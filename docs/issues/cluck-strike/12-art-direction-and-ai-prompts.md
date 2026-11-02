# 12: Art direction and AI prompts

Parent: [0001 Cluck Strike MVP](../0001-cluck-strike-mvp.md)

**What to build:** a short art-direction document plus one ready-to-paste AI image prompt for each sprite name used by the scene. The user can then generate a consistent set and drop it in to replace the CC0 placeholders, with no code changes. The user generates the images; Claude writes the prompts and swaps the files in.

**Blocked by:** 08.

**Status:** ready-for-agent (writing the prompts); generating the images needs the user

- [ ] Art direction: cartoon flat 2D, bold outline, palette tied to the cs2skin tokens, lighting and camera angle, transparent backgrounds, target sizes
- [ ] One prompt per sprite name (chicken idle / hop / roasted, Lane tiles, fire states, Smoke, golden case, background), with sizes and frame counts where animated
- [ ] Explicit "no logos, no Valve/CS map names or assets" constraints in every prompt
- [ ] Steps to swap the files, and a check that the scene still looks right
- [ ] Time spent recorded at the bottom of this ticket
