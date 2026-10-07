# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 3 of 3 — The spec and the checks
- **Done:** grill, plan, stage 1: the package builds, the rule, mapping and scheduler tests pass
- **Next step:** the spec, the scenarios, the bindings and the README
- **Uncommitted:** no
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 Create `projects/cms-server` after the auth server package and register it
- [x] 1.2 Carry over the page rules, the contract mapping and the scheduled publication with their tests
- [x] 2.1 Carry over the port and the admin and site services with the access maps
- [x] 2.2 Carry over the storage helpers over structural delegates
- [x] 2.3 Carry over the media library service, its ports and the copies backfill
- [>] 3.1 Write the spec, the scenarios and the bindings, and the README
- [ ] 3.2 Run the tree checks

## Decisions along the way

- **The branch of this task was created past this session's delivery guard.** The owner's word for
  the whole epic: «Да, на весь эпик». The guard looked for the epic branch in another repository.

- **The plan guard was bypassed for this epic too.** The owner's word: «Обходи и его на весь
  эпик». The guard looked for the plan in another repository.
- **The contract package is linked as `workspace:*` until its release.** It is not on the registry
  yet; the release task turns the link into a version, as the tree did for the first packages.
  Affected stage of the plan: 1.
- **The services are Connect service implementations with access maps per method.** The rights
  are split into reading and editing per area, as the working implementation asked them; the
  application names all eight. Affected stage of the plan: 2.

## Sessions

### 2026-10-07

- The branch taken from the epic branch after RT-2592 was merged.
