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
- **A tree whose override names the removed release case loses the exit guard with no message.**
  The word keys `stop`, `stopExcept` and `holdAfter` are retired in RT-3419 itself: the model reads
  them as nothing and the engine names them. The release case `stopWord` is not: an override that
  removes it by `null` is refused by `flow-override.mjs` (outside the footprint), «null removes
  nothing», and one that sets it names the gone measurer `measure.owner.saidStop`. Then the exit
  guard fails open. This tree has no such override. **Address:**
  `projects/agent-kit/assets/checks/flow-override.mjs:mergeOverride` drops a retired release key
  with a line, as `flow-data.mjs:retiredLines` does for the words. **Metric:** trees on the new
  edition whose exit guard fails open, down to 0.
- **The bindings of two model-check cases name common words.** `ask-judge.md:bare` and
  `turn-judge.md:notice` pass the anchor check while the case they bind is gone. **Address:**
  an anchor the check finds only in the case itself, or a marker comment next to the case.
