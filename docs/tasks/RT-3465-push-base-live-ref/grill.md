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

The roles `goal-critic` and `product-strategist` read the plan of 22.11. Both showed the filter
alone closes the case of 21.11 and opens two splits it does not have today. The decisions below
replace the matching ones above. Спросить было некого: заход автономный.

- **The push judges the tree from the base its run ahead took.** The run ahead records the tree,
  the base and its commit next to its marks; the push guard and the pre-push hook take them for
  the same tree. Without it a lower branch merged and removed during a set of 30 minutes splits
  the bases — the chain of the epic merges bottom-up, and the host deletes a merged branch
  (`delete_branch_on_merge: true`). A new nearer branch split them on 16.11 at 11:52 too. The
  card asks «при любом состоянии ссылок». Цена ошибки: около 15 строк и два сценария.
- **The mark key meets by the commit of the recorded base.** A base whose branch moved between the
  set and the push has the same name and another key today.
- **The case of 21.11 was a prune by a neighbour session** (`git fetch -q origin --prune` at 03:28,
  the refusal at 03:34), not the host alone; the command of the tree `next-session` prunes too.
- **No answer from the host is said by a line of the run ahead.** The run ahead may go without the
  network and the push with it; the line tells the executor the push may judge from another base.
- **The refusal names both bases.** Today it names neither, and the executor cannot see why the
  green set does not count.
- **SC-AK-1340 «the ref of a removed branch stays the base» and two decisions of the description are
  rewritten.** They state the behaviour this task removes.

## What is left unclear

- Nothing blocks the work. The search for branches the host merged off the first-parent line is a
  finding next to the epic plan.
