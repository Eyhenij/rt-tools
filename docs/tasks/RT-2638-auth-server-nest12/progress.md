# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 2 of 2 — Delivery
- **Done:** the run under NestJS 12, the range and version 0.2.3, the spec rule
- **Next step:** open the PR into the epic branch and publish the package
- **Uncommitted:** no
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 Run the built package under NestJS 12 in a scratch install
- [x] 1.2 Widen the peer range and raise the version
- [x] 1.3 Add the rule to the server spec
- [>] 2.1 Open the PR into the epic branch and publish the package

## Decisions along the way

## Sessions

### 2026-10-08

- task RT-2638 created; the branch took main and `RT-2591-cms-packages` without conflicts
- the built 0.2.2 under NestJS 12.1.2 in a scratch install: open 200, no token 401, token 200, no right 403, right 200, a foreign `azp` refused
- `pnpm exec nx test auth-server`: 35 of 35; the spec audit: exit 0
