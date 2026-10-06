# Progress

## Where we stand

- **State:** `этапы-кончились`
- **Stage:** 1 of 1 — The placeholder is an example, not the label
- **Done:** the spec, the code, the tests, the check on the stand
- **Next step:** take the folder apart and open the PR into the epic branch
- **Uncommitted:** the folder of RT-2565, it goes to its own branch
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 The spec rule and scenario SC-AUTH-59 are rewritten
- [x] 1.2 The templates put the example into the login fields and drop the password placeholders
- [x] 1.3 The test of SC-AUTH-59 is rewritten
- [x] 1.4 The theme is checked on the stand

## Decisions along the way

- **A realm whose login takes only a name gets no example either: scenario SC-AUTH-60.** — an
  address in a field that does not take one would mislead. Affected stage of the plan: 1.
- **The stand takes a rebuilt theme only after the container is recreated.** — the jar is mounted
  as a single file, the build writes a new file, and a restart keeps the old one. Affected stage of
  the plan: 1.

## Sessions

### 2026-10-06

- Theme tests: 19 of 19. On the stand the login field shows `name@example.com` under the label
  «Username or email», the password field shows nothing.
