# Grill

**Описание фичи:** не нужно — сжатие правил пакета и дерева; код приложений не меняется.

## The owner request

> продолжай RT-3471, эпик (четвёртая часть переделки проверок)

The owner's word of 21.11.2026; the task is row 8 of the plan of the epic RT-3471
`docs/plans/checks-rework-4.md`. Point B of the epic for this task: long rules give no refusal; the
sign — a probe of an edit with the lines of a store through `window` and a read of `process.env`
prints «pass», and the lines «too long» and «do not fit together» of the report are 0. The
milestone G: three working days in a row of at least 1500 calls, each with fewer than five refusals
per hundred and no dead end; `skill-gate` gives 0,29–3,65 refusals per hundred a day and 8 dead
ends of the week.

The card (issue #3427), filed 19.11 from RT-3410: the rules gate gives the rules of an edit in one
piece of at most 10 000 characters, and nine rules are still longer than 3 000: observability
14 133, task-delivery-loop 9 399, doc-style-human 6 469, platform-access 5 645, epic-flow 5 478,
mockups 5 340, queue-audit 4 389, task-flow-owner 3 470, task-flow 3 440. It asks to compress them
by the way of RT-3392 and RT-3410: the hot part keeps the statement, the boundary, the exception
and the sign of every article and the table of names; arguments and examples go whole into the
cold part. The probe gets lines with the edit text and runs with no refusal, and it does not write
into the observations of the tree. The signs: the probe prints «pass» on every line; the meaning
check finds 0 losses; a blind retelling of the final text and a check by the critic find 0 losses.

> дальше работай полностью самостоятельно в режиме ночной работы, я ухожу спать. не задавай вопросов и не останавливай сессию, все вопросы решай сам как посчитаешь наиболее правильным

The night of 21.11 writes the plan and runs the roles; the code waits for the owner's approval of
the plan in the morning.

## What the tree already has

- **The probe and the meaning check of RT-3410** lie in history:
  `git show d38ed4d42^:docs/tasks/RT-3410-six-long-rules-fit/gate-probe.sh`, `meaning-check.mjs`,
  `gate-probe-paths.txt` (35 areas). Run on a copy of the tree with `CLAUDE_PROJECT_DIR` set to the
  copy, the probe writes its observations into the copy, not into `.claude/rt-kit/observations`:
  measured 21.11, the file of the day did not grow. The copy needs `tools/` and
  `projects/agent-kit/` too: without `tools/decide.mjs` the gate lets every refusal through, and the
  probe reads «no rule».
- **The probe on 21.11**: the 35 areas pass. With the edit text the card names it refuses: a store
  and an aside of the admin with `window.` — together, `entity-conventions`, `angular-patterns`,
  `platform-access`, `reuse-first`; a kit component with `window.` — together, with
  `component-structure`; a service and an entry of the receiver with `process.env` — too long,
  `observability`. A progress or a grill of a task folder is refused together: `doc-style` 2 998,
  `task-delivery-loop` 9 399, `task-flow-plan` 2 996, `task-flow` 3 440 — 18 833 characters. The
  last one is the refusal this session met twice on 21.11 after the compaction of the context.
- **The sources.** Package rules: `projects/agent-kit/assets/rules/observability.needs-app.md`,
  `platform-access.md`, `epic-flow.md`, `mockups.needs-mockups.md`, `queue-audit.github.md`,
  `task-flow.md`, `task-flow-owner.md`; the pattern `assets/patterns/doc-style-human.md`. Overrides
  of the tree: `task-flow` 750 and `task-flow-owner` 702 characters. `task-delivery-loop` is the
  tree's own rule. The cold parts live in `assets/pitfalls/` and `.claude/skills/<rule>/pitfalls.md`.
- **The gate delivers the companion of a rule only when it fits**; the limit is judged on the rules
  and the head line.

## What the rules already say

- The rule `agent-kit-source`: a package resource is edited in the package, then built and laid
  out; a laid-out copy is not edited in place.
- RT-3392 and RT-3410: the hot part keeps the statement, the boundary, the exception and the sign of
  an article and the table of names; the meaning check by words misses a lost boundary, and the
  blind retelling decides.

## Questions and answers

No question was put to the owner: the card names the rules, the way and the signs, and the night
order says to decide alone.

## Decisions

- **The budget of a rule is set by the probe, not by a flat 3 000.** Four rules a store edit
  demands sum to 12 151 with `platform-access` at 5 645; at 3 000 the sum is about 9 500 plus the
  head and the separators, on the edge. A task folder edit sums 18 833; at 3 000 each it is about
  12 000 and is refused. So every line of the probe must pass, and the targets follow: about 1 800
  for `platform-access`, about 1 200 for the hot part of `task-delivery-loop`, about 2 700 for
  `task-flow`, at most 3 000 for the rest. Спросить было некого: заход автономный. Цена ошибки:
  более глубокое сжатие четырёх правил, если владелец держится предела 3 000.
- **The probe gets the task folder and the lines of the edit text.** The card names the text lines;
  the task folder is the refusal of the night of 21.11 and belongs to the same family.
- **The probe runs on a copy of the tree,** with `tools/` and `projects/agent-kit/` in it, so the
  observations of the tree stay clean.
- **The hot part of `task-delivery-loop` keeps the articles and the table of names;** the fifteen
  steps «One task, start to hand-over» and «After the owner answers» go to its cold part. The steps
  are the order of work, read once per task; the articles are what the gate must deliver.
- **The metric is judged on the records of `gate-deny` a week after the merge of the epic into
  `main`,** without the records of the probe, as RT-3410 decided.

The roles `goal-critic` and `product-strategist` read the plan of 22.11 and measured it on a copy
with the rules cut to its targets: 43 of 47. The decisions below replace the matching ones above.
Спросить было некого: заход автономный.

- **The sign is narrowed to the 43 lines a compression can reach.** A task folder edit, the plan
  of a task folder and the commands with a body of a PR or a card (`gh pr create`, `gh pr edit`,
  `gh issue create`, `task:new`) demand five or six rules; `gh pr create --body-file` sums 12 018
  characters even with `task-delivery-loop` and `doc-style-human` at zero. Only a delivery of the
  rules in parts or a change of the map lifts them, and both change what the gate demands — the
  owner's choice. Цена ошибки: эти строки остаются отказами до отдельной задачи.
- **The budget follows the line, and no rule goes below what the owner said.** Eight rules at most
  3 000 characters, `platform-access` at 2 700 (its line leaves about 2 830), counted as the gate
  counts: `LC_ALL=en_US.UTF-8 wc -m`; the shell of the plan counted bytes.
- **`observability` stays up to 4 800.** Its table of names and 29 statements alone weigh about
  4 200; at 3 000 the hot part would lose the table or the statements, against «смысл не теряй».
  Цена ошибки: отступ от «ужимай до 3000» на одном правиле; деление правила на два — другой путь.
- **The five duties of the steps of `task-delivery-loop` stay hot** one line each; the steps go to
  the cold part. The meaning check could not see them lost: the paragraph stands in the cold part.
- **The meaning check demands the rows of the table of names in the hot part,** and the blind
  retelling is a step with its own check, not a line of the done-sign. Without both, a hot part of
  bare statements passed the check with 0 losses on a copy.
- **The probe covers `queue-audit` by `tools/board.mjs` and `mockups` by the design tool.**
  `tools/check-board.mjs` demands `testing` here.
- **The metric reads `why: too-long`,** the value the records hold; `long` is never written.

## What is left unclear

- How the gate should deliver a set of rules longer than the limit: in parts, or by a change of
  the map. The finding goes next to the epic plan and to the morning list.
