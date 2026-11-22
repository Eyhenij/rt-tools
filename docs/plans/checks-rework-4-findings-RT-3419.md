# Находки RT-3419 — ожидание долгой задачи вместо «стоп»

Продолжение файла `docs/plans/checks-rework-4-findings.md`: он дошёл до предела длины. Здесь —
находки ревью RT-3419, которые лежат вне следа её одобренного плана. Каждая ждёт решения владельца:
отдельная задача или нет.

## RT-3419 — a wait of the session's own long task instead of a stop word

- **An agent that handed its report back ends with no event the record reads.** The host writes
  its end as an `attachment` of the kind `task_status` with the status `completed`; the session
  source reads only `<task-notification>`. On 18.11 one such role stood open for 391 stops. RT-3419
  leaves agents out of the hung tasks, so past the bound such an agent counts as no task.
  **Address:** `projects/agent-kit/assets/task-flow/source/session.mjs:taskOver` reads a
  `task_status` with a final status as the end of the task, with a scenario.
  **Metric:** stops with an agent open past its report, from 391 over 14–22.11 down to 0.
- **A tree whose override names the removed word keys loses the exit guard with no message.**
  `WORD_KEYS` no longer holds `stop`, `stopExcept`, `holdAfter`, and the release case `stopWord` is
  gone. An override that sets or removes them now raises `FlowModelError`, and the exit guard fails
  open. This tree has no such override. **Address:** the release notes of the package edition name
  the removed keys, or the model reads them as retired with a warning. **Metric:** trees on the new
  edition whose exit guard fails open, down to 0.
- **A chained server command is read as a server.** `pnpm run serve:auth && pnpm run
  check:auth-stand` ends by itself, yet the pattern `SERVER` of `measure/session.mjs` takes it as a
  server: in the background it releases no stop. **Address:** a server is a command whose last part
  is a server. **Metric:** background commands misread as servers, down to 0.
- **The bindings of two model-check cases name common words.** `ask-judge.md:bare` and
  `turn-judge.md:notice` pass the anchor check while the case they bind is gone. **Address:**
  an anchor the check finds only in the case itself, or a marker comment next to the case.
