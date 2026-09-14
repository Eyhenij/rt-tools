# Grill

## The owner request

> изучи задачи на доске, перетяни в done и закрой те которые уже выполнены и вмержены, актуализируй состояние всех задач

The cleanup of the archive is the price of that order: the push gate refuses every push while `check-archive-age` is red on `main`, and the board config with the new column cannot reach `main` without a push.

## What the tree already has

- `tools/check-archive-age.mjs` — red on `main`: seven records older than 7 days at a grace of 1.
- `tools/archive-prune.mjs --apply` — removes what has overstayed; the records stay in history under their file names.
- Rule `doc-style`: the removal by expiry is work of its own with a task of its own, not carried by whichever branch pushed first.

## What the rules already say

- Skill `archive-record`: the dry run is the default because the command removes the grill of the request.

## Questions and answers

None asked: the order and the price are in the request and the rule.

## Decisions

- **Its own task and its own branch from `main`.** The board config branch stands on it as a chain.

## What is left unclear

- Nothing.
