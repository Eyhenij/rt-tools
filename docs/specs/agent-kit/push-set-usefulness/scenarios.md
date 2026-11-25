# Scenarios — the usefulness of the push set checks

The numbers continue the numbering of the package; a changed promise keeps its number.

## The record of a run

### SC-AK-1657 — a run line carries the moment, the base and the subject mark

Given a push set step that runs on a change against a base
When the set records the run
Then the run line holds the content sign, the command checksum, the outcome, the seconds, the
moment, the base checksum and one of `touched`, `idle`, `unknown`

### SC-AK-1658 — a line written before the work counts without the idle runs

Given a run line of four fields
When the report reads it
Then it counts in the runs, the seconds, the refusals and the false refusals, and the idle runs of
its check print «предмет не записан»

## The numbers

### SC-AK-1659 — a red run followed by a green one on the same tree is a false refusal

Given a red run and a later green run of the same command on the same content sign
When the report counts the check
Then the refusals are 1, the false refusals 1, the real refusals 0

### SC-AK-1660 — a red run with no green repeat on the same tree is a real refusal

Given a red run of a command and a later green run of it on another content sign
When the report counts the check
Then the false refusals are 0 and the real refusals 1

### SC-AK-1661 — a step `select` did not start is recorded as not run

Given a step of the push inputs table that reads `tools/check-specs.mjs` and the specs directory,
and a change that edits only a style file
When the set selects its steps
Then the step gets a run line marked `not-run` with zero seconds, and the report counts it apart
from the idle runs

### SC-AK-1662 — the hook scenarios on a branch that edits only the library code run idle

Given the profile subject of the package hook scenarios — the hooks, the checks and the scenarios
of the package — and a change that edits only `projects/agent-kit/src/lib/metrics.ts`
When the set records the run of `nx affected -t test-hooks`
Then the run is marked `idle`

### SC-AK-1663 — the price of a defect is the seconds on one real refusal

Given a check with four runs of 30 seconds and two real refusals
When the report counts it
Then the price of a defect is 60 seconds, and a check with no real refusal prints «ни одного
дефекта»

## The report

### SC-AK-1664 — the report prints the table of the push set checks

Given run marks of three checks over the period
When `agent-kit metrics` runs
Then the report prints a section «Проверки набора» with a line per check: runs and seconds,
refusals, false refusals, idle runs, the price of a defect; the check is named by its command

### SC-AK-1665 — the report names the checks never useful and the falsely refusing

Given a check with runs and no real refusal and a check with two false refusals and one real one
When the report runs
Then the first is listed under «ни разу не отказали по делу» and the second under «ложных больше
настоящих»

### SC-AK-1666 — the week of this machine names the costly falsely refusing checks

Given the run marks of this tree from 11 to 17 November 2026
When `agent-kit metrics --days 7` runs
Then the list «ложных больше настоящих» names the snapshot step of the second kit and the admin
end-to-end suite — 44 false refusals of 57 and 17 of 28

Not covered: the run marks of this machine are outside history and live a month; the report over
them was read by the check of step 2.3 of RT-3283, and SC-AK-1665 holds the same lists on made-up
lines.

### SC-AK-1935 — a red step names the file of its full output and its locale

Given a tree whose set holds a red check that prints sixty lines
When the set runs ahead, or the push guard runs it
Then the refusal names a file that holds all sixty lines, and the locale the step ran under

Covered: `projects/agent-kit/tests/push-ahead-call-guard.test.sh`.

### SC-AK-1667 — one check on two bases is one line

Given runs of `pnpm exec nx affected -t test-hooks` with `--base=origin/main` and with
`--base=origin/RT-1-x`
When the report counts them
Then the table holds one line for the check with the runs of both bases

### SC-AK-1668 — the candidates are ordered by seconds

Given two checks without a real refusal, one of 300 seconds and one of 3
When the report lists the checks never useful
Then the check of 300 seconds stands first
