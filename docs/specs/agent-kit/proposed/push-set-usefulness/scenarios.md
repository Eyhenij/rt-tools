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

### SC-AK-1661 — a run on a change that does not touch the subject is idle

Given a step of the push inputs table that reads `tools/check-specs.mjs` and the specs directory,
and a change that edits only a style file
When the set records the run
Then the run is marked `idle`, and the report counts one idle run for the check

### SC-AK-1662 — an `nx affected` step is judged by the roots of its projects

Given an `nx affected` step over the package project and a change that edits only a file of the
admin application
When the set records the run
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

### SC-AK-1666 — the week of this machine names at least one candidate

Given the run marks of this tree from 11 to 17 November 2026
When `agent-kit metrics --days 7` runs
Then at least one check is listed as a candidate to remove from the set or to move to the pipeline
