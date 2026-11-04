# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 1 of 3 — The hook and the mark
- **Done:** the branch from the epic branch after the merge of #3099, the task in progress
- **Next step:** write the git hook template `pre-push.sh` in the package
- **Uncommitted:** none
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [>] 1.1 Write the git hook template `pre-push.sh` in the package
- [ ] 1.2 Make the session guard write the mark of a green set
- [ ] 1.3 Write the scenarios of the hook in a suite of their own
- [ ] 2.1 Write the subdomain `pre-push-hook`: spec, scenarios, binding
- [ ] 2.2 Point the out-of-scope line of `push-sign` at the subdomain
- [ ] 2.3 Run the spec audit
- [ ] 3.1 Lay the package out by `pnpm run agent-kit:sync`
- [ ] 3.2 Wire the hook by `.husky/pre-push`
- [ ] 3.3 Run the whole hooks suite and the gate set

## Decisions along the way

## Sessions

### 04.11.2026

- The branch `RT-3046-pre-push-git-hook` from `origin/RT-3043-cargo-2026-11` after the merge of
  #3099. The task moved to «In progress». The marks of RT-3045 are set: two records of this tree and
  two analyses of tree `70f4a3ad0c32` in `fixed`.
