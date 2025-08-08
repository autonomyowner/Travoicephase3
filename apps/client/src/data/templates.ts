import type { GenerateResponse } from '../lib/api'

type Graph = GenerateResponse['map']

type BuiltInTemplate = { id: string; title: string; description?: string; graph: Graph }

export const builtInTemplates: BuiltInTemplate[] = [
  {
    id: 'builtin-essay',
    title: 'Essay Plan',
    description: 'Structure for introduction, thesis, body, and conclusion.',
    graph: {
      nodes: [
        { id: 'root', label: 'Essay Plan', type: 'root' },
        { id: 'n1', label: 'Introduction', type: 'thought' },
        { id: 'n2', label: 'Thesis Statement', type: 'thought', priority: 5 },
        { id: 'n3', label: 'Body Paragraph 1', type: 'thought' },
        { id: 'n4', label: 'Body Paragraph 2', type: 'thought' },
        { id: 'n5', label: 'Body Paragraph 3', type: 'thought' },
        { id: 'n6', label: 'Conclusion', type: 'thought' }
      ],
      edges: [
        { id: 'e-root-n1', source: 'root', target: 'n1' },
        { id: 'e-root-n2', source: 'root', target: 'n2' },
        { id: 'e-root-n3', source: 'root', target: 'n3' },
        { id: 'e-root-n4', source: 'root', target: 'n4' },
        { id: 'e-root-n5', source: 'root', target: 'n5' },
        { id: 'e-root-n6', source: 'root', target: 'n6' }
      ]
    }
  },
  {
    id: 'builtin-sprint',
    title: 'Sprint Plan',
    description: 'Agile sprint goals, backlog, tasks, and risks.',
    graph: {
      nodes: [
        { id: 'root', label: 'Sprint Plan', type: 'root' },
        { id: 'n1', label: 'Sprint Goal', type: 'thought', priority: 4 },
        { id: 'n2', label: 'Backlog', type: 'thought' },
        { id: 'n3', label: 'Tasks', type: 'action' },
        { id: 'n4', label: 'Risks', type: 'emotion' },
        { id: 'n5', label: 'Definition of Done', type: 'thought' }
      ],
      edges: [
        { id: 'e-root-n1', source: 'root', target: 'n1' },
        { id: 'e-root-n2', source: 'root', target: 'n2' },
        { id: 'e-root-n3', source: 'root', target: 'n3' },
        { id: 'e-root-n4', source: 'root', target: 'n4' },
        { id: 'e-root-n5', source: 'root', target: 'n5' }
      ]
    }
  },
  {
    id: 'builtin-persona',
    title: 'Persona Map',
    description: 'User persona with goals, pains, motivations, and bio.',
    graph: {
      nodes: [
        { id: 'root', label: 'Persona', type: 'root' },
        { id: 'n1', label: 'Name & Role', type: 'thought' },
        { id: 'n2', label: 'Goals', type: 'thought' },
        { id: 'n3', label: 'Frustrations', type: 'emotion' },
        { id: 'n4', label: 'Motivations', type: 'emotion' },
        { id: 'n5', label: 'Bio', type: 'thought' }
      ],
      edges: [
        { id: 'e-root-n1', source: 'root', target: 'n1' },
        { id: 'e-root-n2', source: 'root', target: 'n2' },
        { id: 'e-root-n3', source: 'root', target: 'n3' },
        { id: 'e-root-n4', source: 'root', target: 'n4' },
        { id: 'e-root-n5', source: 'root', target: 'n5' }
      ]
    }
  }
]


