# Grill

**Описание фичи:** не нужно — правка проверки отправки и её описания; код приложений не меняется.

## The owner request

> я ухожу спать, переключайся в ночной автономный режим, доведи все задачи эпика до завершения и сам эпик до пр в main

The owner's word of 19.11.2026 for the night; the task is row 24 of the plan of the epic RT-3302.
The card (issue #3426): the push set took the main branch as the base for a task of the epic,
RT-3276, and ran everything — the end-to-end suites, the showcase snapshots, the image build —
about 25 minutes instead of a few. The cause: the server held an old copy of the task branch, and
that copy was already inside the epic branch. The choice of the base drops every branch that
carries this copy — the epic branch too, though the tip of the task holds it. The same check did
not let the old copy be removed from the server: it judged the removal against the main branch.
The card asks: a branch that lies under the tip of the task is not dropped as «standing on this
one». The sign is a scenario of the push check: an old copy of the branch on the server inside
the epic branch, the base of the set is the epic branch.

> продолжай RT-3471, эпик (четвёртая часть переделки проверок)

The owner's word of 21.11.2026 moved the task into the epic RT-3471: row 10 of its plan
`docs/plans/checks-rework-4.md`, among the tasks outside the milestone. The commits of the grill
of 20.11 are carried from the branch of the old chain, kept locally as `RT-3426-grill-2011`.

> дальше работай полностью самостоятельно в режиме ночной работы, я ухожу спать. не задавай вопросов и не останавливай сессию, все вопросы решай сам как посчитаешь наиболее правильным

The night of 21.11 writes the plan and runs the roles; the code waits for the owner's approval of
the plan in the morning.

> Продолжай

The owner's word of 23.11.2026, after RT-3465 was handed in as the PR #3519. The branch is rebuilt
on the tip of RT-3465; the branch of the night is kept locally as `RT-3426-night-before-rebuild`.

## What the tree already has

- **The choice of the base.** `projects/agent-kit/assets/hooks/git-guard-push-marks.sh:rt_push_base`
  walks the remote branches and takes the one the head has the fewest commits over. Before the
  count it drops some of them.
- **The line that drops the epic.** A remote branch that holds the own copy of this branch — the
  remote ref of the same name — is taken for a branch that stands on this one, and dropped. The
  one exception is a branch at the very commit of the own copy. The rule does not ask whether the
  dropped branch lies under the head.
- **How RT-3276 got there.** The task was pushed, its PR merged a part of it into the epic by the
  host, and the work went on in the same branch after the epic was merged back in. The remote copy
  of the task was then an ancestor of the epic, and the epic an ancestor of the head. The epic was
  dropped, and the nearest branch left was the main one.
- **The scenarios.** `SC-AK-1340` in `docs/specs/agent-kit/push-gate-ahead/scenarios.md` holds the
  cases of the choice; `projects/agent-kit/tests/git-guard-push-tests.test.sh` runs them on real
  repositories. One case reads «a remote branch that stands on this one is not the base».
- **After RT-3465.** The choice drops refs of branches the host no longer holds, and the run ahead
  pins its base; the push takes the pinned ref while its record fits the head. The scenarios of the
  base live in `projects/agent-kit/tests/git-guard-push-base-live.test.sh`, a suite of its own; the
  suite of the push check stands at 499 lines of the limit of 500.
- **The price.** The push set of a task counted against the main branch runs every heavy step;
  memory of this tree holds 80 minutes lost on 13.11 and 25 on 19.11.

## What the rules already say

- The description of the push set: the base is the remote branch the head has the fewest commits
  over; git does not record which branch was taken from which, and the known limits are named.
- The rule `git-workflow-push`: the push gate set is never narrower than the pipeline set.

## Questions and answers

None. The card names the cause, the condition and the sign.

## Decisions

- **A branch that lies strictly under the head is not dropped for carrying the own copy.** The
  drop asks one more thing: the branch is not a strict ancestor of the head. A branch at the very
  commit of the head stays dropped — it adds nothing to compare with and would make the set check
  nothing. The role `product-strategist` built the history of RT-3276 both ways the epic can be
  taken back: today the base is the main branch, with the condition it is the epic branch, and the
  26 other cases of the choice print what they printed.
- **In a stack the condition makes one more branch a base, and that is accepted.** An upper branch
  pushed earlier can lie strictly under the head of the lower one — the lower took it in, or the
  upper was pushed with no commit of its own. It becomes the base of the lower. Its commits passed
  the set at its own push, which is the rule of what the base trusts. A case of the scenario and a
  line of the description say so. Спросить было некого: заход автономный. Цена ошибки: одно условие в выборе
  базы и один случай сценария.
- **The removal of an old copy from the server is not taken here.** The card names it as a second
  trouble and asks nothing about it; after this task the old copy no longer costs a full set.
  Named in what the work does not do.
- **The case is added to `SC-AK-1340`,** the scenario of the choice, not issued a number of its
  own: it is one more row of the same rule.
- **The task stands on RT-3465 in the chain and edits the same function after it.** RT-3465
  filters the candidates by the branches the host holds and pins the base of a set to its tree.
  An old copy of the task branch is a live branch on the host, so the filter does not lift this
  case; the condition here is still needed. The pinned base does not lift it either: the set
  itself chose the main branch. Спросить было некого: заход автономный. Цена ошибки: условие
  ложится на функцию после правки RT-3465, конфликт решает слияние цепочки снизу вверх.

The role `goal-critic` read the plan of 22.11 and built five histories: the condition «strictly
under the head» gave the epic in one, the main branch in four. The decisions below replace the
matching ones above. Спросить было некого: заход автономный.

- **A branch is dropped for the own copy only when the copy did not come into it by a merge of the
  host.** On RT-3276 the copy came into the epic on 15.11 by the request #3351 of RT-3329, merge
  `459bdf5c3`, and the task took the epic in only on 19.11 at 17:10; all that time the epic was
  ahead of the head and was dropped. A branch taken from this one by plain commits carries the
  copy on its own line and stays dropped. Цена ошибки: одно условие и три случая.
- **A branch under the head or at its commit is not dropped for the own copy.** A head
  fast-forwarded to the epic would run the whole set over what the epic already passed, against
  the rule «a push that adds nothing runs nothing» of the same file.
- **`own` stays the ref of the copy.** The host deletes a merged branch and the ref stays; the
  test of the host merge decides, not the life of the ref.
- **Each case has its own check by its name,** and the cases of the epic are red on the code
  before the edit; a total count would pass with a case missing.
- The «How RT-3276 got there» above is corrected by the first decision: the request of RT-3329,
  not the task's own, brought the copy into the epic.

The role `product-strategist` replayed the history of 19.11 (main `6d78ddc38`, epic `5e50d8d3b`,
the copy on the host `f58ca0746`) with five variants of the condition. The decisions below replace
the matching ones above. Спросить было некого: заход автономный.

- **A branch is dropped for the own copy only when the copy lies on its first-parent line and the
  branch is not under the head.** The test of a host merge left a stack open: T ← U ← V, the owner
  merges V into U on the host, T gets a review commit — U carries the copy of T by a host merge
  and would become the base of T, a branch above it. The first-parent line drops U and keeps the
  epic: on the replay it gives the epic for both tops, and the 23 former cases of SC-AK-1340 and
  SC-AK-1240 print what they printed. Цена ошибки: одно условие вместо цикла по слияниям хоста и
  один случай стопки.
- **A total count of the scenario stands next to the cases by name,** `>= 28`: 20 cases of today
  and 8 new ones. A case removed by mistake is seen by the count; a case missing by name is seen
  by its own check. The number is recounted after the merge of RT-3465 into the chain.
- **A copy that came into the epic by a merge of a session, not of the host, while the task did
  not take the epic in, stays out.** The line of a shift not by the host drops the epic there,
  whatever the condition of the copy; the records since 14.11 hold no such case.
- **The copy of the branch on the host was `f58ca0746`, not `a3b68bbe3`;** the time lost was
  about 33 minutes (09:36Z to 10:09Z), not 25.

The rebuild of 23.11 on the tip of RT-3465. The decisions below replace the matching ones above.

- **The new cases go into the suite of the base, not into the suite of the push check.** The suite
  of the push check stands at 499 lines of the limit of 500; the suite of the base was split off
  by RT-3465 for exactly these scenarios. The former 20 cases of SC-AK-1340 stay where they are:
  recounted on 23.11 after RT-3465, there are 20, and the count `>= 20` there keeps them.

## What is left unclear

- Nothing. The line about a merge of the host does not drop the epic in this history: tried on
  the built repository with that line taken out, the base stays the main branch; with the line of
  the own copy taken out, it is the epic.
