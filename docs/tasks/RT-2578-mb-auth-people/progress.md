# Progress

## Where we stand

- **State:** `этапы-кончились`
- **Stage:** 1 of 1 — People and roles leave the bus
- **Done:** the task folder; main is merged into the local epic branch; seven frames are taken anew; the specs of the people and roles screens are gone; the admin panel and the server have no accounts domain; the four tables are dropped; the stand and the suite have no people rows, and the suite passes whole
- **Next step:** the push gate, then take the folder apart and open the PR
- **Uncommitted:** no
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 The frames of the suite are taken anew after the merge of main
- [x] 1.2 The specs of the people and roles screens are removed and the access spec is rewritten
- [x] 1.3 The admin panel loses the people and roles sections
- [x] 1.4 The server loses the accounts operations, and the signed-in person is read in the access domain
- [x] 1.5 The storage loses the four tables, and the operator column names the Keycloak person
- [x] 1.6 The stand and the suite lose the people rows

## Decisions along the way

- **The branch stands on the local epic branch with main merged in.** The epic branch could not be
  sent: the frames of main lack the Keycloak name in the header, and the push gate runs the suite.
  The frames are taken anew by the first step here, and the merge reaches the epic branch with this
  task. Affected stage of the plan: 1.

## Sessions

### 2026-10-07

- The task folder is written.
- The frames are taken anew; the screen specs are removed, and the access spec reads the rights
  from the token alone.
- The accounts domain left the admin panel and the server. The signed-in person is read in the
  access domain; the refusal codes of people and roles are gone.
- The migration drops the four tables, and the operator column is `personId`.
- The stand seeds people only in Keycloak. Seventeen frames are taken anew: the header now fits
  in one row. The suite passes, 146 of 146.
