# The product metrics of the rules package — where the rules are carried out

The first column is the rule verbatim, as it is written in the "Rules" section of the spec next to
it. A rule without a line and a line without a rule are a divergence: the spec promises what is not
in the code, or the code holds what the spec is silent about.

The day line at the intake and the section «Качество» have rules of their own, bound in
`docs/specs/message-bus/usage/implementation.md`. The rules of the loop are about how work is done,
so the pattern of the cycle carries them, and the anchor there is the word that holds the statement.

## The metrics

- **First-pass acceptance is the main metric of the package.** — `projects/agent-kit/src/lib/outcomes.ts:outcomeLines` — the line stands first in the report of one tree; over the trees it is `libs/message-bus-api/observations/util/src/lib/quality.util.ts:firstPassOf`
- **A request without a handover sign counts apart.** — `projects/agent-kit/src/lib/outcomes.ts:outcomeOf` — the outcome `no-handover`; `projects/agent-kit/src/lib/outcomes.ts:outcomeLines` names how many there are
- **A merge is not yet an acceptance by a person.** — `projects/agent-kit/src/lib/outcomes.ts:correctedInTime` — the three days are `projects/agent-kit/src/lib/outcomes.ts:SETTLE_DAYS`, and a younger request waits in `projects/agent-kit/src/lib/outcomes.ts:collectLocked`
- **A revert takes first-pass away.** — `projects/agent-kit/src/lib/outcomes.ts:lostBy` — the term is `projects/agent-kit/src/lib/outcomes.ts:LOST_WITHIN_DAYS`
- **Three result metrics follow the mission.** — `libs/message-bus-api/observations/util/src/lib/quality.util.ts:qualityOf` — the fields `firstPass`, `corrections` and `repeats` of one answer
- **A repeated mistake is counted against the version that carries its fix.** — `libs/message-bus-api/observations/util/src/lib/quality.util.ts:repeatsOf` — the day of installing the fix is `libs/message-bus-api/observations/util/src/lib/quality.util.ts:installedOn`
- **Texts are judged by four numbers, read together.** — `projects/agent-kit/src/lib/metrics.ts:metricsLines` — the edits and the exams come from `projects/agent-kit/src/lib/metric-usage.ts:usageLines`, the dead rules from `projects/agent-kit/src/lib/metrics.ts:deadRuleLines`
- **A guard declares the rule it enforces.** — `projects/agent-kit/assets/hooks/guard-note.sh:RT_GUARD_RULE` — the count is `projects/agent-kit/src/lib/metric-usage.ts:refusalsAfterLoad`, and the gate refusal stays out in `projects/agent-kit/src/lib/metric-usage.ts:editsRefusedOf`
- **Guards are judged by empty refusals and by minutes.** — `projects/agent-kit/src/lib/metrics.ts:guardsOf` — the refusals, with the sign from `projects/agent-kit/assets/hooks/metric-marks.sh:rt_refusal_empty`; the minutes are `projects/agent-kit/src/lib/metrics.ts:runsOf`
- **Roles and commands are judged by calls and verdicts.** — `projects/agent-kit/src/lib/metric-usage.ts:callsOf` — the verdict is read when a role ends by `projects/agent-kit/assets/hooks/role-calls.sh:rt_verdict_of`, and the name by `projects/agent-kit/assets/hooks/role-calls.sh:rt_called_name`
- **A report names its own completeness.** — `libs/message-bus-api/observations/util/src/lib/quality.util.ts:completenessOf`
- **A metric has no target until it has a baseline.** — `projects/agent-kit/assets/patterns/task-flow-cycle.md:baseline` — a task names a direction, not a target

## What a tree records

- **Only numbers and package names leave a tree.** — `projects/agent-kit/src/lib/metric-lines.ts:dayMetrics` — the day line is built here alone; a name the package does not ship is replaced by `projects/agent-kit/src/lib/metric-lines.ts:nameOf`
- **The tree counts by itself.** — `projects/agent-kit/assets/hooks/metric-marks.sh:rt_marks_dir` — the ignored directory; `projects/agent-kit/assets/hooks/metric-marks.sh:rt_run_note` keeps the sign there and writes only the answer into the observation
- **A number is judged by its shape.** — `projects/agent-kit/src/lib/cargo.ts:isMetricValue` — the sender filters by it and by `projects/agent-kit/src/lib/cargo.ts:isMetricKey` in `projects/agent-kit/src/lib/metric-lines.ts:dayMetrics`; the intake refuses in `libs/message-bus-api/observations/util/src/lib/metrics-day.util.ts:parseMetricsDay`
- **A person's message is counted by a hook, and the executor takes no part.** — `projects/agent-kit/assets/hooks/owner-corrections.sh:RT_CORRECTION_PATTERNS` — the counter line is `projects/agent-kit/assets/hooks/metric-marks.sh:rt_correction_mark`
- **Every run of a check writes one line.** — `projects/agent-kit/assets/hooks/metric-marks.sh:rt_run_note` — called by `projects/agent-kit/assets/hooks/push-set.sh:rt_run_note` for the gate and the git hook, and by `projects/agent-kit/assets/hooks/git-guard-push-ahead.sh:rt_run_note` for the run ahead
- **A content sign covers uncommitted edits.** — `projects/agent-kit/assets/hooks/metric-marks.sh:rt_tree_sign`
- **An outcome is read by the sending, not at the merge.** — `projects/agent-kit/src/lib/outcomes.ts:collectOutcomes` — the profile is asked by `projects/agent-kit/assets/hooks/pull-outcomes.sh:rt_pull_outcomes`, the default is `projects/agent-kit/assets/defaults/project.sh:rt_pull_outcomes_default`, and the two keys are set in `projects/agent-kit/src/lib/metric-send.ts:factsOf`
- **A request is counted once.** — `projects/agent-kit/src/lib/outcomes.ts:newOutcomes` — the shared store is `projects/agent-kit/src/lib/outcomes.ts:sharedMarksDir` and `projects/agent-kit/assets/hooks/metric-marks.sh:rt_shared_marks_dir`, the lock stands in `projects/agent-kit/src/lib/outcomes.ts:collectOutcomes`

## What sends it

- **Guards start the sending, and the agent sends at the end of every session.** — `projects/agent-kit/assets/hooks/observe.sh:rt_note` — a guard starts it with its record; the three session events are `projects/agent-kit/assets/hooks/metric-send-start.sh:SessionEnd`
- **A guard never waits for the network.** — `projects/agent-kit/assets/hooks/observe.sh:rt_send_start`
- **A copy tries at most once in 15 minutes.** — `projects/agent-kit/src/lib/metric-send.ts:SEND_EVERY_MS` — judged in `projects/agent-kit/src/lib/metric-send.ts:tooEarly`, with the flag `--session-end` read in `projects/agent-kit/src/bin/agent-kit.ts:sendMetrics`
- **The window runs from the last success, at most the keeping term.** — `projects/agent-kit/src/lib/metric-send.ts:windowDays`
- **A send holds a lock of its copy, and a second one exits.** — `projects/agent-kit/src/lib/metric-send.ts:sendMetrics` — the lock is `projects/agent-kit/src/lib/file-lock.ts:takeFileLock`
- **The numbers of a tree are kept with the day they were counted on.** — `projects/agent-kit/src/lib/metric-send-mark.ts:factsByDay` — written by `projects/agent-kit/src/lib/metric-send.ts:sendLocked`; the failure code stays by `projects/agent-kit/src/lib/metric-send.ts:faultOfDay`
- **A day leaves under the version of its records.** — `projects/agent-kit/src/lib/metric-send.ts:versionOfDay`
- **The first-pass count of a line is gross.** — `projects/agent-kit/src/lib/metric-lines.ts:outcomeNumbers` — the difference is taken in `libs/message-bus-api/observations/util/src/lib/quality.util.ts:firstPassOf`
- **A refused line closes its own day only.** — `projects/agent-kit/src/lib/metric-send.ts:stopsTheWindow`
- **The automatic sending has no path to proposals, analyses or the digest.** — `projects/agent-kit/src/lib/metric-send.ts:shipLine` — the only call out, and it names the operation `metrics`
- **A tree without an intake address and a token file sends nothing.** — `projects/agent-kit/src/lib/metric-send.ts:sendMetrics` — the start is marked before the process in `projects/agent-kit/assets/hooks/observe.sh:rt_send_start`
- **A copy without a build of the package asks the main copy.** — `projects/agent-kit/assets/hooks/observe.sh:rt_send_command` — what is missing is named by `projects/agent-kit/assets/hooks/observe.sh:rt_send_fault_line`
- **Enrolled trees send by default, and the change is named.** — `projects/agent-kit/src/lib/config.ts:send` — the default; `projects/agent-kit/src/lib/metric-send-mark.ts:sendEnrolledLines` names it at the layout, and `projects/agent-kit/assets/hooks/observe.sh:rt_send_keys_note` records a change of the key. The release note is a line of the journal assembled from the commit
- **A failed send leaves a trace.** — `projects/agent-kit/src/lib/metric-send.ts:failed` — named by `projects/agent-kit/src/lib/metric-send-mark.ts:sendFaultLines` and `projects/agent-kit/assets/hooks/observe.sh:rt_send_fault_line`
- **A refused token stops the tries.** — `projects/agent-kit/src/lib/metric-send.ts:tooEarly` — the sum of the refused token is set in `projects/agent-kit/src/lib/metric-send.ts:failed`
- **A run marked as a test sends nothing.** — `projects/agent-kit/assets/hooks/observe.sh:RT_KIT_TEST`
- **The observations directory is refused to direct edits.** — `projects/agent-kit/assets/hooks/rule-source-guard.sh:observations` — the two keys are refused in the same place

## The loop

- **The report of a cycle is the section over all enrolled trees.** — `libs/message-bus-api/observations/util/src/lib/quality.util.ts:qualityOf` — the partial view names what is outside it by `projects/agent-kit/src/lib/metrics.ts:OUTSIDE_THE_TREE`
- **The partial view names what it read.** — `projects/agent-kit/src/lib/metrics.ts:metricsLines` — the sentence for a silent tree is `projects/agent-kit/src/lib/commands.ts:noObservationLines`, the cut list `projects/agent-kit/src/lib/metrics.ts:topLines`, the dead rules `projects/agent-kit/src/lib/metrics.ts:coversFullPeriod`
- **A cycle begins with the report.** — `projects/agent-kit/assets/patterns/task-flow-cycle.md:worst`
- **One task changes one thing and names the metric it should move.** — `projects/agent-kit/assets/patterns/task-flow-cycle.md:direction`
- **A release of the package does not start without its metric.** — `tools/release-metric.mjs:lineOf` — the required field and the call are `.github/workflows/publish-agent-kit.yml:RELEASE_METRIC`
- **A cycle compares the same trees.** — `projects/agent-kit/assets/patterns/task-flow-cycle.md:themselves` — the same tree and version are narrowed by `libs/message-bus-api/observations/util/src/lib/quality.util.ts:narrowed`
- **The role `goal-critic` gives the verdict from the numbers of the report.** — `projects/agent-kit/assets/patterns/task-flow-cycle.md:goal-critic`
