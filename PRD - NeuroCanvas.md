## Product Requirements Document (PRD)

### Product: NeuroCanvas — AI-Powered Thought Mapping SaaS

### Version: 1.0

### Owner: Founder/PM

### Last Updated: 2025-08-07

---

## 1) Overview

- Vision: Augment human creativity by turning free-form thoughts (voice or text) into structured, interactive mind maps using AI.
- Tagline: Think freely. Map infinitely.
- Outcome: A collaborative cognitive canvas where individuals and teams capture ideas naturally, see structure instantly, and progress to action faster.

---

## 2) Goals & Non-Goals

- Goals:
  - G1: Instant conversion of user input (text first, voice optional) into a clear, editable mind map.
  - G2: Provide a delightful node-based editor (n8n/React Flow style) with low friction and high clarity.
  - G3: Extract actions, priorities, and sentiment automatically to guide focus.
  - G4: Save, version, and share maps; enable collaboration and live presence in later phases.
  - G5: Offer templates and exports to integrate with users’ workflows.
- Non-Goals (MVP):
  - Real-time multi-speaker diarization and advanced live meeting mapping (planned in Phase 2/3).
  - Full offline-first support.
  - AR/VR interfaces.

---

## 3) Target Users & Personas

- Product Managers: Feature planning, backlog mapping, sprint retros.
- Students/Researchers: Lecture capture, literature review, hypothesis mapping.
- Writers/Creators: Plot, character mapping, content planning.
- Entrepreneurs/Founders: Strategy maps, business modeling.
- Therapists/Coaches: Visualizing thought patterns and progress.

---

## 4) Market & Competitive Context

- Adjacent tools: MindMeister, XMind, Coggle (visual but minimal AI), Notion AI/Mem/Reflect (AI but not visual-first), Whimsical AI/Mindgrasp/Tana (closest, but not voice-first or coaching-centric).
- Differentiation: AI-first, voice-to-map, node-based visual editor, collaboration, emotional/sentiment cues, coaching, templates, and versioned thought evolution.

---

## 5) Value Proposition (Hormozi’s Value Equation)

- Dream Outcome: 9/10 — faster ideation, clarity, team cognition.
- Perceived Likelihood (initial): 5/10 — depends on execution precision and UX.
- Time Delay: 6/10 — near-instant if onboarding is smooth.
- Effort & Sacrifice: 5/10 — new behavior; must feel invisible.
- Score (initial): (9×5)/(6×5) = 1.5 → Aim for 4–5+ by improving accuracy, latency, and zero-friction UX.

---

## 6) Scope

### 6.1 MVP Scope (Phase 1: 1–2 months)

- Input Layer:
  - Text input to map (required)
  - Voice input via Whisper (optional for MVP; behind a flag)
- AI Parsing:
  - Convert input to hierarchical JSON (topics, subtopics)
  - Extract action items and priorities
  - Basic sentiment tagging (positive/neutral/negative)
- Visual Map (React Flow):
  - Render nodes/edges, drag/drop, zoom/pan, fit-to-view
  - Node types: Root, Thought, Action, Emotion
  - Color/shape based on type and sentiment
- Persistence:
  - Save maps to DB; basic versioning (auto-save + manual checkpoints)
- Templates & Export:
  - Basic templates (Essay, Sprint Plan, Persona)
  - Export PNG/JSON
- Auth:
  - Supabase Auth (Email/Magic Link, OAuth Google/GitHub)

### 6.2 Phase 2 (3–4 months)

- Realtime collaboration (presence, cursor sharing, node locking)
- Comments/annotations, advanced version history and playback
- Import (notes, JSON), export to PDF/Markdown, Notion/Obsidian/ClickUp
- AI Coach (prompt-based suggestions per node, topic expansion)

### 6.3 Phase 3 (6–12+ months)

- Live team room with streaming transcription + diarization
- Advanced clustering, smart merge suggestions, auto-insights
- Mobile quick-capture (voice-first), marketplace templates, billing

---

## 7) Detailed Requirements

### 7.1 Functional Requirements

- FR-1 Text Input to Map: Users submit text; system returns a structured mind map rendered visually.
- FR-2 Voice Input (optional): Users record via mic; audio is transcribed and parsed into nodes.
- FR-3 AI Parsing: System identifies topics, subtopics, actions, sentiment; returns JSON schema.
- FR-4 Node Editing: Users can drag nodes, edit labels, connect/disconnect edges.
- FR-5 Save/Version: Users save maps; system auto-saves and supports manual checkpoints.
- FR-6 Templates: Users can start from a small set of templates.
- FR-7 Export: Users export map as PNG and JSON.
- FR-8 Auth: Users can register/login/logout; protected routes enforced.

### 7.2 Non-Functional Requirements

- NFR-1 Performance: Render 500 nodes with smooth pan/zoom on mid-tier laptops (60 FPS target, 30 FPS min).
- NFR-2 Latency: Text→map roundtrip ≤ 3s p50 (≤ 7s p95) for 500–800 words.
- NFR-3 Availability: 99.5% monthly uptime (MVP), error budget tracked.
- NFR-4 Security: RLS in DB, JWT-based auth, encrypted at rest and in transit.
- NFR-5 Privacy: Granular map privacy: private, unlisted, shared (Phase 2 adds consent controls for AI learning).
- NFR-6 Accessibility: Keyboard navigation for nodes, ARIA labels, contrast-compliant themes.

---

## 8) User Flows

- UF-1 Onboarding: Login → brief intro → first prompt (textarea) → generate first map → tips overlay.
- UF-2 Create Map (Text): Enter text → submit → map renders → user edits → save.
- UF-3 Create Map (Voice): Start recording → stop → transcription → map renders → save.
- UF-4 Template Flow: Choose template → fill guided fields → generate map.
- UF-5 Export: Click Export → select PNG/JSON → download.
- UF-6 Versioning: View version panel → select version → restore/copy.

---

## 9) Information Architecture & Data Model

- Entities:
  - User: id, email, name, avatarUrl, onboardingFlags
  - Map: id, userId, title, description, nodes, edges, createdAt, updatedAt, sentimentSummary
  - Version: id, mapId, snapshot, createdAt, label
  - Comment (Phase 2): id, mapId, nodeId, userId, body, createdAt

- Map JSON Schema (TypeScript):

```ts
export type Emotion = 'positive' | 'neutral' | 'negative'

export type ThoughtNode = {
  id: string
  text: string
  children?: ThoughtNode[]
  emotion?: Emotion
  priority?: number // 1 (high) .. 5 (low)
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
```

---

## 10) UX/UI Requirements

- Editor: React Flow canvas, pan/zoom controls, fit-to-view, selection, multi-select.
- Nodes:
  - Root: larger, distinct color; Thought: default; Action: badge; Emotion: color halo (green/gray/red).
  - Inline editing of labels; double-click to edit; Enter to confirm; Esc to cancel.
- Layout: Tree and radial layouts. Preserve manual positions after user edits.
- Theming: Minimal dark/neutral theme; Tailwind-based styles.
- Tooling: Tooltip on hover; context menu for node actions (convert type, delete, connect).

---

## 11) Technical Architecture

- Frontend: Next.js + React + TypeScript, Tailwind CSS, React Flow, Framer Motion.
- Backend: Node.js (Express) + TypeScript.
- Database: PostgreSQL (Supabase). RLS policies for multi-tenant safety.
- Realtime: Supabase Realtime (Phase 2+).
- AI Services: OpenAI GPT-4o (parsing/suggestions), Whisper (speech-to-text), optional Claude for sentiment.
- Storage: Supabase Buckets for media.
- Hosting: Vercel (frontend), Railway/Render (backend).
- Auth: Supabase Auth (Magic Link, OAuth Google/GitHub).
- Billing: Stripe (Phase 3).

---

## 12) API Endpoints (Initial)

- POST `/api/maps/generate`
  - body: `{ input: string, mode: 'text' | 'voice', options?: { templateId?: string } }`
  - returns: `{ map: MapGraph, summary?: string }`

- POST `/api/voice/transcribe` (optional MVP)
  - body: audio/multipart
  - returns: `{ text: string }`

- GET `/api/maps`
  - returns: `{ maps: Map[] }`

- POST `/api/maps`
  - body: `{ title: string, graph: MapGraph, description?: string }`
  - returns: `{ map: Map }`

- GET `/api/maps/:id`
  - returns: `{ map: Map }`

- POST `/api/maps/:id/versions`
  - body: `{ label?: string, graph: MapGraph }`
  - returns: `{ version: Version }`

- POST `/api/coach` (Phase 2)
  - body: `{ nodeId?: string, prompt?: string, context: MapGraph }`
  - returns: `{ suggestions: ThoughtNode[] }`

---

## 13) Security, Privacy, Compliance

- JWT sessions; Supabase Auth; enforce user ownership with RLS.
- Encrypt secrets; store API keys in server-side environment variables.
- Map privacy settings: private (default), unlisted link, shared (Phase 2 granular sharing).
- Data retention: Users can delete maps and versions; hard-delete within 30 days.
- Compliance targets (later): GDPR basics (export/delete data), audit logs for enterprise.

---

## 14) Analytics & KPIs

- Activation: % new users who generate a first map within 5 minutes.
- Time-to-Value: Median time from signup to first useful map (< 2 minutes target).
- Engagement: Avg nodes per map, edits per session, saves per user per week.
- Quality: User rating of map accuracy (thumbs up/down), edit distance from AI map.
- Retention: D1/D7 active rate; % returning to edit maps.
- Conversion: Free→Pro, Team adoption rate (Phase 3).

---

## 15) Pricing & Packaging

- Free: $0 — Limited nodes, 1 template, PNG/JSON export.
- Pro: $15/mo — Unlimited maps, templates, export formats, versioning.
- Team: $49/user/mo — Shared workspaces, collaboration tools, presence, comments.
- Enterprise: Custom — SSO, on-prem option, SLA, API access, white-label.
- Upsells: AI Coaching packs, memory/analytics reports, premium templates.

---

## 16) Roadmap & Milestones

- Phase 1 (MVP, 1–2 months): FR-1..FR-8; deploy; collect feedback.
- Phase 2 (Beta, 3–4 months): Collaboration, comments, import/export suite, AI coach.
- Phase 3 (Launch, 6–12 months): Live team rooms, billing, mobile quick-capture, integrations.

---

## 17) Acceptance Criteria (MVP)

- User can sign up, log in, and access a protected editor.
- Entering 300–800 words generates a map with ≥ 90% valid JSON and renders without errors.
- Nodes are draggable; users can edit text, connect/disconnect edges.
- Action items and sentiment are visible and distinguishable.
- Users can save, view, restore versions.
- Users can export PNG and JSON.
- P50 generation latency ≤ 3s on typical inputs; render is smooth on 500 nodes.

---

## 18) Risks & Mitigations

- AI Accuracy Variance: Use schema validation (Zod), retries, and post-process normalization.
- Latency/Cost: Cache partial results; batch calls; consider smaller/faster models where acceptable.
- Graph Complexity: Virtualize large canvases; progressive rendering; pruning.
- User Trust: Provide transparent controls and ability to correct AI output quickly.
- Voice Complexity: Keep voice behind a flag in MVP; add as quality permits.

---

## 19) Open Questions

- Do we prefer React Flow or D3 for long-term customization? (Default: React Flow.)
- Which integrations are must-have for Beta (Notion, ClickUp, Obsidian)?
- How to score and visualize “thinking style” in a way users find actionable?

---

## 20) Appendix

- Template Ideas: Essay Plan, Sprint Planning, Persona Map, Business Model, Research Matrix, Retro.
- Future Concepts: Timeline mode for thought evolution, public map gallery, AI co-thinking personas, cognitive profile, privacy consent controls.
