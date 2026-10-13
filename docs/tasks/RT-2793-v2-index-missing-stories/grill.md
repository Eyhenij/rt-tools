# Grill

## The owner request

> обнови все пакеты до самых последних

The task came out of that order: twice on 12 October the showcase check of the second kit met an
index with some of its stories missing.

## What the tree already has

- The check `tools/visual-snapshots-v2.mjs` reads the story index of the showcase, counts the
  stories and runs the snapshot runner. It looks for references without a story only after the
  run, from the registry of frames the harness took.
- On 12 October the index lacked 9 chat stories (780 of 789) and the check failed on 9 «orphaned»
  references; the second time it lacked 8 (781 of 789) and the check ended green with no orphan
  line. Both times a repeat passed with 789 of 789.
- A reference file is named by the story id, and a story with named widths has one more file per
  width, `<id>--w<width>`. The directory holds 883 files for 789 stories, so a plain count of
  stories against references cannot judge the index.

## Decisions

- **The index is matched against the references before the run:** every reference names its story
  id, and a story id missing from the index is an index that lost it. The check refuses with the
  list of missing ids.
- **The index is read again a few times before the refusal:** a lost entry came back on a repeat,
  so the check gives the showcase a bounded time to finish the index. Rejected: a retry of the
  whole run — it would hide a story that is really gone.
- **Known limit:** a story that has no reference yet cannot be missed this way. A new story gets
  its reference in a re-take session, and the check stands on references that exist.
