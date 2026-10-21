# Grill

Records of the intake this work closes, by full keys:

- `92055fbd-4c25-41a2-8b53-79b7dd8cb5f1` — proposal for `hooks/grill-gate.sh`: an option list after a
  refused quiz counts as a question.
- `06aa3895-e78d-4974-bba5-d1aedd158c47` — analysis: the question went out as prose after the quiz
  was refused.
- `a5a75cad-9403-460b-8ff0-3b1f06676efe` — analysis: a push recreated a branch whose PR was merged.
- `2e8e8224-d3b9-44e3-a2bd-da76d02785a3` — analysis: the executor stopped on the assignment refusal
  after a direct order of the owner.

## The owner request

> разбери всё новое что есть в приёмнике

The menu answer on the volume: «Разобрать все 31 (Recommended)». The order to take the epic: «бери
RT-2922».

## What the tree already has

- The fourth sign of `grill-gate.sh` judges a question after a refusal. At the turn end it counts
  as a question only text with a line ending in «?».
- The assignment refusal ends with «the owner moves the assignment» and names no way to recognise
  that move in the conversation.
- The pattern `git-workflow-commit` already asks for the PR state before a push into a branch of a
  merged PR. No guard asks it: the signature helper of the delivery guard judges the push, but not
  the state of the PR.
- The board helper reads one PR by branch (`pullState`), and its fields carry no merged state.

## What the rules already say

- `task-flow`: «The owner's instruction holds until they cancel it». The refusal text does not
  repeat it, and the executor read the refusal, not the rule.
- `git-workflow`: «A refusal is read before it is bypassed by a second way». A prose question after
  a refused quiz is such a second way.

## Questions and answers

No question went to the owner. The epic plan already holds the decision per record, and the owner
gave the order «бери RT-2922».

## Decisions

- **The option list counts as a question only in a turn where the quiz was refused.** The proposal
  asked for a wider sign. A numbered list under a colon stands in many ordinary reports, and a
  refusal on each of them would teach the executor to strip lists from replies.
- **The push refusal needs a merged PR and no open PR for the same branch.** A branch reopened by a
  new PR after a merge is lawful work.
