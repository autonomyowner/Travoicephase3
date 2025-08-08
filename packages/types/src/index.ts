import { z } from 'zod'

export type Emotion = 'positive' | 'neutral' | 'negative'

export type NodeTheme =
  | 'emerald'          // Emerald Elegance (Professional)
  | 'sapphire'         // Sapphire Serenity (Premium)
  | 'goldenMajesty'    // Golden Majesty (Luxury)
  | 'silver'           // Silver Sophistication (Elegant)
  | 'royalPurple'      // Royal Purple (Royal)
  | 'crimson'          // Crimson Passion (Bold)
  | 'teal'             // Teal Tranquility (Calming)
  | 'indigo'           // Indigo Insight (Intellectual)
  | 'rose'             // Rose Radiance (Romantic)
  | 'vibrantGold'      // Vibrant Gold (Vibrant)
  | 'richGold'         // Rich Gold (Luxury)
  | 'brightGold'       // Bright Gold (Energetic)
  | 'warmOrange'       // Warm Orange (Warm)

export type ThoughtNode = {
  id: string
  text: string
  children?: ThoughtNode[]
  emotion?: Emotion
  priority?: number
  type?: 'root' | 'thought' | 'action' | 'emotion'
  theme?: NodeTheme
}

export type MapGraph = {
  nodes: Array<{
    id: string
    label: string
    type?: 'root' | 'thought' | 'action' | 'emotion'
    emotion?: Emotion
    priority?: number
    position?: { x: number; y: number }
    theme?: NodeTheme
  }>
  edges: Array<{
    id: string
    source: string
    target: string
    label?: string
    curve?: 'flexible' | 'straight'
    line?: 'dashed' | 'solid'
  }>
}

export const EmotionEnum = z.enum(['positive', 'neutral', 'negative'])

export const MapNodeSchema = z.object({
  id: z.string(),
  label: z.string(),
  type: z.enum(['root', 'thought', 'action', 'emotion']).optional(),
  emotion: EmotionEnum.optional(),
  priority: z.number().int().min(0).max(5).optional(),
  position: z.object({ x: z.number(), y: z.number() }).optional(),
  theme: z.enum([
    'emerald',
    'sapphire',
    'goldenMajesty',
    'silver',
    'royalPurple',
    'crimson',
    'teal',
    'indigo',
    'rose',
    'vibrantGold',
    'richGold',
    'brightGold',
    'warmOrange'
  ]).optional()
})

export const MapEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  label: z.string().optional(),
  curve: z.enum(['flexible', 'straight']).optional(),
  line: z.enum(['dashed', 'solid']).optional()
})

export const MapGraphSchema = z.object({
  nodes: z.array(MapNodeSchema),
  edges: z.array(MapEdgeSchema)
})


