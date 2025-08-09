## 0908 Improvements — Real‑Time Voice → Reasoning → Live Mind Map

Short, actionable tasks focused only on the main goal. Each task includes a simple mission and concrete subtasks.

### 1) Real‑time audio capture and chunking
- **Mission**: Make voice capture fast and smooth so ideas appear on the map within ~1–2 seconds.
- **Subtasks**:
  - [ ] Reduce recording chunk size to 1–1.5s in `VoiceRecorder` and send immediately.
  - [ ] Add simple silence detection (VAD) using RMS/threshold to flush chunks on pauses.
  - [ ] Handle mic errors gracefully; keep session alive even if recording stops.

### 2) SSE stream resilience and ordered delivery
- **Mission**: Keep the live session connected and consistent even with brief network hiccups.
- **Subtasks**:
  - [ ] Add `id:` and `retry:` to server‑sent events; support `Last-Event-ID` on reconnect.
  - [ ] Include `x-chunk-seq` and `Idempotency-Key` on `/chunk`; drop duplicates/out‑of‑order on server.
  - [ ] Auto‑reconnect the client `EventSource` and resume from last event ID.

### 3) Reasoner heuristics v2 (quality of nodes)
- **Mission**: Turn rough speech into useful nodes: detect actions, emotions, and priorities reliably.
- **Subtasks**:
  - [ ] Expand emotion/action keyword sets; detect phrases like “I’ll…”, “need to…”, “we should…”.
  - [ ] Attach `priority` (1–5) when urgency words appear (must/urgent/ASAP).
  - [ ] Normalize labels (trim, dedupe whitespace, cap length) before ID/hash.

### 4) Stable IDs and de‑duplication
- **Mission**: Prevent duplicate spam and keep nodes consistent across updates.
- **Subtasks**:
  - [ ] Generate node IDs by hashing normalized text + parentId + rounded timestamp bucket.
  - [ ] Reject duplicates using fuzzy match on existing labels near the parent.
  - [ ] Merge updates (e.g., promote emotion/priority) instead of creating a new node.

### 5) Delta placement and spacing
- **Mission**: Place new nodes near the most related idea without overlaps.
- **Subtasks**:
  - [ ] Choose a semantic parent via token overlap; fallback to `root`.
  - [ ] Radial fan around parent with angular spacing; maintain 140–180px minimum gap.
  - [ ] Spiral fallback search to avoid collisions when space is crowded.

### 6) Client live‑session UX
- **Mission**: Make the live session feel clear and responsive while recording.
- **Subtasks**:
  - [ ] Add a transcript pane with streaming chunks and a “Live” status.
  - [ ] Implement a lightweight `applyDelta(delta)` merger to animate node/edge additions without full rerender.
  - [ ] Separate “Finish” from “Stop” so `/finish` always runs and summary appears.

### 7) Session lifecycle and limits
- **Mission**: Keep sessions healthy and avoid memory leaks.
- **Subtasks**:
  - [ ] Add TTL/GC: auto‑expire sessions after 10 minutes idle; remove subscribers on `close`.
  - [ ] Cap max subscribers and total chunk bytes per session.
  - [ ] Enforce MIME whitelist and 10MB per chunk limit with clear errors.

### 8) Observability and latency
- **Mission**: Know if voice→delta is fast and reliable; catch regressions early.
- **Subtasks**:
  - [ ] Log p50/p95 for (chunk received → delta emitted) and number of connected SSE clients.
  - [ ] Add counters for deduped chunks/nodes and rejected chunks.
  - [ ] Expose a simple `/metrics` or structured logs for dashboards.

### 9) Provider interface (mock now, swap later)
- **Mission**: Be able to swap in Whisper/LLM later without touching the UI or endpoints.
- **Subtasks**:
  - [ ] Define `Transcriber` and `Reasoner` interfaces in `src/ai/providers.ts`.
  - [ ] Move mock implementations behind the interface; select via `AI_PROVIDER` env.
  - [ ] Keep mock deterministic (seeded randomness) so UI doesn’t jump between runs.

### 10) Persist output on finish
- **Mission**: Save the final map and summary automatically for logged‑in users.
- **Subtasks**:
  - [ ] On `/finish`, if JWT present: upsert `users`, insert into `maps`, create a `map_versions` row.
  - [ ] Return `{ ok: true, mapId }` so the client can deep‑link to the saved map.
  - [ ] Store full transcript with the map (optional JSON field) for later review.

### 11) Security and rate limits
- **Mission**: Protect the service from abuse while keeping it usable.
- **Subtasks**:
  - [ ] Per‑IP and per‑session rate limits on `/chunk` and `/session` creation.
  - [ ] Validate auth on persistence; anonymous stays in‑memory only.
  - [ ] Clear, user‑friendly error messages on limits.

### 12) QA checklist (done = green)
- **Mission**: Verify the experience is fast, stable, and correct.
- **Subtasks**:
  - [ ] First delta visible ≤ 2s after speaking pause (5 trials avg).
  - [ ] No duplicate nodes created in 2‑minute rapid dictation test.
  - [ ] Reconnect test: toggle network; stream resumes without data loss.
  - [ ] Map persisted and link opens the saved map after finish.


