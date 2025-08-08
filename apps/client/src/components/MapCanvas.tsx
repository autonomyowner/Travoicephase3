"use client"

import React, { useMemo, useEffect, useCallback, useRef, useState } from "react"
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
  Position,
  MarkerType,
  useReactFlow,
  ReactFlowProvider,
} from "reactflow"
import { NodeResizer } from '@reactflow/node-resizer'
import '@reactflow/node-resizer/dist/style.css'
import "reactflow/dist/style.css"

type Emotion = 'positive' | 'neutral' | 'negative'
type EdgeData = { curve?: 'flexible' | 'straight'; line?: 'dashed' | 'solid' }
type NodeTheme =
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

type BaseNode = {
  id: string
  label: string
  position?: { x: number; y: number }
  type?: 'root' | 'thought' | 'action' | 'emotion'
  emotion?: Emotion
  priority?: number
  theme?: NodeTheme
  width?: number
  height?: number
  extraHandles?: Array<{ id: string; type: 'source' | 'target'; position: Position; offsetPercent?: number }>
}
type BaseEdge = {
  id: string
  source: string
  target: string
  label?: string
  curve?: 'flexible' | 'straight'
  line?: 'dashed' | 'solid'
}

type MapCanvasProps = {
  nodes: Array<BaseNode>
  edges: Array<BaseEdge>
  readOnly?: boolean
  onChange?: (next: { nodes: Array<BaseNode>; edges: Array<BaseEdge> }) => void
  enableToolbar?: boolean
  layoutMode?: 'none' | 'tree' | 'radial'
  onLayoutModeChange?: (mode: 'none' | 'tree' | 'radial') => void
  className?: string
  variant?: 'panel' | 'background'
}

function classNames(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(" ")
}

function NodeBadge({ type }: { type?: BaseNode["type"] }) {
  const color = type === 'root'
    ? 'bg-amber-600'
    : type === 'action'
      ? 'bg-amber-500'
      : type === 'emotion'
        ? 'bg-amber-700'
        : 'bg-amber-400'
  const text = type ?? 'thought'
  return (
    <span className={classNames('inline-block text-[10px] leading-none px-1.5 py-0.5 rounded text-white', color)}>{text}</span>
  )
}

function PriorityBadge({ priority }: { priority?: number }) {
  if (priority == null) return null
  return (
    <span
      aria-label={`priority ${priority}`}
      className={classNames(
        'absolute -top-2 -right-2 inline-flex items-center justify-center rounded-full text-[10px] h-5 w-5 border shadow-sm',
        priority <= 2 ? 'bg-amber-500 text-black border-amber-600' : priority === 3 ? 'bg-slate-500 text-white border-slate-600' : 'bg-slate-700 text-white border-slate-800'
      )}
    >
      {priority}
    </span>
  )
}

function NodeIcon({ type }: { type?: BaseNode['type'] }) {
  const common = 'w-4 h-4'
  if (type === 'root') {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 2l2.39 4.84 5.34.78-3.86 3.76.91 5.32L12 14.77 7.22 16.7l.91-5.32L4.27 7.62l5.34-.78L12 2z" />
      </svg>
    )
  }
  if (type === 'action') {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
      </svg>
    )
  }
  if (type === 'emotion') {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12.1 21.35l-1.1-1.01C5.14 14.24 2 11.39 2 7.99 2 5.24 4.24 3 6.99 3c1.54 0 3.04.74 4 1.9A5.14 5.14 0 0 1 15 3c2.76 0 5 2.24 5 4.99 0 3.4-3.14 6.25-8.01 12.34l-1.89 1.02z" />
      </svg>
    )
  }
  // thought (default)
  return (
    <svg className={common} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19 10a7 7 0 0 0-13.9-1.5A4.5 4.5 0 0 0 6.5 19H9l.5 2 1.5-2h2a6 6 0 0 0 6-6z" />
    </svg>
  )
}

function NcNode({ id, selected, data }: NodeProps<{ label: string; type?: BaseNode['type']; emotion?: Emotion; priority?: number; theme?: NodeTheme; extraHandles?: Array<{ id: string; type: 'source' | 'target'; position: Position; offsetPercent?: number }> }>) {
  const baseRing = data.type === 'root' ? 'ring-amber-500' : data.type === 'action' ? 'ring-amber-400' : 'ring-amber-300'
  const emotionRing = data.emotion === 'positive' ? 'ring-amber-400' : data.emotion === 'negative' ? 'ring-amber-600' : 'ring-amber-300'
  const ringColor = data.emotion ? emotionRing : baseRing

  const themeClass = ((): string | undefined => {
    switch (data.theme) {
      // Core themes
      case 'emerald':
        return 'bg-gradient-to-br from-slate-900 via-cyan-900 to-slate-900 text-white'
      case 'sapphire':
        return 'bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white'
      case 'goldenMajesty':
        return 'bg-gradient-to-br from-slate-900 via-amber-900 to-slate-900 text-amber-100'
      case 'silver':
        return 'bg-gradient-to-br from-slate-900 via-gray-800 to-slate-900 text-gray-100'
      case 'royalPurple':
        return 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-purple-100'
      case 'crimson':
        return 'bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 text-red-100'
      case 'teal':
        return 'bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900 text-teal-100'
      case 'indigo':
        return 'bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 text-indigo-100'
      case 'rose':
        return 'bg-gradient-to-br from-slate-900 via-rose-900 to-slate-900 text-rose-100'
      // Metallic variants
      case 'vibrantGold':
        return 'bg-gradient-to-br from-slate-900 via-amber-400 to-slate-900 text-slate-900'
      case 'richGold':
        return 'bg-gradient-to-br from-slate-900 via-amber-600 to-slate-900 text-amber-50'
      case 'brightGold':
        return 'bg-gradient-to-br from-slate-900 via-yellow-500 to-slate-900 text-slate-900'
      case 'warmOrange':
        return 'bg-gradient-to-br from-slate-900 via-orange-500 to-slate-900 text-slate-900'
      default:
        return undefined
    }
  })()
  const defaultThemeClass = 'bg-gradient-to-br from-slate-900 via-cyan-900 to-slate-900 text-white'

  // Shape-specific classes
  const isThought = data.type === 'thought' || !data.type
  const isRoot = data.type === 'root'
  const isEmotion = data.type === 'emotion'

  if (isThought) {
    // Circle
    return (
      <div className={classNames('relative flex flex-col items-center justify-center text-center ring-2 shadow-sm hover:shadow-md transition-shadow rounded-full px-3 w-full h-full', ringColor, themeClass ?? defaultThemeClass)}> 
        <NodeResizer color="#d4af37" isVisible={selected} minWidth={96} minHeight={96} keepAspectRatio />
        {(data?.extraHandles || []).map((h) => (
          <Handle key={h.id} id={h.id} type={h.type} position={h.position} className="!w-2 !h-2" style={
            h.position === Position.Left || h.position === Position.Right
              ? { top: `${h.offsetPercent ?? 50}%` }
              : { left: `${h.offsetPercent ?? 50}%` }
          } />
        ))}
        <PriorityBadge priority={data.priority} />
        <span className="font-medium text-sm leading-tight">{data.label}</span>
        <div className="leading-none mt-1"><NodeBadge type={'thought'} /></div>
        <Handle type="target" position={Position.Left} className="!w-2 !h-2" />
        <Handle type="source" position={Position.Right} className="!w-2 !h-2" />
      </div>
    )
  }

  if (isRoot) {
    // Triangle using clip-path; 3 handles (top/left/right)
    const rootTheme = themeClass ?? 'bg-white/95 text-slate-900'
    return (
      <div
        className={classNames(
          'relative hover:shadow-md transition-shadow w-full h-full',
          'shadow-[0_0_0_2px_rgba(234,179,8,0.7)]',
          rootTheme
        )}
        style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}
      >
        <NodeResizer color="#d4af37" isVisible={selected} minWidth={120} minHeight={84} />
        {(data?.extraHandles || []).map((h) => (
          <Handle key={h.id} id={h.id} type={h.type} position={h.position} className="!w-2 !h-2" style={
            h.position === Position.Left || h.position === Position.Right
              ? { top: `${h.offsetPercent ?? 50}%` }
              : { left: `${h.offsetPercent ?? 50}%` }
          } />
        ))}
        <div className="absolute inset-0 flex items-center justify-center text-center px-4">
          <span className="font-semibold text-sm leading-tight">{data.label}</span>
        </div>
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 leading-none"><NodeBadge type={'root'} /></div>
        <PriorityBadge priority={data.priority} />
        {/* Edge handles positioned near triangle edges with visible gold dots */}
        {/* Left edge midpoint */}
        <Handle
          type="source"
          position={Position.Left}
          className="!w-2 !h-2"
          style={{ top: '58%', zIndex: 5, background: '#d4af37', border: '1px solid #fff', pointerEvents: 'auto' }}
        />
        <Handle
          type="target"
          position={Position.Left}
          className="!w-2 !h-2"
          style={{ top: '58%', zIndex: 5, background: '#d4af37', border: '1px solid #fff', pointerEvents: 'auto' }}
        />
        {/* Right edge midpoint */}
        <Handle
          type="source"
          position={Position.Right}
          className="!w-2 !h-2"
          style={{ top: '58%', zIndex: 5, background: '#d4af37', border: '1px solid #fff', pointerEvents: 'auto' }}
        />
        <Handle
          type="target"
          position={Position.Right}
          className="!w-2 !h-2"
          style={{ top: '58%', zIndex: 5, background: '#d4af37', border: '1px solid #fff', pointerEvents: 'auto' }}
        />
        {/* Apex */}
        <Handle
          type="source"
          position={Position.Top}
          className="!w-2 !h-2"
          style={{ left: '50%', transform: 'translateX(-50%)', zIndex: 5, background: '#d4af37', border: '1px solid #fff', pointerEvents: 'auto' }}
        />
        <Handle
          type="target"
          position={Position.Top}
          className="!w-2 !h-2"
          style={{ left: '50%', transform: 'translateX(-50%)', zIndex: 5, background: '#d4af37', border: '1px solid #fff', pointerEvents: 'auto' }}
        />
      </div>
    )
  }

  if (isEmotion) {
    // Box (sharp corners)
    return (
      <div className={classNames('relative ring-2 px-3 py-2 shadow-sm hover:shadow-md transition-shadow rounded-none w-full h-full', ringColor, themeClass ?? defaultThemeClass)}>
        <NodeResizer color="#d4af37" isVisible={selected} minWidth={140} minHeight={44} />
        {(data?.extraHandles || []).map((h) => (
          <Handle key={h.id} id={h.id} type={h.type} position={h.position} className="!w-2 !h-2" style={
            h.position === Position.Left || h.position === Position.Right
              ? { top: `${h.offsetPercent ?? 50}%` }
              : { left: `${h.offsetPercent ?? 50}%` }
          } />
        ))}
        <PriorityBadge priority={data.priority} />
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center bg-amber-700 text-white w-6 h-6" aria-hidden><NodeIcon type={'emotion'} /></span>
          <div className="flex flex-col">
            <span className="font-medium text-[13px]">{data.label}</span>
            <div className="leading-none"><NodeBadge type={'emotion'} /></div>
          </div>
        </div>
        <Handle type="target" position={Position.Left} className="!w-2 !h-2" />
        <Handle type="source" position={Position.Right} className="!w-2 !h-2" />
      </div>
    )
  }

  // Default (action or others) rectangular rounded
  return (
    <div className={classNames('relative rounded-md text-sm ring-2 px-3 py-2 shadow-sm hover:shadow-md transition-shadow w-full h-full', ringColor, themeClass ?? defaultThemeClass)}>
      <NodeResizer color="#d4af37" isVisible={selected} minWidth={140} minHeight={44} />
      {(data?.extraHandles || []).map((h) => (
        <Handle key={h.id} id={h.id} type={h.type} position={h.position} className="!w-2 !h-2" style={
          h.position === Position.Left || h.position === Position.Right
            ? { top: `${h.offsetPercent ?? 50}%` }
            : { left: `${h.offsetPercent ?? 50}%` }
        } />
      ))}
      <PriorityBadge priority={data.priority} />
      <div className="flex items-center gap-2">
        <span className={classNames('inline-flex items-center justify-center rounded-md w-6 h-6', themeClass ? 'bg-black/40 text-white' : 'text-white bg-amber-500')} aria-hidden>
          <NodeIcon type={data.type} />
        </span>
        <div className="flex flex-col">
          <span className="font-medium text-[13px]">{data.label}</span>
          <div className="leading-none"><NodeBadge type={data.type} /></div>
        </div>
      </div>
      <Handle type="target" position={Position.Left} className="!w-2 !h-2" />
      <Handle type="source" position={Position.Right} className="!w-2 !h-2" />
    </div>
  )
}

const nodeTypes = { ncNode: NcNode }

function FlowToolbarControls({ isInteractive }: { isInteractive: boolean }) {
  const rf = useReactFlow()
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => rf.fitView({ padding: 0.2 })}
        className="rounded-md border px-2 py-1 border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10"
        aria-label="Zoom to fit"
      >
        Fit
      </button>
      <button
        onClick={() => {
          const nodes = rf.getNodes()
          const root = nodes.find((n) => (n.data as { type?: BaseNode['type'] } | undefined)?.type === 'root')
          if (root) {
            rf.setCenter(root.position.x, root.position.y, { zoom: 1.2, duration: 300 })
          } else {
            rf.fitView({ padding: 0.2 })
          }
        }}
        className="rounded-md border px-2 py-1 border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10"
        aria-label="Center on root"
      >
        Center
      </button>
      <div className="ml-2 flex items-center gap-1">
        <span className="text-xs">Theme:</span>
        <select
          className="rounded-md border px-2 py-1 border-black/10 dark:border-white/15 bg-transparent text-xs"
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
            if (!isInteractive) return
            const theme = (e.target.value || undefined) as NodeTheme | undefined
            const nodes = rf.getNodes()
            const selectedIds = new Set(nodes.filter((n) => n.selected).map((n) => n.id))
            rf.setNodes(nodes.map((n) => selectedIds.has(n.id)
              ? { ...n, data: { ...(n.data as { label: string; type?: BaseNode['type']; emotion?: Emotion; priority?: number; theme?: NodeTheme; extraHandles?: BaseNode['extraHandles'] } | undefined), theme } }
              : n
            ))
          }}
          defaultValue=""
        >
          <option value="">Default</option>
          <option value="emerald">Professional</option>
          <option value="sapphire">Premium</option>
          <option value="goldenMajesty">Luxury (Gold)</option>
          <option value="silver">Elegant (Silver)</option>
          <option value="royalPurple">Royal</option>
          <option value="crimson">Bold</option>
          <option value="teal">Calming</option>
          <option value="indigo">Intellectual</option>
          <option value="rose">Romantic</option>
          <option value="vibrantGold">Vibrant Gold</option>
          <option value="richGold">Rich Gold</option>
          <option value="brightGold">Bright Gold</option>
          <option value="warmOrange">Warm Orange</option>
        </select>
      </div>
    </div>
  )
}

export default function MapCanvas({ nodes, edges, readOnly = false, onChange, enableToolbar = false, layoutMode = 'none', onLayoutModeChange, className, variant = 'panel' }: MapCanvasProps) {
  const initialNodes = useMemo<Node[]>(
    () =>
      nodes.map((n) => ({
        id: n.id,
        position: n.position ?? { x: 0, y: 0 },
        data: { label: n.label, type: n.type, emotion: n.emotion, priority: n.priority, theme: n.theme, extraHandles: n.extraHandles },
        type: 'ncNode',
        style: {
          width: n.width || (n.type === 'root' ? 160 : n.type === 'emotion' ? 200 : n.type === 'action' ? 220 : 128),
          height: n.height || (n.type === 'root' ? 112 : n.type === 'emotion' ? undefined : n.type === 'action' ? undefined : 128)
        }
      })),
    [nodes]
  )
  const initialEdges = useMemo<Edge[]>(
    () => edges.map((e) => {
      const baseStyle = { stroke: 'rgba(201, 162, 39, 0.9)', strokeWidth: 2 }
      return ({
        id: e.id,
        source: e.source,
        target: e.target,
        label: e.label,
        type: e.curve === 'straight' ? 'straight' : 'default',
        style: e.line === 'dashed' ? { ...baseStyle, strokeDasharray: '6 6' } : baseStyle,
        data: { curve: e.curve, line: e.line } as EdgeData
      })
    }),
    [edges]
  )

  const isInteractive = !!onChange && !readOnly

  const [rfNodes, setRfNodes, onNodesChange] = useNodesState(initialNodes)
  const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState(initialEdges)
  const onChangeRef = useRef<typeof onChange>(onChange)
  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  // Add-handle mode managed via window event
  const addHandleRef = useRef<{ active: boolean; type: 'source' | 'target' }>({ active: false, type: 'source' })
  const [isAddingHandle, setIsAddingHandle] = useState(false)
  useEffect(() => {
    const onStartAdd = (e: Event) => {
      const ce = e as CustomEvent<'source' | 'target' | undefined>
      addHandleRef.current = { active: true, type: (ce.detail ?? 'source') as 'source' | 'target' }
      setIsAddingHandle(true)
      if (containerRef.current) containerRef.current.classList.add('cursor-crosshair')
    }
    window.addEventListener('nc-start-add-handle' as unknown as never, onStartAdd as unknown as EventListener)
    return () => window.removeEventListener('nc-start-add-handle' as unknown as never, onStartAdd as unknown as EventListener)
  }, [])

  // Allow Escape to cancel add-handle mode
  useEffect(() => {
    if (!isAddingHandle) return
    const onKeyDown = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') {
        addHandleRef.current.active = false
        setIsAddingHandle(false)
        if (containerRef.current) containerRef.current.classList.remove('cursor-crosshair')
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isAddingHandle])

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
    if (!isInteractive || !onChangeRef.current) return
    if (suppressEmitRef.current) { suppressEmitRef.current = false; return }
    const nextNodes: Array<BaseNode> = rfNodes.map((n) => {
      const data = n.data as { label: string; type?: BaseNode['type']; emotion?: Emotion; priority?: number; theme?: NodeTheme; extraHandles?: BaseNode['extraHandles'] } | undefined
      return {
        id: n.id,
        label: data?.label ?? '',
        type: data?.type,
        emotion: data?.emotion,
        priority: data?.priority,
        theme: data?.theme,
        extraHandles: data?.extraHandles,
        width: typeof n.width === 'number' ? n.width : undefined,
        height: typeof n.height === 'number' ? n.height : undefined,
        position: n.position,
      }
    })
    const nextEdges: Array<BaseEdge> = rfEdges.map((e) => ({
      id: e.id,
      source: String(e.source),
      target: String(e.target),
      label: typeof (e as Edge).label === 'string' ? ((e as Edge).label as string) : undefined,
      curve: (e.data as EdgeData | undefined)?.curve,
      line: (e.data as EdgeData | undefined)?.line
    }))
    onChangeRef.current?.({ nodes: nextNodes, edges: nextEdges })
  }, [rfNodes, rfEdges, isInteractive])

  // Inline label editing on double-click (simple prompt for now)
  const handleNodeDoubleClick = useCallback((_: React.MouseEvent, node: Node<{ label: string; type?: BaseNode['type'] }>) => {
    if (!isInteractive) return
    const current = node.data?.label ?? ''
    const next = window.prompt('Edit label', current)
    if (next === null) return
    setRfNodes((prev) => prev.map((n) => n.id === node.id ? { ...n, data: { ...(n.data as { label: string; type?: BaseNode['type'] } | undefined), label: next } } : n))
  }, [isInteractive, setRfNodes])

  const handleNodeClick = useCallback((e: React.MouseEvent, node: Node) => {
    if (!isInteractive) return
    if (!addHandleRef.current.active) return
    // Determine which side user clicked relative to node bounds
    const nodeEl = document.querySelector(`[data-id="${node.id}"]`) as HTMLElement | null
    if (!nodeEl) { addHandleRef.current.active = false; return }
    const rect = nodeEl.getBoundingClientRect()
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height))
    const dLeft = x
    const dRight = 1 - x
    const dTop = y
    const dBottom = 1 - y
    let side: Position = Position.Left
    let offsetPercent = 50
    const minD = Math.min(dLeft, dRight, dTop, dBottom)
    if (minD === dLeft) { side = Position.Left; offsetPercent = Math.round(y * 100) }
    else if (minD === dRight) { side = Position.Right; offsetPercent = Math.round(y * 100) }
    else if (minD === dTop) { side = Position.Top; offsetPercent = Math.round(x * 100) }
    else { side = Position.Bottom; offsetPercent = Math.round(x * 100) }
    const handleId = `h-${side}-${Math.random().toString(36).slice(2)}`
    const handleType = addHandleRef.current.type
    setRfNodes((prev) => prev.map((n) => {
      if (n.id !== node.id) return n
      const existing = (n.data as { label: string; type?: BaseNode['type']; emotion?: Emotion; priority?: number; theme?: NodeTheme; extraHandles?: BaseNode['extraHandles'] } | undefined)?.extraHandles as BaseNode['extraHandles'] | undefined
      const nextExtra = (existing ? existing.slice() : []).concat({ id: handleId, type: handleType, position: side, offsetPercent })
      return { ...n, data: { ...(n.data as { label: string; type?: BaseNode['type']; emotion?: Emotion; priority?: number; theme?: NodeTheme; extraHandles?: BaseNode['extraHandles'] } | undefined), extraHandles: nextExtra } }
    }))
    addHandleRef.current.active = false
    setIsAddingHandle(false)
    if (containerRef.current) containerRef.current.classList.remove('cursor-crosshair')
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

  const setSelectedEdgesCurve = useCallback((curve: 'flexible' | 'straight') => {
    if (!isInteractive) return
    setRfEdges((prev) => prev.map((e) => {
      if (!e.selected) return e
      const existingData: EdgeData = (e.data as EdgeData | undefined) || {}
      const nextType = curve === 'straight' ? 'straight' : 'default'
      return {
        ...e,
        type: nextType,
        data: { ...existingData, curve } as EdgeData,
        style: existingData.line === 'dashed'
          ? { stroke: 'rgba(201, 162, 39, 0.9)', strokeWidth: 2, strokeDasharray: '6 6' }
          : { stroke: 'rgba(201, 162, 39, 0.9)', strokeWidth: 2, strokeDasharray: undefined }
      }
    }))
  }, [isInteractive, setRfEdges])

  const setSelectedEdgesLine = useCallback((line: 'dashed' | 'solid') => {
    if (!isInteractive) return
    setRfEdges((prev) => prev.map((e) => {
      if (!e.selected) return e
      const existingData: EdgeData = (e.data as EdgeData | undefined) || {}
      return {
        ...e,
        data: { ...existingData, line } as EdgeData,
        style: { stroke: 'rgba(201, 162, 39, 0.9)', strokeWidth: 2, strokeDasharray: line === 'dashed' ? '6 6' : undefined }
      }
    }))
  }, [isInteractive, setRfEdges])

  // Simple layout toggles (placeholder: no auto layout engine wired yet)
  useEffect(() => {
    // Keep manual positions; this placeholder just records mode via parent
  }, [layoutMode])

  // Force resync from props when requested (e.g., structural edits without id changes)
  useEffect(() => {
    const onResync = () => {
      setRfNodes(initialNodes)
      setRfEdges(initialEdges)
    }
    window.addEventListener('nc-resync' as unknown as never, onResync)
    return () => window.removeEventListener('nc-resync' as unknown as never, onResync)
  }, [initialNodes, initialEdges, setRfNodes, setRfEdges])

  // Keyboard shortcuts: Delete to remove selection, Ctrl+D to duplicate selected nodes
  const containerRef = useRef<HTMLDivElement | null>(null)
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!isInteractive) return
    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault()
      deleteSelection()
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
      e.preventDefault()
      setRfNodes((prev) => {
        const selected = prev.filter((n) => n.selected)
        const clones = selected.map((n) => ({
          ...n,
          id: `${n.id}-copy-${Math.random().toString(36).slice(2)}`,
          position: { x: n.position.x + 24, y: n.position.y + 24 },
          selected: false,
        }))
        return prev.concat(clones)
      })
    }
  }, [isInteractive, deleteSelection, setRfNodes])

  // Global clear action
  useEffect(() => {
    const onClear = () => {
      setRfNodes([])
      setRfEdges([])
      onChangeRef.current?.({ nodes: [], edges: [] })
    }
    window.addEventListener('nc-clear-board' as unknown as never, onClear)
    return () => {
      window.removeEventListener('nc-clear-board' as unknown as never, onClear)
    }
  }, [setRfNodes, setRfEdges])

  // Bridge window events that require React Flow instance
  function EventBridge() {
    const flow = useReactFlow()
    useEffect(() => {
      const onFit = () => {
        flow.fitView({ padding: 0.2 })
      }
      const onCenter = () => {
        const nodesNow = flow.getNodes()
        const root = nodesNow.find((n) => (n.data as { type?: BaseNode['type'] } | undefined)?.type === 'root')
        if (root) {
          flow.setCenter(root.position.x, root.position.y, { zoom: 1.2, duration: 300 })
        } else {
          flow.fitView({ padding: 0.2 })
        }
      }
      const onSetTheme = (ev: Event) => {
        const e = ev as CustomEvent<NodeTheme | ''>
        const val = e.detail
        const theme: NodeTheme | undefined = val ? (val as NodeTheme) : undefined
        const nodes = flow.getNodes()
        const selectedIds = new Set(nodes.filter((n) => n.selected).map((n) => n.id))
        flow.setNodes(nodes.map((n) => selectedIds.has(n.id)
          ? { ...n, data: { ...(n.data as { label: string; type?: BaseNode['type']; emotion?: Emotion; priority?: number; theme?: NodeTheme; extraHandles?: BaseNode['extraHandles'] } | undefined), theme } }
          : n
        ))
      }
      window.addEventListener('nc-fit-view' as unknown as never, onFit as unknown as EventListener)
      window.addEventListener('nc-center-root' as unknown as never, onCenter as unknown as EventListener)
      window.addEventListener('nc-set-theme' as unknown as never, onSetTheme as unknown as EventListener)
      return () => {
        window.removeEventListener('nc-fit-view' as unknown as never, onFit as unknown as EventListener)
        window.removeEventListener('nc-center-root' as unknown as never, onCenter as unknown as EventListener)
        window.removeEventListener('nc-set-theme' as unknown as never, onSetTheme as unknown as EventListener)
      }
    }, [flow])
    return null
  }

  // Global extended toolbar actions
  useEffect(() => {
    const onConvert = (e: CustomEvent<BaseNode['type']>) => {
      const to = (e as CustomEvent<BaseNode['type']>)?.detail
      if (!to) return
      convertSelectedType(to)
    }
    const onCurve = (e: CustomEvent<'flexible' | 'straight'>) => {
      const cv = (e as CustomEvent<'flexible' | 'straight'>)?.detail
      if (!cv) return
      setSelectedEdgesCurve(cv)
    }
    const onLine = (e: CustomEvent<'solid' | 'dashed'>) => {
      const ln = (e as CustomEvent<'solid' | 'dashed'>)?.detail
      if (!ln) return
      setSelectedEdgesLine(ln)
    }
    window.addEventListener('nc-convert-type' as unknown as never, onConvert as unknown as EventListener)
    window.addEventListener('nc-edges-curve' as unknown as never, onCurve as unknown as EventListener)
    window.addEventListener('nc-edges-line' as unknown as never, onLine as unknown as EventListener)
    // When a template structure is applied, ensure canvas stays stable (no special handling needed here)
    return () => {
      window.removeEventListener('nc-convert-type' as unknown as never, onConvert as unknown as EventListener)
      window.removeEventListener('nc-edges-curve' as unknown as never, onCurve as unknown as EventListener)
      window.removeEventListener('nc-edges-line' as unknown as never, onLine as unknown as EventListener)
    }
  }, [convertSelectedType, setSelectedEdgesCurve, setSelectedEdgesLine])

  return (
    <ReactFlowProvider>
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className={classNames(
        variant === 'background'
          ? "fixed inset-0 w-screen h-screen z-0 rounded-none shadow-none ring-0"
          : "w-full rounded-lg overflow-hidden shadow-xl ring-1 ring-white/10",
        className || (variant === 'background' ? "" : "h-[70vh] sm:h-[76vh] lg:h-[82vh]")
      )}
    >
      {enableToolbar ? (
        <div className={classNames(
          "flex items-center gap-2 p-2 border-b border-white/10 backdrop-blur supports-[backdrop-filter]:bg-white/10",
          variant === 'background' ? "bg-gradient-to-br from-slate-900/60 via-yellow-600/30 to-slate-900/60" : "bg-gradient-to-br from-slate-900/80 via-yellow-600/40 to-slate-900/80"
        )}>
          <button onClick={addNode} className="rounded-md border px-2 py-1 text-xs border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10">Add node</button>
          <button onClick={deleteSelection} className="rounded-md border px-2 py-1 text-xs border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10">Delete selection</button>
          <div className="flex items-center gap-1 text-xs">
            <span>Convert:</span>
            <button onClick={() => convertSelectedType('thought')} className="rounded-md border px-2 py-1 border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10">Thought</button>
            <button onClick={() => convertSelectedType('action')} className="rounded-md border px-2 py-1 border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10">Action</button>
            <button onClick={() => convertSelectedType('emotion')} className="rounded-md border px-2 py-1 border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10">Emotion</button>
            <button onClick={() => convertSelectedType('root')} className="rounded-md border px-2 py-1 border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10">Root</button>
          </div>
          <div className="ml-auto flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1">
            <span>Edge:</span>
              <button onClick={() => setSelectedEdgesCurve('flexible')} className="rounded-md border px-2 py-1 border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10" aria-label="Set selected edges to flexible">Flexible</button>
              <button onClick={() => setSelectedEdgesCurve('straight')} className="rounded-md border px-2 py-1 border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10" aria-label="Set selected edges to straight">Straight</button>
            </div>
            <div className="flex items-center gap-1">
              <span>Line:</span>
              <button onClick={() => setSelectedEdgesLine('solid')} className="rounded-md border px-2 py-1 border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10" aria-label="Set selected edges to solid">______</button>
              <button onClick={() => setSelectedEdgesLine('dashed')} className="rounded-md border px-2 py-1 border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10" aria-label="Set selected edges to dashed">------</button>
            </div>
            <div className="flex items-center gap-1">
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
            <FlowToolbarControls isInteractive={isInteractive} />
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
        onNodeClick={handleNodeClick}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        defaultEdgeOptions={{ markerEnd: { type: MarkerType.ArrowClosed, color: 'rgba(201, 162, 39, 0.9)' }, style: { stroke: 'rgba(201, 162, 39, 0.9)', strokeWidth: 2 } }}
        snapToGrid
        snapGrid={[16, 16]}
        minZoom={0.2}
        maxZoom={2}
        style={{ background: '#fff8dc' }}
      >
        <MiniMap pannable zoomable maskColor="rgba(0,0,0,0.06)" />
        <Controls position="bottom-right" />
        <Background variant={"dots" as unknown as never} color="rgba(201, 162, 39, 0.7)" gap={22} size={1.4} />
        <EventBridge />
      </ReactFlow>
    </div>
    </ReactFlowProvider>
  )
}


