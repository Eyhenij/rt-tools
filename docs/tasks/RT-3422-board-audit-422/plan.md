# Plan

**Task:** RT-3422 · **Branch:** RT-3422-board-audit-422
**Behaviour:** unchanged — код приложений не меняется. Меняется аудит очереди работ: отставание выкатки он спрашивает запросом, который не строит дифф, а отказ хостинга сравнить печатает заметкой и идёт дальше; правило идёт в описание аудита той же правкой. Слово владельца: «доведи все задачи эпика до завершения».

## Points

- **A:** the work queue audit asks the host to compare the last rolled-out commit with the main
  branch by the REST comparison. The host builds the diff of the whole for it — 300 files even with
  a page of one commit, measured on 21.11 — and sometimes refuses: HTTP 422, «this diff is taking
  too long to generate». Nothing catches it, and the audit dies with a stack before its last lines.
  On 19.11 it fell twice in a row before the PR of a task, at a lag of 274 commits. On 21.11 four
  answers in a row passed, at a lag of 487. The recorded output keeps the fall:
  `grep -c '^Error\|^    at ' projects/agent-kit/tests/fixtures/real-host/.audit.txt` gives 7.
- **This task reaches:** the audit names the lag of production by its number, asked by the GraphQL
  comparison, which counts commits and builds no diff (`behindBy: 487` on 21.11). A refusal of the
  host to compare is a note with the commit and the day of the last rollout, and the audit goes on
  to its last line.
- **Sign:** on the recorded answers of the host the audit prints «production lags … by N commits»
  and its last line, and no stack. On the double, a comparison refused with 422 gives the note, the
  line of the last rollout and the lines after it; a 500 of the comparison and a failure of another
  request break the audit as before.
- **Milestone G of the epic:** fewer than five refusals per hundred commands and no dead end. The
  audit is a step before every PR; when it falls, the step cannot be made. This task removes the
  dead end, not a refusal from the count.
- **Metric:** нет: падение аудита не входит в счёт отказов проверок; признак — сценарии на записанных ответах и на двойнике.

## Task footprint

| What  | Where |
| ----- | ----- |
| Laws  | `docs/constitution/delivery.md`, `docs/constitution/verifiability.md` |
| Rules | `.claude/skills/queue-audit/`, `.claude/skills/agent-kit-source/`, `.claude/skills/spec-driven/` — читаются |
| Code  | `projects/agent-kit/assets/checks/board-runs.github.mjs` |
| Code  | `projects/agent-kit/assets/checks/board-gh.github.mjs` |
| Code  | `projects/agent-kit/assets/checks/check-board.github.mjs` |
| Code  | `projects/agent-kit/tests/checks-board-real.test.sh`, `checks-board.test.sh`, `lib-board.sh` |
| Code  | `projects/agent-kit/tests/fixtures/real-host/` — новые записанные ответы, `.audit.txt`, `.audit.code` |
| Specs | `docs/specs/agent-kit/work/`, `docs/specs/agent-kit/hooks/scenarios.md` |
| Code  | `tools/board-runs.mjs`, `tools/board-gh.mjs`, `tools/check-board.mjs` — разложенные копии, их пишет раскладка |

## What counts as done

- The lag is asked by the GraphQL comparison of the main branch with the rolled-out commit; the
  number is `behindBy`. No diff is built.
- A refusal of that comparison with HTTP 422 or «diff is taking too long» is caught inside the
  measure of the lag, not around the block: the lag returns the rollout with a mark and the words of
  the host. The audit prints one note — production was not compared with the main branch, the commit
  and the day of the last rollout, the words of the host. The note is not a divergence.
- Any other failure of the comparison — a 500, no rights, a commit that is gone — and a failure of
  any other request break the audit as before.
- The line of the last rollout, the last run of the main branch and the count are printed after the
  note.
- The double of the host in the suite of the audit has a mode in which the comparison is refused
  with 422 and a mode with 500.
- The recorded answers hold the GraphQL comparison and the state of the last rollout, each one real
  answer read under the machine token in the form of the recorder; the other recorded answers are
  not recorded anew. The recorded output and its code are written from the replay and hold no stack.
- `SC-AK-1600` waits for the result of the audit. The scenario of the note `SC-AK-1796` stands in
  the description of the audit, with its rules.
- The laid-out copies match the package.

## Stages

### 1. The lag is counted without a diff, and a refusal is a note

Rules: the lag is asked by the GraphQL comparison. The measure of the lag catches only 422 and «diff
is taking too long» and returns the rollout with the mark and the words of the host; the caller
prints the note and calls the state of the last rollout outside that catch. The double gets the two
modes of a refused comparison. The suites run the laid-out copy, so the package is built and laid
out inside this stage, before its checks.

- **Steps:**
    1. On the double a 422 of the comparison gives the note with the commit and the day
       Check: `VERBOSE=1 bash projects/agent-kit/tests/checks-board.test.sh 2>&1 | grep -c '^ *ok .*SC-AK-1796 — заметка'` → >= 1
    2. On the double the line of the last rollout and the count follow the note, the code is 0
       Check: `VERBOSE=1 bash projects/agent-kit/tests/checks-board.test.sh 2>&1 | grep -c '^ *ok .*SC-AK-1796 — строки после'` → >= 1
    3. On the double a 500 of the comparison and a failure of another request break the audit
       Check: `VERBOSE=1 bash projects/agent-kit/tests/checks-board.test.sh 2>&1 | grep -c '^ *ok .*SC-AK-1796 — другой отказ'` → >= 2
    4. On the recorded answers the audit names the lag by a number and prints its last line
       Check: `VERBOSE=1 bash projects/agent-kit/tests/checks-board-real.test.sh 2>&1 | grep -c '^ *ok .*SC-AK-1600 — аудит очереди называет отставание числом'` → >= 1
    5. The recorded output holds no stack
       Check: `grep -c '^Error\|^    at ' projects/agent-kit/tests/fixtures/real-host/.audit.txt | cat` → = 0
- **Readiness sign:** both suites end with 0 failures under node 22 and under node 20; the five
  lines stand in the progress.
- **Verified by:** `bash projects/agent-kit/tests/checks-board-real.test.sh`,
  `bash projects/agent-kit/tests/checks-board.test.sh` — exit 0 each; `pnpm run agent-kit:check` —
  exit 0.

### 2. The description

Rules: the description of the audit gets two rules — the lag is counted by the GraphQL comparison,
and a comparison the host refused is a note. `SC-AK-1600` loses the words about the fall; the
scenario of the note gets its number and its bindings.

- **Steps:**
    1. `SC-AK-1600` no longer waits for the fall
       Check: `grep -c 'fall on the comparison answer 422' docs/specs/agent-kit/hooks/scenarios.md | cat` → = 0
    2. The scenario of the note stands in the description of the audit
       Check: `grep -c '^### SC-AK-1796' docs/specs/agent-kit/work/scenarios.md` → = 1
- **Readiness sign:** both counts hold, and the coverage check is green.
- **Verified by:** `npm run check:spec-coverage` — exit 0. A live `node tools/check-board.mjs` is an
  observation only: on 21.11 the full comparison passed on the old code too.

## What this work does not do

- It does not lift the lag itself: 487 commits wait for a rollout, and the rollout is started by
  the owner. After this task the audit says so before every PR, and stays red until the rollout.
- It does not touch the second comparison of the audit — how far a PR is behind its base. That one
  swallows a failure and returns zero; a silent skip the rule `queue-audit` forbids. A task of its
  own.
- It does not retry beyond what the reader of the host already does.
