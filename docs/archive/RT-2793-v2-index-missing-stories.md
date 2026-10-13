# Grill

## The owner request

> обнови все пакеты до самых последних

The task came out of that order: twice on 12 October the showcase check of the second kit met an
index with some of its stories missing.

## What the tree already had

- The check read the story index, counted the stories and ran the snapshot runner. It looked for
  references without a story only after the run, from the registry of frames the harness took.
- The index lacked 9 chat stories (780 of 789) and the check failed on 9 «orphaned» references;
  the second time it lacked 8 (781 of 789) and the check ended green with no orphan line. Both
  times a repeat passed with 789 of 789.
- A reference file is named by the story id, and a story with named widths has one more file per
  width, `<id>--w<width>`. The directory holds 883 files for 789 stories, so a plain count of
  stories against references cannot judge the index.

## Decisions

- **The index is matched against the references before the run:** every reference names its story
  id, and a missing id is an index that lost it. The check refuses with the list of missing ids.
- **The index is read again up to six times before the refusal:** a lost entry came back on a
  repeat. Rejected: a retry of the whole run — it would hide a story that is really gone.
- **Known limit:** a story that has no reference yet cannot be found missing this way.
- **Checked against a fake showcase:** an index missing three stories ended the run with a refusal
  naming them; a whole index went on to the runner.
