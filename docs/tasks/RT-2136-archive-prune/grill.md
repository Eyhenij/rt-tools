# Grill

## The owner request

> Работа взята не по слову владельца, а по правилу: запись прошлого старше срока держит проверку
> «возраст архива» красной на каждой ветке, а удаление по сроку — работа со своей задачей.

## What the tree already has

- `tools/archive-prune.mjs` removes the overstayed records; `tools/check-archive-age.mjs` turns
  red while they are still there. Both take the selection from `tools/archive-age.mjs`.
- The term is `archiveRetentionDays` in `.claude/rt-kit/checks.json`: seven days, grace one.
- The pipeline run on the tip of RT-2130 went red at the step «Archive retention» with one
  record eight days old; the dry run names twenty-three records at the term.

## What the rules already say

- Rule `doc-style`: the removal by expiry is not carried by whichever branch pushed first —
  either the cleanup is work of its own with a task of its own, or the check refuses the run.
- Skill `archive-record`: the dry run is the default because the command removes the grill of the
  request; the removal goes by `--apply`, and a removed record stays in the history by file name.

## Questions and answers

None: the rule answers the question whole.

## Decisions

- **The cleanup is one commit on a branch of its own.** — the rule names it so. Rejected: a prune
  inside RT-2130 — it would travel to the reviewer inside an edit that has nothing to do with it.

## What is left unclear

- Nothing.
