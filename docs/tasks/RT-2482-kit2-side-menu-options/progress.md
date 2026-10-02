# Progress

## Where we stand

- **State:** `этапы-кончились`
- **Stage:** 2 of 2 — showcase
- **Done:** the switches, the content slot, the row button fallback, the spec with its bindings
- **Next step:** the folder teardown and the request
- **Uncommitted:** no
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 The pin button and the submenu tooltips switches
- [x] 1.2 The icon button content slot
- [x] 1.3 The row button fallback to the menu template
- [x] 2.1 The spec of the subdomain, its bindings and scenarios
- [x] 2.2 The overview tables and the stories for the new switches and the fallback
- [x] 2.3 Snapshots for the new stories

## Decisions along the way

- A row button with a name outside the kit and no own template no longer hands that name to the
  icon: the button was empty before as well, while the icon waited for a symbol the set does not
  hold, and the showcase waited with it until its timeout.

## Sessions

### 2026-10-02

- The branch stands on the epic branch RT-2472-kit2-migration-gaps, which carries main.
