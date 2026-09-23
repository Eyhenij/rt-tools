# Grill

## The owner request

> ты сам сравнивал таблицу с первым китом? сторис с темой нечитаемо все накладывается друг на друга?
> иконки совпадают с первым китом?
> асайд настроек видимости колонок используется со второго кита и это ок, но нужно отображать вьюху как на первом ките
>
> тут пример использования динамик листа певого кита <путь к списку ролей в приложении>

23 September 2026, after the second kit showcase was shown from the branch RT-1882. The path in
the last line named a consumer of the kit; the rule `doc-style` does not let it into the tree, so
it is replaced, and the rest is verbatim.

## What the tree already has

- The family `rt-data-table` / `rt-data-list` came with RT-2316 (PR #2319, merged into the epic
  branch on 22 September 2026). Its archive record: the look of the first kit is kept, «Материала
  быть не должно!», icons taken from the kit set by a list of matches.
- No frame of the family was ever put next to a frame of the first kit: `tools/kit-shot-pairs.json`
  carries no pair for it, and the archive record names none.
- The references `organisms-datalist-datalist--themes.png` and
  `organisms-datatable-datatable--themes.png` are readable. They were taken before RT-1882, which
  replaced the showcase crutch for local themes with the `rtTheme` mark; the owner looked at a
  showcase built from RT-1882.
- Icons, read in the code: `rt-data-list-toolbar.component.ts` maps `view_column` → `table`,
  `sync` → `sync`, `block` → `ban`, `search` → `search`; the cell maps `content_copy`/`done` →
  `copy`/`check`. By meaning, not by glyph: `table` is a grid, `view_column` three bars.
- The settings panel: the first kit draws `rt-table-config-aside` — heading with a subline, two
  toggles, a draggable `rtui-dynamic-selector` with an eye button per item. The second kit draws
  `rt-data-list-settings-aside` — `rt-aside` with `rt-table-settings-panel` inside.
- The sample of use: the roles list of the application — `rtui-dynamic-list` with filters,
  search, a toolbar button, a custom cell and row actions.

## What the rules already say

- `browser-verification`: work that carries a look over from a sample is accepted by a frame of
  one's own screen next to the sample's frame.
- `ui-component-tests-visual`: a baseline is re-taken one at a time, after being looked at.

## Questions and answers

**Did the executor compare the table with the first kit**
No — answered in the conversation.

**The column settings panel**
«асайд настроек видимости колонок используется со второго кита и это ок, но нужно отображать вьюху
как на первом ките».

## Decisions

- **One task for the three remarks** — all three are about one family and are accepted by one set
  of paired frames. Question closed by assumption.
- **The shell of the settings panel stays `rt-aside` of the second kit, the content takes the look
  of `rt-table-config-aside`** — the owner's words.
- **Icons: the glyph of the first kit where the kit's own differs visibly** — the look of the first
  kit was the owner's condition in RT-2316. A missing glyph is drawn into the kit set, as «равно»
  was. Question closed by assumption: the owner may keep the mapping.
- **The theme stories are fixed by what the live showcase shows after RT-1882** — the symptom is
  reproduced first, not guessed.
- **The closing sign: paired frames of the first and the second kit for the table, the list, the
  settings panel and the themes, shown to the owner.**
- **Not in the task:** new functions of the table, material, the side menu RT-1883.
- **No law or rule edit.** Question closed by assumption.

## What is left unclear

- Which theme story overlaps — both are checked; it does not block the work.
- The overlap in the theme stories is inferred, not measured: `story-themes.component.scss` lets a
  pane shrink to `18rem`, and the list keeps its own width of about 470 px with no scroll of its
  own. The push gate matched the frames of `34eaa2ec0` against the references, so the frame width
  does not show it; a narrower canvas does. Confirmed by a measurement at the first stage.
