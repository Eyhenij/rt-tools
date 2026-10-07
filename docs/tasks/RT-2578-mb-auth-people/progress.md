# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 1 of 1 — People and roles leave the bus
- **Done:** the task folder; main is merged into the local epic branch; seven frames are taken anew
- **Next step:** remove the specs of the people and roles screens and rewrite the access spec
- **Uncommitted:** no
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 The frames of the suite are taken anew after the merge of main
- [>] 1.2 The specs of the people and roles screens are removed and the access spec is rewritten
- [ ] 1.3 The admin panel loses the people and roles sections
- [ ] 1.4 The server loses the accounts operations, and the signed-in person is read in the access domain
- [ ] 1.5 The storage loses the four tables, and the operator column names the Keycloak person
- [ ] 1.6 The stand and the suite lose the people rows

## Decisions along the way

- **The branch stands on the local epic branch with main merged in.** The epic branch could not be
  sent: the frames of main lack the Keycloak name in the header, and the push gate runs the suite.
  The frames are taken anew by the first step here, and the merge reaches the epic branch with this
  task. Affected stage of the plan: 1.

## Sessions

### 2026-10-07

- The task folder is written.
