## PRD: Real‑Time Voice → Reasoning → Mind Map (Mock-first, API-pluggable)

### Objective
Enable solo/team to talk while the system listens, transcribes, reasons, and updates a shared mind map in real time. For this phase, deliver fully working mocks with clean interfaces so Whisper + a reasoning LLM can be plugged in later without rewriting UI or APIs.

### Success Criteria
- Live “session” captures audio chunks and emits real‑time map deltas over a stream; map updates are visible within ≤2s of speech pause.
- No external AI APIs required in this phase; a mock pipeline produces deterministic, credible deltas from transcript text.
- Switching to real providers requires only env config and swapping provider implementations (no UI/protocol changes).

### Non‑Goals (this phase)
- No calls to external APIs (OpenAI Whisper or reasoning models). These are final‑phase plug‑ins.
- No advanced diarization or multi‑track capture; simple speaker tagging only if easy.

---

### Architecture Overview

- Client (Next.js `apps/client`)
  - VoiceRecorder: add Live Session mode (chunked recording, 5s blocks)
  - Stream subscriber (SSE) consumes events and applies map deltas to `MapCanvas`
  - Partial transcripts pane updates as audio is processed
- Server (Express `apps/server`)
  - Session Manager (in‑memory for MVP): tracks sessions, subscribers, transcript buffer, current map
  - Endpoints (stable contracts):
    - POST `/api/voice/session` → { sessionId }
    - GET `/api/voice/session/:id/stream` (SSE) → events: `transcript`, `delta`, `summary`, `heartbeat`
    - POST `/api/voice/session/:id/chunk` (multipart audio) → enqueue; returns 202
    - POST `/api/voice/session/:id/finish` → finalize, emit `summary`, close
  - Providers (mock-first):
    - Transcriber: `transcribeChunk(buffer,mime) => TranscriptChunk[]`
    - Reasoner: `reason(existingMap, transcriptSlice) => MapDelta`
  - Persistence: write final map to `maps` and a version row to `map_versions` (batch writes during session optional)

---

### Data Contracts

- TranscriptChunk
  - `{ text: string; tsStart?: number; tsEnd?: number; speaker?: string }`
- MapDelta
  - `{ nodes?: Array<{ id: string; label: string; type?: 'root'|'thought'|'action'|'emotion'; emotion?: 'positive'|'neutral'|'negative'; priority?: number; position?: {x:number;y:number} }>; edges?: Array<{ id: string; source: string; target: string; label?: string }> }`
- ReasoningEvent (SSE payload)
  - `{ type: 'transcript'|'delta'|'summary'|'heartbeat'; data: any }`

All deltas validated/normalized against `MapGraphSchema` when merged.

---

### UX Requirements (Real‑Time Map Updates)
- As the user says “I think of working hard on my car project,” a new node appears in the canvas nearly instantly.
  - Example label: `optimistic working hard on car project` (emotion prefix + content)
  - If emotion words like “optimistic, excited, worried, blocked” are detected, attach `emotion` attribute and/or create an emotion node linked to the thought.
- Show a live transcript sidebar/pill updating with each chunk.
- Show session controls: Start, Pause/Resume, Stop & Finish.
- Team mode: copying the session link allows teammates to subscribe and see live updates (read-only for MVP).

---

### Provider Interfaces (Plug‑and‑Play)

```ts
// server: src/ai/providers.ts (new)
export type TranscriptChunk = { text: string; tsStart?: number; tsEnd?: number; speaker?: string }
export type MapDelta = { nodes?: any[]; edges?: any[] }

export interface Transcriber {
  transcribeChunk(input: { buffer: Buffer; mimetype: string }): Promise<TranscriptChunk[]>
}

export interface Reasoner {
  produceDelta(args: { existingMap: any; transcript: TranscriptChunk[] }): Promise<MapDelta>
}

export type Providers = { transcriber: Transcriber; reasoner: Reasoner }
```

Mock implementations now; OpenAI versions later use same interfaces.

---

### Mock Logic (Deterministic, Testable)

- MockTranscriber
  - Convert audio chunk → one chunk with placeholder timing and `text: "<simulated text>"` if no real decode; when browser sends `audio/webm` captured speech isn’t decoded server‑side in mock; accept a parallel plaintext override for testing.
- MockReasoner (heuristics)
  - Extract emotion: if text includes [optimistic|excited|proud] → positive; [worried|anxious|blocked] → negative; else neutral
  - Extract action cues: phrases starting with “we should”, “let’s”, “I will” → action node
  - Extract thought: default to a thought node using cleaned phrase
  - Generate node label: `[emotionWord?] <cleaned phrase>`; connect to a `root` node (create if missing)
  - Compute stable ids with hashing of text + time to avoid duplicates; merge by fuzzy matching to prevent spam

---

### Endpoints (Detailed)

1) POST `/api/voice/session`
   - Auth: Bearer (Supabase JWT) optional for MVP; required to persist maps
   - Body: `{ mapId?: string }`
   - Returns: `{ sessionId: string }`

2) GET `/api/voice/session/:id/stream` (SSE)
   - Headers: `Content-Type: text/event-stream`, `Cache-Control: no-cache`
   - Events:
     - `event: transcript` → `data: { chunks: TranscriptChunk[] }`
     - `event: delta` → `data: { delta: MapDelta }`
     - `event: summary` → `data: { text: string }`
     - `event: heartbeat` → `data: { t: number }` (every 15s)

3) POST `/api/voice/session/:id/chunk`
   - Multipart form: `audio` field (≤10MB per chunk; ~5s)
   - Returns: `202 { ok: true }`; server emits `transcript` then `delta` via SSE

4) POST `/api/voice/session/:id/finish`
   - Finalize summary: stitch transcript, produce final `delta` consolidation, emit `summary`
   - If authenticated and `mapId` known: save final version to `maps` and create a `map_versions` row

---

### Client Integration (Next.js)

- `VoiceRecorder` (extend)
  - New props: `mode: 'live'|'single'` (default 'live')
  - When starting: call `createSession()` → sessionId; open `EventSource` to `/stream`
  - Record in 5s chunks; POST each chunk to `/chunk`
  - On `delta` events: call `MapCanvas.applyDelta(delta)`
  - On `transcript` events: append to transcript panel
  - On Stop: call `/finish`; close EventSource

- `MapCanvas`
  - Add `applyDelta(delta: MapDelta)` merging logic with de‑duplication and safe positioning (grid/force layout)
  - Optionally animate new nodes for visibility

- `lib/api.ts`
  - Add: `createVoiceSession()`, `streamVoiceSession(sessionId)`, `sendVoiceChunk(sessionId, blob)`, `finishVoiceSession(sessionId)`

---

### Persistence & Ownership

- On authenticated sessions, create/ensure `users` row exists; persist final map to `maps`; store interim versions every N deltas or on finish.
- Unauthorized sessions: keep purely in memory; provide a “Save” CTA that requires login.

---

### Feature Flags & Envs

- Server:
  - `AI_PROVIDER`: 'mock' (default), 'openai' (final phase)
  - `WHISPER_MODEL`, `OPENAI_MODEL`, `OPENAI_API_KEY`: ignored while mock
- Client:
  - `NEXT_PUBLIC_API_BASE_URL`: server base URL

Switching to real models later: set `AI_PROVIDER=openai` and deploy provider implementations without changing endpoints or client code.

---

### Milestones & Acceptance Criteria

P0: Stream Skeleton
- Endpoints live; EventSource receives `heartbeat`
- Manually emit demo `delta` every few seconds → nodes appear in canvas

P1: Chunked Recording → Transcript → Deltas (Mock)
- Record 30–60s, see transcript updates and corresponding map deltas
- Latency ≤2s per chunk

P2: Heuristic Reasoning (Mock)
- Emotion/intent extraction works for common phrases
- Example utterance produces node: “optimistic working hard on car project” linked to root

P3: Auth & Persistence
- If logged in, final map + version saved; if not, stays ephemeral

P4: Team View (Subscribe Only)
- Sharable session URL; second browser sees live updates (read‑only)

P5: Provider Swap (Final Phase)
- Drop‑in OpenAI transcriber/reasoner; env flip only; no UI/protocol changes

---

### Risks & Mitigations
- Cost spikes (future APIs): batch chunks; cap session length; rate limit
- Browser compatibility: fall back to non‑streamed “record then process” path
- JSON validity: validate deltas; repair or fallback to neutral nodes

---

### Mapping to 10X.txt Ideas
- “Auto‑Transcribe and Map Meetings”: core of this PRD (P1–P3)
- “AI Memory Layer”: persist deltas/versions (P3), later retrieval for reminders
- “Co‑Thinking Agents”: future reasoning prompt personas (post‑P5)
- “Timeline Mode”: versions already captured; add visualization later

---

### Deliverables (this phase)
- Server: session endpoints, SSE stream, mock providers, delta merge + validation, optional persistence
- Client: chunked recorder, stream subscriber, transcript panel, real‑time map updates, save flow
- README updates: envs, curl examples, usage


