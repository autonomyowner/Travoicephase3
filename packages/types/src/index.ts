import { z } from 'zod'

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

export const EmotionEnum = z.enum(['positive', 'neutral', 'negative'])

export const MapNodeSchema = z.object({
  id: z.string(),
  label: z.string(),
  type: z.enum(['root', 'thought', 'action', 'emotion']).optional(),
  emotion: EmotionEnum.optional(),
  priority: z.number().int().min(0).max(5).optional(),
  position: z.object({ x: z.number(), y: z.number() }).optional()
})

export const MapEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  label: z.string().optional()
})

export const MapGraphSchema = z.object({
  nodes: z.array(MapNodeSchema),
  edges: z.array(MapEdgeSchema)
})


