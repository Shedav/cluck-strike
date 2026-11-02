# 01: Project skeleton, CI and deploy

Parent: [0001 Cluck Strike MVP](../0001-cluck-strike-mvp.md)

**What to build:** a deployed, empty Cluck Strike page that already looks like a cs2skin game page: dark `#060b15` background with a faint purple glow, Chakra Petch font, palette as CSS variables. Every push runs lint, tests and build in CI. This sets up the tooling every later ticket relies on.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] Git repository initialised; public GitHub repo created; Conventional Commits from the first commit
- [ ] Vite + React + TypeScript (strict) project managed with pnpm
- [ ] ESLint + Prettier configured and passing
- [ ] Vitest runs one trivial test; Playwright runs one trivial smoke test against the built app
- [ ] GitHub Actions workflow: lint → test (Vitest + Playwright) → build, green on main
- [ ] Deployed to Vercel from main; the link opens the styled empty shell
- [ ] cs2skin palette tokens (background, panel gradient, accent `#7d2efa`, win `#15d77c`, Hit `#ed4438`, coin `#f8a605`, text colors) defined once as CSS variables; Chakra Petch loaded
- [ ] MIT license file
- [ ] Time spent recorded at the bottom of this ticket
