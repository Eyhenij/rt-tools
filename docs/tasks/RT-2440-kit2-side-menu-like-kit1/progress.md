# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 1 of 5 — Stories on the first kit's data, live
- **Done:** the grill and the plan are written; the first and second kit frames are compared
- **Next step:** carry the first kit's menu data into the second kit's story data
- **Uncommitted:** nothing beyond the task folder
- **Waiting for the owner:** no; every port is shown before a push — «я просил каждый перенесенный из первого кита модуль показывать мне перед отправкой в пр!!!»
- **PR:** not open yet

## Steps

- [>] 1.1 Carry the first kit's menu data into the second kit's story data with kit icons
- [ ] 1.2 Make Playground a full-height live menu like the first kit's Default
- [ ] 1.3 Add a story per first-kit menu state
- [ ] 1.4 Look at every pair of frames, kit one next to kit two
- [ ] 2.1 Compare the second kit's narrow layout with the first kit's Mobile by measurement
- [ ] 2.2 Close what differs in the component
- [ ] 2.3 Show the narrow menu live at phone width in its own stories
- [ ] 3.1 Port the favorites logic and its spec
- [ ] 3.2 Port the favorites block into the menu without Material
- [ ] 3.3 Add the favorites stories after the first kit's eleven
- [ ] 3.4 Write the scenarios and their tests
- [ ] 4.1 Declare `[data-rt-scheme]` over the brand ramp in the kit's styles, the material preset too
- [ ] 4.2 Add a scheme switch to the showcase toolbar
- [ ] 4.3 Show the menu under a scheme in a story
- [ ] 5.1 Bring the spec, scenarios, overview and context of the menu up to what was done
- [ ] 5.2 Take the new frames after looking at them
- [ ] 5.3 Run the whole check set
- [ ] 5.4 Show the owner the pairs of links before any push

## Decisions along the way

- **The colour scheme is declared over the brand ramp.** The second kit's accent derives from
  `--rt-brand-*`, so a scheme block overriding that ramp repaints the menu the way the first kit's
  `[data-rt-scheme]` does. Affected stage of the plan: 4.

## Sessions

### 2026-09-30

- Task RT-2440 created from the owner's remarks on #2421; the branch taken from the epic branch.
- Frames compared: the first kit's menu is live and full height with eleven sections, the second
  kit's stories are small static boxes with three placeholder sections.
