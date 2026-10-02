# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 3 of 3 — texts and showcase
- **Done:** the branch from the epic branch, the folder, the spec, the tag, the toggle switch, the toggle button group, the toolbar, the loading button, the tooltip sides, the scenarios SC-UKV-565…574, the overviews and the stories
- **Next step:** snapshots for the new stories
- **Uncommitted:** no
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 The tag: size properties on the host, colour, padding and letter-spacing handles
- [x] 1.2 The toggle switch: size properties on the host, the label, the disabled opacity
- [x] 1.3 The toggle button group: size properties on the host
- [x] 1.4 The toolbar: layout properties
- [x] 2.1 The button hides its label while loading and keeps its width
- [x] 2.2 The tooltip on the left and on the right
- [x] 3.1 The spec of the subdomain, its bindings and scenarios
- [x] 3.2 The overview tables and the stories for the new inputs
- [>] 3.3 Snapshots for the new stories

## Decisions along the way

- The tag keeps its severity and size values in private properties on its root; the six handles read them as the fallback.
- The toggle switch label properties are `--rt-toggle-label-gap`, `-size`, `-color-off`, `-color-on`, `-color-hover`: the requested `--rt-toggle-label-color` and `-font-size` are taken by the first kit, and the tokens graph check refuses a shared name.
- The size, on and disabled modifiers are also drawn on the toggle switch host; the disabled opacity sits there and dims the label too.
- The toolbar height is a minimum height: a bar stacked into a column on a narrow screen is never clipped. The gap property is the gap between the zones.
- A loading button with `loadingLabel="hide"` keeps its ordinary content, icon included, at zero opacity rather than `visibility: hidden`: the width stays the idle width and the label still names the button for a screen reader. The loader stands over it absolutely.
- A side tooltip that fits on neither side falls back to top, then bottom; the sides are logical `start`/`end`, so they mirror in right-to-left writing.

## Sessions

### 2026-10-02

- The branch stands on the epic branch RT-2472-kit2-migration-gaps, which carries main.
