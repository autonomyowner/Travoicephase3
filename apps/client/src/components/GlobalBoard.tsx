"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import TemplatesMenu from './TemplatesMenu'
import MapCanvas from './MapCanvas'
import VoiceRecorder from './VoiceRecorder'
import TopToolbar from './TopToolbar'
import { parseTextToMapGraph } from "../lib/parser"

type Node = {
  id: string
  label: string
  position?: { x: number; y: number }
  type?: 'root' | 'thought' | 'action' | 'emotion'
}
type Edge = { id: string; source: string; target: string; label?: string }


export default function GlobalBoard() {
  const [graph, setGraph] = useState<{ nodes: Node[]; edges: Edge[] }>(() => ({
    nodes: [
      { id: 'root', label: 'Start', position: { x: 0, y: 0 }, type: 'root' },
      { id: 'n1', label: 'Idea', position: { x: 240, y: 0 }, type: 'thought' }
    ],
    edges: [{ id: 'e-root-n1', source: 'root', target: 'n1' }]
  }))
  const [quickText, setQuickText] = useState("")

  const nodes = useMemo(() => graph.nodes, [graph.nodes])
  const edges = useMemo(() => graph.edges, [graph.edges])

  const handleGenerateFromText = useCallback(() => {
    const parsed = parseTextToMapGraph(quickText)
    if (!parsed.nodes.length) return
    // Append to existing graph with unique ids to avoid collisions
    const suffix = `g${Date.now().toString(36)}`
    const idMap = new Map<string, string>()
    const newNodes = parsed.nodes.map((n) => {
      const newId = `${n.id}-${suffix}`
      idMap.set(n.id, newId)
      return { ...n, id: newId }
    })
    const newEdges = parsed.edges.map((e) => ({
      ...e,
      id: `${e.id}-${suffix}`,
      source: idMap.get(e.source) || e.source,
      target: idMap.get(e.target) || e.target
    }))
    setGraph((prev) => ({ nodes: [...prev.nodes, ...newNodes], edges: [...prev.edges, ...newEdges] }))
  }, [quickText])

  const handleTranscribed = useCallback((text: string) => {
    setQuickText((prev) => (prev ? prev + "\n" : "") + text)
  }, [])

  const handleDelta = useCallback((delta: { nodes?: any[]; edges?: any[] }) => {
    if (!delta) return
    setGraph((prev) => {
      const next = { nodes: prev.nodes.slice(), edges: prev.edges.slice() }
      const existingIds = new Set(next.nodes.map((n) => n.id))
      for (const n of (delta.nodes || [])) {
        if (!existingIds.has(n.id)) {
          next.nodes.push({ id: n.id, label: n.label, position: n.position, type: n.type })
          existingIds.add(n.id)
        }
      }
      const existingEdgeIds = new Set(next.edges.map((e) => e.id))
      for (const e of (delta.edges || [])) {
        if (!existingEdgeIds.has(e.id)) {
          next.edges.push({ id: e.id, source: String(e.source), target: String(e.target), label: e.label })
          existingEdgeIds.add(e.id)
        }
      }
      return next
    })
  }, [])

  // Accept JSON import events globally (ensures header Import works on any page)
  useEffect(() => {
    const layoutImported = (g: { nodes: Node[]; edges: Edge[] }): { nodes: Node[]; edges: Edge[] } => {
      const needs = g.nodes.every((n) => !n.position)
      if (!needs) return g
      const spacingX = 240
      const spacingY = 120
      const cols = 4
      const rootIndex = g.nodes.findIndex((n) => n.type === 'root')
      const ordered = [...g.nodes]
      if (rootIndex > 0) {
        const [rootNode] = ordered.splice(rootIndex, 1)
        ordered.unshift(rootNode)
      }
      const withPos = ordered.map((n, i) => ({
        ...n,
        position: { x: (i % cols) * spacingX, y: Math.floor(i / cols) * spacingY }
      }))
      return { nodes: withPos, edges: g.edges }
    }
    const onData = (e: Event) => {
      const ce = e as CustomEvent<{ nodes: Node[]; edges: Edge[] }>
      const data = ce.detail
      if (data && Array.isArray(data.nodes) && Array.isArray(data.edges)) {
        setGraph(layoutImported(data))
        // fit-view hint
        window.dispatchEvent(new CustomEvent('nc-fit-view'))
      }
    }
    window.addEventListener('nc-import-json-data' as unknown as never, onData as unknown as EventListener)
    return () => window.removeEventListener('nc-import-json-data' as unknown as never, onData as unknown as EventListener)
  }, [])

  return (
    <>
      <MapCanvas
        nodes={nodes}
        edges={edges}
        readOnly={false}
        enableToolbar
        variant="background"
        onChange={(next) => setGraph(next)}
      />
      <TopToolbar />
      <TemplatesMenu />
      {/* Top-left: Audio record bar */}
      <div className="fixed top-16 left-3 z-40 w-[300px] pointer-events-auto">
        <div className="rounded-lg border border-white/20 bg-black/40 backdrop-blur p-2 shadow-xl">
          <div className="text-[11px] font-medium mb-1 text-white">Voice</div>
          <VoiceRecorder mode="live" onTranscribed={handleTranscribed} onDelta={handleDelta} />
        </div>
      </div>
      {/* Top-right: Quick text to nodes */}
      <div className="fixed top-16 right-3 z-40 w-[360px] pointer-events-auto">
        <div className="rounded-lg border border-white/20 bg-black/40 backdrop-blur p-2.5 space-y-2 shadow-xl">
          <label htmlFor="quick-text" className="text-[11px] font-medium text-white">Quick text</label>
          <textarea
            id="quick-text"
            rows={3}
            value={quickText}
            onChange={(e) => setQuickText(e.target.value)}
            className="w-full rounded-md border border-white/25 bg-white/5 p-2 text-xs outline-none focus:ring-2 focus:ring-white/25 placeholder:text-white/60"
            placeholder="Type here to generate nodes (supports tags like [type:action], {id:task1}, link: @root -> @task1)"
          />
          <div className="flex items-center justify-end">
            <button
              onClick={() => {
                handleGenerateFromText()
                window.dispatchEvent(new CustomEvent('nc-fit-view'))
              }}
              className="rounded-md bg-black text-white px-2.5 py-1 text-xs hover:bg-black/90"
            >Generate nodes</button>
          </div>
        </div>
      </div>
    </>
  )
}


