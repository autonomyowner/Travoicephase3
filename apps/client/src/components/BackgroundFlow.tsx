"use client"

import React from "react"
import ReactFlow, { Background, ReactFlowProvider } from "reactflow"
import "reactflow/dist/style.css"

export default function BackgroundFlow() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      <ReactFlowProvider>
        <ReactFlow
          nodes={[]}
          edges={[]}
          fitView
          panOnScroll={false}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          zoomOnScroll={false}
          zoomOnPinch={false}
          zoomOnDoubleClick={false}
          style={{ background: "rgba(255, 248, 220, 0.9)" }}
        >
          <Background variant={"dots" as unknown as never} color="rgba(201, 162, 39, 0.25)" gap={26} size={1.6} />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  )
}


