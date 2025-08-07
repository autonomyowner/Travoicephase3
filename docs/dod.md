# Definition of Done (DoD)

A change is done when:

- Scope: Matches acceptance criteria and task description.
- Code: Compiles cleanly; adheres to coding standards; types pass with `--noEmit`.
- Lint: ESLint passes; Prettier formatted.
- Tests: Unit tests for logic; E2E updated when UX changes critical path.
- Security: Inputs validated; secrets not exposed; access controls checked.
- UX: Accessible (keyboard, labels), responsive; error and loading states handled.
- Docs: README or in-app help updated if behavior changed; API docs adjusted.
- CI: All checks green; review comments addressed; squash-merge ready.
