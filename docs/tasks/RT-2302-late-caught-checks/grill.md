# Grill

## The owner request

> если проблемы реальны заведи тикет на это отдельный

The findings are the rules review of RT-2291 (PR #2301); the task body of #2302 lists the six that
were confirmed against the code. Taken into work by the owner's words «глянь локальные ветки
вернись к работе над ними» and «почему остановился?».

## What the tree already has

- The push gate — `.claude/hooks/git-guard-push-tests.sh`, laid out from
  `projects/agent-kit/assets/hooks/git-guard-push-tests.sh`: the loop leaves on the first red check.
- The token graph check — `tools/check-tokens-graph.mjs`, section 4 collects first-kit names by a
  literal pattern; the accepted list `tools/tokens-graph-allowlist.json` already holds shared names
  of both kits (font weights, radii) with the reason of RT-383.
- The showcase fonts — `projects/ui-kit/.storybook/preview-head.html` declares the icon families;
  the gate map `.claude/rt-kit/gate-map.sh` sends only `.storybook/*.ts` to `rt-tools-storybook`.
- The first kit's snapshot harness — `projects/ui-kit/.storybook/test-runner.ts` reads only
  `parameters.snapshotViewport`, 1280×720 by default.
- The showcase command — `pnpm run storybook:ui-kit-v1`; `pnpm run storybook` no longer exists.
- The doc-style override — `.claude/rt-kit/overrides/rules/doc-style.md`.

## What the rules already say

- `testing`: a line is added to a known list only by the owner's word.
- `doc-style`: an override section with a new heading is appended, one with a package heading
  replaces the package section.
- `browser-verification`: a browser raised by a library from a script is a forbidden door — so the
  review's sixth proposal is dropped.

## Questions and answers

**The token check will see five names both kits have declared for long: `--rt-radius-lg`,
`--rt-radius-2xl`, `--rt-shadow-sm`, `--rt-shadow-md`, `--rt-shadow-lg`. Put them into the
accepted list with the reason of RT-383?**
Да, внести все пять.

**Stage 4 ran into the snapshots taking animations at their first frame (#2303). Hand RT-2302 in
without it, do #2303 first, or do everything in RT-2302?**
Сделать всё в RT-2302.

## Decisions

- **One task, six stages** — every finding is about a miss caught late; the owner asked for one
  ticket.
- **The favourites drag shadow goes back to `var(--rt-shadow-md)` after PR #2301 merges** — the file
  is not in main yet.
- **`SubMenuFavoritesMobile` gets its narrow frame after PR #2301 merges** — the story is not in main
  yet.

- **#2303 is absorbed by RT-2302** — by the owner's answer above: the harness fix and the re-taken
  references go into this branch, and #2303 leaves the board as absorbed.

## What is left unclear

- Nothing blocks the work.
