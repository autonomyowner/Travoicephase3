export type Emotion = 'positive' | 'neutral' | 'negative'
export type NodeType = 'root' | 'thought' | 'action' | 'emotion'
export type NodeTheme =
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

export type CanvasNode = {
  id: string
  label: string
  type?: NodeType
  emotion?: Emotion
  priority?: number
  position?: { x: number; y: number }
  theme?: NodeTheme
}

export type CanvasEdge = {
  id: string
  source: string
  target: string
  label?: string
  curve?: 'flexible' | 'straight'
  line?: 'dashed' | 'solid'
}

function detectType(raw: string): NodeType | undefined {
  const s = raw.toLowerCase()
  if (s.startsWith('!') || /\b(todo|do|action|next)\b/.test(s)) return 'action'
  if (/\b(feel|emotion|mood)\b/.test(s)) return 'emotion'
  return undefined
}

function detectEmotion(raw: string): Emotion | undefined {
  const s = raw.toLowerCase()
  if (/(^|\s)(\:\-?\)|\+|good|great|love|win)(\s|$)/.test(s)) return 'positive'
  if (/(^|\s)(\:\-?\(|\-|bad|hate|fail)(\s|$)/.test(s)) return 'negative'
  return undefined
}

function cleanLabel(raw: string): string {
  return raw
    .replace(/^\s*[\-\*\+]\s+/, '') // bullets
    .replace(/^\s*\d+\.[\)\s]+/, '') // numbered lists
    .replace(/^\s*\!+\s*/, '') // leading bangs for actions
    .replace(/\s+\[(action|emotion)\]\s*/i, ' ')
    .trim()
}

function getIndentLevel(line: string): number {
  let i = 0
  while (i < line.length && (line[i] === ' ' || line[i] === '\t')) i++
  // Treat 2 spaces as one level; tabs as one level
  const spaces = line.slice(0, i).split('').filter((c) => c === ' ').length
  const tabs = line.slice(0, i).split('').filter((c) => c === '\t').length
  return Math.floor(spaces / 2) + tabs
}

export function parseTextToMapGraph(text: string): { nodes: CanvasNode[]; edges: CanvasEdge[] } {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0)
  const nodes: CanvasNode[] = []
  const edges: CanvasEdge[] = []
  if (lines.length === 0) return { nodes, edges }

  const stack: Array<{ id: string; level: number }> = []
  const levelById = new Map<string, number>()
  const anchorToId = new Map<string, string>()
  let nodeCounter = 0

  const parseTags = (s: string): Record<string, string | true> => {
    const tags: Record<string, string | true> = {}
    const re = /\[([^\]]+)\]/g
    let m: RegExpExecArray | null
    while ((m = re.exec(s)) !== null) {
      const content = m[1]
      const parts = content.split(/\s*[;,]\s*|\s+/).filter(Boolean)
      for (const part of parts) {
        const kv = part.split(':')
        if (kv.length >= 2) {
          const key = kv[0].toLowerCase()
          const value = kv.slice(1).join(':')
          tags[key] = value
        } else {
          tags[part.toLowerCase()] = true
        }
      }
    }
    return tags
  }

  const stripTags = (s: string): string => s.replace(/\[[^\]]+\]/g, '')
  const readAnchor = (s: string): { anchor?: string; rest: string } => {
    const m = s.match(/\{id:([a-zA-Z0-9_-]+)\}/)
    if (!m) return { rest: s }
    return { anchor: m[1], rest: s.replace(m[0], '') }
  }

  const getPriority = (s: string, tags: Record<string, string | true>): number | undefined => {
    if (typeof tags['p'] === 'string') return Math.max(0, Math.min(5, Number(tags['p']) || 0))
    if (typeof tags['priority'] === 'string') return Math.max(0, Math.min(5, Number(tags['priority']) || 0))
    const bangs = (s.match(/!/g) || []).length
    if (bangs > 0) return Math.min(5, bangs)
    return undefined
  }

  for (const full of lines) {
    const isLinkLine = /^\s*(link:|->)/i.test(full)
    if (isLinkLine) {
      // explicit cross link: e.g., "link: @a -> @b [edge:label] [curve:straight] [line:dashed]"
      const src = full.match(/@([a-zA-Z0-9_-]+)/)
      const dst = full.match(/->\s*@([a-zA-Z0-9_-]+)/)
      if (src && dst) {
        const tags = parseTags(full)
        const sourceId = anchorToId.get(src[1])
        const targetId = anchorToId.get(dst[1])
        if (sourceId && targetId) {
          const labelRaw = typeof tags['edge'] === 'string' ? String(tags['edge']) : undefined
          const label = labelRaw ? labelRaw.replace(/_/g, ' ') : undefined
          const curve = typeof tags['curve'] === 'string' ? (String(tags['curve']) as CanvasEdge['curve']) : undefined
          const line = typeof tags['line'] === 'string' ? (String(tags['line']) as CanvasEdge['line']) : undefined
          edges.push({ id: `x-${sourceId}-${targetId}-${edges.length}`, source: sourceId, target: targetId, label, curve, line })
        }
      }
      continue
    }

    const level = getIndentLevel(full)
    const raw = full.trim()
    const tags = parseTags(raw)
    const { anchor, rest } = readAnchor(raw)
    const label = cleanLabel(stripTags(rest)).replace(/\{id:[^}]+\}/, '').trim()

    const explicitType = typeof tags['type'] === 'string' ? (String(tags['type']).toLowerCase() as NodeType) : undefined
    const type = nodeCounter === 0 ? ('root' as NodeType) : explicitType ?? detectType(raw)
    const explicitEmotion = typeof tags['emotion'] === 'string' ? (String(tags['emotion']).toLowerCase() as Emotion) : undefined
    const themeRaw = typeof tags['theme'] === 'string' ? String(tags['theme']).toLowerCase() : undefined
    const theme = ((): NodeTheme | undefined => {
      switch (themeRaw) {
        case 'professional':
        case 'emerald':
        case 'emerald elegance':
          return 'emerald'
        case 'premium':
        case 'sapphire':
        case 'sapphire serenity':
          return 'sapphire'
        case 'luxury':
        case 'gold':
        case 'golden':
        case 'golden majesty':
          return 'goldenMajesty'
        case 'elegant':
        case 'silver':
        case 'silver sophistication':
          return 'silver'
        case 'royal':
        case 'purple':
        case 'royal purple':
          return 'royalPurple'
        case 'bold':
        case 'crimson':
        case 'crimson passion':
          return 'crimson'
        case 'calming':
        case 'teal':
        case 'teal tranquility':
          return 'teal'
        case 'intellectual':
        case 'indigo':
        case 'indigo insight':
          return 'indigo'
        case 'romantic':
        case 'rose':
        case 'rose radiance':
          return 'rose'
        case 'vibrant':
        case 'vibrant gold':
          return 'vibrantGold'
        case 'rich':
        case 'rich gold':
          return 'richGold'
        case 'energetic':
        case 'bright gold':
          return 'brightGold'
        case 'warm':
        case 'warm orange':
        case 'orange':
          return 'warmOrange'
        default:
          return undefined
      }
    })()
    const emotion = explicitEmotion ?? detectEmotion(raw)
    const priority = getPriority(raw, tags)
    const id = anchor ? `a-${anchor}` : `t-${nodeCounter}`
    nodeCounter += 1
    const node: CanvasNode = { id, label, type, emotion, priority, theme }
    nodes.push(node)
    if (anchor) anchorToId.set(anchor, id)

    while (stack.length && stack[stack.length - 1].level >= level) stack.pop()
    if (stack.length) {
      const parent = stack[stack.length - 1]
      const edgeLabelRaw = typeof tags['edge'] === 'string' ? String(tags['edge']) : undefined
      const edgeLabel = edgeLabelRaw ? edgeLabelRaw.replace(/_/g, ' ') : undefined
      const curve = typeof tags['curve'] === 'string' ? (String(tags['curve']) as CanvasEdge['curve']) : undefined
      const line = typeof tags['line'] === 'string' ? (String(tags['line']) as CanvasEdge['line']) : undefined
      edges.push({ id: `e-${parent.id}-${id}`, source: parent.id, target: id, label: edgeLabel, curve, line })
    }
    stack.push({ id, level })
    levelById.set(id, level)
  }

  // Naive layout seed per level to avoid overlapping
  const levelPositions = new Map<number, number>()
  nodes.forEach((n) => {
    const level = levelById.get(n.id) ?? 0
    const y = level * 120
    const x = (levelPositions.get(level) ?? 0) * 240
    levelPositions.set(level, (levelPositions.get(level) ?? 0) + 1)
    n.position = { x, y }
  })

  return { nodes, edges }
}


