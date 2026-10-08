# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 2 of 2 — Delivery
- **Done:** the recreate of Keycloak, the theme check, the spec rule
- **Next step:** open the PR into main and roll the theme out
- **Uncommitted:** no
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 Recreate Keycloak after the stack is up
- [x] 1.2 Compare the served theme with the built one at the end of the rollout
- [x] 1.3 Add the rule to the entry module spec
- [>] 2.1 Open the PR into main and roll the theme out

## Decisions along the way

## Sessions

### 2026-10-08

- task RT-2634 created after the rollout of `97c1c1fe5` left the old theme on production
- the theme check run by hand against production: the served `main.js` differs from the built one, as expected before the fix
- the spec audit: exit 0
