export type Emotion = 'positive' | 'neutral' | 'negative'

export type ThoughtNode = {
  id: string
  text: string
  children?: ThoughtNode[]
  emotion?: Emotion
  priority?: number
  type?: 'root' | 'thought' | 'action' | 'emotion'
}

export type MapGraph = {
  nodes: Array<{
    id: string
    label: string
    type?: 'root' | 'thought' | 'action' | 'emotion'
    emotion?: Emotion
    priority?: number
    position?: { x: number; y: number }
  }>
  edges: Array<{ id: string; source: string; target: string; label?: string }>
}

