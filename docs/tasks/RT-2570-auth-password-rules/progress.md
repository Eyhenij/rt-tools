# Progress

## Where we stand

- **State:** `этапы-кончились`
- **Stage:** 1 of 1 — The password requirements under the new password field
- **Done:** every step of the stage
- **Next step:** run the push gate, take the folder apart, open the PR
- **Uncommitted:** no
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 The theme spec rules and scenarios are written
- [x] 1.2 The stand realm declares the password policy
- [x] 1.3 The requirements are built from the page context
- [x] 1.4 The update page shows the list under the new password field
- [x] 1.5 The tests are written
- [x] 1.6 The theme is checked on the stand

## Decisions along the way

- **The requirement texts are the theme's own, in English and Russian.** Keycloak names the policy
  only in refusal texts, and the Russian set lacks the address requirement. Affected stage of the
  plan: 1.
- **The stand password of the end-to-end suite gets an upper case letter.** Keycloak refuses to
  create a person with a password weaker than the realm policy. Affected stage of the plan: 1.

## Sessions

### 2026-10-06

- The task folder is written.
- Theme tests 30 of 30. On the stand the list stands under the field: after typing `Abcdefgh` five
  lines are green and the digit and the special character stay grey.
