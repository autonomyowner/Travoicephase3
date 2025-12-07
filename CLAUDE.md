# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TRAVoices is a real-time voice translation platform using WebRTC (LiveKit) for bidirectional communication. Users join a room, speak in one language (EN/AR), and receive translated audio in another language.

**Tech Stack:** Next.js 15.4, React 19, TypeScript, Tailwind CSS v4, LiveKit (WebRTC), Clerk (auth), Deepgram (STT), Gemini (translation), ElevenLabs (TTS)

## Commands

```bash
npm install         # Install all workspace dependencies (run at repo root)
npm run dev         # Next.js dev server on localhost:3000
npm run build       # Production build
npm run lint        # ESLint check
npm run typecheck   # TypeScript strict mode check
```

## Architecture

### Monorepo Structure

```
apps/client/          # Next.js frontend
├── src/app/          # App Router pages & API routes
│   ├── api/          # livekit-token, translate endpoints
│   ├── dashboard/    # Protected main app
│   ├── test-call/    # Real-time voice translation demo
│   └── ...
├── src/components/   # React components (ui/, AuthProvider, Header, LanguageProvider)
├── src/hooks/        # Custom hooks
└── src/lib/          # Utilities (auth.ts, translations.ts)
docs/                 # Branding, coding standards, DoD, PRD
supabase/             # Migrations & config (not actively used)
```

### Real-time Voice Flow

1. Client requests LiveKit token from `/api/livekit-token`
2. WebRTC connection established via LiveKit room
3. Microphone audio captured and sent to `/api/translate`
4. Translation pipeline: Deepgram STT → Gemini Translate → ElevenLabs TTS
5. Translated audio published as named track ("translated_audio")
6. Participants receive and play translated audio

### Key Files

- `apps/client/src/app/test-call/page.tsx` - Voice translation demo
- `apps/client/src/app/api/translate/route.ts` - Translation pipeline
- `apps/client/src/app/api/livekit-token/route.ts` - Token generation

## Coding Standards

- **TypeScript:** Strict mode enabled; no `any` except typed escapes
- **Naming:** Functions use verbs; event handlers prefixed `handle`
- **Control Flow:** Early returns, guard clauses, minimal nesting
- **Styling:** Tailwind CSS; prefer class conditionals over ternaries
- **Errors:** Typed errors, actionable messages, no silent failures

## Conventions

### Commit Messages (Conventional Commits)
```
feat:     New feature
fix:      Bug fix
chore:    Housekeeping
docs:     Documentation
refactor: Code reorganization
test:     Test additions
```

### Design Constraints
- Never use icons in design
- Never use colored icons in UI
- Dark-first design with minimal motion
- Primary: #0B0B0E, Accent: #F4C542, #38BDF8

## Environment Variables

Required keys (see `.env.example`):
- Clerk: `NEXT_PUBLIC_CLERK_*`
- LiveKit: `LIVEKIT_*`
- Deepgram: `DEEPGRAM_API_KEY`
- Gemini: `GEMINI_API_KEY`
- ElevenLabs: `ELEVENLABS_API_KEY`

## Technical Notes

- LiveKit data channels have 65KB message limit - audio is chunked or sent via tracks
- Edge Runtime used for API routes (Blob/Uint8Array, not Buffer)
- No separate backend server - all logic in Next.js API routes
- Auth is Clerk-only (Supabase auth removed)
- i18n supports EN/FR via LanguageProvider context
