import 'dotenv/config'
import { env } from './env'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import pino from 'pino'
import pinoHttp from 'pino-http'
import { z } from 'zod'

const logger = pino({ level: process.env.LOG_LEVEL || 'info' })
const app = express()

app.use(helmet())
app.use(cors({ origin: true }))
app.use(express.json({ limit: '2mb' }))
app.use(pinoHttp({ logger }))

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() })
})

const GenerateRequest = z.object({
  input: z.string().min(1),
  mode: z.enum(['text', 'voice']).default('text')
})

app.post('/api/maps/generate', (req, res) => {
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
  res.json({ map, summary: 'Mock map generated for wiring.' })
})

const port = Number(env.PORT || 4000)
app.listen(port, () => {
  logger.info({ port }, 'Server listening')
})


