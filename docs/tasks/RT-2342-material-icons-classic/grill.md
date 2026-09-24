# Grill

## The owner request

> иконкидинамик листа во втором ките толще чем иконки динамик листа в первом ките, сверь иконки

## What the tree already has

- The first kit's showcase draws the list icons with the classic `Material Icons` font: a
  `mat-icon` without a font set class takes `material-icons`, and that font ignores the weight
  axis. Measured on `components-dynamiclist--many-items`: `font-family: "Material Icons"`,
  `font-variation-settings: "FILL" 0, "wght" 700` set but not applied. Only the side-menu favorites
  story switches the registry to `material-symbols-outlined`.
- The first kit's README tells an application to load `Material Symbols Outlined` and to set the
  registry to it; `RtIconOutlinedDirective` in `projects/core` sets `'wght' 700` and `'FILL' 0|1`.
  So in an application set up by the README the first kit draws Material Symbols at weight 700.
- The second kit's material set is fetched from Material Symbols at weight 700, outlined and
  filled, by `tools/fetch-material-icons.mjs` — it matches the application, not the first kit's
  showcase.
- The spec `table-material-theme` states the same: «both at weight 700».

## What the rules already say

- The owner's word about the design is a task setting: what the owner compares is the first kit's
  showcase, and it diverges from the first kit's own setup instructions — so the owner is asked
  which one the second kit follows.
- A search over specs, plans, the archive and the rules finds no decision about the reference
  drawing. The material preset agreement says only that no icon font goes into the kit — the
  drawings are files either way, so it does not decide the question.

## Questions and answers

**Which drawing is the reference: the first kit's showcase (classic Material Icons, regular
weight, filled) or an application set up by the first kit's README (Material Symbols, weight
700)?**
<waiting for the owner>

## Decisions

- <after the answer>
