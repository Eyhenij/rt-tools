# Progress

## Where we stand

- **State:** `этапы-кончились`
- **Stage:** 2 of 2 — texts and showcase
- **Done:** the branch from the epic branch, the folder, the spec, the scroll area, the action bar, its menu, the scenarios SC-UKV-575…578, the overviews and the stories, the snapshots
- **Next step:** archive the folder, push, open the request into the epic branch
- **Uncommitted:** no
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 The scroll area: padding and background properties
- [x] 1.2 The action bar: colour, padding, gap, font and weight properties
- [x] 1.3 The action bar menu: properties read with a fallback in the overlay
- [x] 2.1 The spec of the subdomain, its bindings and scenarios
- [x] 2.2 The overview tables and the stories for the new properties and the open menu
- [x] 2.3 Snapshots for the new stories

## Decisions along the way

- The bar's own hover tint and close icon colour now follow `--rt-action-bar-color`, so a recoloured bar keeps a readable close icon and hover; the default is the same inverse text.
- The menu properties are consumer handles read with a fallback; their kit defaults for rounding and shadow live in private `-default` properties on the menu, because the token check refuses a direct step as a fallback on those families.
- The host background of the scroll area stands under `:where()`: the side menu uses scroll areas as its own elements with a surface background, and an equal-strength host rule took it away — the first snapshot run showed every side menu frame diverged. With zero specificity any class rule wins.
- Snapshots: three written (scroll area Properties, action bar Properties and Menu); the 744 former frames matched after the fix.
- The radius contract stripped only flat `var()` references, and the menu's nested reference read as an off-scale literal. It now strips references from the inside out, and its negative half names the nested case.

## Sessions

### 2026-10-02

- The branch stands on the epic branch RT-2472-kit2-migration-gaps, which carries main.
