# Progress

## Where we stand

Rewritten by every session, not appended to.

- **State:** `этап-идёт`
- **Stage:** 4 of 5 — The settings panel content looks as in the first kit
- **Done:** stages 1–3 committed. Stage 4 begun in `3937433fe` and not checked: the settings
  panel markup and the pure move and toggle functions are in, the plaque styles are not written, the
  panel spec is not rewritten. The toolbar fix is half done — see the decision about `min-width`.
- **Next step:** run `node tools/visual-gate.mjs ui-kit-v2` on the tip and read which frames moved
  (expected: `Toolbar → Fill` back to its reference; `DataList → Narrow`, `Themes`, `Settings`
  changed for the better); then the stage 4 plaque styles and the panel spec; then the two field
  looks.
- **Uncommitted:** nothing.
- **Waiting for the owner:** no.
- **Not pushed:** the branch is local only; the push gate would refuse it on the snapshots and the panel spec.
- **PR:** not open yet.

## Steps

- `[x]` done · `[>]` going on right now · `[ ]` not begun

- [x] 1.1 The overlap in the theme stories measured on a narrow canvas
- [x] 1.2 The icons of both kits listed glyph against glyph
- [x] 1.3 The settings panel of both kits compared element by element
- [x] 1.4 The agreement written in `proposed/data-list-kit-one-look`
- [x] 2.1 The pane of the theme wrapper keeps its content inside
- [x] 2.2 The fix measured on a narrow canvas
- [x] 3.1 Missing glyphs drawn into the kit set
- [x] 3.2 The family's icon mapping switched to them
- [>] 4.1 The panel content rebuilt by the first kit's layout inside `rt-aside`
- [ ] 4.2 The tests of the panel brought to the new markup
- [ ] 5.1 The family's references re-taken after being looked at
- [ ] 5.2 The pairs written into `tools/kit-shot-pairs.json`

## Decisions along the way

- **The branch stands on RT-1882, not on the epic branch** — the theme wrapper of the showcase was
  rewritten there, and #2323 is not merged. Affected stage of the plan: none.
- **The icons are not redrawn into the kit's own set; only the drag handle changes** — the grill
  assumed the first kit's glyphs go into the own set, but the second kit has a material set, and
  the look of the first kit is that set. The sheet of the family icons, shot by the image browser:
  in the material set all sixteen mapped icons match the first kit glyph for glyph. The own set
  draws its own look on purpose and stays. A first reading paired `drag_handle` with `bars` — that
  pair was mine, not the kit map's: in the first kit `drag_handle` is the «equals» sign of the filter
  cell, already drawn by RT-2316, and the drag handle of the settings panel is `open_with` (✥),
  which neither set of the second kit has. Affected stage of the plan: 3 — it shrinks to drawing ✥.
- **The shared `rt-table-settings-panel` is not edited** — the second kit's own table draws its
  settings with it, and that look is the second kit's. The column list in the first kit's look is
  the list's own. Affected stage of the plan: 4.

- **The right bar of `rt-toolbar` keeps its min-content width** — with `min-width: 0` it shrank
  below its own button: the frame `Organisms/Table/Toolbar → Fill` put «Сохранить» 20 px past the
  half's edge (diff 0.98%). Without it the list theme story overflows by 93 px instead of 197: the
  right bar stands 256 px in a 222 px parent. Affected stage of the plan: 2 — reopened.
- **The search field has two looks in the first kit, and the second kit has one** — owner's remark
  23 September 2026: «серч инпут в материал имеет два вид аутлайн и другой смотри какой в первом ките
  в динамик листе». Read in the code: `rtui-dynamic-list` takes the required input `appearance`
  (`fill` or `outline`, anything else becomes `outline`) for the search, and `filterAppearance`
  (default `outline`) for the filter fields; the search is `mat-form-field` with a search prefix
  icon and a clear button. `rt-data-list` has no such input, and `rt-input` draws one look. Not in
  the plan: goes into the agreement before any code. The owner answered: «нужны оба вида для
  материального инпута» — written into the agreement as a rule; it reverses the `table-full-port`
  rule «the family takes no field-look input». The work is outside the plan's stages and is done
  after stage 4, before the paired frames. Affected stage of the plan: none — added after 4.

## Sessions

### 2026-09-23

- The task created from the owner's remarks on the showcase; the grill closed from the
  conversation and the RT-2316 record.
- The overlap measured on the built showcase of `34eaa2ec0` by the image browser, the right edge of
  every node of a theme pane against the pane: `DataList → Themes` at 900 px — pane 352 px, content
  197 px past its edge, the document 1056 px wide; at 600 and 1280 px — 0. `DataTable → Themes` — 0
  at all three. What leaves the pane is the list toolbar (search, refresh, columns) and the table,
  and at 900 px the panes stand two in a row, so it lies over the neighbour. The references are
  shot wide and do not see it.
- The cause, traced node by node: the right bar of `rt-toolbar` was `flex: 0 0 auto`, and the list
  search held `--rt-size-60`; the bar stood 360 px in a 222 px parent. The `fill` input on the theme
  wrapper alone changed nothing — measured. Fixed by letting the bar and the search shrink.
- The first snapshot run fell in 171 suites with «browser has been closed»: my one-off shots
  raised the image browser under the gate's own container name and port and took its browser
  away. One-off shots now go with `E2E_SHOT_CONTAINER=rt-tools-shot-probe E2E_SHOT_PORT=43219`.
- The ✥ glyph: `material-icons-outlined` draws `open_with` as filled triangles, Material Symbols as
  arrows with a gap; the material set follows Symbols, so the outline was taken from the Symbols
  subset of the first kit (`uniE89F`) and matched on the comparison sheet.
- The overlap fixed by `d0029f4f9`, then half undone: the snapshot run of `53597f131` diverged on
  four frames — `Toolbar → Fill` for the worse (the button past the edge), `DataList → Narrow`,
  `Themes`, `Settings` for the better (the search no longer leaves the box).
- Stage 4 begun in `3937433fe`; the branch is local only.
- Stage 2 closed by `contain: inline-size` on the list search: the input's own width had held the
  right bar at 256 px. Measured by the image browser on the built showcase: 0 px past the pane for
  both theme stories at 600, 900 and 1280 px, with the shared bar keeping its min-content width.

## Handover of the session

### Work

RT-2324 «Таблица второго кита выглядит не как в первом ките: темы, значки, панель колонок». Working
tree — `/Users/sviatoslavkhutornoy/WebstormProjects/rt-tools`, branch
`RT-2324-data-list-kit-one-look`, local only, standing on `RT-1882-kit-settings-theme`. Its PR goes
to base `RT-1882-kit-settings-theme` while #2323 is open, and to `RT-1870-one-kit` after it merges.
PR #2323 (RT-1882, settings and theme) is open, ready, waiting for the reviewer's merge into the
epic branch.

### Where to look

The progress and the plan come by the hook. The grill lies next to them; the agreement is
`docs/specs/ui-kit-v2/proposed/data-list-kit-one-look/`.

### Epic 1870 — one kit

| #   | Task                                                           | State       |
| --- | -------------------------------------------------------------- | ----------- |
| 1   | RT-2316 — the first kit table in the second as its own family  | closed      |
| 2   | RT-2317 — the radio button                                     | closed      |
| 3   | RT-1882 — kit settings and the theme                           | PR #2323    |
| 4   | **RT-2324 — the table family looks as in the first kit**       | in progress |
| 5   | RT-1883 — the side menu; RT-1884 — by the application's demand | ahead       |
| 6   | RT-1881 — the image uploader                                   | postponed   |

### Done and the next step

Done: stages 1–3; stage 4 begun. Next: the snapshot run on the tip, then the stage 4 styles (rules for `columns` and `column-label`
are missing — the style check before sending names them) and the panel spec, then the snapshot run.

### What to keep in mind

- One-off image-browser shots go with `E2E_SHOT_CONTAINER=rt-tools-shot-probe E2E_SHOT_PORT=43219`:
  under the default name they take away the browser of a running snapshot gate. The measuring
  scripts lay in the session scratchpad and are gone. The recipe: build the showcase
  (`pnpm exec nx run @rt-tools/ui-kit-v2:build-storybook --configuration ci`), serve it by
  `node tools/serve-static.mjs dist/storybook/@rt-tools/ui-kit-v2 <port>` on the machine's address,
  run a script under `node tools/shot-browser.mjs node <script>` that connects to `RT_SHOT_BROWSER`
  and measures every node of `.app-story-themes__pane` against the pane's right edge at 600, 900
  and 1280 px.
- A command whose text holds the word for sending to the host is judged by the sending gate whole —
  even inside a heredoc; texts with that word are written by the file tools.
- The second kit showcase on 6007 was raised by this session in dev mode from the RT-1882 branch
  for the owner and may still be running.
- The search field look is decided by the owner — both `fill` and `outline`, by the inputs
  `appearance` and `filterAppearance` as in the first kit; it is a rule of the agreement now. Not
  asked again.
- The four diverged frames lie in `projects/ui-kit-v2/.storybook/__snapshots__/__diff_output__/`,
  outside history.
