# Grill

## The owner request

> это запрос из апки по миграции с первого кита на второй, там используется материальный вид

> проанализируй, важно правки не должны сломать второй кит

> делай не так как просят а так как лучше

The consumer's items 5–8: a `glyph` input with a Material name on the icon and the components that
draw icons, a ligature of the Material Symbols font as the last resort, a strategy option of
`provideRtIcons`, a spinning icon and a size in pixels.

## What the tree already has

- `iconMaterialMap` — 49 pairs from a Material name to a kit name; `rt-menu-item` and `rt-side-menu`
  each resolve a Material name through it by a copy of their own.
- The material drawings in `assets/icons-material` are drawn only for mapped names, and only under
  a node with the material preset flag.
- No font path, no `document.fonts`, no ligature anywhere in the kit.
- `rtButton` builds its svg by hand and never asks for the material drawing.

## Decisions

- **The strategy option is the third argument of `provideRtIcons`** — the second is the address of
  the material drawings, and changing its type breaks every existing call. Rejected: an object in
  place of the second argument, as the consumer asked.
- **`name` of `rt-icon` stops being required, and `glyph` stands next to it** — one of the two
  names the icon; `name` wins when both are given. Rejected: a second component for the font.
- **One resolver for a Material name in the icon folder** — the menu item and the side menu move
  onto it with their behaviour unchanged. Rejected: a third copy.
- **The ligature is hidden until the page's fonts are ready, and the kit ships no font** — the
  family is the property `--rt-icon-glyph-font` with Material Symbols Outlined as its fallback.
- **The size takes a number of pixels by the input, and the size type stays as it is** — the type
  is read in eighteen places, and widening it would break consumers that map over it.
- **`rtButton` asks for the material drawing under the material preset, like `rt-icon`** — the
  consumer draws in the material preset, and buttons were the only icons that ignored it.

## Decisions along the way

- The ligature waits for the page's font readiness as a whole, not for one family: the kit ships
  no font and does not know which family the application connects.
- `name` of the icon became optional, so its type widened to a name or nothing; one helper in the
  data-table spec followed the type.
- The size input stores pixels: a step is turned into them on write. Nothing in the kit read the
  step back, and one number spared a second branch in the component.
- rtButton got no input of its own for a glyph: its `icon` already takes any string, so it is
  resolved the way `glyph` of the icon is. A kit name draws as before; a name that drew an empty
  place now draws its pair or the ligature.
- The material drawing on rtButton changes the material half of thirteen existing story wrappers
  that hold a button with an icon. Step 3.3 retakes those frames too, after a look by eye: the
  change is the one the spec names.
- The split button got no input of its own: its menu items draw through rtButton, and an item
  `icon` takes a Material name since step 2.1. `icon` of the icon button stopped being required.
- The icon probe of the snapshot gate held back only the own set. Under the material preset the
  button now asks for the material set, so the probe holds both sets.
- The second showcase ships no Material Symbols font, and the first showcase's file is a subset by
  its own names. The Glyph story therefore shows the ligature as the word in the fallback font, the
  state of an application without the font, and says so under the frames.
- Snapshots: two written, three retaken (the button and the split button, material half only),
  745 of 745 matched on a second raising.
