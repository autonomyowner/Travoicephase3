export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000'
import { supabase } from './supabase'

export type GenerateResponse = {
  map: {
    nodes: Array<{
      id: string
      label: string
      type?: 'root' | 'thought' | 'action' | 'emotion'
      emotion?: 'positive' | 'neutral' | 'negative'
      priority?: number
      position?: { x: number; y: number }
      theme?:
        | 'emerald'
        | 'sapphire'
        | 'goldenMajesty'
        | 'silver'
        | 'royalPurple'
        | 'crimson'
        | 'teal'
        | 'indigo'
        | 'rose'
        | 'vibrantGold'
        | 'richGold'
        | 'brightGold'
        | 'warmOrange'
    }>
    edges: Array<{ id: string; source: string; target: string; label?: string }>
  }
  summary: string
}

export async function getHealth(): Promise<{ status: string; uptime: number }> {
  const res = await fetch(`${API_BASE_URL}/health`, { cache: 'no-store' })
  if (!res.ok) {
    throw new Error(`Health check failed: ${res.status}`)
  }
  return res.json()
}

export async function generateMap(input: string, mode: 'text' | 'voice' = 'text'): Promise<GenerateResponse> {
  const token = (await supabase?.auth.getSession())?.data.session?.access_token
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${API_BASE_URL}/api/maps/generate`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ input, mode })
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Generate failed: ${res.status} ${text}`)
  }
  return res.json()
}

export async function transcribeVoice(audioBlob: Blob): Promise<{ text: string }> {
  const form = new FormData()
  form.append('audio', audioBlob, 'recording.webm')
  const res = await fetch(`${API_BASE_URL}/api/voice/transcribe`, {
    method: 'POST',
    body: form
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Transcription failed: ${res.status} ${text}`)
  }
  return res.json()
}

export type MapListItem = { id: string; title: string; created_at: string }

export async function listMaps(): Promise<MapListItem[]> {
  const token = (await supabase?.auth.getSession())?.data.session?.access_token
  if (!token) throw new Error('Not authenticated')
  const res = await fetch(`${API_BASE_URL}/api/maps`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`List maps failed: ${res.status} ${text}`)
  }
  const data = await res.json()
  return data.maps as MapListItem[]
}

export async function saveMap(params: { title: string; description?: string; graph: GenerateResponse['map']; layout?: unknown }): Promise<{ id: string }> {
  const token = (await supabase?.auth.getSession())?.data.session?.access_token
  if (!token) throw new Error('Not authenticated')
  const res = await fetch(`${API_BASE_URL}/api/maps`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(params)
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Save map failed: ${res.status} ${text}`)
  }
  return res.json()
}

export async function listVersions(mapId: string): Promise<Array<{ id: string; version: number; created_at: string }>> {
  const token = (await supabase?.auth.getSession())?.data.session?.access_token
  if (!token) throw new Error('Not authenticated')
  const res = await fetch(`${API_BASE_URL}/api/maps/${mapId}/versions`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`List versions failed: ${res.status} ${text}`)
  }
  const data = await res.json()
  return data.versions as Array<{ id: string; version: number; label?: string; created_at: string }>
}

export async function createVersion(mapId: string, params: { graph: GenerateResponse['map']; layout?: unknown; label?: string }): Promise<{ id: string; version: number; label?: string; created_at: string }> {
  // use unknown for layout to avoid any
  const token = (await supabase?.auth.getSession())?.data.session?.access_token
  if (!token) throw new Error('Not authenticated')
  const res = await fetch(`${API_BASE_URL}/api/maps/${mapId}/versions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(params)
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Create version failed: ${res.status} ${text}`)
  }
  const data = await res.json()
  return data.version as { id: string; version: number; label?: string; created_at: string }
}

export async function getMap(mapId: string): Promise<{ id: string; title: string; graph: GenerateResponse['map']; layout?: unknown }> {
  const token = (await supabase?.auth.getSession())?.data.session?.access_token
  if (!token) throw new Error('Not authenticated')
  const res = await fetch(`${API_BASE_URL}/api/maps/${mapId}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Get map failed: ${res.status} ${text}`)
  }
  const data = await res.json()
  return data.map as { id: string; title: string; graph: GenerateResponse['map']; layout?: unknown }
}

export async function updateMap(mapId: string, params: Partial<{ title: string; description: string; graph: GenerateResponse['map']; layout: unknown }>): Promise<{ ok: true }> {
  const token = (await supabase?.auth.getSession())?.data.session?.access_token
  if (!token) throw new Error('Not authenticated')
  const res = await fetch(`${API_BASE_URL}/api/maps/${mapId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(params)
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Update map failed: ${res.status} ${text}`)
  }
  return res.json()
}

export async function deleteMap(mapId: string): Promise<{ ok: true }> {
  const token = (await supabase?.auth.getSession())?.data.session?.access_token
  if (!token) throw new Error('Not authenticated')
  const res = await fetch(`${API_BASE_URL}/api/maps/${mapId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Delete map failed: ${res.status} ${text}`)
  }
  return res.json()
}

export async function getVersion(mapId: string, version: number): Promise<{ id: string; version: number; label?: string; graph: GenerateResponse['map']; layout?: unknown; created_at: string }> {
  const token = (await supabase?.auth.getSession())?.data.session?.access_token
  if (!token) throw new Error('Not authenticated')
  const res = await fetch(`${API_BASE_URL}/api/maps/${mapId}/versions/${version}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Get version failed: ${res.status} ${text}`)
  }
  const data = await res.json()
  return data.version as { id: string; version: number; label?: string; graph: GenerateResponse['map']; layout?: unknown; created_at: string }
}

export async function restoreVersion(mapId: string, version: number): Promise<{ ok: true }> {
  const token = (await supabase?.auth.getSession())?.data.session?.access_token
  if (!token) throw new Error('Not authenticated')
  const res = await fetch(`${API_BASE_URL}/api/maps/${mapId}/versions/${version}/restore`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Restore failed: ${res.status} ${text}`)
  }
  return res.json()
}

// Templates API
export type TemplateListItem = { id: string; title: string; description?: string; is_public: boolean; created_at: string }

export async function listTemplates(): Promise<TemplateListItem[]> {
  const token = (await supabase?.auth.getSession())?.data.session?.access_token
  const headers: Record<string, string> = {}
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${API_BASE_URL}/api/templates`, { headers })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`List templates failed: ${res.status} ${text}`)
  }
  const data = await res.json()
  return data.templates as TemplateListItem[]
}

export async function getTemplate(templateId: string): Promise<{ id: string; title: string; description?: string; is_public: boolean; graph: GenerateResponse['map']; created_at: string }> {
  const token = (await supabase?.auth.getSession())?.data.session?.access_token
  const headers: Record<string, string> = {}
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${API_BASE_URL}/api/templates/${templateId}`, { headers })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Get template failed: ${res.status} ${text}`)
  }
  const data = await res.json()
  return data.template as { id: string; title: string; description?: string; is_public: boolean; graph: GenerateResponse['map']; created_at: string }
}

export async function createTemplate(params: { title: string; description?: string; graph: GenerateResponse['map']; is_public?: boolean }): Promise<{ id: string }> {
  const token = (await supabase?.auth.getSession())?.data.session?.access_token
  if (!token) throw new Error('Not authenticated')
  const res = await fetch(`${API_BASE_URL}/api/templates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(params)
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Create template failed: ${res.status} ${text}`)
  }
  return res.json()
}


