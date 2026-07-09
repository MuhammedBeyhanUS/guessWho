# Project Instructions

## Project Context
- Project type: game
- Primary language/framework: React + TypeScript
- Main entry points: localhost:5173
- Important commands:
  - `npm run dev` — start development server
  - `npm run build` — production build
  - `npm test` — run unit tests
  - `npm run lint` — lint check
  - `npm run format` — fix formatting

## Workflow
Default development flow is Plan -> Work -> Review.

1. Plan first when requirements are unclear or the task is larger than one small change.
2. Work on one scoped issue/change at a time.
3. Review the diff before considering the task complete.
4. Keep changes small, reversible, and testable.

### Subagent dispatch
- `/plan` or large planning tasks → dispatch `planner` agent (Task tool or `/planner`)
- `/work` or scoped implementation → dispatch `worker` agent (Task tool or `/worker`)
- `/review` or pre-commit/PR review → dispatch `reviewer` agent (Task tool or `/reviewer`)

### Issue storage
- Planned issues go in `docs/issues/` as one markdown file per issue.
- Architecture decisions go in `docs/adr/` when meaningful.

## Architecture Rules
- Keep business logic separate from UI/framework glue.
- Prefer small public interfaces and deep modules.
- Do not introduce new dependencies without explaining why.
- Do not perform unrelated refactors while implementing an issue.
- Document meaningful architecture decisions in `docs/adr/`.

## General Rules
- Always search the project before creating new classes.
- Prefer modifying existing code over creating duplicates.
- Keep methods small.
- Write tests for every new feature.
- Never commit code that does not compile.
- Keep the main readme.md file up to date.

## Before finishing
Always:
1. Build the project.
2. Run unit tests.
3. Fix formatting issues.
4. Explain what changed.

## Safety
- Do not delete files without explicit instruction.
- Do not change public behavior outside the active task.
- Ask before large rewrites, schema migrations, or dependency changes.
- If scope grows, stop and propose a new issue.
