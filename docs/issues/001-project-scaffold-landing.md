# Project scaffold and landing page

## User story
As a player visiting the site, I want a clear landing page with "Create Game" and "Join Game" options so that I can start or enter a match quickly.

## Acceptance criteria
- [ ] Vite + React + TypeScript project initialized with `npm run dev`, `npm run build`, `npm test`, `npm run lint`, and `npm run format` scripts working.
- [ ] `react-router-dom` configured with routes for `/` (landing), `/play/:roomCode`, and `/join`.
- [ ] Landing page displays app title, short tagline, and two prominent buttons: **Create Game** and **Join Game**.
- [ ] **Create Game** navigates to a new room (placeholder route acceptable until issue 004).
- [ ] **Join Game** navigates to join flow (placeholder acceptable until issue 005).
- [ ] Vitest and React Testing Library configured; at least one smoke test passes.
- [ ] CSS Modules used for component styling; page is readable on desktop and mobile widths.
- [ ] `AGENTS.md` entry points and commands remain accurate.

## Test expectations
- Landing page renders both buttons (component test).
- `npm run build` succeeds with zero errors.
- `npm test` passes.

## Out of scope
- WebRTC, chat, game board, or room code generation.
- Production deployment configuration.
- Signaling server setup.

## Suggested owner
worker
