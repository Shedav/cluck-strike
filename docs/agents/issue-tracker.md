# Issue tracker

Work items are local Markdown files; there is no external tracker.

- `docs/issues/0001-cluck-strike-mvp.md`: the MVP issue (user stories, modules, tests). Its Out of Scope list is historical; `docs/spec.md` is current.
- `docs/issues/cluck-strike/NN-name.md`: one ticket each. A ticket split into slices gets a folder `NN-name/` with `01-….md`, `02-….md`, and the parent links to it.

A ticket has: **What to build**, **Blocked by**, **Status**, checkbox criteria, **Notes**, **Time spent**.

Closing a ticket, in the same commit as the work:

1. Tick every box that is done.
2. Set `**Status:** done`.
3. Add **Notes**: decisions that changed the plan, how it was checked. A Note overrides the older spec text, so bring `docs/spec.md` in line when it does.
4. Add `**Time spent:** ~N min (HH:MM–HH:MM, YYYY-MM-DD)` from `date` at the start and the end.
