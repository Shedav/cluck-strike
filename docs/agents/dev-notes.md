# Dev notes

## Commands

`package.json` scripts: `dev`, `build`, `lint` (oxlint), `format` / `format:check` (Prettier), `test` (Vitest), `test:e2e` (Playwright, desktop and a 360px phone, against the production build). `BASE_URL=https://cluck-strike.vercel.app pnpm test:e2e` runs the e2e suite against the live site.

## Commit and deploy flow

- Commits go straight to `main` (no PRs). Vercel deploys every push to `main`, **even when CI fails**, so run the checks before committing: `pnpm lint && pnpm format:check && pnpm exec tsc -b && pnpm test`, and `pnpm build && pnpm test:e2e` when UI or flow changed.
- After pushing, watch CI: `gh run watch $(gh run list --limit 1 --json databaseId -q '.[0].databaseId') --exit-status`.
- The user sends small UI corrections mid-task: verify and commit each unrelated fix separately.
- Run `pnpm test:e2e` in the background: it takes over a minute, and a foreground run has been killed.
- Prettier re-wraps lines. When splitting one file's changes across commits, re-read the file after `pnpm format` before cutting it.

## Seeing the game

- `node scripts/shot.mjs <out.png> [--phone] [--hit <lane> | --no-hit] [click:<button> key:<key> fill:<label>=<value> wait:<ms> ...]`: a screenshot of the production build (run `pnpm build` first) after scripted actions, with the first Round's outcome pinned.
- `node scripts/sprites.mjs <out.png>`: every pixel sprite's frames at 8x, to show the user frames for approval before wiring them in.
- Timing is unreliable in headless shots: a screenshot lands 100–300 ms late and `requestAnimationFrame` can stall. To check _when_ something happens, sample DOM state from a `setInterval` in the page, or record CDP screencast frames. Video recording needs Playwright's ffmpeg, which is not installed.
- The in-app browser pane throttles animations while hidden; prefer the scripts above.
- On macOS 13 Playwright can't install its Chromium: local runs use the installed Chrome (`channel: 'chrome'`), CI uses the bundled one.
- Outcomes are pinned only by stubbing `crypto.getRandomValues` in the page (`e2e/rig.ts`); the app has no seed backdoor.
- To let the user hear a sound: temporarily `export` `EFFECTS` from `src/shared/lib/sound.ts`, render each with `OfflineAudioContext` in headless Chrome against the dev server, write WAVs, then revert the export.

## Phones

The user checks every change on a real iPhone, in Safari and in Chrome (Chrome on iOS is WKWebView). Layout bugs found there are pinned in `e2e/phone.spec.ts`; add a check there with each phone fix. iOS audio needs the unlock on a tap's release and a playback audio session; see the comments in `src/shared/lib/sound.ts`.

## Shell

macOS `sed` has no `\b`: use `perl -pi -e 's/\bold\b/new/g'` for word-boundary renames.
