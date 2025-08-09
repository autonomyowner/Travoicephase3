# NeuroCanvas — Build Checklist

> Comprehensive, phased tasks and subtasks with checkboxes, aligned to the PRD.

## Phase 0 — Project Hygiene & Planning
- [ ] Define product name, domain, branding basics
  - [ ] Reserve domain and socials
  - [x] Create logo, color palette, typography
- [ ] Repository setup
  - [x] Initialize Git repo
  - [ ] Create `main`/`develop` branches
  - [ ] Configure CODEOWNERS
  - [x] Configure PR template
  - [x] Configure issue templates
  - [ ] Protect branches and require PR reviews
- [ ] Project management
  - [ ] Create epics and milestones in tracker
  - [x] Define definition of done (DoD)
  - [x] Define coding standards

## Phase 1 — Monorepo & Dev Environment
- [x] Monorepo structure
  - [x] Create folders: `apps/client`, `apps/server`, `packages/types`
  - [x] Configure npm workspaces in `package.json`
  - [x] Add shared tsconfig in root and per app
- [x] Client app
  - [x] Scaffold Next.js (TypeScript, App Router)
  - [x] Install Tailwind, configure base theme
  - [x] Add ESLint + Prettier configs
  - [x] Wire client to server base URL via env
- [x] Server app
  - [x] Scaffold Express (TypeScript)
  - [x] Add Zod, CORS, helmet, pino logger
  - [x] Create health endpoint `/health`
- [x] Local env
  - [x] `.env.example` with OPENAI, SUPABASE, etc.
  - [x] Add `dotenv` loading and validation
- [x] Scripts
  - [x] `dev:client`, `dev:server`, `dev`, `build`, `lint`, `typecheck`

## Phase 2 — Authentication & Onboarding
- [x] Supabase setup
  - [ ] Create project; enable Auth (Email/Magic Link, Google, GitHub)
  - [x] Configure RLS policies for multi-tenant safety
  - [x] Create tables: `users`, `maps`, `map_versions`, `templates`
- [ ] Client auth
  - [x] Install Supabase client; session provider
  - [x] Pages: Login, Signup, Logout
  - [x] Route guards for protected pages
- [x] Onboarding
  - [x] First-run prompt page (seed text to map)
  - [x] Save onboarding flags on user

## Phase 3 — Input Layer (Text & Voice)
- [x] Text input
  - [x] Component with textarea and submit (Enter / Cmd+Enter)
  - [x] Basic validation and character count
- [x] Voice input (optional in MVP)
  - [x] Microphone capture with Web Audio API
  - [x] Upload endpoint for audio blob
  - [ ] Whisper transcription integration

## Phase 4 — AI Thought Parsing
- [x] Map schema
  - [x] Define `ThoughtNode`, `MapGraph` types in `packages/types`
  - [x] Zod schema for API validation
- [ ] Generation service
  - [x] Server route `/api/maps/generate`
  - [ ] Prompt engineering for hierarchical JSON
  - [ ] Normalization and schema validation
  - [ ] Retry/fallback strategy and error handling
- [ ] Enhancements
  - [ ] Action item extraction with priority
  - [ ] Sentiment tagging (positive/neutral/negative)

## Phase 5 — Mind Map Interface (React Flow)
- [x] Base canvas
  - [x] Integrate React Flow; pan/zoom/fit-to-view
  - [x] Render nodes/edges from `MapGraph`
- [x] Node types & styles
  - [x] Root, Thought, Action, Emotion nodes
  - [x] Tailwind-based styling and icons
  - [x] Sentiment color halo + priority badge
- [ ] Interactions
  - [x] Drag/reposition nodes
  - [x] Connect/disconnect edges, re-link
  - [x] Inline label editing (double-click)
  - [ ] Context menu (convert type, delete, connect)
- [ ] Layouts
  - [ ] Tree and radial layouts
  - [x] Preserve manual positions after edits

## Phase 6 — Persistence, Versioning, Recovery
- [x] Persistence
  - [x] Save map JSON and layout to Supabase
  - [x] Link maps to user id; title/description metadata
- [x] Versioning
  - [x] Auto-save on throttled interval
  - [x] Manual checkpoints with labels
  - [x] Version history panel; restore/copy
- [x] Resilience
  - [x] Optimistic UI + rollback
  - [x] Error toasts and recovery UX

## Phase 7 — Real-time Collaboration (Beta)
- [ ] Realtime basics
  - [ ] Supabase Realtime channels per map
  - [ ] CRDT or server conflict strategy
- [ ] Presence & cursors
  - [ ] Show collaborator avatars and cursors
  - [ ] Active selection highlighting
- [ ] Concurrency control
  - [ ] Node-level locking to prevent collisions

## Phase 8 — Export, Import, Templates
- [x] Export
  - [x] PNG export (HTML-to-Canvas)
  - [x] JSON export
  - [x] Markdown (beta)
  - [ ] PDF (beta)
- [x] Import
  - [x] Import JSON to map
  - [x] Import raw notes → AI parse
- [x] Templates
  - [x] Prebuilt: Essay, Sprint Plan, Persona Map
  - [x] Save user maps as templates

## Phase 9 — AI Coaching & Exploration (Beta)
- [ ] Coach API
  - [ ] `/api/coach` endpoint with context-aware prompts
  - [ ] Suggest deeper questions and adjacent topics
- [ ] UI
  - [ ] Side panel with suggestions and “Add to Map”
  - [ ] Per-node follow-ups and acceptance tracking

## Phase 10 — Dashboard & Analytics
- [ ] Dashboard
  - [ ] List of saved maps, quick actions, recent activity
- [ ] Analytics
  - [ ] Thinking style snapshots (depth, breadth, sentiment)
  - [ ] Node count growth over time

## Phase 11 — Mobile Web Optimization
- [ ] Responsive
  - [ ] Tailwind breakpoints; bottom tab navigation
  - [ ] Pinch-zoom and tap-to-focus
- [ ] Performance
  - [ ] Progressive loading for large maps
  - [ ] Touch gestures and latency checks

## Phase 12 — Billing & Plans (Launch)
- [ ] Pricing tiers
  - [ ] Free, Pro, Team, Enterprise definitions
- [ ] Stripe integration
  - [ ] Checkout/subscription flows
  - [ ] Webhooks and account management
- [ ] Paywalls
  - [ ] Feature gating by tier

## Phase 13 — Security, Privacy, Compliance
- [ ] Auth & access control
  - [ ] JWT sessions, RLS policies
  - [ ] Map privacy: private, unlisted, shared
- [ ] Secrets & storage
  - [ ] Server-side env only; rotation plan
  - [ ] Supabase Buckets for media
- [ ] Compliance (later)
  - [ ] GDPR export/delete data
  - [ ] Audit logs for enterprise

## Phase 14 — DevOps & Observability
- [ ] CI/CD
  - [ ] GitHub Actions: lint, typecheck, test, build
  - [ ] Preview deployments for PRs
- [ ] Hosting
  - [ ] Vercel (client), Railway/Render (server)
  - [ ] Custom domains and HTTPS
- [ ] Observability
  - [ ] Structured logs; error reporting (Sentry)
  - [ ] Metrics and health checks

## Phase 15 — QA, Testing, Performance
- [ ] Testing
  - [ ] Unit tests (Vitest) for utils and services
  - [ ] Component tests for key UI widgets
  - [ ] E2E (Playwright) for core flows
- [ ] Performance
  - [ ] Load testing (k6/Artillery) for API
  - [ ] Canvas performance on 500+ nodes

## Phase 16 — Launch & Post-Launch
- [ ] Beta program
  - [ ] Collect feedback; iterate on UX and accuracy
- [ ] Public launch
  - [ ] Landing page, docs, tutorial video
  - [ ] Announcements and community channels
- [ ] Post-launch
  - [ ] NPS, activation/retention KPIs tracking
  - [ ] Roadmap updates and backlog grooming




Map diffs/timeline: Version playback, side‑by‑side diff, “restore as branch,” and changelog export.