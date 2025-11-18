# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TRAVoices is an AI-powered real-time voice translation platform using LiveKit for voice rooms, DeepL for translation, and ElevenLabs TTS for voice synthesis. The system consists of three main components:

1. **Next.js Client** (`apps/client`) - Frontend with multi-language support (English, Arabic with RTL)
2. **Express Server** (`apps/server`) - Backend API with Supabase integration
3. **Python Agent Worker** (`agent-worker`) - LiveKit agent for real-time translation

## Architecture

### Monorepo Structure
- **npm workspaces** - Root `package.json` defines workspaces: `apps/*` and `packages/*`
- **Shared types** - `packages/types` provides TypeScript types shared across apps
- **Independent deployments** - Each app has its own build/deploy pipeline

### Real-Time Translation Flow
1. User clicks "Start Agent" in voice room (client)
2. Next.js API route (`apps/client/src/app/api/translation/start/route.ts`) dispatches LiveKit job
3. Python agent worker receives job with language pair metadata (e.g., "ar,fr")
4. Agent joins room and processes audio:
   - **STT**: Deepgram transcribes speech (multi-language support)
   - **Translation**: DeepL translates text between languages
   - **TTS**: ElevenLabs converts to speech in target language
5. Translated audio is streamed back to room participants

### Key Integration Points
- **Agent name**: `interpreter-agent` (must match in both `apps/client/src/app/api/translation/start/route.ts` and `agent-worker/interpreter.py`)
- **LiveKit URLs**:
  - Client-side: `wss://` (WebSocket)
  - Server-side (Next.js API routes): `https://`
  - Agent worker: `wss://`

### Multi-Language Support
- Main English site at `/`
- Arabic site at `/ar` with full RTL support and Arabic typography
- Uses `next-intl` for internationalization
- Separate app directory structures: `apps/client/src/app/` (English) and `apps/client/src/app/ar/` (Arabic)

## Development Commands

### Setup
```bash
npm install                  # Install all workspace dependencies
```

### Development
```bash
npm run dev                  # Run both client and server concurrently
npm run dev:client          # Run Next.js client only (port 3000)
npm run dev:server          # Run Express server only (port 4000)
```

### Client (Next.js)
```bash
cd apps/client
npm run dev                  # Dev server with Turbopack
npm run build               # Production build
npm run start               # Start production server
npm run lint                # ESLint check
```

### Server (Express)
```bash
cd apps/server
npm run dev                  # Dev server with auto-reload (ts-node-dev)
npm run build               # Compile TypeScript to dist/
npm run start               # Run compiled JavaScript
```

### Agent Worker (Python)
```bash
cd agent-worker
pip install -r requirements.txt    # Install Python dependencies
python interpreter.py              # Run agent locally
```

## Environment Variables

### Client (apps/client/.env.local)
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
NEXT_PUBLIC_LIVEKIT_URL=wss://travcoies-9h1ntokz.livekit.cloud
LIVEKIT_URL=https://travcoies-9h1ntokz.livekit.cloud
LIVEKIT_API_KEY=
LIVEKIT_API_SECRET=
```

### Agent Worker (agent-worker/.env)
```
LIVEKIT_URL=wss://travcoies-9h1ntokz.livekit.cloud
LIVEKIT_API_KEY=
LIVEKIT_API_SECRET=
DEEPGRAM_API_KEY=
DEEPL_API_KEY=
ELEVENLABS_API_KEY=
ELEVENLABS_VOICE_ID=
```

## Coding Standards

- **TypeScript strict mode** - No `any` types except in escape hatches
- **Naming conventions**:
  - Functions: verbs/verb-phrases
  - Event handlers: prefix with `handle`
  - Variables: descriptive nouns (no single-letter names)
- **Control flow**: Early returns, guard clauses, avoid deep nesting
- **Styling**: Tailwind CSS with `class:` conditional utilities
- **Accessibility**: ARIA labels, keyboard navigation, focus states
- **Error handling**: Typed errors with actionable messages, no silent failures
- **Validation**: Use Zod for input validation
- **Security**: Never commit secrets, enforce RLS on database access

## Definition of Done

- Code compiles cleanly with TypeScript `--noEmit`
- ESLint passes, Prettier formatted
- Unit tests for logic (Vitest), E2E for critical paths (Playwright)
- Inputs validated with Zod
- Accessible (keyboard, ARIA), responsive
- Documentation updated if behavior changed

## Branching & Commits

- **main**: protected, release-ready
- **develop**: integration branch
- **Feature branches**: `feat/<scope>`, `fix/<scope>`, `chore/<scope>`
- **Commit convention**: Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, etc.)
- **PRs**: Small, focused, link issues, include tests

## Deployment

- **Client**: Next.js (Vercel/Netlify recommended)
- **Server**: Node.js backend (any provider supporting Express)
- **Agent Worker**: Docker container (Render.com/Railway.app - see `AGENT_WORKER_DEPLOYMENT.md`)

## Important Files

- `.env.example` - Template for environment variables
- `docs/coding-standards.md` - Full coding standards
- `docs/dod.md` - Complete Definition of Done
- `docs/repo-setup.md` - Repository workflows
- `AGENT_WORKER_DEPLOYMENT.md` - Detailed deployment guide for Python agent
- `packages/types/src/` - Shared TypeScript interfaces
