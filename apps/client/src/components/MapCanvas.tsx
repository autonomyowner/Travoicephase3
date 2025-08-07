"use client"

import React, { useMemo } from "react"
import ReactFlow, { Background, Controls, MiniMap, Node, Edge } from "reactflow"
import "reactflow/dist/style.css"

type MapCanvasProps = {
  nodes: Array<{ id: string; label: string; position?: { x: number; y: number } }>
  edges: Array<{ id: string; source: string; target: string; label?: string }>
}

export default function MapCanvas({ nodes, edges }: MapCanvasProps) {
  const rfNodes = useMemo<Node[]>(
    () =>
      nodes.map((n) => ({
        id: n.id,
        position: n.position ?? { x: 0, y: 0 },
        data: { label: n.label },
        type: 'default'
      })),
    [nodes]
  )
  const rfEdges = useMemo<Edge[]>(
    () => edges.map((e) => ({ id: e.id, source: e.source, target: e.target, label: e.label })),
    [edges]
  )

  return (
    <div className="h-[480px] w-full rounded-md border border-black/10 dark:border-white/15 bg-black/5 dark:bg-white/5">
      <ReactFlow nodes={rfNodes} edges={rfEdges} fitView>
        <MiniMap />
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  )
}


