# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 2 of 2 — texts and showcase
- **Done:** the branch from the epic branch, the folder, the spec, the scroll area, the action bar, its menu, the scenarios SC-UKV-575…578
- **Next step:** the overview tables and the stories for the new properties and the open menu
- **Uncommitted:** no
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 The scroll area: padding and background properties
- [x] 1.2 The action bar: colour, padding, gap, font and weight properties
- [x] 1.3 The action bar menu: properties read with a fallback in the overlay
- [x] 2.1 The spec of the subdomain, its bindings and scenarios
- [>] 2.2 The overview tables and the stories for the new properties and the open menu
- [ ] 2.3 Snapshots for the new stories

## Decisions along the way

- The bar's own hover tint and close icon colour now follow `--rt-action-bar-color`, so a recoloured bar keeps a readable close icon and hover; the default is the same inverse text.
- The menu properties are consumer handles read with a fallback; their kit defaults for rounding and shadow live in private `-default` properties on the menu, because the token check refuses a direct step as a fallback on those families.

## Sessions

### 2026-10-02

- The branch stands on the epic branch RT-2472-kit2-migration-gaps, which carries main.
