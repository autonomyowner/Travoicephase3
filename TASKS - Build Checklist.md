# NeuroCanvas — Build Checklist

> Comprehensive, phased tasks and subtasks with checkboxes, aligned to the PRD.

## Phase 0 — Project Hygiene & Planning
- [ ] Define product name, domain, branding basics
  - [ ] Reserve domain and socials
  - [ ] Create logo, color palette, typography
- [ ] Repository setup
  - [ ] Initialize Git repo, main/develop branches
  - [ ] Configure CODEOWNERS, PR template, issue templates
  - [ ] Protect branches and require PR reviews
- [ ] Project management
  - [ ] Create epics and milestones in tracker
  - [ ] Define definition of done (DoD) and coding standards

## Phase 1 — Monorepo & Dev Environment
- [ ] Monorepo structure
  - [ ] Create folders: `apps/client`, `apps/server`, `packages/types`
  - [ ] Configure npm workspaces in `package.json`
  - [ ] Add shared tsconfig in root and per app
- [ ] Client app
  - [ ] Scaffold Next.js (TypeScript, App Router)
  - [ ] Install Tailwind, configure base theme
  - [ ] Add ESLint + Prettier configs
- [ ] Server app
  - [ ] Scaffold Express (TypeScript)
  - [ ] Add Zod, CORS, helmet, pino logger
  - [ ] Create health endpoint `/health`
- [ ] Local env
  - [ ] `.env.example` with OPENAI, SUPABASE, etc.
  - [ ] Add `dotenv` loading and validation
- [ ] Scripts
  - [ ] `dev:client`, `dev:server`, `dev`, `build`, `lint`, `typecheck`

## Phase 2 — Authentication & Onboarding
- [ ] Supabase setup
  - [ ] Create project; enable Auth (Email/Magic Link, Google, GitHub)
  - [ ] Configure RLS policies for multi-tenant safety
  - [ ] Create tables: `users`, `maps`, `map_versions`, `templates`
- [ ] Client auth
  - [ ] Install Supabase client; session provider
  - [ ] Pages: Login, Signup, Logout
  - [ ] Route guards for protected pages
- [ ] Onboarding
  - [ ] First-run prompt page (seed text to map)
  - [ ] Save onboarding flags on user

## Phase 3 — Input Layer (Text & Voice)
- [ ] Text input
  - [ ] Component with textarea and submit (Enter / Cmd+Enter)
  - [ ] Basic validation and character count
- [ ] Voice input (optional in MVP)
  - [ ] Microphone capture with Web Audio API
  - [ ] Upload endpoint for audio blob
  - [ ] Whisper transcription integration

## Phase 4 — AI Thought Parsing
- [ ] Map schema
  - [ ] Define `ThoughtNode`, `MapGraph` types in `packages/types`
  - [ ] Zod schema for API validation
- [ ] Generation service
  - [ ] Server route `/api/maps/generate`
  - [ ] Prompt engineering for hierarchical JSON
  - [ ] Normalization and schema validation
  - [ ] Retry/fallback strategy and error handling
- [ ] Enhancements
  - [ ] Action item extraction with priority
  - [ ] Sentiment tagging (positive/neutral/negative)

## Phase 5 — Mind Map Interface (React Flow)
- [ ] Base canvas
  - [ ] Integrate React Flow; pan/zoom/fit-to-view
  - [ ] Render nodes/edges from `MapGraph`
- [ ] Node types & styles
  - [ ] Root, Thought, Action, Emotion nodes
  - [ ] Tailwind-based styling and icons
  - [ ] Sentiment color halo + priority badge
- [ ] Interactions
  - [ ] Drag/reposition nodes
  - [ ] Connect/disconnect edges, re-link
  - [ ] Inline label editing (double-click)
  - [ ] Context menu (convert type, delete, connect)
- [ ] Layouts
  - [ ] Tree and radial layouts
  - [ ] Preserve manual positions after edits

## Phase 6 — Persistence, Versioning, Recovery
- [ ] Persistence
  - [ ] Save map JSON and layout to Supabase
  - [ ] Link maps to user id; title/description metadata
- [ ] Versioning
  - [ ] Auto-save on throttled interval
  - [ ] Manual checkpoints with labels
  - [ ] Version history panel; restore/copy
- [ ] Resilience
  - [ ] Optimistic UI + rollback
  - [ ] Error toasts and recovery UX

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
- [ ] Export
  - [ ] PNG export (HTML-to-Canvas)
  - [ ] JSON export
  - [ ] PDF/Markdown (beta)
- [ ] Import
  - [ ] Import JSON to map
  - [ ] Import raw notes → AI parse
- [ ] Templates
  - [ ] Prebuilt: Essay, Sprint Plan, Persona Map
  - [ ] Save user maps as templates

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
