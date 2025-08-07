"use client"

import React, { useMemo, useEffect, useCallback, useRef } from "react"
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  NodeProps,
  Handle,
  Position
} from "reactflow"
import "reactflow/dist/style.css"

type BaseNode = { id: string; label: string; position?: { x: number; y: number }; type?: 'root' | 'thought' | 'action' | 'emotion' }
type BaseEdge = { id: string; source: string; target: string; label?: string }

type MapCanvasProps = {
  nodes: Array<BaseNode>
  edges: Array<BaseEdge>
  readOnly?: boolean
  onChange?: (next: { nodes: Array<BaseNode>; edges: Array<BaseEdge> }) => void
  enableToolbar?: boolean
  layoutMode?: 'none' | 'tree' | 'radial'
  onLayoutModeChange?: (mode: 'none' | 'tree' | 'radial') => void
}

function classNames(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(" ")
}

function NodeBadge({ type }: { type?: BaseNode["type"] }) {
  const color = type === 'root' ? 'bg-indigo-600' : type === 'action' ? 'bg-emerald-600' : type === 'emotion' ? 'bg-rose-600' : 'bg-slate-600'
  const text = type ?? 'thought'
  return (
    <span className={classNames('inline-block text-[10px] leading-none px-1.5 py-0.5 rounded text-white', color)}>{text}</span>
  )
}

function NcNode({ data }: NodeProps<{ label: string; type?: BaseNode['type'] }>) {
  const accent = data.type === 'root' ? 'ring-indigo-500' : data.type === 'action' ? 'ring-emerald-500' : data.type === 'emotion' ? 'ring-rose-500' : 'ring-slate-500'
  return (
    <div className={classNames('relative rounded-md border border-black/10 dark:border-white/15 bg-white dark:bg-black text-sm ring-2 px-3 py-2 shadow-sm', accent)}>
      <div className="flex items-center gap-2">
        <NodeBadge type={data.type} />
        <span className="font-medium">{data.label}</span>
      </div>
      {/* in/out handles for wiring */}
      <Handle type="target" position={Position.Top} className="!w-2 !h-2" />
      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2" />
    </div>
  )
}

const nodeTypes = { ncNode: NcNode }

export default function MapCanvas({ nodes, edges, readOnly = false, onChange, enableToolbar = false, layoutMode = 'none', onLayoutModeChange }: MapCanvasProps) {
  const initialNodes = useMemo<Node[]>(
    () =>
      nodes.map((n) => ({
        id: n.id,
        position: n.position ?? { x: 0, y: 0 },
        data: { label: n.label, type: n.type },
        type: 'ncNode'
      })),
    [nodes]
  )
  const initialEdges = useMemo<Edge[]>(
    () => edges.map((e) => ({ id: e.id, source: e.source, target: e.target, label: e.label })),
    [edges]
  )

  const isInteractive = !!onChange && !readOnly

  const [rfNodes, setRfNodes, onNodesChange] = useNodesState(initialNodes)
  const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState(initialEdges)
  const onChangeRef = useRef<typeof onChange>(onChange)
  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  // Only sync from props when the set of node/edge IDs changes (e.g., new generation/load),
  // not for every minor edit which the canvas already emits via onChange.
  const suppressEmitRef = useRef(false)
  const lastExternalSigRef = useRef<string | null>(null)
  const externalSig = useMemo(() => {
    const nIds = nodes.map((n) => n.id).join('|')
    const eIds = edges.map((e) => e.id).join('|')
    return `${nIds}::${eIds}`
  }, [nodes, edges])
  useEffect(() => {
    const shouldSync = !isInteractive || lastExternalSigRef.current !== externalSig
    if (!shouldSync) return
    suppressEmitRef.current = true
    lastExternalSigRef.current = externalSig
    setRfNodes(initialNodes)
    setRfEdges(initialEdges)
  }, [externalSig, isInteractive, initialNodes, initialEdges, setRfNodes, setRfEdges])

  const handleConnect = useCallback((connection: Connection) => {
    setRfEdges((eds) => addEdge({ ...connection, id: `${connection.source}-${connection.target}-${Math.random().toString(36).slice(2)}` }, eds))
  }, [setRfEdges])

  // Emit changes upward if interactive
  useEffect(() => {
    if (!isInteractive || !onChange) return
    if (suppressEmitRef.current) { suppressEmitRef.current = false; return }
    const nextNodes: Array<BaseNode> = rfNodes.map((n) => {
      const data = n.data as { label: string; type?: BaseNode['type'] } | undefined
      return { id: n.id, label: data?.label ?? '', type: data?.type, position: n.position }
    })
    const nextEdges: Array<BaseEdge> = rfEdges.map((e) => ({
      id: e.id,
      source: String(e.source),
      target: String(e.target),
      label: typeof (e as Edge).label === 'string' ? ((e as Edge).label as string) : undefined
    }))
    onChangeRef.current?.({ nodes: nextNodes, edges: nextEdges })
  }, [rfNodes, rfEdges, isInteractive])

  // Inline label editing on double-click
  const handleNodeDoubleClick = useCallback((_: React.MouseEvent, node: Node<{ label: string; type?: BaseNode['type'] }>) => {
    if (!isInteractive) return
    const current = node.data?.label ?? ''
    const next = window.prompt('Edit label', current)
    if (next === null) return
    setRfNodes((prev) => prev.map((n) => n.id === node.id ? { ...n, data: { ...(n.data as { label: string; type?: BaseNode['type'] } | undefined), label: next } } : n))
  }, [isInteractive, setRfNodes])

  // Basic toolbar and context actions
  const addNode = useCallback(() => {
    if (!isInteractive) return
    const newId = `n-${Math.random().toString(36).slice(2)}`
    setRfNodes((prev) => prev.concat({ id: newId, position: { x: 50, y: 50 }, data: { label: 'New node', type: 'thought' } as { label: string; type?: BaseNode['type'] }, type: 'ncNode' }))
  }, [isInteractive, setRfNodes])
  const deleteSelection = useCallback(() => {
    if (!isInteractive) return
    setRfNodes((prev) => prev.filter((n) => !n.selected))
    setRfEdges((prev) => prev.filter((e) => !e.selected))
  }, [isInteractive, setRfNodes, setRfEdges])
  const convertSelectedType = useCallback((to: BaseNode['type']) => {
    if (!isInteractive) return
    setRfNodes((prev) => prev.map((n) => n.selected ? { ...n, data: { ...(n.data as { label: string; type?: BaseNode['type'] } | undefined), type: to } } : n))
  }, [isInteractive, setRfNodes])

  // Simple layout toggles (placeholder: no auto layout engine wired yet)
  useEffect(() => {
    // Keep manual positions; this placeholder just records mode via parent
  }, [layoutMode])

  return (
    <div className="h-[520px] w-full rounded-md border border-black/10 dark:border-white/15 bg-black/5 dark:bg-white/5">
      {enableToolbar ? (
        <div className="flex items-center gap-2 p-2 border-b border-black/10 dark:border-white/15">
          <button onClick={addNode} className="rounded-md border px-2 py-1 text-xs border-black/10 dark:border-white/15">Add node</button>
          <button onClick={deleteSelection} className="rounded-md border px-2 py-1 text-xs border-black/10 dark:border-white/15">Delete selection</button>
          <div className="flex items-center gap-1 text-xs">
            <span>Convert:</span>
            <button onClick={() => convertSelectedType('thought')} className="rounded-md border px-2 py-1 border-black/10 dark:border-white/15">Thought</button>
            <button onClick={() => convertSelectedType('action')} className="rounded-md border px-2 py-1 border-black/10 dark:border-white/15">Action</button>
            <button onClick={() => convertSelectedType('emotion')} className="rounded-md border px-2 py-1 border-black/10 dark:border-white/15">Emotion</button>
            <button onClick={() => convertSelectedType('root')} className="rounded-md border px-2 py-1 border-black/10 dark:border-white/15">Root</button>
          </div>
          <div className="ml-auto flex items-center gap-1 text-xs">
            <span>Layout:</span>
            <select
              value={layoutMode}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onLayoutModeChange?.(e.target.value as 'none' | 'tree' | 'radial')}
              className="rounded-md border px-2 py-1 border-black/10 dark:border-white/15 bg-transparent"
            >
              <option value="none">None</option>
              <option value="tree">Tree</option>
              <option value="radial">Radial</option>
            </select>
          </div>
        </div>
      ) : null}
      <ReactFlow
        nodes={isInteractive ? rfNodes : initialNodes}
        edges={isInteractive ? rfEdges : initialEdges}
        onNodesChange={isInteractive ? onNodesChange : undefined}
        onEdgesChange={isInteractive ? onEdgesChange : undefined}
        onConnect={isInteractive ? handleConnect : undefined}
        nodeTypes={nodeTypes}
        onNodeDoubleClick={handleNodeDoubleClick}
        fitView
      >
        <MiniMap />
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  )
}


