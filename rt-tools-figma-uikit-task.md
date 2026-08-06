# Claude Code task — build the RT-Tools UI Kits in Figma

> Run this task in the **rt-tools** repository scope.
> Goal: a Figma library file with design tokens (variables) and component mockups for the two
> component packages this repo publishes, built from the actual source code and verified against
> live Storybook renders.
>
> Facts below were re-checked against the working tree on **2026-08-05** (`d83272f`). Counts and
> paths come from commands run on this tree, not from memory.

## Prerequisites (verify before starting)

1. **Figma MCP server is connected** in this session. Call `mcp__claude_ai_Figma__whoami` —
   expected account: `eyhenij@gmail.com`, single plan `team::1303067727292529283`
   ("Yauheni Krumin's team", tier `pro`, seat Full). If the Figma MCP is missing, stop and ask
   the user to enable it.
2. **Skills discipline**: load `/figma-use` before EVERY `use_figma` call, and
   `/figma-generate-design` before the first capture/design-generation pass. The skills actually
   served by this MCP are `/figma-use`, `/figma-generate-design`, `/figma-generate-library`,
   `/figma-code-connect`, `/figma-use-figjam` — fetch them via `get_figma_skill` /
   `read_skill_uri` when no local plugin skill is installed. There is **no**
   `/figma-create-new-file` skill; `create_new_file` is used bare.
3. **Storybook works** — both are wired as Nx targets with fixed ports:

    ```bash
    pnpm run storybook              # @rt-tools/ui-kit    → port 6006
    pnpm run storybook:ui-kit-v2    # @rt-tools/ui-kit-v2 → port 6007
    ```

    Start the one you need and keep it running for the whole session.

## Which kit to build

This repo holds **two independent component packages**. `@rt-tools/ui-kit-v2` is the better first
target — see “Why build v2 first” below. Everything about the older `@rt-tools/ui-kit` is kept
because the Figma file already carries it and it still has to be reconciled.

---

## Phase 0 — The Figma file already exists. Reconcile before you build.

Do **not** create a new file. The library lives at:

```
https://www.figma.com/design/73BbHi12YOuRYl0BtQGsG1     fileKey 73BbHi12YOuRYl0BtQGsG1
name: RT-Tools UI Kit    (team::1303067727292529283, drafts)
```

Its Cover claims it was built 2026-06-07 from commit `7afe200` with “18/18 modules”, and an
earlier session recorded a page per module plus 🎨 Foundations and 📸 References.

**As of 2026-08-05 `get_metadata` on that fileKey returns exactly one top-level page —
`0:1 📋 Cover`** (holding the Cover frame, a “Build summary” frame, and 15 capture frames).
The per-module pages are not there.

So the first action of any session is:

1. `get_metadata` with the fileKey and no `nodeId` → list the pages that actually exist.
2. Compare against the Cover’s Build summary (node `55:4`) and the ⚠ token list (node `55:6`).
3. Report the delta to the user and ask whether the older kit is to be rebuilt, before spending
   any calls on it. Do not assume the recorded state is the real one.

Target page structure (create only what is missing):

```
📋 Cover            — title, date, source repo + commit hash, build summary, ⚠ token list
🎨 Foundations      — variables showcase: color ramps, radius, spacing, breakpoints, typography
🧩 <module>         — one page per module (older kit) / per component group (v2)
📸 References       — raw Storybook captures (kept for comparison, clearly marked non-library)
```

---

## Source of truth — `@rt-tools/ui-kit-v2` (build this first)

Package root: `projects/ui-kit-v2/`. Selectors `rt-*` (the older kit uses `rtui-*`), own token
set, own component list, no shared code — one application can hold both. Published as `0.1.0`.

Scale, counted on this tree:

| Thing              | Count | How counted                                                                                                           |
| ------------------ | ----- | --------------------------------------------------------------------------------------------------------------------- |
| Component families | 72    | dirs under `src/lib/components/` (73 entries incl. `index.ts`)                                                        |
| Components         | 83    | `*.component.ts` under `src/lib`, excluding `stories/`                                                                |
| Directives         | 11    | `*.directive.ts`, excluding specs                                                                                     |
| Pipes              | 5     | `*.pipe.ts`                                                                                                           |
| Services           | 6     | `*.service.ts`                                                                                                        |
| Icons              | 335   | SVG files in `src/assets/icons`                                                                                       |
| Label languages    | 8     | `en, ru, de, ko, th, hi, zh-Hans, zh-Hant` — 131 keys in the `rtKit` namespace, `src/lib/i18n/rt-kit-translations.ts` |

### Why build v2 first

Three reasons, all of which remove work rather than add it.

1. **Its tokens are self-contained.** It defines everything it needs itself — nothing is left for
   a consuming app to supply, so every Figma variable gets a real value on day one.

2. **The tier structure maps onto Figma variables one-to-one.**

    | File (under `projects/ui-kit-v2/src/styles/`) | Figma                                                                                                                                                                                                                                                  |
    | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
    | `_primitives.scss`                            | collection `core` — literals: neutral/blue/charcoal/status ramps, spacing, radii, typography, shadows, z-index, durations                                                                                                                              |
    | `_semantic.scss`                              | collection `theme`, mode `Light` — 179 declarations, 168 of them references to a `core` variable (Figma alias); the remaining 11 are literal dimensions (`--rt-space-2xs: 2px`, `--rt-profile-avatar-size: 42px`, …) and become plain number variables |
    | `_theme-dark.scss`                            | collection `theme`, mode `Dark` — same names, overridden aliases; emitted from the `rt-theme-dark-tokens` mixin so it can also scope to a container                                                                                                    |
    | `_breakpoints.scss`                           | number variables `$rt-bp-sm/md/lg/xl` = 480 / 768 / 1080 / 1380 px; SCSS-only by design (CSS properties do not work in `@media`)                                                                                                                       |

    Also present and not part of the token tiers: `_index.scss` (aggregator), `_mixins.scss`,
    `_scrollbar.scss`, `_login.scss`.

3. **You do not have to parse SCSS at all.** `pnpm run build:ui-kit-v2` (or just
   `pnpm run build:tokens-v2`) emits `dist/ui-kit-v2/styles/tokens.css` — ~500 resolved custom
   properties, light under `:root` and dark under `:root[data-theme=dark], html.rt-theme-dark`.
   Read that instead; it is what the consumer gets, so it cannot drift from the library.
   Caveat: the file is not tokens only — `_index.scss` also forwards `_scrollbar.scss` and the
   `rtButton` directive styles, so skip the non-`--rt-*` rules when harvesting variables.

### Storybook for v2 — what to expect before capturing

Port 6007. Stories glob: `../docs/**/*.mdx` + `../src/**/*.stories.@(js|jsx|mjs|ts|tsx)`.

- **80 story files, 81 stories** — one `Default` per component, except `autocomplete`, which has
  two. The variant matrix must come from the component’s inputs, not from the story list — read
  `*.component.ts` as Phase 3 instructs. Storybook controls do enumerate the options: `argTypes`
  are generated from the declared union types.
- **5 Foundation pages** — `Foundation / Design Tokens / {Overview, Colors, Semantic, Spacing,
Theming}`, authored in `projects/ui-kit-v2/docs/*.mdx` (note: the _Spacing_ page is
  `Scales.mdx`). They read their values out of the loaded stylesheets at render time, so a
  capture of them is a capture of the real palette.
- **Theme** is switched from the toolbar; it writes `data-theme` on `<html>` — the same attribute
  the kit’s `ThemeService` sets and the same selector `tokens.css` keys the dark block on.
  Capture both themes for every component: dark is a real override, not a filter.
- **About ten stories render empty** — table, chat, calendar, bar-list, night-grid, thread-list,
  timeline, toggle-button-group, filter-control, split-button all receive an empty data array.
  Feed them through the Controls panel before capturing, or drive them from the component source.
- **Fourteen components have no story at all** — `rt-aside-footer`, `rt-aside-unsaved-dialog`,
  `rt-detail-list`, `rt-dialog-footer`, `[rtFieldHint]`, `rt-file-list`, `rt-menu-confirm-dialog`,
  `rt-money-list`, `rt-note`, `rt-photo-viewer`, `[rtTableRow]`, `rt-table-settings-aside`,
  `rt-tooltip`, `rt-welcome-dialog`. They take no inputs and need projected content; build them
  from source and the SCSS only.
- Stories target `Test*Component` wrappers, not the kit components directly. The wrapper adds
  nothing visually — it exists because the kit’s inputs are signals — but do not mistake its
  `app-*` selector for a shipped component, and do not put it in the Figma library.

Full status of the showcase lives in `UI-KIT-V2-ISSUES.md` in the repo root.

### Suggested order for v2

Simple → complex. This covers 36 of the 72 families; work the rest in alphabetical order after,
or ask the user which matter.

```
icon → spinner → skeleton → tag → live-badge → info-item → button → icon-button
→ checkbox → toggle-switch → input → textarea → select → multiselect → date-picker → field
→ card → empty-state → tooltip → popover → confirm-popover → menu → toast → toaster
→ dialog → bottom-sheet → aside → tabs → stepper → pagination → table
→ page-header → section-nav → toolbar → chat → calendar → rich-editor
```

Icons first is deliberate: `rt-icon` is a dependency of most other components, and the 335-file
set under `projects/ui-kit-v2/src/assets/icons` is worth importing into Figma as its own
component set before anything references it. Storybook serves that directory at `/icons`
(`staticDirs` in `.storybook/main.ts`) — `rt-icon` fetches `/icons/<name>.svg` over HTTP and
inlines a sprite.

### Still open on the v2 side

Two things that affect what you can trust while building:

- **No component is rendered in any test.** 96 tests in 10 spec files cover eight pure-logic
  modules and the translation providers; the components themselves are verified by nothing.
  If a Storybook render looks wrong, the code is as likely to be wrong as your reading of it.
- **The neutral ramp is irregular** — 21 steps (`0, 50, 100, 150, 200, 250, 280, 300, 350, 400,
420, 450, 520, 500, 510, 550, 600, 700, 800, 900, 950`), with `280`, `420`, `450`, `510`, `520`
  off the grid and `520` declared before `500`. Reproduce it as-is; do not tidy it into an even
  scale, or the Figma variables stop matching the code.

---

## Source of truth — `@rt-tools/ui-kit` (the older kit)

Package root: `projects/ui-kit/`.

- **Components**: `projects/ui-kit/src/lib/ui-kit/<name>/` — **19 visual modules**:
  `action-bar`, `aside`, `buttons` (multi-button, icon-round, …), `checkbox`,
  `dynamic-selectors`, `file-uploader`, `header`, `icon` (`rtui-icon`), `image-uploader`,
  `info-badge`, `modal`, `popover`, `scrollable`, `side-menu`, `snack-bar`, `spinner`, `table`,
  `toggle`, `toolbar`.
  `icon` is the one the Figma file’s “18/18” Cover predates — it is not built there.
  Non-visual siblings in the same folder, **not** for the library: `animation`, `config`,
  `theme` (`RtuiThemeService`/directive), `tooltip` (a `hide-tooltip` directive only),
  `providers.ts`.
- **Stories**: `projects/ui-kit/src/lib/ui-kit/<name>/stories/` — 13 modules have them
  (`aside`, `buttons`, `checkbox`, `file-uploader`, `header`, `image-uploader`, `info-badge`,
  `modal`, `side-menu`, `snack-bar`, `table`, `toggle`). Treat stories as the canonical variant
  list where they exist; elsewhere read the SCSS.
- **Tokens** — this changed completely since the first draft of this brief. The kit now owns a
  three-tier CSS custom-property system:

    ```
    Tier 1  primitives   --rt-color-*                      projects/ui-kit/src/styles/base/_tokens.scss
    Tier 2  semantic     --rt-{bg,text,icon,border}-*      same file, adaptive via light-dark()
    Tier 3  component    --rt-<component>-<el>-<token>     per-component SCSS maps
    ```

    Light is the default; `.rt-dark` on `<html>`/`<body>` switches globally, `data-rt-theme`
    creates a nested local context, `.rt-theme-auto` follows the OS. `base/_color-scheme.scss`
    emits brand palettes under `[data-rt-scheme="<name>"]`. Written up in
    `projects/ui-kit/src/styles/TOKENS.md` and in 7 MDX pages under `projects/ui-kit/docs/`.

- **Prebuilt tokens**: `pnpm run build:tokens` → `dist/ui-kit/styles/tokens.css`. Same trick as
  v2 — read the compiled file rather than parsing SCSS.
- **`_variables.scss` no longer holds a `$clr-*` palette.** It holds breakpoints
  (`$device-xs: 600px` … `$device-xl: 1920px`), font seeds, and static button seeds fed to
  `color.scale()`: `$btn-danger: #eb5055`, `$btn-danger-soft: #fdedee`, `$btn-success: #00b894`
  (marked in-source as an outlier, off the `--rt-color-green` scale), `$btn-success-soft:
#e5f8f4`, `$text-highlight-color: #0077bf`. Do not look for `$clr-red-100` / `$clr-green-80`.
- **Component styles**: `projects/ui-kit/src/styles/components/` — `_action-bar`, `_button`,
  `_checkbox`, `_dynamic-selectors`, `_form`, `_material-bridge`, `_rtui_button`, `_snackbar`,
  `_table`. Mixins in `base/_mixin.scss`, resets in `base/_base.scss`.
- **Angular Material is now a fallback chain, not a dependency.** 47 distinct `--mat-*` custom
  properties are read, 10 of them `--mat-sys-*` (`primary`, `primary-container`, `error`,
  `error-container`, `on-error`, `on-error-container`, `on-surface-variant`,
  `surface-container-high`, `surface-container-highest`, `surface-dim`). Semantic tokens are
  written as `var(--mat-sys-X, light-dark(L, D))`, so the kit renders correctly with no Material
  theme present; a build-time opt-out exists
  (`@use '…/styles/main' with ($tokens-use-material: false)`).
- **Genuinely app-defined**: only `--font-default`, plus the Material theme colors when an app
  supplies one. `--bg` and `--border` are _not_ app-defined — they are the button’s own internal
  aliases, set from `--rt-rtui-btn-*` inside `_rtui_button.scss`.
- Verified on 2026-08-05: **`--clr-*` custom properties exist nowhere under `projects/`** (0
  matches). Do not look for them, and do not build a `theme` collection around them.

---

## Phase 2 — Variables (design tokens)

Build from the compiled `tokens.css` of whichever kit you are working on, not from SCSS:

```bash
pnpm run build:tokens        # → dist/ui-kit/styles/tokens.css
pnpm run build:tokens-v2     # → dist/ui-kit-v2/styles/tokens.css
```

1. Collections:
    - **`core`** — literals owned by the kit: color ramps, spacing, radii, shadows, z-index,
      durations, breakpoints (as number variables), typography.
    - **`theme`** — the semantic tier, **two modes `Light` / `Dark`**, every value an alias into
      `core` wherever the CSS is an alias. Both kits carry real values for both modes now; the
      `⚠ app-defined` suffix is only for `--font-default` and for Material-sampled colors in the
      older kit’s Figma pages (already listed on Cover node `55:6`).
2. Keep the existing v1 naming (`rt/color/*` in `core`; `rt/{bg,text,icon,border}/*` and
   `rt/<component>/*` in `theme`) — an earlier pass bound ~235 paints to it and rebinding is
   expensive. v2 tokens go under their own `rt/` paths per the Naming section.
3. Bind everything you build in Phase 3 to these variables — no hard-coded fills where a token
   exists.
4. On the 🎨 Foundations page render swatch grids per ramp and a breakpoint/radius table.

## Phase 3 — Components (the main loop)

Work **one component per iteration**, simple → complex, committing progress in Figma as you go.

For each component:

1. **Read the source**: `*.component.ts` (inputs → these become Figma variant properties),
   `*.component.html`, `*.component.scss`, and everything in `stories/`. Build the variant
   matrix: e.g. the older kit’s toggle = size (lg/md/sm per 50×30 / 48×26 / 36×20) × state
   (on/off) × disabled (yes/no).
2. **Capture the live render.** There is **no `generate_figma_design` tool** on this MCP server —
   the capture path is local, then upload:
    - screenshot `http://localhost:<port>/iframe.html?id=<story-id>&viewMode=story` with headless
      Chrome (the working recipe from the previous session: old `--headless`, a fresh profile per
      run; `--headless=new` and `--virtual-time-budget` hang, and Chrome writes the PNG at
      `--timeout` and then hangs on exit — wrap the call in
      `perl -e 'alarm 30; exec @ARGV'`, and treat a `FAIL` in the log as “check for the file”,
      not “no file”);
    - push the PNGs in with `upload_assets` and place them on 📸 References.
    - Stories that only open on click (older kit: modal, snack-bar, aside, action-bar, popover)
      cannot be captured headlessly — build those from the SCSS and say so in the note.
3. **Build the real component** with `use_figma` (load `/figma-use` first):
    - Auto-layout frames, exact paddings/radii/typography from the SCSS.
    - Figma **component set with variant properties** mirroring the Angular inputs
      (`size`, `disabled`, `checked`, `appearance`, …).
    - All colors/radii bound to Phase-2 variables.
4. **Verify**: `get_screenshot` your built component and visually compare with the Storybook
   capture. Fix mismatches before moving on. Note unresolvable differences (Figma renders Inter,
   Storybook Roboto/Helvetica Neue — metrics differ) in a sticky note next to the component.
5. **Log progress** in a running checklist — this is a long session; the user may stop and resume.

### Component-specific notes (older kit)

- **buttons**: include every button style from `styles/components/_button.scss` and
  `_rtui_button.scss`, not just the standalone button components.
- **table**: large scope — 83 distinct `--rt-table-*` custom properties. Header row, data row,
  hover state, filter row, pagination bar, actions container. Build it as composable
  sub-components (row, cell, header-cell) + one assembled example. The real pagination is
  `[←][1][2][3][…][n][→] Items per page: <select>`, not a Material paginator.
- **modal / popover / snack-bar**: build overlay + content slot as separate components; include
  the color variants snack-bar supports (`danger`, `warning`, `success`).
- **aside / side-menu / header**: app-shell components; one assembled example each is enough,
  with slot placeholders for content (`rtui/_slot` already exists as the shared placeholder).
- **dynamic-selectors**: enumerate states from stories (empty, searching, selected, multi).

## Phase 4 — Wrap-up

1. **Publishing as a library**: the file currently sits in **drafts**, and a drafts file cannot be
   published as a team library. If the user wants a real library, it has to be moved into a team
   project first — tell them, do not move it yourself.
2. On 📋 Cover: update the build summary, the variant counts, the source commit, and the
   `⚠ app-defined` list. (Note: an earlier session had a Cover edit denied by the permission
   classifier — if that happens again, report it instead of silently skipping.)
3. Report back to the user with the file URL and the leftover-work list.

## Naming

Keep the two libraries apart in one file, or the later programmatic pass cannot tell them apart:

- older kit → `rtui/<module>/<component>` (e.g. `rtui/buttons/icon-round`)
- second kit → `rt/<component>` (e.g. `rt/button`, `rt/date-picker`)
- variable collections → `core` / `theme` shared; v2 tokens keep their own `rt/` path prefix and
  must not collide with the v1 `rt/<component>/*` component tier already in `theme`

## Hard rules

- Do NOT modify any repo source code — this task is read-only on the codebase. (Running
  `pnpm run build:tokens*` is fine; it only writes into `dist/`.)
- One Figma file for everything; do not create extra files, and do not create a second
  “RT-Tools UI Kit”.
- Captures are references, not deliverables — everything on the 🧩 pages must be rebuilt
  native-Figma with auto-layout and variables.
- If `use_figma` output drifts from the Storybook capture, the capture wins (code is the source
  of truth).
- Mind Figma MCP rate limits (Pro plan): batch `use_figma` operations sensibly, don't fire
  dozens of parallel calls.

## Context for later (do not act on it now)

This file is one step of a larger pipeline. A later session, run in the scope of a consuming
application, will (a) overlay that application's real Light/Dark values onto the `theme`
variable collection, (b) add its own components on top of the library, and (c) compose full
page designs from it. Keep naming and token structure clean — it will be consumed
programmatically.
