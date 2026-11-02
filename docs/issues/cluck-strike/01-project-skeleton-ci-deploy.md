# 01: Project skeleton, CI and deploy

Parent: [0001 Cluck Strike MVP](../0001-cluck-strike-mvp.md)

**What to build:** a deployed, empty Cluck Strike page that already looks like a cs2skin game page: dark `#060b15` background with a faint purple glow, Chakra Petch font, palette as CSS variables. Every push runs lint, tests and build in CI. This sets up the tooling every later ticket relies on.

**Blocked by:** None (can start immediately).

**Status:** done

- [x] Git repository initialised; public GitHub repo created; Conventional Commits from the first commit
- [x] Vite + React + TypeScript (strict) project managed with pnpm
- [x] Linter (oxlint, the current Vite template default, instead of ESLint) + Prettier configured and passing
- [x] Vitest runs one trivial test; Playwright runs one trivial smoke test against the built app
- [x] GitHub Actions workflow: lint → test (Vitest + Playwright) → build, green on main
- [x] Deployed to Vercel from main; the link opens the styled empty shell
- [x] cs2skin palette tokens (background, panel gradient, accent `#7d2efa`, win `#15d77c`, Hit `#ed4438`, coin `#f8a605`, text colors) defined once as CSS variables; Chakra Petch loaded
- [x] MIT license file
- [x] Time spent recorded at the bottom of this ticket

**Live:** https://cluck-strike.vercel.app/ (smoke test passes against it with `BASE_URL=https://cluck-strike.vercel.app pnpm test:e2e`)

**Notes:** Playwright's bundled Chromium does not install on macOS 13, so local runs use the installed Google Chrome; CI uses bundled Chromium.

**Time spent:** ~15 min (15:25–15:40, 2026-11-02). Design, research, spec and ticket breakdown before this ticket: ~4 h wall-clock (11:38–15:25).
