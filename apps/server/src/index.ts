import 'dotenv/config'
import { env } from './env'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import pino from 'pino'
import pinoHttp from 'pino-http'
import { z } from 'zod'
import { supabase } from './supabase'
import jwtDecode from 'jwt-decode'
import { MapGraphSchema } from '@neurocanvas/types'

const logger = pino({ level: process.env.LOG_LEVEL || 'info' })
const app = express()

app.use(helmet())
app.use(cors({ origin: true }))
app.use(express.json({ limit: '2mb' }))
app.use(pinoHttp({ logger }))

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() })
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
    await supabase.from('users').insert({ id: userId }).select('id').single().catch(() => null)
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

app.post('/api/maps/generate', async (req, res) => {
  const parsed = GenerateRequest.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid request', issues: parsed.error.issues })
  }
  // Mock response for MVP wiring
  const id = Math.random().toString(36).slice(2)
  const map = {
    nodes: [
      { id: `root-${id}`, label: 'Root', type: 'root', position: { x: 0, y: 0 } },
      { id: `n1-${id}`, label: 'Idea 1', type: 'thought', position: { x: 200, y: -80 } },
      { id: `n2-${id}`, label: 'Action A', type: 'action', position: { x: 220, y: 120 } }
    ],
    edges: [
      { id: `e1-${id}`, source: `root-${id}`, target: `n1-${id}` },
      { id: `e2-${id}`, source: `root-${id}`, target: `n2-${id}` }
    ]
  }
  const safe = MapGraphSchema.safeParse(map)
  if (!safe.success) {
    return res.status(500).json({ error: 'Internal schema error', issues: safe.error.issues })
  }
  // Optional: if Authorization: Bearer <jwt> is provided, persist
  try {
    const authHeader = req.header('authorization')
    const jwt = authHeader?.toLowerCase().startsWith('bearer ')
      ? authHeader.slice(7).trim()
      : null
    if (jwt && supabase) {
      const client = supabase
      // get user id
      const { data: userData, error: userError } = await client.auth.getUser(jwt)
      if (!userError && userData?.user) {
        const userId = userData.user.id
        await client.from('users').insert({ id: userId }).select('id').single().catch(() => null)
        await client.from('maps').insert({ user_id: userId, title: 'Generated Map', graph: map }).select('id').single()
      }
    }
  } catch (_e) {
    // ignore persistence errors for now
  }
  res.json({ map, summary: 'Mock map generated for wiring.' })
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
      .select('id,version,created_at')
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
        graph: parsed.data.graph,
        layout: parsed.data.layout
      })
      .select('id,version,created_at')
      .single()
    if (error) return res.status(500).json({ error: error.message })
    res.json({ version: data })
  } catch (e: any) {
    res.status(500).json({ error: e?.message ?? 'Unexpected error' })
  }
})

const port = Number(env.PORT || 4000)
app.listen(port, () => {
  logger.info({ port }, 'Server listening')
})


