import { env } from './env'
import type { MapGraph } from '@neurocanvas/types'

export type GenerateParams = { input: string; mode: 'text' | 'voice' }
export type GenerateResult = { map: MapGraph; summary?: string }

export function getAIConfig() {
  const provider = (env.AI_PROVIDER ?? 'mock') as 'mock' | 'openai'
  const openaiEnabled = Boolean(env.OPENAI_API_KEY)
  return {
    provider,
    enabled: provider === 'openai' ? openaiEnabled : true,
    textModel: env.OPENAI_MODEL ?? null,
    whisperModel: env.WHISPER_MODEL ?? null
  }
}

export async function generateMapWithAI(_params: GenerateParams): Promise<GenerateResult> {
  const cfg = getAIConfig()
  if (cfg.provider === 'openai' && cfg.enabled) {
    // Placeholder: OpenAI integration can be enabled at deploy time.
    // For now, return a minimal map while keeping the code path ready.
    return mockGenerate('Using OpenAI provider path (stub) — replace with real call at deploy time.')
  }
  return mockGenerate()
}

export async function transcribeAudio(_input?: unknown): Promise<{ text: string }> {
  const cfg = getAIConfig()
  if (cfg.provider === 'openai' && cfg.enabled) {
    // Placeholder for Whisper; keep endpoint stable but return stub text for now
    return { text: 'OpenAI Whisper path (stub). Replace with real transcription at deploy time.' }
  }
  return { text: 'This is a mock transcription. Plug in Whisper at deploy time.' }
}

function mockGenerate(summary = 'Mock map generated for wiring.'): GenerateResult {
  const id = Math.random().toString(36).slice(2)
  const map: MapGraph = {
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
  return { map, summary }
}


