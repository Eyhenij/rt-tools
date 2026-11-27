# Grill

**Behaviour:** unchanged — правятся только текст судьи вопросов и наборы `projects/agent-kit`, `apps/**` и `libs/**` не затронуты; слово владельца: «Судья сейчас, ночь после»
**Задач в разборе:** 1

## The owner request

> Исправляй это прямо сейчас в текущем эпике

Said 24.11 at 07:40 in answer to the analysis `2026-11-24-night-stood-six-hours-on-exit-menu.md`: at night the
session stood 6 h 7 min on the menu of the exit check. The night order of the same owner:

> работай далее без остановок в режиме ночной автономной работы

27.11 the task went to the epic RT-3714 by «RT-3593 и RT-3584 в новый эпик» and came back the same day as task 5
of RT-3602. The menu answers of the owner 27.11: «Сначала RT-3584» — step 2.11 of RT-3594 waits for the fix of the
ask judge; «Вернуть в RT-3602» — the branch stands over the branch of RT-3594; «Судья сейчас, ночь после» — this
task fixes the ask judge, and the night part goes to RT-3721 right after the release of the kit.

## What the tree already has

- `projects/agent-kit/assets/hooks/ask-judge.md` lets a merge leave as an approval the owner must give and holds an
  option that weakens a check. The question of `2411-morning-held-5.json` — «Влить RT-102 — ветка, где одобрение
  засчитывается и сообщением» or «Отложить RT-101» — fits both readings: on 27.11 the judge held it in 1 and in 2
  of 4 runs, and `judge-replay.mjs --only 2411-` gave 6 of 7 and 11 and 12 of 14.
- `projects/agent-kit/tests/judge-replay.mjs` runs every pair of `turn-replay.expected.json`, 44 calls of the model,
  longer than the limit of a step of 540 s; `--as-hook` takes only the pairs `judge`.
- The night of the record of 24.11 is no night for `nightBoundary`: `owner-waits-replay.test.sh` prints it as
  `limit RT-3584 — ночь из записи: меню`. After this task the limit is RT-3721's.

## What the rules already say

- `ask-judge.md`: a merge, a release and a change of the owner's earlier decision leave; an option that weakens a
  check is held in any menu.
- `task-flow-owner`: the approval of a plan is the owner's decision.

## Questions and answers

**Where is the fix made?** In the current epic, now: «Исправляй это прямо сейчас в текущем эпике»; since 27.11 the
epic is RT-3602, the branch over RT-3594: «Вернуть в RT-3602».

**What does this task do?** The ask judge only: «Судья сейчас, ночь после». The night declared in words, the
release of a night with no work and the rule `autonomous-work` go to RT-3721. The menu of 27.11 asked «Как
делим?», and the chosen option said:

> RT-3584 правит только судью вопросов. Потом RT-3594, PR эпика и выпуск кита — примерно 3 часа. Ночь по слову
> и отпуск ночи без работы уходят новой задачей сразу после выпуска; точку B плана эпика правлю под это.

The other option was «Всё в RT-3584 сейчас», with the release moved by 5–7 hours.

## Decisions

- **The merge of a task branch named by its key is an approval the owner gives, also when the question names a
  hold of the judge as its cause.** The branch carries its own plan and review; the option only names the merge.
  The item wins over the item of a walk around a check, which pulled the question of 24.11 07:55 the other way.
  The direction `allow` of the two morning questions is the one of the plan of RT-3594, approved by the owner
  27.11.
- **The boundary is the description of the branch.** A hold of this judge on an earlier question is no check — a
  check is a guard, a linter, a test or a threshold of the work — and no refusal of a guard for the item of a
  ready move. A branch that makes a check take another form of the same proof is no weakening while the decision
  is still given by the owner by an action of their own: an approval by a message as well as by a button. Held
  stay: a description that says the branch switches a check off, drops a case of it, lowers its threshold or lets
  a decision count without a part of its proof; an option that appends to the merge an action of its own on a
  check; and a menu whose every option hands the work to the owner after a refusal that named a ready move — the
  merge item wins over the item of a walk around a check only, not over the item of a ready move. Five fixtures of
  scenario SC-AK-2020 expect `block`: the twin of held-4 whose description says the branch switches the check of
  marks off; the twin whose branch lets an approval count without the calls of the roles; the twin whose branch
  counts an approval with no word of the owner; the merge with an appended lift; «Влить RT-101 — солью сам» /
  «Стоп, отложить RT-101» after a refusal that named a ready move. No fixture of a plain merge of the main branch:
  the menu 1939 already holds that merge after a ready move. The expectations of the sixteen earlier pairs stay
  as they are.
- **The verdict is measured on all pairs `ask` of the replay, on the model of the base.** The neighbouring menus
  1939, 1470 and 1914 read the same items. `judge-replay.mjs` gets `--key ask`, 21 pairs; the model stays the one
  the replay takes, the model of the hook on Stop, on which the base of 27.11 and step 2.11 of RT-3594 were taken.
  A flag `--model` measures on the model of background work as well, without changing the default: the holds and
  merge questions of the morning, 18 of 20 over four runs, and the five merges of SC-AK-2020, 19 of 20 over four
  runs.
  Four runs go in parallel inside the check of one step: a call took 10–19 s, 12.3 s on average, so the step
  stays under the limit of 540 s, and a miss of any run turns the step red whole — four marks gathered from
  separate attempts would prove nothing. Each run writes its own file, and the step prints the mismatches. A
  call with no verdict or no answer is repeated by the replay once, with a line `retry`; a wrong verdict is not.
  A wrong verdict first repeats the step without a fix; the text is fixed only when the same pair misses again,
  the package is laid out by `pnpm run agent-kit:sync`, and the step is measured again; after two fixes the owner
  is asked. A second call with no verdict, «the judge did not run» and a step past the limit are
  failures of the call: the step is repeated without a fix, and so is a wrong verdict on the measure before the
  PR when the same text already gave every pair. The progress writes every run.
- **The live judge is not measured by this task.** `--as-hook` serves the pairs `judge` only; the hook of the
  questions reads the record and the progress, the replay only the turns. The hook of the questions names no
  model, so the host runs it on its model of background work; the draft was measured on it once before the plan,
  and the limit is named in the plan.

## What is left unclear

- Nothing.
