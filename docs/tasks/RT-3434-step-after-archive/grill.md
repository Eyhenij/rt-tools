# Grill

**Описание фичи:** не нужно — правка движка хода работы и его описания; код приложений не меняется.

## The owner request

> я ухожу спать, переключайся в ночной автономный режим, доведи все задачи эпика до завершения и сам эпик до пр в main

The owner's word of 19.11.2026 for the night; the task is row 26 of the plan of the epic RT-3302.
The card (issue #3434) was filed on 19.11 from the work on RT-3417. The check before a PR opens
measures the done steps of the plan again and takes the mark off a step that did not match. By
that minute the task folder is taken apart by the last commit of the branch, and the mark cannot
be put back: the command `step` refuses with «the task folder differs from the commit of the
plan». The engine then names the state «этап-идёт» and at every turn end orders to finish the
stage by the command that refuses. The card asks three things. After the folder is taken apart
the command `step` measures the step by the plan from the commit of the plan, as the rerun before
a PR already does. The refusal of the rerun names the line of the output the step went wrong on:
today only «получено 0» is seen. A step whose check calls a model or counts live runs does not
lose its mark at the first mismatch before a PR, or the plan warns of such steps when written.
The sign: on a branch with the folder taken apart and a step mark taken off, the command
`step N.M` measures the step and puts the mark, and the engine names no move that cannot be made.

> продолжай RT-3471, эпик (четвёртая часть переделки проверок)

The owner's word of 21.11.2026 moved the task into the epic RT-3471: row 4 of its plan
`docs/plans/checks-rework-4.md`. Point B of the epic for this task and RT-3425: a task taken apart
does not roll back into «этап-идёт», and a step mark taken off before a PR comes back. The
milestone G: three working days in a row of at least 1500 calls, each with fewer than five
refusals per hundred and no dead end.

> дальше работай полностью самостоятельно в режиме ночной работы, я ухожу спать. не задавай вопросов и не останавливай сессию, все вопросы решай сам как посчитаешь наиболее правильным

The night of 21.11 writes the plan and runs the roles; the code waits for the owner's approval of
the plan in the morning.

## What the tree already has

- **The command of a step.** `projects/agent-kit/assets/checks/flow-step.mjs:prepareStep` compares
  every file of the task folder on disk with its text at the commit of the plan. A folder that is
  not on disk differs in every file, and the step is refused before anything runs.
- **The rerun before a PR.** `runBeforePull` in the same file puts the taken-apart folder back
  from the history for the run and removes it after: the files as they stood at the parent of the
  commit that removed the folder. It measures every step the progress marks done, and a step that
  does not match loses its mark at once.
- **What the engine reads.** The exit «every step is done» asks two things of a step: the mark
  «done» in the progress — the working copy or its last version in the history — and the mark of a
  matched run. A mark taken off by the rerun leaves the exit unmet, and the state falls back to
  «этап-идёт».
- **The line of a measured step.** «ожидалось … · получено … · совпало / не совпало», where
  «получено» is the last line of the output. For a check that counts lines it is a bare number.
- **What happened on RT-3417.** Five steps done, the folder taken apart, the push set green, the
  branch pushed. The call that opens the PR measured the steps again. Two did not match: the commit
  of the second review round reset the live count of one, and a run of the model diverged once of
  six in the other. Their marks were taken off, and `step 2.2` refused.
- **The suite** `projects/agent-kit/tests/task-flow-script-steps.test.sh` holds the cases of the
  command and of the rerun; the rules live in
  `docs/specs/agent-kit/turn-guards/flow-script/step-mark/`.

## What the rules already say

- The description of the step mark: only the engine marks a step done; every done step is measured
  again once before the PR opens.
- The rule `task-flow`: a refusal by state names the mandatory action of that state. An action
  that cannot be made breaks this rule.

## Questions and answers

None. The card names the three demands and the sign.

## Decisions

- **The command of a step puts a taken-apart folder back for the run, the way the rerun does.**
  One function serves every form of the command. The mark of the matched run is written. Спросить
  было некого: заход автономный. Цена ошибки: одна общая функция и сценарий.
- **The function gives a step the progress as it stood when the step was measured.** The rerun
  already does so: a check that reads the progress saw it before the step was marked done. The
  role `product-strategist` showed on the repository of the suite that a bare putting back fails
  such a step — the rerun counts it, the command of one step never would, and the dead end stays.
- **A step the history does not mark done is refused on a taken-apart folder.** Its mark «done»
  would be written into a folder that is removed after the run, and the state would never move.
- **A run broken off is cleaned by the next call of the engine.** The engine writes a record
  before it puts the folder back and removes the folder such a record names at every start. A
  handler of a signal cannot do it: a check runs inside a call that hears no signal until it ends.
  A folder left behind is counted by the marks of the push set and would return to the history by
  the first «add all».
- **Before a PR a step that did not match is run once more, and loses its mark on the second
  mismatch.** Of the two ways of the card this one needs no knowledge of which check calls a model:
  the engine cannot tell it by the text of a command. The steps that did not match go as one group
  after the first round, and a step that ran past its limit is not run again: the limit of a step
  is 540 seconds, and the hook that waits for the rerun has 1800. Rejected: a warning in the plan —
  a warning does not return the mark. Цена ошибки: одно число повторов.
- **The line of an unmatched step names the command of its check and the last three lines of its
  output.** A bare number says nothing; the command says what was counted. The last three lines of
  the error stream join them when it is not empty.

The roles `product-strategist` and `goal-critic` read the first plan of 21.11 and found four dead
ends it left. The decisions below replace the matching ones above where they differ. Спросить было
некого: заход автономный.

- **A step the history does not mark done, and a step that fails twice, get the move `git revert
  <the commit that took the folder apart>`.** A bare refusal is a dead end again: no command makes
  such a step done. The revert brings the folder back by a commit; the step guard lets it through.
  Цена ошибки: одна строка хода и два сценария.
- **The record of a putting back lies in the git directory of the copy and carries the process
  number and the root.** A start of the engine during a live run of a neighbour call would remove
  the folder under it. The folder is removed only when the process is gone, the folder is not at
  the head and its files match the ones put back. Цена ошибки: одна запись и два сценария.
- **The rerun before a PR goes by the same groups of progress versions within 1500 s from the start
  of the rerun.** One group breaks the rule «the progress as it stood when the step was measured»,
  and the hook that waits for the rerun has 1800 s. Цена ошибки: одно число бюджета.
- **The exit refusal with no folder reads the progress from history and names the step number.**
  «`step N.M`» with no number is a move nobody can make.
- **The search for the commit that removed a path is one function of the history source,
  `removedAt`.** This task moves today's search into it as is; RT-3425 fixes the search there.

## What is left unclear

- Nothing. The state falls back through the mark alone: the exit «every step is done» reads only
  whether the mark of a step says «matched», and with both marks back it is met — measured on the
  repository of the suite.
