import 'dotenv/config'
import { env } from './env'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import pino from 'pino'
import pinoHttp from 'pino-http'
import { z } from 'zod'
import { supabase } from './supabase'
import { jwtDecode } from 'jwt-decode'
import { MapGraphSchema } from '@neurocanvas/types'
import { generateMapWithAI, getAIConfig, transcribeAudio } from './ai'
import multer from 'multer'

const logger = pino({ level: process.env.LOG_LEVEL || 'info' })
const app = express()

app.use(helmet())
app.use(cors({ origin: true }))
app.use(express.json({ limit: '2mb' }))
app.use(pinoHttp({ logger }))

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() })
})

// ===== Real-time Voice Session (Mock-first, SSE) =====
type TranscriptChunk = { text: string; tsStart?: number; tsEnd?: number; speaker?: string }
type MapDelta = { nodes?: Array<{ id: string; label: string; type?: 'root'|'thought'|'action'|'emotion'; emotion?: 'positive'|'neutral'|'negative'; priority?: number; position?: { x: number; y: number } }>; edges?: Array<{ id: string; source: string; target: string; label?: string }> }

type Session = {
  id: string
  createdAt: number
  transcript: TranscriptChunk[]
  map: { nodes: Array<{ id: string; label: string; type?: 'root'|'thought'|'action'|'emotion'; position?: { x:number; y:number }; emotion?: 'positive'|'neutral'|'negative' }>; edges: Array<{ id: string; source: string; target: string; label?: string }> }
  subscribers: Set<import('express').Response>
  angle: number // simple radial placement for new nodes
}

const sessions = new Map<string, Session>()

function sendSse(res: import('express').Response, event: string, data: unknown) {
  res.write(`event: ${event}\n`)
  res.write(`data: ${JSON.stringify(data)}\n\n`)
}

function ensureRoot(session: Session) {
  const hasRoot = session.map.nodes.some((n) => n.type === 'root')
  if (!hasRoot) {
    session.map.nodes.push({ id: 'root', label: 'Root', type: 'root', position: { x: 0, y: 0 } })
  }
}

function findNonOverlappingPosition(session: Session, desired: { x: number; y: number }, minGap = 120): { x: number; y: number } {
  const existing = session.map.nodes.map((n) => n.position).filter(Boolean) as Array<{ x: number; y: number }>
  // Quick accept if far enough from all
  const isFree = (p: { x: number; y: number }) => existing.every((q) => Math.hypot(p.x - q.x, p.y - q.y) >= minGap)
  if (isFree(desired)) return desired
  // Spiral search around desired
  const maxRings = 12
  const step = 30 // degrees
  for (let ring = 1; ring <= maxRings; ring++) {
    const radius = ring * 24
    for (let deg = 0; deg < 360; deg += step) {
      const rad = (deg * Math.PI) / 180
      const cand = { x: Math.round(desired.x + Math.cos(rad) * radius), y: Math.round(desired.y + Math.sin(rad) * radius) }
      if (isFree(cand)) return cand
    }
  }
  // Fallback: place a bit offset
  return { x: desired.x + 16, y: desired.y + 16 }
}

function mockReasonerDelta(session: Session, chunks: TranscriptChunk[]): MapDelta {
  // Very basic heuristic: extract an emotion word if present; otherwise neutral
  const full = chunks.map((c) => c.text).join(' ').trim()
  const lower = full.toLowerCase()
  let emotion: 'positive'|'neutral'|'negative' = 'neutral'
  if (/\b(optimistic|excited|proud|happy|confident)\b/.test(lower)) emotion = 'positive'
  if (/\b(worried|anxious|blocked|stressed|sad)\b/.test(lower)) emotion = 'negative'
  let label = full.replace(/\s+/g, ' ').slice(0, 120)
  if (emotion !== 'neutral') label = `${emotion} ${label}`

  // Simple type heuristic
  const isAction = /\b(i will|let's|we should|buy|buying|purchase|ship|build|launch)\b/.test(lower)
  const nodeType: 'thought'|'action' = isAction ? 'action' : 'thought'

  // Tokenize and find a similar existing node to attach to (associative linking)
  const stop = new Set(['i','the','and','of','my','to','on','in','a','an','we','you','our','about','think','thinking','work','working','hard','project'])
  const tokenize = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean).filter(w => !stop.has(w))
  const newTokens = new Set(tokenize(lower))

  ensureRoot(session)
  // find best match among existing non-root nodes
  let parentId = 'root'
  let bestOverlap = 0
  let parentPos: { x: number; y: number } | null = null
  for (const n of session.map.nodes) {
    if (n.id === 'root') continue
    const toks = new Set(tokenize(n.label || ''))
    let overlap = 0
    for (const t of newTokens) if (toks.has(t)) overlap++
    if (overlap > bestOverlap) {
      bestOverlap = overlap
      parentId = n.id
      parentPos = n.position ?? null
    }
  }
  // threshold: if we have at least 1 common token, attach to that similar node; else attach to root
  if (bestOverlap < 1) {
    parentId = 'root'
    parentPos = { x: 0, y: 0 }
  }

  // position: near parent if similar found; else around root
  let x = 0, y = 0
  if (parentId !== 'root' && parentPos) {
    const radius = 140
    session.angle = (session.angle + 40) % 360
    const rad = (session.angle * Math.PI) / 180
    x = Math.round(parentPos.x + Math.cos(rad) * radius)
    y = Math.round(parentPos.y + Math.sin(rad) * radius)
  } else {
    const radius = 240
    session.angle = (session.angle + 32) % 360
    const rad = (session.angle * Math.PI) / 180
    x = Math.round(Math.cos(rad) * radius)
    y = Math.round(Math.sin(rad) * radius)
  }
  // ensure non-overlapping position
  const pos = findNonOverlappingPosition(session, { x, y })
  const id = `n-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
  const node = { id, label: label || 'thought', type: nodeType, emotion, position: pos }
  const edge = { id: `e-${parentId}-${id}`, source: parentId, target: id }
  return { nodes: [node], edges: [edge] }
}

app.post('/api/voice/session', async (_req, res) => {
  const id = Math.random().toString(36).slice(2)
  const session: Session = {
    id,
    createdAt: Date.now(),
    transcript: [],
    map: { nodes: [], edges: [] },
    subscribers: new Set(),
    angle: 0,
  }
  sessions.set(id, session)
  res.json({ sessionId: id })
})

app.get('/api/voice/session/:id/stream', (req, res) => {
  const s = sessions.get(req.params.id)
  if (!s) return res.status(404).end()
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders?.()
  s.subscribers.add(res)
  // Send initial heartbeat
  sendSse(res, 'heartbeat', { t: Date.now() })
  req.on('close', () => {
    s.subscribers.delete(res)
  })
})

app.post('/api/voice/session/:id/chunk', (req, res) => {
  const s = sessions.get(req.params.id)
  if (!s) return res.status(404).json({ error: 'Session not found' })
  const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } }).single('audio')
  upload(req, res as any, (err: any) => {
    if (err) return res.status(400).json({ error: 'Upload failed' })
    const file = (req as any).file as Express.Multer.File | undefined
    // MOCK: ignore audio content; fabricate a transcript chunk
    const text = file?.buffer?.length ? `heard ${Math.min(12, Math.ceil(file.buffer.length / 2000))} words about your topic` : 'thinking about goals and projects'
    const chunk: TranscriptChunk = { text, tsStart: Date.now(), tsEnd: Date.now() }
    s.transcript.push(chunk)
    // emit transcript
    for (const sub of s.subscribers) sendSse(sub, 'transcript', { chunks: [chunk] })
    // reason and emit a delta
    const delta = mockReasonerDelta(s, [chunk])
    // merge into in-memory map
    if (delta.nodes) s.map.nodes.push(...delta.nodes)
    if (delta.edges) s.map.edges.push(...delta.edges)
    for (const sub of s.subscribers) sendSse(sub, 'delta', { delta })
    res.status(202).json({ ok: true })
  })
})

app.post('/api/voice/session/:id/finish', (req, res) => {
  const s = sessions.get(req.params.id)
  if (!s) return res.status(404).json({ error: 'Session not found' })
  // Simple summary
  const summary = s.transcript.map((c) => c.text).join(' ').slice(0, 400)
  for (const sub of s.subscribers) sendSse(sub, 'summary', { text: summary })
  // Optionally persist if authenticated (skipped for mock-first)
  res.json({ ok: true })
})

// List current user's maps (id, title, created_at)
app.get('/api/maps', async (req, res) => {
  try {
    const authHeader = req.header('authorization')
    const jwt = authHeader?.toLowerCase().startsWith('bearer ')
      ? authHeader.slice(7).trim()
      : null
    if (!jwt || !supabase) return res.status(401).json({ error: 'Unauthorized' })
    // Validate JWT locally to avoid network hiccups
    let userId: string | null = null
    try {
      const decoded: any = jwtDecode(jwt)
      userId = decoded?.sub ?? null
    } catch {}
    if (!userId) {
      const { data: userData, error: userError } = await supabase.auth.getUser(jwt)
      if (userError || !userData?.user) return res.status(401).json({ error: 'Unauthorized' })
      userId = userData.user.id
    }
    const { data, error } = await supabase.from('maps').select('id,title,created_at').order('created_at', { ascending: false })
      .eq('user_id', userId)
    if (error) return res.status(500).json({ error: error.message })
    res.json({ maps: data })
  } catch (e: any) {
    res.status(500).json({ error: e?.message ?? 'Unexpected error' })
  }
})

// Create a map explicitly
const CreateMapRequest = z.object({
  title: z.string().min(1).default('Untitled'),
  description: z.string().optional(),
  graph: MapGraphSchema,
  layout: z.any().optional()
})

app.post('/api/maps', async (req, res) => {
  try {
    const parsed = CreateMapRequest.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: 'Invalid body', issues: parsed.error.issues })
    const authHeader = req.header('authorization')
    const jwt = authHeader?.toLowerCase().startsWith('bearer ')
      ? authHeader.slice(7).trim()
      : null
    if (!jwt || !supabase) return res.status(401).json({ error: 'Unauthorized' })
    let userId: string | null = null
    try { userId = (jwtDecode(jwt) as any)?.sub ?? null } catch {}
    if (!userId) {
      const { data: userData, error: userError } = await supabase.auth.getUser(jwt)
      if (userError || !userData?.user) return res.status(401).json({ error: 'Unauthorized' })
      userId = userData.user.id
    }
    await supabase.from('users').upsert({ id: userId }, { onConflict: 'id' })
    const { data, error } = await supabase.from('maps').insert({
      user_id: userId,
      title: parsed.data.title,
      description: parsed.data.description,
      graph: parsed.data.graph,
      layout: parsed.data.layout
    }).select('id').single()
    if (error) return res.status(500).json({ error: error.message })
    res.json({ id: data.id })
  } catch (e: any) {
    res.status(500).json({ error: e?.message ?? 'Unexpected error' })
  }
})

// Get a map by id (owned by user)
app.get('/api/maps/:id', async (req, res) => {
  try {
    const authHeader = req.header('authorization')
    const jwt = authHeader?.toLowerCase().startsWith('bearer ')
      ? authHeader.slice(7).trim()
      : null
    if (!jwt || !supabase) return res.status(401).json({ error: 'Unauthorized' })
    let userId: string | null = null
    try { userId = (jwtDecode(jwt) as any)?.sub ?? null } catch {}
    if (!userId) {
      const { data: userData, error: userError } = await supabase.auth.getUser(jwt)
      if (userError || !userData?.user) return res.status(401).json({ error: 'Unauthorized' })
      userId = userData.user.id
    }
    const { data, error } = await supabase
      .from('maps')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', userId)
      .single()
    if (error) return res.status(404).json({ error: 'Not found' })
    res.json({ map: data })
  } catch (e: any) {
    res.status(500).json({ error: e?.message ?? 'Unexpected error' })
  }
})

// Update a map (partial)
const UpdateMapRequest = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  graph: MapGraphSchema.optional(),
  layout: z.any().optional()
})

app.patch('/api/maps/:id', async (req, res) => {
  try {
    const parsed = UpdateMapRequest.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: 'Invalid body', issues: parsed.error.issues })
    const authHeader = req.header('authorization')
    const jwt = authHeader?.toLowerCase().startsWith('bearer ')
      ? authHeader.slice(7).trim()
      : null
    if (!jwt || !supabase) return res.status(401).json({ error: 'Unauthorized' })
    const { data: userData, error: userError } = await supabase.auth.getUser(jwt)
    if (userError || !userData?.user) return res.status(401).json({ error: 'Unauthorized' })
    const userId = userData.user.id

    // Ensure ownership
    const { data: mapRow, error: mapErr } = await supabase
      .from('maps')
      .select('id,user_id')
      .eq('id', req.params.id)
      .single()
    if (mapErr || !mapRow || mapRow.user_id !== userId) return res.status(404).json({ error: 'Not found' })

    const payload: Record<string, unknown> = {}
    if (Object.prototype.hasOwnProperty.call(parsed.data, 'title')) payload.title = parsed.data.title
    if (Object.prototype.hasOwnProperty.call(parsed.data, 'description')) payload.description = parsed.data.description
    if (Object.prototype.hasOwnProperty.call(parsed.data, 'graph')) payload.graph = parsed.data.graph
    if (Object.prototype.hasOwnProperty.call(parsed.data, 'layout')) payload.layout = parsed.data.layout

    const { error } = await supabase
      .from('maps')
      .update(payload)
      .eq('id', req.params.id)
      .eq('user_id', userId)
    if (error) return res.status(500).json({ error: error.message })
    res.json({ ok: true })
  } catch (e: any) {
    res.status(500).json({ error: e?.message ?? 'Unexpected error' })
  }
})

// Delete a map by id
app.delete('/api/maps/:id', async (req, res) => {
  try {
    const authHeader = req.header('authorization')
    const jwt = authHeader?.toLowerCase().startsWith('bearer ')
      ? authHeader.slice(7).trim()
      : null
    if (!jwt || !supabase) return res.status(401).json({ error: 'Unauthorized' })
    const { data: userData, error: userError } = await supabase.auth.getUser(jwt)
    if (userError || !userData?.user) return res.status(401).json({ error: 'Unauthorized' })
    const userId = userData.user.id
    const { error } = await supabase
      .from('maps')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', userId)
    if (error) return res.status(500).json({ error: error.message })
    res.json({ ok: true })
  } catch (e: any) {
    res.status(500).json({ error: e?.message ?? 'Unexpected error' })
  }
})

const GenerateRequest = z.object({
  input: z.string().min(1),
  mode: z.enum(['text', 'voice']).default('text')
})

app.get('/api/ai/providers', (_req, res) => {
  res.json(getAIConfig())
})

app.post('/api/maps/generate', async (req, res) => {
  const parsed = GenerateRequest.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid request', issues: parsed.error.issues })
  }
  const result = await generateMapWithAI(parsed.data)
  const safe = MapGraphSchema.safeParse(result.map)
  if (!safe.success) {
    return res.status(500).json({ error: 'Internal schema error', issues: safe.error.issues })
  }
  try {
    const authHeader = req.header('authorization')
    const jwt = authHeader?.toLowerCase().startsWith('bearer ')
      ? authHeader.slice(7).trim()
      : null
    if (jwt && supabase) {
      const client = supabase
      const { data: userData, error: userError } = await client.auth.getUser(jwt)
      if (!userError && userData?.user) {
        const userId = userData.user.id
        await client.from('users').upsert({ id: userId }, { onConflict: 'id' })
        await client.from('maps').insert({ user_id: userId, title: 'Generated Map', graph: result.map }).select('id').single()
      }
    }
  } catch (_e) {}
  res.json(result)
})

// Stub voice transcription until Whisper is configured
app.post('/api/voice/transcribe', async (_req, res) => {
  try {
    const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } }).single('audio')
    upload(_req, res as any, async (err: any) => {
      if (err) return res.status(400).json({ error: 'Upload failed' })
      const file = (_req as any).file as Express.Multer.File | undefined
      const result = await transcribeAudio(file ? { buffer: file.buffer, mimetype: file.mimetype } : undefined)
      res.json(result)
    })
  } catch (e: any) {
    res.status(500).json({ error: e?.message ?? 'Unexpected error' })
  }
})

// Templates API
const CreateTemplateRequest = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  graph: MapGraphSchema,
  is_public: z.boolean().optional()
})

// List templates: public and, if authenticated, also own
app.get('/api/templates', async (req, res) => {
  try {
    const authHeader = req.header('authorization')
    const jwt = authHeader?.toLowerCase().startsWith('bearer ')
      ? authHeader.slice(7).trim()
      : null

    let userId: string | null = null
    if (jwt && supabase) {
      try { userId = (jwtDecode(jwt) as any)?.sub ?? null } catch {}
      if (!userId) {
        const { data: userData } = await supabase.auth.getUser(jwt)
        userId = userData?.user?.id ?? null
      }
    }

    if (!supabase) return res.status(500).json({ error: 'Supabase not configured' })

    let query = supabase
      .from('templates')
      .select('id,title,description,is_public,created_at,user_id')
      .order('created_at', { ascending: false })

    if (userId) {
      // public OR own
      // Supabase JS v2: use .or() with filter string
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      query = query.or(`is_public.eq.true,user_id.eq.${userId}`)
    } else {
      query = query.eq('is_public', true)
    }

    const { data, error } = await query
    if (error) return res.status(500).json({ error: error.message })
    res.json({ templates: (data ?? []).map((t: any) => ({ id: t.id, title: t.title, description: t.description, is_public: t.is_public, created_at: t.created_at })) })
  } catch (e: any) {
    res.status(500).json({ error: e?.message ?? 'Unexpected error' })
  }
})

// Create a template (auth required)
app.post('/api/templates', async (req, res) => {
  try {
    const parsed = CreateTemplateRequest.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: 'Invalid body', issues: parsed.error.issues })

    const authHeader = req.header('authorization')
    const jwt = authHeader?.toLowerCase().startsWith('bearer ')
      ? authHeader.slice(7).trim()
      : null
    if (!jwt || !supabase) return res.status(401).json({ error: 'Unauthorized' })
    const { data: userData, error: userError } = await supabase.auth.getUser(jwt)
    if (userError || !userData?.user) return res.status(401).json({ error: 'Unauthorized' })
    const userId = userData.user.id

    const { data, error } = await supabase
      .from('templates')
      .insert({
        user_id: userId,
        title: parsed.data.title,
        description: parsed.data.description ?? null,
        graph: parsed.data.graph,
        is_public: parsed.data.is_public ?? false
      })
      .select('id')
      .single()
    if (error) return res.status(500).json({ error: error.message })
    res.json({ id: data.id })
  } catch (e: any) {
    res.status(500).json({ error: e?.message ?? 'Unexpected error' })
  }
})

// Get a template by id. Public accessible; private only to owner
app.get('/api/templates/:id', async (req, res) => {
  try {
    if (!supabase) return res.status(500).json({ error: 'Supabase not configured' })
    const { data: tpl, error } = await supabase
      .from('templates')
      .select('id,title,description,is_public,graph,user_id,created_at')
      .eq('id', req.params.id)
      .maybeSingle()
    if (error) return res.status(500).json({ error: error.message })
    if (!tpl) return res.status(404).json({ error: 'Not found' })

    if (!tpl.is_public) {
      const authHeader = req.header('authorization')
      const jwt = authHeader?.toLowerCase().startsWith('bearer ')
        ? authHeader.slice(7).trim()
        : null
      if (!jwt) return res.status(404).json({ error: 'Not found' })
      const { data: userData } = await supabase.auth.getUser(jwt)
      const userId = userData?.user?.id
      if (!userId || userId !== tpl.user_id) return res.status(404).json({ error: 'Not found' })
    }

    res.json({ template: { id: tpl.id, title: tpl.title, description: tpl.description, is_public: tpl.is_public, graph: tpl.graph, created_at: tpl.created_at } })
  } catch (e: any) {
    res.status(500).json({ error: e?.message ?? 'Unexpected error' })
  }
})

// Create a new map version
const CreateVersionRequest = z.object({
  label: z.string().optional(),
  graph: MapGraphSchema,
  layout: z.any().optional()
})

app.get('/api/maps/:id/versions', async (req, res) => {
  try {
    const authHeader = req.header('authorization')
    const jwt = authHeader?.toLowerCase().startsWith('bearer ')
      ? authHeader.slice(7).trim()
      : null
    if (!jwt || !supabase) return res.status(401).json({ error: 'Unauthorized' })
    const { data: userData, error: userError } = await supabase.auth.getUser(jwt)
    if (userError || !userData?.user) return res.status(401).json({ error: 'Unauthorized' })
    const userId = userData.user.id

    const { data: mapRow, error: mapErr } = await supabase
      .from('maps')
      .select('id,user_id')
      .eq('id', req.params.id)
      .single()
    if (mapErr || !mapRow || mapRow.user_id !== userId) return res.status(404).json({ error: 'Not found' })

    const { data, error } = await supabase
      .from('map_versions')
      .select('id,version,label,created_at')
      .eq('map_id', req.params.id)
      .order('version', { ascending: false })
    if (error) return res.status(500).json({ error: error.message })
    res.json({ versions: data })
  } catch (e: any) {
    res.status(500).json({ error: e?.message ?? 'Unexpected error' })
  }
})

app.post('/api/maps/:id/versions', async (req, res) => {
  try {
    const parsed = CreateVersionRequest.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: 'Invalid body', issues: parsed.error.issues })

    const authHeader = req.header('authorization')
    const jwt = authHeader?.toLowerCase().startsWith('bearer ')
      ? authHeader.slice(7).trim()
      : null
    if (!jwt || !supabase) return res.status(401).json({ error: 'Unauthorized' })
    const { data: userData, error: userError } = await supabase.auth.getUser(jwt)
    if (userError || !userData?.user) return res.status(401).json({ error: 'Unauthorized' })
    const userId = userData.user.id

    // Ensure map ownership
    const { data: mapRow, error: mapErr } = await supabase
      .from('maps')
      .select('id,user_id')
      .eq('id', req.params.id)
      .single()
    if (mapErr || !mapRow || mapRow.user_id !== userId) return res.status(404).json({ error: 'Not found' })

    // Compute next version number
    const { data: maxRow, error: maxErr } = await supabase
      .from('map_versions')
      .select('version')
      .eq('map_id', req.params.id)
      .order('version', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (maxErr) return res.status(500).json({ error: maxErr.message })
    const nextVersion = (maxRow?.version ?? 0) + 1

    const { data, error } = await supabase
      .from('map_versions')
      .insert({
        map_id: req.params.id,
        version: nextVersion,
        label: parsed.data.label ?? null,
        graph: parsed.data.graph,
        layout: parsed.data.layout
      })
      .select('id,version,label,created_at')
      .single()
    if (error) return res.status(500).json({ error: error.message })
    res.json({ version: data })
  } catch (e: any) {
    res.status(500).json({ error: e?.message ?? 'Unexpected error' })
  }
})

// Get a specific version details
app.get('/api/maps/:id/versions/:version', async (req, res) => {
  try {
    const authHeader = req.header('authorization')
    const jwt = authHeader?.toLowerCase().startsWith('bearer ')
      ? authHeader.slice(7).trim()
      : null
    if (!jwt || !supabase) return res.status(401).json({ error: 'Unauthorized' })
    const { data: userData, error: userError } = await supabase.auth.getUser(jwt)
    if (userError || !userData?.user) return res.status(401).json({ error: 'Unauthorized' })
    const userId = userData.user.id

    // Ensure ownership via parent map
    const { data: mapRow, error: mapErr } = await supabase
      .from('maps')
      .select('id,user_id')
      .eq('id', req.params.id)
      .single()
    if (mapErr || !mapRow || mapRow.user_id !== userId) return res.status(404).json({ error: 'Not found' })

    const versionNum = Number(req.params.version)
    const { data, error } = await supabase
      .from('map_versions')
      .select('id,version,label,graph,layout,created_at')
      .eq('map_id', req.params.id)
      .eq('version', versionNum)
      .maybeSingle()
    if (error) return res.status(500).json({ error: error.message })
    if (!data) return res.status(404).json({ error: 'Version not found' })
    res.json({ version: data })
  } catch (e: any) {
    res.status(500).json({ error: e?.message ?? 'Unexpected error' })
  }
})

// Restore a map to a specific version (copies graph/layout into maps)
app.post('/api/maps/:id/versions/:version/restore', async (req, res) => {
  try {
    const authHeader = req.header('authorization')
    const jwt = authHeader?.toLowerCase().startsWith('bearer ')
      ? authHeader.slice(7).trim()
      : null
    if (!jwt || !supabase) return res.status(401).json({ error: 'Unauthorized' })
    const { data: userData, error: userError } = await supabase.auth.getUser(jwt)
    if (userError || !userData?.user) return res.status(401).json({ error: 'Unauthorized' })
    const userId = userData.user.id

    // Ensure ownership via parent map
    const { data: mapRow, error: mapErr } = await supabase
      .from('maps')
      .select('id,user_id')
      .eq('id', req.params.id)
      .single()
    if (mapErr || !mapRow || mapRow.user_id !== userId) return res.status(404).json({ error: 'Not found' })

    const versionNum = Number(req.params.version)
    const { data: versionRow, error: vErr } = await supabase
      .from('map_versions')
      .select('graph,layout')
      .eq('map_id', req.params.id)
      .eq('version', versionNum)
      .maybeSingle()
    if (vErr) return res.status(500).json({ error: vErr.message })
    if (!versionRow) return res.status(404).json({ error: 'Version not found' })

    const { error } = await supabase
      .from('maps')
      .update({ graph: versionRow.graph, layout: versionRow.layout })
      .eq('id', req.params.id)
      .eq('user_id', userId)
    if (error) return res.status(500).json({ error: error.message })
    res.json({ ok: true })
  } catch (e: any) {
    res.status(500).json({ error: e?.message ?? 'Unexpected error' })
  }
})

const port = Number(env.PORT || 4000)
app.listen(port, () => {
  logger.info({ port }, 'Server listening')
})


