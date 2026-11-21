# Grill

**Описание фичи:** не нужно — правка движка хода работы и его описания; код приложений не меняется.

## The owner request

> я ухожу спать, переключайся в ночной автономный режим, доведи все задачи эпика до завершения и сам эпик до пр в main

The owner's word of 19.11.2026 for the night; the task is row 23 of the plan of the epic RT-3302.
The card (issue #3425): after the epic branch is merged into the branch of a task, the engine of
the work flow rolls the task back from «папка-разобрана» to «этап-идёт», though the folder is
taken apart and the PR is open. It happened on 19.11 with RT-3276: the epic branch held an old
copy of its folder, where step 3.4 was not done yet. The engine takes the progress from the
newest commit by time that holds the file, and that is a commit of the merged epic branch, not a
commit of the branch itself. The exit check then holds the turn on a step done long ago. The card
asks: the last version of a task file is read along the first line of the branch, and a merged
base does not replace the progress of the task. The sign is a scenario of the engine: the branch
took the folder apart, then merged a base with the old folder; the state is not below
«папка-разобрана».

> продолжай RT-3471, эпик (четвёртая часть переделки проверок)

The owner's word of 21.11.2026 moved the task into the epic RT-3471: row 5 of its plan
`docs/plans/checks-rework-4.md`. Point B of the epic for this task and RT-3434: a task taken apart
does not roll back into «этап-идёт». The milestone G: three working days in a row of at least 1500
calls, each with fewer than five refusals per hundred and no dead end.

> дальше работай полностью самостоятельно в режиме ночной работы, я ухожу спать. не задавай вопросов и не останавливай сессию, все вопросы решай сам как посчитаешь наиболее правильным

The night of 21.11 writes the plan and runs the roles; the code waits for the owner's approval of
the plan in the morning.

## What the tree already has

- **The history the engine reads.** `projects/agent-kit/assets/task-flow/source/git.mjs:open`
  lists the commits the main branch on the server does not hold, oldest first — every commit
  reachable from the tip, the commits a merge brought in among them.
- **The last version.** `lastVersion(path)` walks that list from the newest and returns the text
  of the first commit whose tree holds the file. A commit of a merged branch that still holds the
  folder answers before the commit of the branch that took the folder apart.
- **Who reads it.** Four measurers: the progress and the plan of a task (`measure/progress.mjs`),
  the grill (`measure/grill.mjs`), the agreement (`measure/agreement.mjs`), the footprint
  (`measure/footprint.mjs`). Each asks the working tree first and the history second, so the
  wrong answer comes exactly when the folder is no longer on disk — after it is taken apart.
- **The suites.** The double of the history in `projects/agent-kit/tests/flow-doubles.mjs` is a
  straight line of snapshots and cannot show a merge. The suites of the step guard and of the task
  flow guard build a real repository.
- **The classification of RT-3418** counted 16 refusals at turn ends over 14–19.11 where the
  engine named the wrong state, judged by the text alone. The role `product-strategist` searched
  every branch since 10.11 for a merge after which the branch lost its folder and the merged side
  kept it: there is one, 19.11 at 10:10Z on RT-3276, and no refusal at a turn end follows it on
  that branch. The 16 are other causes.

## What the rules already say

- The description of the flow script: the history of a branch is the commits the main branch on
  the server does not hold, and a fact read from it stays true in later sessions.
- The rule `git-workflow`: the epic branch is merged into the branches of its tasks while the work
  runs. So a merge of the base into a task branch is an ordinary step, not a rare case.

## Questions and answers

None. The card names the cause, the condition and the sign.

## Decisions

- **The last version of a file the head no longer holds is read at the parent of the commit that
  removed it.** The card names the walk along the first line of the branch. The role
  `product-strategist` tried both on a copy of the real branch of RT-3276 and on five built
  histories. The first line gives the right progress after a merge commit and the old one after a
  fast-forward: a branch whose PR is merged and that then takes the base in has the line of the
  base for its first line. The parent of the newest commit that removed the path gave the right
  progress in all five and 15 steps done of 15 on the real branch. The sign of the card — the
  state not below «папка-разобрана» — is kept; its way is replaced. Спросить было некого: заход
  автономный. Цена ошибки: одна функция источника истории и три сценария.
- **One function holds the rule.** The rerun before a PR finds the taken-apart folder by the same
  search in its own code; it calls the function instead, so the tree does not hold two answers to
  one question.
- **The list of commits other measurers read stays as it is.** What a branch added and changed is
  asked of every commit; this task changes only the choice of the last version. The scenario shows
  whether another reader gives the same roll-back; if it does, it is fixed here, by the same line.
- **The scenario runs on a real repository.** The double cannot hold a merge, and a double taught
  to hold one would prove the double, not the call of the history.

The roles `goal-critic` and `product-strategist` read the plan of 21.11. The decisions below
replace the matching ones above where they differ. Спросить было некого: заход автономный.

- **The commit that removed a file is found by the path search of `git log` from the head, with
  the default history simplification, and by the full history only when that is empty.** «The
  newest removing commit» breaks in two histories. After a fast-forward the default search answers
  empty. When the base removed its own old copy later than the branch, a walk by date or the full
  history takes the removal in the base and the old progress again. Цена ошибки: два сценария.
- **The search stays inside the history of the branch (`--not origin/main`).** The description
  of the flow script says the history of a branch is what main does not hold; a removal already in
  main keeps the old answer «no file». Цена ошибки: одна граница поиска.
- **The function `removedAt` is born in RT-3434, one step lower in the chain.** RT-3434 moves
  today's search into it as is; this task fixes the search there, and `lastVersion`,
  `everExisted`, `prepareStep` and `runBeforePull` all call it. Without that, the refusal of
  RT-3434 «a step the history does not mark done» reads the old progress after a merged base —
  the dead end of RT-3276 under another name.
- **The task moves no share of refusals.** It lifts a dead end the epic chain meets at every merge
  of the base into a task branch; the plan says so instead of a share of `turn-exit-guard`.
- **A false pass of the footprint exit after a merged base is not fixed here.**
  `measure/footprint.mjs` counts the commits the base brought as edits of the branch. It is a
  finding next to the epic plan.

## What is left unclear

- Nothing. The measure on the copy of the real branch answered the one question: the roll-back
  came from the exit «every step is done» alone; the other six exits read from the history stayed
  met after the merge.
