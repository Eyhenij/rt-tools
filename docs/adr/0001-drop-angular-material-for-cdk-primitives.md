# ADR 0001 — Replace Angular Material with in-house CDK primitives

- **Status:** Accepted (plan)
- **Date:** 2026-07-20
- **Scope:** `@rt-tools/ui-kit`, `@rt-tools/utils`

## Context

The kit currently depends on Angular Material across ~47 source files
(`@angular/material/{icon,button,tooltip,form-field,input,select,snack-bar,checkbox,radio,menu,…}`).
We want to drop the `@angular/material` dependency entirely and render every component from our own
primitives built on `@angular/cdk` (overlay, a11y, portal, etc.).

Two hard constraints frame the work:

1. **No behavioural or visual regression may reach production.** Any deviation from today's rendered
   output or behaviour must be caught by automation before merge.
2. The public contract of the already-shipped components must keep working for consumers.

Implementation is guided by an internal, material-free, CDK-based reference component library. That
library is a **code reference only** — its visual design and its token system are _not_ adopted.

## Decisions

| #   | Decision                                                                                                                                                                                                                                   |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | **Public API stays 1:1.** `rtui-*` selectors, inputs, and outputs are unchanged.                                                                                                                                                           |
| 2   | **Baseline = today's Material-based rt-tools.** It is the golden master for both look and behaviour.                                                                                                                                       |
| 3   | **Pixel-identical result** for the existing 50 components. The reference library informs _how_ to build material-free primitives, not how they look.                                                                                       |
| 4   | **Styling:** keep the existing three-tier `--rt-*` token system and its current values. Port only material-free CSS techniques/layout from the reference, remapped onto `--rt-*`. Do not adopt the reference's tokens.                     |
| 5   | **Visual regression** via Storybook + Playwright screenshots.                                                                                                                                                                              |
| 6   | **Screenshots run only in a pinned Docker image in CI**, threshold ≈ 0, animations off, clock frozen. Locally captured baselines are never committed.                                                                                      |
| 7   | **Behavioural tests are black-box** over the public surface (roles/ARIA, emitted events, visible text/state, `rtui-*` classes) — never over Material internals, so they survive the swap.                                                  |
| 8   | **Test runner migrates from Jest to Vitest** (aligns with the reference; enables reusing its test ideas).                                                                                                                                  |
| 9   | **Coverage criterion per component:** a state matrix (variants/sizes/`disabled`/`loading`/`focus`/light+dark) as stories with screenshots, plus black-box behavioural + a11y tests, plus a coverage gate as a backstop.                    |
| 10  | **A11y is part of the behavioural contract:** axe checks in stories + keyboard/focus/ARIA tests, baselined on the Material version, must stay green on CDK. Built on CDK a11y primitives (`FocusTrap`, `ListKeyManager`, `LiveAnnouncer`). |
| 11  | **Per-component discipline: net before cut.** No internals are touched until the component has full story-matrix + committed visual baselines + behavioural/a11y tests, all green on the current implementation.                           |
| 12  | **Migration order:** a pilot leaf first (proves the pipeline end-to-end), then topological leaves→composites.                                                                                                                              |
| 13  | **Accumulate on `main` per component** as non-breaking PRs (identical API + pixels ⇒ not breaking, not published).                                                                                                                         |
| 14  | **One major release at the end** carries all breaking changes and the single npm publish.                                                                                                                                                  |
| 15  | **Enforcement:** a hard CI gate (any failing layer blocks merge) plus an ESLint `no-restricted-imports` ban on `@angular/material`, with a per-file baseline exception list drained to zero.                                               |
| 16  | **Sequencing:** land the in-flight Angular upgrade on `main` first; start on the clean upgraded base.                                                                                                                                      |
| 17  | **New components** absent from the kit are a separate, on-demand stream with the same test/screenshot bar (baseline = the reference, since there is no prior rt-tools look). They do not block the major.                                  |

## Breaking changes (batched into the final major)

The assumption of "a single sanctioned breaking change" was **false**. There are at least three,
spanning two packages:

- **`@rt-tools/ui-kit`** — remove the `design: 'material'` mode of `rtui-button` (renders a native
  `matButton` today) and its `RT_UI_CONFIG` entries.
- **`@rt-tools/utils`** — `RtIconOutlinedDirective` (selector `mat-icon[rtIconOutlined]`) is
  retargeted to `rtui-icon`; `RtHideTooltipDirective` (injects `MatTooltip`) is retargeted to the new
  `rtui-tooltip`.
- **Both packages** — `@angular/material` removed from `peerDependencies`.

The primary consumer app uses none of these features, so real-world consumer breakage is expected to
be nil; the changes are still major by contract and ship with a migration guide.

## Safety-net architecture

Two independent layers, both baselined on the current Material implementation, both surviving the
internal swap because they assert on the public surface only:

- **Behavioural** (Vitest, black-box + a11y): logic, states, keyboard, focus, ARIA, emitted events.
- **Visual** (Storybook + Playwright, Docker-only, threshold ≈ 0): any pixel deviation, light + dark.
- **Gate**: CI blocks merge on any failing layer; ESLint forbids reintroducing `@angular/material`.

## Per-component rhythm (net before cut)

1. Author the story matrix on the **current** implementation (all states, both themes).
2. Commit visual baselines (generated in the Docker CI image).
3. Add black-box behavioural + a11y tests — green on the current implementation.
4. Swap internals Material → CDK; port structure to `--rt-*` tokens.
5. Tests and screenshots must stay green; remove the component's ESLint exception.
6. Open a non-breaking PR into `main` (not published).

## Phases

- **Phase 0 — prerequisites:** land the Angular upgrade on `main`; migrate the runner Jest→Vitest
  (incl. the 3 existing specs); stand up visual infra (Playwright + Docker + baseline pipeline);
  add the Material ESLint ban with a full baseline-exception list; update the repo's testing
  convention docs/skill (currently "Jest, not Vitest").
- **Phase 1 — pilot:** one simple leaf (e.g. `spinner`) to shake out the net→cut pipeline and
  screenshot determinism.
- **Phase 2 — leaf primitives (topological):** `icon` (drop `MatIcon`), a new `rtui-tooltip`
  (replaces `MatTooltip`), `button` (drop `MatButton`), `checkbox`, `toggle`, `spinner`.
- **Phase 3 — overlays:** `modal`, `aside`, `popover`, `snack-bar` (CDK Overlay + FocusTrap).
- **Phase 4 — composites:** `table`, `dynamic-selectors`, `header`, `toolbar`, `side-menu`,
  `image/file-uploader` — inheriting already-clean primitives.
- **Phase 5 — `@rt-tools/utils`:** retarget the two directives; remove Material from utils.
- **Phase 6 — final major:** remove `design:'material'` + config; drain the last ESLint exception;
  drop `@angular/material` from ui-kit and utils peer deps; migration guide; one publish of all packages.

## Risks

- **Pixel-identical overlays / ripple / float-label** are genuinely hard at threshold ≈ 0. Where a
  faithful reproduction is impossible, that is an explicit per-component escalation point — never a
  silently accepted diff.
- **Big-bang release** changes every component's implementation in production at once. Mitigated by
  per-component net + short PRs into `main` + consumer validation gated on the major merge.
- **Long-lived unmerged Angular upgrade** is a Phase 0 dependency.
- **Runner migration to Vitest** contradicts the current testing convention → the convention/skill
  is updated as part of Phase 0.
- **Reference library targets an older CDK** → CDK API adaptation during porting.

## Open implementation questions (non-blocking)

- Exact pilot component (recommended: `spinner`).
- A11y tooling: Playwright + axe-core vs vitest-axe.
- Portal/overlay snapshotting: full-page Playwright capture.
