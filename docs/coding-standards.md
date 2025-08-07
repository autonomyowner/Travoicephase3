# Coding Standards

- TypeScript everywhere (strict mode). No `any` except in typed escape hatches.
- Naming:
  - Functions: verbs/verb-phrases; Handlers prefixed with `handle`.
  - Variables: descriptive nouns. Avoid 1–2 char names.
- Control flow: prefer early returns; guard clauses; avoid deep nesting.
- Styling: Tailwind CSS; prefer `class:` conditional utilities over ternaries when supported.
- Accessibility: ARIA labels, keyboard navigation, focus states for interactive elements.
- Error handling: typed errors; surface actionable messages; no silent failures.
- Comments: explain “why”, not “how”. Keep concise.
- Formatting: Prettier + ESLint; keep lines readable; avoid unrelated reformatting.
- Testing: Vitest for units; Playwright for E2E; aim for critical-path coverage.
- Security: never commit secrets; validate inputs with Zod; enforce RLS on data access.
