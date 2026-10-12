# Grill

## The owner request

> Goal: let a consumer of `rt-ai-chat` draw the HEADER buttons' icons (back `arrow-left`, title `sparkle`, `fullscreen` / `window-minimize`, `history`, `close`) with the kit's Material icon set, WITHOUT switching the whole material theme preset (the `[data-preset='material']` / `.rt-preset-material` scope also swaps ~200 design tokens — that is not wanted).
>
> 1. `rt-icon`: an icons-only marker. `RT_ICON_MATERIAL_PRESET_SELECTOR` (or a sibling selector used by the same `closest()` check in `RtIconComponent`) also matches an attribute that switches only the icon drawing set, e.g. `[data-rt-icon-preset='material']`, carrying no tokens. Export the attribute name as a constant.
> 2. `rt-ai-chat`: a new input, e.g. `headerIconPreset: IRtIcon.Preset` (default `'base'`, current look unchanged), bound as that attribute on the `<header rtElem="header">` element.
> 3. Material drawings missing for header names: `history` and `window-minimize` have no file in `assets/icons-material/`. Add them with `tools/fetch-material-icons.mjs` + the correspondence list `rt-icon-material-map.ts` (Material names: `history`, and for window-minimize the Material collapse/exit-fullscreen glyph — pick the one that pairs with the existing `fullscreen` drawing). `tools/check-icon-map.mjs` must pass. Check `arrow-left`, `sparkle`, `fullscreen`, `close` already have pairs.
> 4. Unit tests for the marker (icon inside the attribute renders the material drawing) and for the input (attribute present on header when `'material'`, absent by default). Storybook/scenario docs as the repo requires.
>
> Base the branch on `RT-2720-ai-chat-copy` so one dist carries both changes. Run the push gate, commit, push, build the ui-kit-v2 dist. No PR, no merge, no publish.

## What the tree already has

- `RT_ICON_MATERIAL_PRESET_SELECTOR` in `rt-icon.const.ts` is read by `closest()` in two places:
  `RtIconComponent` and `RtButtonDirective#drawingOf`. The `rt-icon-button` draws through `rt-icon`.
- The token scope of the material preset is built by `tools/build-tokens-v2.mjs` from
  `[data-preset='material']` and `.rt-preset-material` only; a third selector in the icon constant
  does not reach the styles.
- Pairs exist for `arrow-left` (`arrow_back`), `sparkle` (`auto_awesome`), `fullscreen`, `close`
  and `ico-plus` (`add`, the «New conversation» button of the header).
- `history` and `window-minimize` lie in `assets/icons` and have no material drawing.

## What the rules already say

- The default look does not move: the input defaults to `'base'`, the attribute is absent then.
- Reuse first: the same `closest()` check, the same selector constant, no second mechanism.

## Questions and answers

The work came as a ready order; every question is closed by the request or by assumption.

- **Does the task change the behaviour?** Yes: a new icon sign and a new input of `rt-ai-chat`.
- **Does it need an edit of a law or a rule?** No — question closed by assumption.
- **One task or several?** One.
- **What is not part of the task?** The PR, the merge and the publish of the kit.
- **What shows the task is closed?** The specs pass, `check-icon-map` is green, the kit builds, the branch is pushed.
- **Is there a sample?** The `data-preset='material'` check of `RtIconComponent`.

## Decisions

- **The sign joins `RT_ICON_MATERIAL_PRESET_SELECTOR`, and its name is `RT_ICON_PRESET_ATTRIBUTE`.**
  — both readers of the selector take it at once: the icon and the button. Rejected: a sibling
  selector — a second constant the button would miss.
- **`window-minimize` pairs with `fullscreen_exit`.** — it is the inward-corner twin of `fullscreen`.
  Rejected: `close_fullscreen` — it pairs with `open_in_full`, not with `fullscreen`.
- **The attribute is bound only for `'material'`; for `'base'` it is absent.** — the default
  markup does not change.

## What is left unclear

- Nothing.
