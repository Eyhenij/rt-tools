# Progress

## Where we stand

- **State:** `этапы-кончились`
- **Stage:** 3 of 3 — Domain spec
- **Done:** all three stages. The stand check prints five ok lines, the spec audit is green.
- **Next step:** run the push gate, take the folder apart, open the PR into the epic branch.
- **Uncommitted:** nothing
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 Write the compose file of the stand
- [x] 1.2 Write the realm file
- [x] 1.3 Add the raising command
- [x] 2.1 Write the check command
- [x] 2.2 Run the check over the raised stand
- [x] 2.3 Check that an edited realm file reaches a running stand
- [x] 3.1 Merge the agreement into the domain spec
- [x] 3.2 Write the companion of the domain
- [x] 3.3 Add the domain to the specs index

## Decisions along the way

- **The realm loader runs without the import cache.** With the cache the loader skips a file whose
  checksum did not change. A console edit then outlives the next raising. Affected stage: 2.
- **The raising command waits for the realm loader to exit with code 0.** The plain wait returns while
  the loader still runs. Affected stage: 1.
- **Keycloak 26.5.5 with keycloak-config-cli 6.5.1-26.5.5.** The config tool has no build for a
  newer Keycloak yet. Affected stage: 1.

## Sessions

### 2026-10-05

- The epic RT-2528 and its seven tasks are created; the grill of the epic lies in this folder.
