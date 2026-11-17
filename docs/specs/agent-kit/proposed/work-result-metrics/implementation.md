# Binding — the metrics of the work result

A statement of the spec and the place where it is carried out. The link goes by the text of the
statement: a removed statement is removed together with its line. Statements with no line yet are
carried out by later stages of the work.

- **Calls, refusals, the owner's words, interrupts and re-asks are counted from the session record, not from the observations.** — `projects/agent-kit/assets/checks/record-count.mjs:eventsOf` — the events of the entries of a record; scenario `SC-AK-1612`
- **The hook at the end of a turn counts, and it writes observations.** — `projects/agent-kit/assets/hooks/record-turn.sh:counter` — on Stop and SessionEnd; `projects/agent-kit/assets/checks/record-turn.mjs:observationsOf` — one line per event, by the day of its moment; scenario `SC-AK-1611`
- **The hook keeps a mark per session.** — `projects/agent-kit/assets/hooks/record-turn.sh:marks` — the mark `record-<sign>.json` in the marks directory; `projects/agent-kit/assets/checks/record-turn.mjs:readFrom` — the offset read; scenario `SC-AK-1641`
- **An unfinished last line of the record waits for the next turn.** — `projects/agent-kit/assets/checks/record-turn.mjs:readFrom` — the offset stops at the last whole line; scenario `SC-AK-1641`
- **A broken line in the middle of the record is skipped and counted.** — `projects/agent-kit/assets/checks/record-turn.mjs:readFrom` — the skipped count; the observation `rec-skip`; scenario `SC-AK-1642`
- **The stop refusal of a turn is counted by the next count.** — `projects/agent-kit/assets/hooks/record-turn.sh:record` — the SessionEnd count reads the line written after the stop hooks; scenario `SC-AK-1643`
- **The counting never fails the turn.** — `projects/agent-kit/assets/checks/record-turn.mjs` — every path exits with zero, a read that broke writes `rec-broken`; scenario `SC-AK-1629`
- **An observation keeps the moment of each call and each refusal, with its class, check and branch.** — `projects/agent-kit/assets/checks/record-turn.mjs:observationsOf` — the moment, the kind, the check and the task key of the branch; scenario `SC-AK-1611`
- **The cut is rebuilt from the full record, and it keeps what the counter reads.** — `projects/agent-kit/tests/real-data/cut-record.mjs:cutEntry` — the session, the branch, the queued messages, the opening of a refusal and the re-ask sign; scenario `SC-AK-1611`
- **The owner's words are counted per message, and a wrapper of the harness is never counted.** — `projects/agent-kit/assets/checks/record-count.mjs:typedOf` — a typed or a queued message of a person; `projects/agent-kit/assets/checks/record-count.mjs:ownerWords` — a queued message repeated by a typed one counts once; scenarios `SC-AK-1610`, `SC-AK-1650`
- **Owner corrections are matched among the owner's words.** — `projects/agent-kit/assets/checks/record-count.mjs:corrections` — the set of patterns of the hook that declares it; scenario `SC-AK-1620`
- **Pairs of refusals are counted by the ordered pair of checks.** — `projects/agent-kit/assets/checks/record-count.mjs:pairsOf` — two different checks with no successful call between; scenario `SC-AK-1614`
- **Idle time is counted in whole minutes per stretch, and a stretch belongs to the day it started.** — `projects/agent-kit/assets/checks/record-count.mjs:idleOf` — from a refusal to the next change of the tree; scenarios `SC-AK-1616`, `SC-AK-1617`, `SC-AK-1648`
- **A re-ask is told by the beginning of the question.** — `projects/agent-kit/assets/checks/record-count.mjs:isReask` — the fixed set `REASK` over the first `REASK_SPAN` characters; `projects/agent-kit/assets/checks/record-count.mjs:reasksOf` — after an answered menu question of the same task; scenario `SC-AK-1619`
- **An interrupt is counted per entry.** — `projects/agent-kit/assets/checks/record-count.mjs:eventsOf` — the event `interrupt`; scenario `SC-AK-1620`
- **A past day is counted by a one-off recount of the saved session records, by the same counter.** — `projects/agent-kit/assets/checks/record-recount.mjs:recount` — a day the hook counted is left, an earlier recount of the day is replaced; `projects/agent-kit/assets/checks/record-recount.mjs:recordsOf` — the records of the tree by the working directory or by the branches, read line by line; scenario `SC-AK-1632`
- **A dead end is a series the executor could not leave.** — `projects/agent-kit/assets/checks/record-count.mjs:deadEndsOf` — `DEAD_END_SERIES` refusals of one check within `DEAD_END_GAP_MS`; scenario `SC-AK-1625`
