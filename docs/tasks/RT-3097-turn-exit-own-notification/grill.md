# Grill

## The owner request

> RT-3097 (Рекомендуется)

The owner picked it from three described tasks; the other options were RT-3084 (one icon input in
the second kit) and RT-3088 (measure the domain spec before the merge of an agreement). The task
body: the turn exit guard refuses a turn woken by a notification about the session's own
background agent, while that agent still runs.

## What is already in the tree

- The guard is `projects/agent-kit/assets/hooks/turn-exit-guard.sh`; the turn record is parsed by
  `projects/agent-kit/assets/hooks/turn-exit-verdict.sh`. The scenarios are
  `projects/agent-kit/tests/turn-exit-guard.test.sh`, the spec is
  `docs/specs/agent-kit/turn-guards/exit/`.
- Reproduced in this session's record: a notification that wakes an idle session is written as a
  record of the owner's role with `origin.kind = "task-notification"` and the text
  `<task-notification>…<tool-use-id>…<status>…`. The parser takes it as the owner's remark, the
  turn holds no tool call, and the guard refuses it as empty — five refusals in one hour.
- A notification that arrives in the middle of a turn is written as an attachment and starts no
  turn; only the waking one does.
- The spec already has «A service message neither starts a turn nor is a word of the owner» and «A
  launch in the background is never the last action of a turn».

## Questions and answers

The owner took the recommended answer twice in a row («Отдельная задача (Рекомендуется)», then
«RT-3097 (Рекомендуется)»), so the six questions are closed by assumption:

- **Does the task change the behaviour** — yes, of the guard in the package; no application code.
- **Does it need an edit of a law or a rule** — no: the spec of the guard gains one rule.
- **One task or several** — one.
- **What is not part of the task** — the neighbouring case «a question to the owner and the guard
  refuses again» (no reproduction in the task body) and RT-3067.
- **What shows the task is closed** — a scenario: an empty turn woken by a notification while
  another own background task runs passes; the same turn when nothing else runs is refused as
  before; the guard suite is green.
- **The sample** — the service-message sign `is_service` in the parser.

## Decisions

- **The release holds only while another own background task runs.** A notification about the
  last task asks the executor to act on its result, and that turn is judged as before. Rejected:
  treating every notification as a service message — the turn after the last result would then be
  judged together with the previous one and released by its work.
