# Grill

**Описание фичи:** не нужно — правка сверки очереди работ и её описания; код приложений не меняется.

## The owner request

> я ухожу спать, переключайся в ночной автономный режим, доведи все задачи эпика до завершения и сам эпик до пр в main

The owner's word of 19.11.2026 for the night; the task is row 21 of the plan of the epic RT-3302.
The card (issue #3422): the work queue audit `node tools/check-board.mjs` falls with a stack and
prints no result. It compares the deployed version with the main branch, and the host answers
«Sorry, this diff is taking too long to generate» (HTTP 422). Nothing catches the error, the whole
audit breaks off, and there is nothing to run before the PR of a task. On 19.11 it fell twice in a
row. The scenario `SC-AK-1600` records the fall as a finding. The card asks: the answer 422 does
not break the audit; the line about the lag of the rollout names that the comparison failed, the
other lines are printed; `SC-AK-1600` waits for the result of the audit, not for the fall.

## What the tree already has

- **The comparison.** `projects/agent-kit/assets/checks/board-runs.github.mjs:deployLag` finds the
  last successful rollout and asks the host to compare its commit with the main branch; it reads
  one number of the answer, how many commits the branch is ahead.
- **The caller.** `check-board.github.mjs` calls it inside a `try` that catches one kind of error,
  the offline one, and prints «production was not checked — …» as a note, not as a divergence. Any
  other error is thrown on, and the audit dies before its last lines: the state of the last
  rollout, the last run of the main branch, the count of divergences.
- **The scenario.** `projects/agent-kit/tests/checks-board-real.test.sh` replays the recorded
  answers of the host. The recorded output `fixtures/real-host/.audit.txt` ends with the stack of
  the fall, and the case «аудит очереди падает на ответе 422» counts the words of the host in it.
- **The stack ties the suite to one version of the runtime.** The recorded stack names the lines
  of node 22.22.3. Under node 20 the same replay prints other lines, and the case «аудит очереди
  на настоящих ответах» is red: 9 ok, 1 failure, measured on this branch before any edit.
- **The laid-out copies.** `tools/board-runs.mjs` and `tools/check-board.mjs` are written by the
  layout from the package.

## What the rules already say

- The rule `queue-audit`: the audit names what it could not judge; a silent skip is
  indistinguishable from a broken audit.
- The rule `spec-driven`: a scenario and its test title change together.

## Questions and answers

None. The card names the condition and the sign.

## Decisions

- **The lag is measured, not excused.** The refusal is a consequence of the lag: production is 274
  commits behind, and the host cannot build a diff of 1278 files. A note alone would let the audit
  end green in the very state the line was written for. The same request with a page of one commit
  answers with the number in 2,4 seconds — measured on 19.11 against the live host, a read. The
  audit asks so. The role `goal-critic` showed the cause on the first draft of the plan, which
  only printed a note.
- **A comparison the host still refuses is a note, not a divergence.** The note carries the commit
  and the day of the last rollout and the words of the host. Only the refusal «the host could not»
  is caught; no rights and a commit that is gone break the audit as before, and so does a failure
  of any other request. Спросить было некого: заход автономный. Цена ошибки: если владелец решит
  считать заметку расхождением, меняется одна строка вызова.
- **Two real answers are added to the recorded ones.** The record of the host broke off at the
  fall, so it holds no answer for the request after the lag — the state of the last rollout — and
  none for the new form of the comparison. Each is read once under the machine token and written
  in the form of the recorder. A full new record is not made: it would wipe the 43 answers.
- **The recorded output is written anew from the replay.** It holds the lag by its number and the
  last lines of the audit, and no stack; the suite no longer depends on the version of the
  runtime.
- **The refused comparison and the failure of another request are shown on the double** of the
  host the suite of the audit already has: the record holds one kind of answer only.

## What is left unclear

- Whether the host answers 422 every time for this pair of commits or only under load. The audit
  does not need to know: the note is printed either way.
