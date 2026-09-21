# Plan

**Task:** RT-2302 · **Branch:** RT-2302-late-caught-checks
**Behaviour:** unchanged — the owner: «если проблемы реальны заведи тикет на это отдельный»; the work edits checks, rules and the showcase, not application code

## Task footprint

| What     | Where                                                                                                                                                                                                                         |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Package  | `projects/agent-kit/assets/hooks/git-guard-push-tests.sh`, its test under `projects/agent-kit/tests/`                                                                                                                         |
| Tools    | `tools/check-tokens-graph.mjs`, `tools/tokens-graph-allowlist.json`                                                                                                                                                           |
| Showcase | `projects/ui-kit/src/lib/ui-kit/side-menu/stories/side-menu.stories.ts`, its references                                                                                                                                       |
| Rules    | `rt-tools-storybook`, `rt-tools-styling-tokens`, `ui-component-tests`, `ui-component-tests-visual`, `browser-verification` companion, overrides of `doc-style` and `browser-verification-stand`, `.claude/rt-kit/gate-map.sh` |
| Texts    | `CLAUDE.md`                                                                                                                                                                                                                   |

## What counts as done

- a refusal of the push gate names every red check at once;
- the token check sees the first kit's scales declared by interpolation, and the five shared names
  stand in the accepted list;
- the narrow side-menu stories are shot in a narrow window;
- no text of the tree names `pnpm run storybook` without a suffix;
- the showcase rule, the snapshot pattern and the doc-style override hold the new articles.

## Stages

### 1. The push gate names every red check

- **Steps:**
    1. The package hook collects every red check and names them in one refusal
    2. The hook's test covers two red checks in one run
    3. The hook is laid out into the tree and `CLAUDE.md` says what `check:all` does not run
- **Readiness sign:** the test case with two red checks passes
- **Verified by:** `bash projects/agent-kit/tests/git-guards.test.sh` — no failed case

### 2. The token check sees interpolated scales

- **Steps:**
    1. The check expands `--rt-<scale>-#{$token}` over the keys of the map it walks
    2. The five shared names go into the accepted list with the reason of RT-383
    3. The token pattern names the interpolation trap
- **Readiness sign:** the check is green and counts five more accepted names
- **Verified by:** `node tools/check-tokens-graph.mjs` — «there are no new divergences»

### 3. The showcase fonts have a rule

- **Steps:**
    1. The showcase rule says where an icon font is declared and what its class repeats
    2. The gate map sends `preview-head.html` and `.storybook/*.scss` to the showcase rule
- **Readiness sign:** the gate map names `rt-tools-storybook` for `preview-head.html`
- **Verified by:** `bash .claude/rt-kit/gate-map.sh` probe — the rule name for both paths

### 4. Narrow stories are shot narrow

- **Steps:**
    1. `Mobile` and `MobileActiveMenu` declare `snapshotViewport`
    2. Their references are re-taken, looked at and confirmed by a second raising
    3. The snapshot pattern names the narrow-story trap
- **Readiness sign:** both references show the narrow layout, the second raising matches
- **Verified by:** `pnpm run test:visual side-menu/stories` — every snapshot passed

### 5. The showcase command and who raised it

- **Steps:**
    1. Every text names `pnpm run storybook:ui-kit-v1`
    2. The browser-verification companion says how to find who raised a showcase
- **Readiness sign:** no stale command left in the texts
- **Verified by:** `git grep -nE "pnpm run storybook($|[^:-])"` — no line

### 6. Consumers are not named

- **Steps:**
    1. The doc-style override gets a section of its own about consumers
    2. The layout is checked against the package
- **Readiness sign:** the layout check is green
- **Verified by:** `pnpm run agent-kit:check` — «разложенное сходится с пакетом»

## What this work does not do

- The favourites drag shadow and `SubMenuFavoritesMobile` — their files come with PR #2301; they are
  edited after it merges.
- Renaming the shared scale names of the two kits — separate work, as for RT-383.
