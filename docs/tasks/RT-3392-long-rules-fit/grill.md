# Grill

**Описание фичи:** не нужно — правка текстов правил и строки недельного отчёта; правила спеки отчёта правятся на месте этой задачей.

## The owner request

> продолжай работу по эпику

The owner's standing order for the epic RT-3302; the task is row 11 of the epic plan. The card
(issue #3392) was filed after RT-3326: the rules gate puts a rule into the session only when it fits
the host limit of 10 000 characters, and long rules still give the refusal «load the rule and
repeat» — about 215 of 1 522 gate refusals over 19.10–18.11.

## What the tree already has

- **The gate.** `projects/agent-kit/assets/hooks/skill-gate.sh` delivers the rules of a call while
  their text fits `RT_GATE_CONTEXT_LIMIT` (10 000); the companions are dropped first. A refusal
  carries its reason in the note `gate … why=too-long|together|not-read|no-session`, and a delivery
  writes `gate-deliver res=<rule>`.
- **The sizes on 19.11.2026** (`wc -m` of the laid-out `SKILL.md`): agent-kit 20 113, testing 24 157,
  rt-tools-storybook 21 566, reuse-first 14 573, deploy-flow 17 840, rt-tools-styling 22 519,
  agent-kit-source 8 392, typescript-conventions 9 710; their pairs spec-driven 2 997 and
  angular-patterns 6 262.
- **Whose texts.** agent-kit, testing, reuse-first, deploy-flow and typescript-conventions are
  package resources under `projects/agent-kit/assets/`; rt-tools-storybook, rt-tools-styling and
  agent-kit-source are this tree's own and are edited in place.
- **The technique.** RT-3326 compressed seven rules to 3 000 characters: the arguments and samples
  went to the cold parts, a reader without the old text retold each part, and a critic compared.
  The article «A compressed article keeps its statement, boundary, exception and sign» of the rule
  `spec-driven` holds it.
- **The report.** `projects/agent-kit/assets/checks/work-result.mjs` counts refusals by check from
  the session records; it reads neither the reason of a gate refusal nor the deliveries.

## What the rules already say

`spec-driven`: a compressed article keeps its statement, boundary, exception and sign; room is
measured first; a loss returns to the article. `doc-style`: the prose of the rules layer has a
limit in characters.

## Questions and answers

None: the owner told the executor to decide himself («делай всё сам»), and the card names the
technique and the rules.

## Decisions

- **Every named rule gets a hot part of at most 3 000 characters**, agent-kit-source and
  typescript-conventions included: then any pair fits the limit with room for the companions.
- **The meaning is checked the way RT-3326 did it**: a reader role retells each compressed rule
  without the old text, a critic compares the retelling with the old text, and a loss goes back.
- **The report gets two numbers**: gate refusals by reason, read from the refusal text in the
  records, and rules delivered with no refusal, read from the `gate-deliver` notes.
- **Metric:** gate refusals go down; the next weekly report judges it.

## What is left unclear

- Whether a rule cut to 3 000 characters still answers the questions of its area — that is the job
  of the retelling, not of a count.
