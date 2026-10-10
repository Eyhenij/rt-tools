# Grill

## The owner request

> все переносимые компоненты из апки должны иметь базовую вьюху кита + материальную но без
> использования пакетов материал, стили должны быть заданы через токены чтобы поддавались
> модификации из апки + необходимые входы

> важно не допустить регрессий и изменения дефолтной вьюхи второго кита

> мигрировать на новую апку будет без проблем без потери вьюхи и функционала, хватает окинов и входов?

> доделывай

The first two quotes are the owner's words for the whole epic RT-2542; the last two answer the
comparison of the ported trees with the application. The card #2764 names the gap: none of the five
kit trees has the application's material look.

## What the tree already has

- Five trees in `projects/ui-kit-v2/src/lib/components/`: `rt-tree`, `rt-hybrid-tree` (the same
  template and styles as `rt-tree`), `rt-tree-selector`, `rt-hybrid-tree-selector` (the same
  template and styles as the selector) and `rt-draggable-tree`.
- Their specs: `docs/specs/ui-kit-v2/{tree,tree-selector,draggable-tree,hybrid-tree-selector}/`.
- Every matrix story of the trees already stands in `app-story-presets`: each frame holds a kit half
  and a material half. Today both halves look the same, because no tree reads the preset.
- Samples of a component material block in this epic: the breadcrumbs, the quick menu, the palette
  and the carousel — a `:is(.rt-preset-material, [data-preset='material']) &` block that only
  reassigns the component's own properties.
- The epic plan `docs/plans/kit2-app-parts.md`, section «Сравнение с приложением 10 октября», lists
  what the trees lack: rows 8px 12px with a 6px radius and a 5px gap, a level indent of 46px with a
  line, an arrow in the primary colour, the match highlight #ffeb3b, an empty state with an icon, a
  count pill; in the selector a place under the search, row content at the end, a flag for the
  match highlight; in the draggable tree a radius of 8px, a shadow under the pointer, a handle on
  hover and 2px lines.

## The application's trees measured live

Measured by the main session with `getComputedStyle` on the application's hybrid tree selector, at a
pixel ratio of 1:

- A group row is a button 32px high, padding 8px 12px, radius 6px, transparent; 10px between the
  arrow and the name; the arrow is 16px in the theme's primary colour; the name is 14px/400 in the
  on-surface colour.
- The children list has padding 5px 0 0 46px: the indent is 46px, and 5px stand between rows.
- A leaf row is the same 32px button; a 16px checkbox box with a 1px border and a 4px radius, 10px
  to the name.
- The search field and the two pill buttons above the list are kit controls already.
- The list area of the static selector has 10px above it.

## What the rules already say

- No Angular Material packages in the second kit; `var(--mat-sys-…, <kit step>)` is allowed in a
  component's own property declarations.
- A raw value is not written where a token exists; a value off the scale is composed from steps.
- A new colour step goes into the material scale, and a scale step is never rewritten by the dark
  theme.
- The checkbox and the radio keep the kit's own look under the material preset (owner, 29 September
  2026): the tree sizes its checkbox through a property, the checkbox block does not change.

## Questions and answers

None asked: the owner's «доделывай» answers the list of gaps from the comparison.

## Decisions

- **The default look stays pixel for pixel.** Every new property takes today's value as its
  default; the proof is two runs: the properties without the material block must match every
  existing frame, and only then the material block goes in. Rejected: one change and a re-take of
  all tree frames — a moved kit half would hide in it.
- **The empty state icon is an input, not a preset effect.** `emptyIcon` defaults to none, so the
  kit look draws no icon; the application names its icon. Rejected: an icon drawn only under the
  preset — CSS cannot add an element, and a hidden icon in every kit tree is dead markup.
- **The node templates reach the inner tree by inputs.** `rt-tree` takes `nodeEndTemplate` and
  `nodeMetaTemplate` next to its directives; the selector reads the directives from its content and
  passes their templates down. Rejected: projecting them — a template given to the selector is not
  content of the tree inside it.
- **The place under the search is a template directive, like the selector's controls.** Rejected:
  `ng-content` — the selector already takes its slots as templates.
- **The match highlight in the selector is switched by `matchHighlight`, on by default.** Off,
  the tree inside gets no term; `highlight` alone would read as the highlighted row. Rejected: an input on `rt-tree` — the standalone tree's term is the
  application's own, and it can pass none.
- **The checkbox box takes its size from an optional property with today's 18px as the fallback.**
  The tree sets it to 16px under the preset; the checkbox declares nothing and looks as before.

## What is left unclear

- Where the application draws the level line: the measurement names the indent, not the line. The
  line stands under the parent's arrow; the owner judges it on the showcase.
