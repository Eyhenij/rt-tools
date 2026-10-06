# Progress

## Where we stand

- **State:** `этапы-кончились`
- **Stage:** 1 of 1 — Switches in the card, back links without the chevron
- **Done:** the switches stand in the card, the back links show no chevron
- **Next step:** take the folder apart and open the PR into the epic branch
- **Uncommitted:** no
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 The theme spec rules and scenarios are written
- [x] 1.2 The frame moves the switches into the card
- [x] 1.3 The back links lose the chevron
- [x] 1.4 The tests are written
- [x] 1.5 The theme is checked on the stand

## Decisions along the way

- **The plate under the switches is dropped.** The owner moved the switches into the card after
  asking for the plate. Affected stage of the plan: 1.
- **The switches are pinned to the top right corner of the card, and the card's top padding grows
  to 80px.** In the flow of the card they took a row of their own and pressed the realm name;
  pinned, they sit in the padding, 20px above the name. Affected stage of the plan: 1.
- **Scenario numbers 64 and 65.** Number 63 went to the plate, which was committed in a branch that
  never left the machine. Affected stage of the plan: 1.

## Sessions

### 2026-10-06

- Theme tests: 22 of 22. On the stand the sign-in and the reset pages show the switches inside the
  card, 21px from its top and right edges; the reset page link reads «Back to Login».
