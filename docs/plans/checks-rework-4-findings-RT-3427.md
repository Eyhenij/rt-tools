# Находки RT-3427 — длинные правила помещаются в выдачу проверки правил

Продолжение файла `docs/plans/checks-rework-4-findings.md`: он дошёл до предела длины. Здесь —
то, что RT-3427 не закрыла в пределах своего одобренного плана. Каждая находка ждёт решения
владельца: отдельная задача или нет.

## RT-3427 — nine long rules fit into the rules gate delivery

- **Three rules keep 15 losses of the blind retelling: the step limits leave no room to put them
  back.** observability keeps 9 losses at 4791 of 4800 characters, epic-flow keeps 2 at 2987 of
  3000, and task-delivery-loop keeps 4 at 2995 of 3000. Each loss stands whole in the rule's cold
  part. The critic's wording to put back for each one goes with the task's
  archive record. The limit of observability comes from the gate: on a
  `process.env` edit of a receiver service the gate delivers it with `typescript-conventions` and
  `reuse-first`. Their total is judged at about 9 940 of 10 000 characters. A fresh critic in each
  round found new losses where the previous one found none: three rounds gave 14 → 9 for
  observability. **Address:** a decision of the owner, one of three. Split observability into two
  rules. Raise the limits of epic-flow and task-delivery-loop and check the probe again. Or keep
  these losses in the cold part, the way step 3.2 of RT-3427 now records them.
