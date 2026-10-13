# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 1 of 1 — Index against references
- **Done:** the pure matching, the re-read and the refusal are in; 31 scenarios pass
- **Next step:** run the push gate set
- **Uncommitted:** folders of other tasks of the epic, not part of this branch
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 Add the pure matching of references to the story ids of the index
- [x] 1.2 Make the check read the index again before it refuses
- [x] 1.3 Write the scenarios of the pure part
- [>] 1.4 Run the scenarios and the tree set

## Decisions along the way

- **Scenario SC-UKV-856 is added to the spec of the snapshots** — the number is the one the
  tree's command named as free. Affected stage of the plan: 1.
- **Checked against a fake showcase:** an index missing three stories ended the run after the
  re-reads with a refusal naming the three ids; a whole index went on to the runner. Affected
  stage of the plan: 1.

## Sessions

### 2026-10-13

- The task is taken. The directory holds 883 reference files for 789 stories, so the match goes by
  story id. 31 of 31 scenarios of the probe file pass.
