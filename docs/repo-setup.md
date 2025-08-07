# Repository Setup & Workflows

## Branching
- `main`: protected; release-ready.
- `develop`: integration branch for ongoing work.
- Feature branches: `feat/<scope>`; fixes: `fix/<scope>`; chores: `chore/<scope>`.

## PRs
- Small, focused; link issues; include acceptance criteria.
- Template includes: scope, screenshots, tests, risks.

## Commit Convention
- Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`, `build:`, `ci:`.

## Protection
- Require PR reviews; status checks (lint, typecheck, test) must pass.

## Local Setup
- Node LTS; `npm` workspace.
- `npm install` at repo root; use workspace scripts: `npm run dev:client`, `npm run dev:server`.

## Secrets
- Use `.env.local` files; never commit secrets; rotate if exposed.
