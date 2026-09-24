# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 2 of 2 — Frames and handing over
- **Done:** the icons of both kits measured; under Material Symbols the first kit's toolbar matches the second kit's crop
- **Next step:** look at the diverged first kit frames and re-take them in the image
- **Uncommitted:** no
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 Rebuild the showcase subset of Material Symbols with every icon name the first kit's templates and stories use
- [x] 1.2 Set the showcase icon registry to `material-symbols-outlined`
- [x] 1.3 Compare the list toolbar and rows of both kits on a crop
- [>] 2.1 Look at the diverged first kit frames and re-take them in the image
- [ ] 2.2 Write the reference drawing into the spec
- [ ] 2.3 Open the PR into the epic branch

## Decisions along the way

- **The reference is the first kit as its README sets an application up.** The question to the owner was refused by the conversation guard three times; the tree answers it: the spec rule «both at weight 700» and the first kit's icon directive. Measured: with its classes switched to Material Symbols, the first kit's toolbar matches the second kit's crop. Affected stage of the plan: all.
- **The showcase subset lacks five names of the list: `search`, `email`, `wc`, `priority_high`, `circle`.** They drew as words under Material Symbols; the subset is rebuilt with them. Affected stage of the plan: 1.

- **The subset keeps every old name.** Its ligatures were compared before the replacement: 80 old names, 107 new, none lost. A sweep of 99 stories drew 1540 icons with Material Symbols and none with the old font. Affected stage of the plan: 1.

## Sessions

### 2026-09-24

- Measured `components-dynamiclist--many-items` of the first kit against `FirstKitManyItems` of the second: the first kit's showcase draws with `Material Icons`, the second kit with Material Symbols at weight 700.
