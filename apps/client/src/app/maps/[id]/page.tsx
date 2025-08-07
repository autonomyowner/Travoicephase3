"use client"

import dynamic from 'next/dynamic'
import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import AuthGate from '../../../components/AuthGate'
import { supabase } from '../../../lib/supabase'
import { createVersion, getMap, listVersions, updateMap, type GenerateResponse } from '../../../lib/api'

const MapCanvas = dynamic(() => import('../../../components/MapCanvas'), { ssr: false })

type Graph = GenerateResponse['map']

export default function MapEditorPage() {
  const params = useParams<{ id: string }>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [title, setTitle] = useState('')
  const [graph, setGraph] = useState<Graph>({ nodes: [], edges: [] })
  const [versions, setVersions] = useState<Array<{ id: string; version: number; created_at: string }>>([])
  const [saving, setSaving] = useState(false)
  const [autoSaving, setAutoSaving] = useState(false)
  const [layoutMode, setLayoutMode] = useState<'none' | 'tree' | 'radial'>('none')

  useEffect(() => {
    let mounted = true
    const run = async () => {
      try {
        if (!params?.id) return
        const session = (await supabase?.auth.getSession())?.data.session
        if (!session) { if (mounted) setLoading(false); return }
        const m = await getMap(String(params.id))
        if (!mounted) return
        setTitle(m.title)
        setGraph(m.graph)
        const v = await listVersions(String(params.id))
        if (!mounted) return
        setVersions(v)
      } catch (e: unknown) {
        if (!mounted) return
        setError(e instanceof Error ? e.message : 'Failed to load map')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    run()
    return () => { mounted = false }
  }, [params?.id])

  const handleChange = useCallback((next: Graph) => {
    setGraph(next)
  }, [])

  const handleSaveVersion = useCallback(async () => {
    if (!params?.id) return
    setSaving(true)
    setError('')
    try {
      const v = await createVersion(String(params.id), { graph })
      setVersions((prev) => [v, ...prev])
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to save version')
    } finally {
      setSaving(false)
    }
  }, [graph, params?.id])

  // Auto-save debounce on edit
  useEffect(() => {
    if (!params?.id) return
    setAutoSaving(true)
    const t = setTimeout(async () => {
      try {
        await updateMap(String(params.id), { graph, layout: layoutMode !== 'none' ? { mode: layoutMode } : undefined })
      } catch {
        // ignore background errors
      } finally {
        setAutoSaving(false)
      }
    }, 1500)
    return () => clearTimeout(t)
  }, [graph, layoutMode, params?.id])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <input
          className="rounded-md border px-2 py-1 text-sm border-black/10 dark:border-white/15 bg-transparent"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={async () => { if (params?.id) { try { await updateMap(String(params.id), { title }) } catch {} } }}
          aria-label="Map title"
        />
        <span className="text-xs opacity-60">{autoSaving ? 'Saving…' : 'Saved'}</span>
      </div>
      <AuthGate>
        {loading ? <p className="text-sm opacity-70">Loading…</p> : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <div className="space-y-3">
          <MapCanvas nodes={graph.nodes} edges={graph.edges} readOnly={false} onChange={handleChange} enableToolbar layoutMode={layoutMode} onLayoutModeChange={setLayoutMode} />
          <div className="flex items-center gap-3">
            <button
              className="rounded-md bg-black text-white px-3 py-1.5 text-sm dark:bg-white dark:text-black disabled:opacity-50"
              onClick={handleSaveVersion}
              disabled={saving}
            >
              {saving ? 'Saving…' : 'Save Version'}
            </button>
            <button
              className="rounded-md border px-3 py-1.5 text-sm border-black/10 dark:border-white/15"
              onClick={async () => { if (params?.id) { setSaving(true); try { await updateMap(String(params.id), { graph, layout: layoutMode !== 'none' ? { mode: layoutMode } : undefined }) } finally { setSaving(false) } } }}
            >
              Save
            </button>
          </div>
        </div>

        <section className="space-y-2">
          <h2 className="text-lg font-medium">Versions</h2>
          <ul className="space-y-1">
            {versions.map((v) => (
              <li key={v.id} className="text-sm opacity-80">v{v.version} — <span className="opacity-60">{new Date(v.created_at).toLocaleString()}</span></li>
            ))}
            {versions.length === 0 && !loading && <li className="text-sm opacity-60">No versions yet.</li>}
          </ul>
        </section>
      </AuthGate>
    </div>
  )
}


