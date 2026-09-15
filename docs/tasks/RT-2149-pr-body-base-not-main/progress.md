# Progress

## Where we stand

- **State:** `этапы-кончились`
- **Stage:** 1 of 1 — done
- **Done:** the paragraph on the host reading the `Closes` line on the default branch alone and
  the two body samples for a base other than main; the closing paragraph and the cleanup step in
  the chain pattern; the task-state section in the merge pattern; the override naming
  `close-epic-tasks.yml`. The PR pattern was split: the link line, reviewer, labels and the body
  sample went to the new pattern `git-workflow-pr-body`. `sync --check` сходится, size, glossary
  and path checks clean, `check-specs` 1587/1439 as before.
- **Next step:** the folder taken apart, the PR into the epic branch
- **Uncommitted:** everything of the stage
- **Waiting for the owner:** no
- **PR:** not open yet

## Decisions along the way

- **The PR pattern is split, the body goes to `git-workflow-pr-body`.** With the new paragraphs
  the pattern went past 330 lines, and the size check refused; the sections about the link to the
  task and the body sample are one subject and left whole. The rule names the new pattern, the
  neighbours point at it, the patterns spec binds it, the override is renamed after it. Affected
  stage: 1.

## Sessions

### 2026-09-15

- Taken right after RT-2148 was handed in (PR #2155); #2151 is merged into the epic branch, and
  the task #2147 closed by the closing pipeline of this tree — the first live proof of RT-2143.
