# Grill

**Описание фичи:** не нужно — правка выбора базы набора перед отправкой пакета правил; код приложений не меняется.

## The owner request

> продолжай RT-3471, эпик (четвёртая часть переделки проверок)

The owner's word of 21.11.2026; the task is row 9 of the plan of the epic RT-3471
`docs/plans/checks-rework-4.md`, among the tasks outside the milestone: the push set and the push
guard take one base.

The card (issue #3465), filed 21.11: on the branch of the epic RT-3302 the push set took the base
`origin/RT-3417-stop-hook-time`, ran green for 1 895 s, and the push was refused: «No green mark for
this tree and base» with the base `origin/main`. The branch RT-3417 had been removed on the host
after its merge. The choice of the base fetches with `--no-prune`, and the ref of the removed
branch stayed for the set; by the minute of the push the ref was gone, and the push guard chose
`origin/main`. The card asks: the choice of the base takes no branch the host does not hold; the
set and the push guard get one base whatever the refs. The sign: a scenario where a ref of a
branch removed on the host stands in the copy gives the base of the main branch to the set and to
the push guard.

> дальше работай полностью самостоятельно в режиме ночной работы, я ухожу спать. не задавай вопросов и не останавливай сессию, все вопросы решай сам как посчитаешь наиболее правильным

The night of 21.11 writes the plan and runs the roles; the code waits for the owner's approval of
the plan in the morning.

## What the tree already has

- **The choice of the base.** `projects/agent-kit/assets/hooks/git-guard-push-marks.sh:rt_push_base`
  fetches with `--no-prune` and walks every ref under `refs/remotes/origin`, taking the one the
  head has the fewest commits over. Both the run ahead (`git-guard-push-ahead.sh`) and the push
  set (`push-set.sh`) call it, so they differ only by the refs at the minute of the call.
- **Why `--no-prune`.** RT-3231 (12.11) made the base independent of stale refs by the rule «the
  nearest remote branch»; the commit does not say why pruning was left out. A prune in one copy
  removes refs the other copies of the same repository read as well.
- **A live ref is already asked once in the tree.** `facts.sh` asks
  `git ls-remote origin refs/heads/<branch>` for one branch.
- **The scenarios.** SC-AK-1340 in `projects/agent-kit/tests/git-guard-push-tests.test.sh` (444
  lines) covers the nearest branch, an own copy, a branch merged by the host; none holds a ref of a
  branch removed on the host.

## What the rules already say

- The rule `git-workflow-push`: the push set runs once per branch; the push reads the marks of the
  run ahead for the same tree and base.

## Questions and answers

No question was put to the owner: the card names the cause, the condition and the sign, and the
night order says to decide alone.

## Decisions

- **The choice of the base takes only the refs the host holds now: one `git ls-remote --heads
  origin` per call, and a ref missing from its answer is skipped.** A prune is not taken: it
  removes refs in every copy of the repository and changes what a neighbour session measures.
  Спросить было некого: заход автономный. Цена ошибки: одна выборка в функции и сценарий.
- **No answer from the host leaves the choice as it was.** Without the network the set runs on
  the refs it has; the push needs the network anyway, and its own call of the function then sees
  the host.
- **A branch removed between the run ahead and the push still splits the bases.** The push guard
  names the base it judges by; this task does not hold the host still.

## What is left unclear

- Nothing blocks the work: the card names the case, and the probe of the function on a built
  repository shows it.
