# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 3 of 3 — Domain spec
- **Done:** stages 1 and 2. The stand check prints five ok lines.
- **Next step:** merge the agreement into the domain spec.
- **Uncommitted:** nothing beyond this folder and the draft
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 Write the compose file of the stand
- [x] 1.2 Write the realm file
- [x] 1.3 Add the raising command
- [x] 2.1 Write the check command
- [x] 2.2 Run the check over the raised stand
- [x] 2.3 Check that an edited realm file reaches a running stand
- [>] 3.1 Merge the agreement into the domain spec
- [ ] 3.2 Write the companion of the domain
- [ ] 3.3 Add the domain to the specs index

## Decisions along the way

- **The realm job runs without the import cache.** With the cache the job skips a file whose
  checksum did not change. A console edit then outlives the next raising. Affected stage: 2.
- **The raising command waits for the realm job to exit with code 0.** The plain wait returns while
  the job still runs. Affected stage: 1.
- **Keycloak 26.5.5 with keycloak-config-cli 6.5.1-26.5.5.** The config tool has no build for a
  newer Keycloak yet. Affected stage: 1.

## Sessions

### 2026-10-05

- The epic RT-2528 and its seven tasks are created; the grill of the epic lies in this folder.
