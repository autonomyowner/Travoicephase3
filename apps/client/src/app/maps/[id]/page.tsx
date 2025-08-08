"use client"
import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams } from 'next/navigation'
import AuthGate from '../../../components/AuthGate'
import { supabase } from '../../../lib/supabase'
import { createVersion, getMap, listVersions, updateMap, getVersion, restoreVersion, listTemplates, getTemplate, createTemplate, type GenerateResponse } from '../../../lib/api'
import * as htmlToImage from 'html-to-image'
import { builtInTemplates } from '../../../data/templates'
import MapCanvas from '../../../components/MapCanvas'

type Graph = GenerateResponse['map']

export default function MapEditorPage() {
  const params = useParams<{ id: string }>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [title, setTitle] = useState('')
  const [graph, setGraph] = useState<Graph>({ nodes: [], edges: [] })
  const [versions, setVersions] = useState<Array<{ id: string; version: number; label?: string; created_at: string }>>([])
  const [saving, setSaving] = useState(false)
  const [autoSaving, setAutoSaving] = useState(false)
  const [layoutMode, setLayoutMode] = useState<'none' | 'tree' | 'radial'>('none')
  const [checkpointLabel, setCheckpointLabel] = useState('')
  const [toast, setToast] = useState('')
  const previousGraphRef = useRef<Graph | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [templates, setTemplates] = useState<Array<{ id: string; title: string; builtIn?: boolean }>>([])
  const [importText, setImportText] = useState('')

  // Ensure imported graphs have basic positions so nodes don't overlap
  const layoutImportedGraph = useCallback((g: Graph): Graph => {
    const needsLayout = g.nodes.every((n) => !n.position)
    if (!needsLayout) return g
    const spacingX = 240
    const spacingY = 120
    const cols = 4
    // Put root first if present
    const rootIndex = g.nodes.findIndex((n) => n.type === 'root')
    const ordered = [...g.nodes]
    if (rootIndex > 0) {
      const [rootNode] = ordered.splice(rootIndex, 1)
      ordered.unshift(rootNode)
    }
    const withPos = ordered.map((n, i) => {
      const row = Math.floor(i / cols)
      const col = i % cols
      return { ...n, position: { x: col * spacingX, y: row * spacingY } }
    })
    return { nodes: withPos, edges: g.edges }
  }, [])

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
        const [v, tpls] = await Promise.all([
          listVersions(String(params.id)),
          listTemplates().catch(() => [])
        ])
        if (!mounted) return
        setVersions(v)
        const combined = (tpls.length > 0
          ? tpls.map((t) => ({ id: t.id, title: t.title }))
          : builtInTemplates.map((t) => ({ id: t.id, title: `${t.title} (built-in)`, builtIn: true }))
        )
        setTemplates(combined)
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
      const v = await createVersion(String(params.id), { graph, label: checkpointLabel || undefined })
      setVersions((prev) => [v, ...prev])
      setCheckpointLabel('')
      setToast('Checkpoint saved')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to save version')
    } finally {
      setSaving(false)
    }
  }, [graph, params?.id, checkpointLabel])

  // Header-triggered global actions (export/import/template)
  useEffect(() => {
    const handleExportJson = () => {
      const blob = new Blob([JSON.stringify(graph, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${title || 'map'}.json`
      a.click()
      URL.revokeObjectURL(url)
    }
    const handleExportMd = () => {
      const lines = [
        `# ${title || 'Map'}`,
        '',
        '## Nodes',
        ...graph.nodes.map(n => `- ${n.id}: ${n.label}${n.type ? ` [${n.type}]` : ''}`),
        '',
        '## Edges',
        ...graph.edges.map(e => `- ${e.source} -> ${e.target}${e.label ? ` (${e.label})` : ''}`)
      ]
      const blob = new Blob([lines.join('\n')], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${title || 'map'}.md`
      a.click()
      URL.revokeObjectURL(url)
    }
    const handleExportPng = async () => {
      try {
        const rfWrapper = containerRef.current?.querySelector('.react-flow') as HTMLElement | null
        const target = rfWrapper ?? (containerRef.current as HTMLElement | null)
        if (!target) return
        const dataUrl = await htmlToImage.toPng(target, { pixelRatio: 2 })
        const a = document.createElement('a')
        a.href = dataUrl
        a.download = `${title || 'map'}.png`
        a.click()
      } catch (e) {
        setError(e instanceof Error ? e.message : 'PNG export failed')
      }
    }
    const handleImportJson = () => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.json,application/json'
      input.onchange = async () => {
        const file = input.files?.[0]
        if (!file) return
        try {
          const text = await file.text()
          const parsed = JSON.parse(text)
          if (parsed && Array.isArray(parsed.nodes) && Array.isArray(parsed.edges)) {
            setGraph(layoutImportedGraph(parsed))
            setToast('Imported JSON')
          } else {
            setError('Invalid JSON map format')
          }
        } catch (e) {
          setError(e instanceof Error ? e.message : 'Import failed')
        }
      }
      input.click()
    }
    const handleSaveTemplate = async () => {
      try {
        const name = window.prompt('Save current map as template. Name?')
        if (!name) return
        const tpl = await createTemplate({ title: name, graph })
        setTemplates((prev) => [{ id: tpl.id, title: name }, ...prev])
        setToast('Saved as template')
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to save template')
      }
    }

    window.addEventListener('nc-export-json' as unknown as never, handleExportJson as unknown as EventListener)
    window.addEventListener('nc-export-md' as unknown as never, handleExportMd as unknown as EventListener)
    window.addEventListener('nc-export-png' as unknown as never, handleExportPng as unknown as EventListener)
    window.addEventListener('nc-import-json' as unknown as never, handleImportJson as unknown as EventListener)
    window.addEventListener('nc-import-json-data' as unknown as never, ((e: CustomEvent<Graph>) => {
      const data = (e as CustomEvent<Graph>).detail
      if (data && Array.isArray(data.nodes) && Array.isArray(data.edges)) {
        setGraph(layoutImportedGraph(data))
        setToast('Imported JSON')
      }
    }) as unknown as EventListener)

    // Apply template structure without adding/removing nodes: remap existing nodes
    window.addEventListener('nc-apply-template-structure' as unknown as never, ((e: CustomEvent<Graph>) => {
      const tpl = (e as CustomEvent<Graph>).detail
      if (!tpl || !Array.isArray(tpl.nodes) || !Array.isArray(tpl.edges)) return
      setGraph((prev) => {
        if (!prev.nodes.length) return prev
        const result: Graph = { nodes: [], edges: [] }
        const count = Math.min(prev.nodes.length, tpl.nodes.length)
        for (let i = 0; i < count; i++) {
          const existing = prev.nodes[i]
          const shape = tpl.nodes[i]
          result.nodes.push({
            id: existing.id,
            label: shape.label ?? existing.label,
            type: shape.type ?? existing.type,
            emotion: shape.emotion ?? existing.emotion,
            priority: shape.priority ?? existing.priority,
            position: existing.position // preserve current positions
          })
        }
        // edges: try to rewire based on index mapping; keep only edges that map to existing nodes
        const idMap = new Map<string, string>()
        for (let i = 0; i < count; i++) {
          idMap.set(tpl.nodes[i].id, result.nodes[i].id)
        }
        const newEdges: typeof result.edges = []
        for (const e2 of tpl.edges) {
          const src = idMap.get(e2.source)
          const dst = idMap.get(e2.target)
          if (src && dst) {
            newEdges.push({ id: `${src}-${dst}-${Math.random().toString(36).slice(2)}`, source: src, target: dst, label: e2.label })
          }
        }
        // If template has no edges mapping, keep existing edges
        result.edges = newEdges.length ? newEdges : prev.edges
        return result
      })
      setToast('Applied template structure')
    }) as unknown as EventListener)
    window.addEventListener('nc-save-template' as unknown as never, handleSaveTemplate as unknown as EventListener)
    return () => {
      window.removeEventListener('nc-export-json' as unknown as never, handleExportJson as unknown as EventListener)
      window.removeEventListener('nc-export-md' as unknown as never, handleExportMd as unknown as EventListener)
      window.removeEventListener('nc-export-png' as unknown as never, handleExportPng as unknown as EventListener)
      window.removeEventListener('nc-import-json' as unknown as never, handleImportJson as unknown as EventListener)
      window.removeEventListener('nc-import-json-data' as unknown as never, (() => {}) as unknown as EventListener)
      window.removeEventListener('nc-apply-template-structure' as unknown as never, (() => {}) as unknown as EventListener)
      window.removeEventListener('nc-save-template' as unknown as never, handleSaveTemplate as unknown as EventListener)
    }
  }, [graph, title, setGraph, layoutImportedGraph])

  // Version actions
  const handleLoadVersion = useCallback(async (versionNumber: number) => {
    if (!params?.id) return
    setError('')
    try {
      const v = await getVersion(String(params.id), versionNumber)
      setGraph(v.graph)
      setToast(`Loaded v${v.version} (not yet saved)`)    
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load version')
    }
  }, [params?.id])

  const handleRestoreVersion = useCallback(async (versionNumber: number) => {
    if (!params?.id) return
    setError('')
    previousGraphRef.current = graph
    try {
      // Optimistic: apply immediately
      const v = await getVersion(String(params.id), versionNumber)
      setGraph(v.graph)
      await restoreVersion(String(params.id), versionNumber)
      setToast(`Restored to v${versionNumber}`)
    } catch (e: unknown) {
      // Rollback
      if (previousGraphRef.current) setGraph(previousGraphRef.current)
      setError(e instanceof Error ? e.message : 'Failed to restore version')
    } finally {
      previousGraphRef.current = null
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
    <div className="space-y-6" ref={containerRef}>
      <div className="flex items-center gap-3">
        <input
          className="rounded-md border px-2 py-1 text-sm border-white/15 bg-white/5 text-white placeholder:text-white/60"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={async () => { if (params?.id) { try { await updateMap(String(params.id), { title }) } catch {} } }}
          aria-label="Map title"
        />
        <span className="text-xs text-white/70">{autoSaving ? 'Saving…' : 'Saved'}</span>
      </div>
      <AuthGate>
        {loading ? <p className="text-sm text-white/70">Loading…</p> : null}
        {error ? <p className="text-sm text-red-300" role="alert">{error}</p> : null}
        {toast ? <p className="text-sm text-emerald-300" role="status">{toast}</p> : null}

        <div className="space-y-3">
          <MapCanvas nodes={graph.nodes} edges={graph.edges} readOnly={false} onChange={handleChange} enableToolbar layoutMode={layoutMode} onLayoutModeChange={setLayoutMode} className="h-[720px]" />
          <div className="flex items-center gap-3 flex-wrap">
            <input
              value={checkpointLabel}
              onChange={(e) => setCheckpointLabel(e.target.value)}
              placeholder="Checkpoint label"
              aria-label="Checkpoint label"
              className="rounded-md border px-2 py-1 text-sm border-white/15 bg-white/5 text-white placeholder:text-white/60"
            />
            <button
              className="rounded-md border border-white/15 text-white px-3 py-1.5 text-sm hover:bg-white/10 disabled:opacity-50"
              onClick={handleSaveVersion}
              disabled={saving}
            >
              {saving ? 'Saving…' : 'Save Version'}
            </button>
            <button
              className="rounded-md border px-3 py-1.5 text-sm border-white/15 hover:bg-white/10"
              onClick={async () => { if (params?.id) { setSaving(true); try { await updateMap(String(params.id), { graph, layout: layoutMode !== 'none' ? { mode: layoutMode } : undefined }) } finally { setSaving(false) } } }}
            >
              Save
            </button>

            {/* Export */}
            <div className="ml-2 inline-flex items-center gap-2">
              <span className="text-xs text-white/70">Export:</span>
              <button
                className="rounded-md border px-2 py-1 text-xs border-white/15 hover:bg-white/10"
                onClick={() => {
                  const blob = new Blob([JSON.stringify(graph, null, 2)], { type: 'application/json' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `${title || 'map'}.json`
                  a.click()
                  URL.revokeObjectURL(url)
                }}
              >JSON</button>
              <button
                className="rounded-md border px-2 py-1 text-xs border-white/15 hover:bg-white/10"
                onClick={async () => {
                  try {
                    const node = containerRef.current?.querySelector('[data-testid="react-flow__renderer"]') as HTMLElement | null
                    const target = node ?? containerRef.current as HTMLElement | null
                    if (!target) return
                    const dataUrl = await htmlToImage.toPng(target, { pixelRatio: 2 })
                    const a = document.createElement('a')
                    a.href = dataUrl
                    a.download = `${title || 'map'}.png`
                    a.click()
                  } catch (e) {
                    setError(e instanceof Error ? e.message : 'PNG export failed')
                  }
                }}
              >PNG</button>
              <button
                className="rounded-md border px-2 py-1 text-xs border-white/15 hover:bg-white/10"
                onClick={() => {
                  // simple markdown: list nodes and edges
                  const lines = [
                    `# ${title || 'Map'}`,
                    '',
                    '## Nodes',
                    ...graph.nodes.map(n => `- ${n.id}: ${n.label}${n.type ? ` [${n.type}]` : ''}`),
                    '',
                    '## Edges',
                    ...graph.edges.map(e => `- ${e.source} -> ${e.target}${e.label ? ` (${e.label})` : ''}`)
                  ]
                  const blob = new Blob([lines.join('\n')], { type: 'text/markdown' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `${title || 'map'}.md`
                  a.click()
                  URL.revokeObjectURL(url)
                }}
              >Markdown</button>
            </div>

            {/* Import */}
            <div className="ml-2 inline-flex items-center gap-2">
              <span className="text-xs text-white/70">Import:</span>
              <button
                className="rounded-md border px-2 py-1 text-xs border-white/15 hover:bg-white/10"
                onClick={() => {
                  const input = document.createElement('input')
                  input.type = 'file'
                  input.accept = '.json,application/json'
                  input.onchange = async () => {
                    const file = input.files?.[0]
                    if (!file) return
                    try {
                      const text = await file.text()
                      const parsed = JSON.parse(text)
                      if (parsed && Array.isArray(parsed.nodes) && Array.isArray(parsed.edges)) {
                        setGraph(parsed)
                        setToast('Imported JSON')
                      } else {
                        setError('Invalid JSON map format')
                      }
                    } catch (e) {
                      setError(e instanceof Error ? e.message : 'Import failed')
                    }
                  }
                  input.click()
                }}
              >JSON</button>
              <details className="text-xs">
                <summary className="cursor-pointer select-none rounded-md border px-2 py-1 border-white/15 hover:bg-white/10 inline-block">Raw notes → AI</summary>
                <div className="mt-2 flex items-start gap-2">
                  <textarea
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                    placeholder="Paste raw notes..."
                    className="min-w-[320px] h-24 rounded-md border px-2 py-1 text-xs border-white/15 bg-white/5 text-white placeholder:text-white/60"
                  />
                  <button
                    className="rounded-md border px-2 py-1 text-xs border-white/15 hover:bg-white/10"
                    onClick={async () => {
                      if (!importText.trim()) return
                      try {
                        // Reuse server generation with text mode
                        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000'}/api/maps/generate`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ input: importText, mode: 'text' })
                        })
                        if (!res.ok) throw new Error('AI parse failed')
                        const data = await res.json()
                        setGraph(data.map)
                        setToast('Parsed notes into map')
                      } catch (e) {
                        setError(e instanceof Error ? e.message : 'AI parse failed')
                      }
                    }}
                  >Parse</button>
                </div>
              </details>
            </div>

            {/* Templates */}
            <div className="ml-2 inline-flex items-center gap-2">
              <span className="text-xs text-white/70">Templates:</span>
              <select
                className="rounded-md border px-2 py-1 text-xs border-white/15 bg-transparent"
                onChange={async (e) => {
                  const id = e.target.value
                  if (!id) return
                  try {
                    const isBuiltIn = templates.find((t) => t.id === id)?.builtIn
                    if (isBuiltIn) {
                      const tpl = builtInTemplates.find((t) => t.id === id)
                      if (tpl) {
                        setGraph(tpl.graph)
                        setToast(`Applied template: ${tpl.title}`)
                      }
                    } else {
                      const t = await getTemplate(id)
                      setGraph(t.graph)
                      setToast(`Applied template: ${t.title}`)
                    }
                  } catch (e) {
                    setError(e instanceof Error ? e.message : 'Failed to apply template')
                  }
                }}
              >
                <option value="">Select template…</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
              <button
                className="rounded-md border px-2 py-1 text-xs border-white/15 hover:bg-white/10"
                onClick={async () => {
                  try {
                    const name = window.prompt('Save current map as template. Name?')
                    if (!name) return
                    const tpl = await createTemplate({ title: name, graph })
                    setTemplates((prev) => [{ id: tpl.id, title: name }, ...prev])
                    setToast('Saved as template')
                  } catch (e) {
                    setError(e instanceof Error ? e.message : 'Failed to save template')
                  }
                }}
              >Save as template</button>
            </div>
          </div>
        </div>

        <section className="space-y-2">
          <h2 className="text-lg font-medium">Versions</h2>
          <ul className="space-y-2">
            {versions.map((v) => (
              <li key={v.id} className="flex items-center gap-2 text-sm">
                <span className="text-white/90">v{v.version}</span>
                {v.label ? <span className="px-1.5 py-0.5 text-[11px] rounded bg-white/10">{v.label}</span> : null}
                <span className="text-white/70">{new Date(v.created_at).toLocaleString()}</span>
                <span className="ml-auto inline-flex items-center gap-2">
                  <button className="rounded-md border px-2 py-0.5 text-[12px] border-white/15 hover:bg-white/10" onClick={() => handleLoadVersion(v.version)} aria-label={`Load version ${v.version}`}>Load</button>
                  <button className="rounded-md border px-2 py-0.5 text-[12px] border-white/15 hover:bg-white/10" onClick={() => handleRestoreVersion(v.version)} aria-label={`Restore version ${v.version}`}>Restore</button>
                </span>
              </li>
            ))}
            {versions.length === 0 && !loading && <li className="text-sm text-white/70">No versions yet.</li>}
          </ul>
        </section>
      </AuthGate>
    </div>
  )
}


