# Plan

**Task:** RT-3417 · **Branch:** RT-3417-stop-hook-time
**Behaviour:** unchanged — правка хука на конце хода и его настройки; код приложений не меняется. Слово владельца: «делай всё сам».

## Points

- **A:** at the end of every turn the agent waits for the model judge on Stop. Since its first run,
  14.11 15:55 UTC, the records `stop_hook_summary` hold 188 runs with a duration: median 37,1 s,
  the tenth decile 56,9 s, the longest 97,1 s; 45 more runs carry no duration — 33 refusals and 12
  runs of about 126 s, the timeout of 120 s. The bound of the plan of RT-3276 is 20 s. The judge
  searches the whole session record on every turn end, and the records reach 273 MB. The replay of
  the tree, `projects/agent-kit/tests/judge-replay.mjs`, hands the judge the turn inside its prompt
  with no tools: it checks verdicts, not the time of a hook that reads the record itself.
- **This task reaches:** the judge answers within 20 s at the median and gives the same verdicts:
  the turns it must let end end, the turns it must hold — a promise with no work among them — are
  held.
- **Sign:** the replay run the way the hook runs — its prompt, the record on disk, the tools Read,
  Grep and Glob — gives 0 divergences, short and in front of a real session record; the live runs on
  this branch after the edit have a median of at most 20 s and no more timeouts than the base.
- **Milestone G of the epic:** fewer than five refusals per hundred commands and no deadlock. This
  task moves no refusal; it cuts the wait at every turn end and keeps the refusals the judge gives.
- **Metric:** время хука на конце хода: вниз. Base — 233 runs since 14.11 15:55 UTC: median 37,1 s
  over the 188 with a duration, 12 timeouts. Judged by the runs of the week after the merge of the
  epic into `main`, counted the same way, with the count of `BLOCKED by turn-judge:` per hundred turn
  ends against the base of the archive of RT-3276. Inside the task the live sign is the runs on this
  branch.

## Task footprint

| What  | Where |
| ----- | ----- |
| Laws  | `docs/constitution/work-conduct.md`, `docs/constitution/verifiability.md` |
| Rules | `.claude/skills/turn-conduct/`, `.claude/skills/agent-kit-source/`, `.claude/skills/spec-driven/` |
| Code (правится) | `projects/agent-kit/tests/judge-replay.mjs` |
| Code (правится) | `projects/agent-kit/tests/turn-replay.expected.json` |
| Code (правится) | `projects/agent-kit/assets/hooks/turn-judge.md` |
| Code (правится) | `.claude/settings.json` |
| Code (правится) | `docs/specs/agent-kit/turn-guards/flow-script/step-mark/` |

## What counts as done

- The replay has a mode that runs the judge the way the hook runs it and prints the time of each
  case; the expected verdicts of the judge hold at least four turns to hold, the two promises with
  no work of step 2.5 of RT-3276 (`1447`, `1461`) among them. The ten turns of that step are lost;
  their classes are the fixtures `1456`–`1461` and `1447`, `1450`, `1451`.
- On the text and the setting that ship, that mode gives 0 divergences, short and in front of a real
  session record of at least 80 MB, and a median of at most 20 s on the short run.
- The live runs on this branch after the edit, picked by the prompt of the new hook declaration:
  at least ten, median at most 20 s, timeouts no more than one in twenty.
- The text of the judge stays one package resource; the hook declaration copies none of its rules.

## Stages

### 1. The replay runs the judge as the hook does

Rules: the mode `--as-hook` writes the recorded turn as a session record by `recordOf`, gives the
judge the prompt of the hook declaration with the hook input — `transcript_path`, `cwd`,
`last_assistant_message`, `stop_hook_active` — and the tools Read, Grep and Glob, names the model
it ran on and prints the seconds of each case. `--pad` puts a real session record in front of the
turn. `--live` reads the runs of the judge from the session records of the current branch after
the last commit of the hook, picked by the prompt of the declaration, with the refusals and the
timeouts that carry no duration timed by their records. The mode gets its scenario in the spec of
the replay in the same commit.

- **Steps:**
    1. The expected verdicts hold the promises with no work
       Check: `jq '[.[] | select(.judge == "block")] | length' projects/agent-kit/tests/turn-replay.expected.json` → >= 4
    2. The judge run as the hook gives the expected verdicts on the text as it stands
       Check: `node projects/agent-kit/tests/judge-replay.mjs --as-hook | tail -1 | awk '{print $2}'` → = 0
- **Readiness sign:** the mode prints a line per case with its seconds, then
  `as-hook <divergences> median <s> model <id>`; the time of this run is the calibration before any
  edit.
- **Verified by:** the mode itself and `bash projects/agent-kit/tests/turn-replay.test.sh` — exit 0.

### 2. The judge answers within the bound

Rules: the round trips of the judge are cut first — the reads of the session record are what a
verdict needs; the hook declaration names a faster model only if the mode keeps 0 divergences on
it, short and in front of a real session record. The text of the judge stays one package resource:
the declaration may order the first calls, never the verdict rules.

- **Steps:**
    1. The edited judge gives the expected verdicts in front of a real session record
       Check: `node projects/agent-kit/tests/judge-replay.mjs --as-hook --pad "$(ls -S ~/.claude/projects/-Users-eyhenij-WebstormProjects-rt-tools/*.jsonl | sed -n 3p)" | tail -1 | awk '{print $2}'` → = 0
    2. The edited judge stays within 20 s at the median with no divergence
       Check: `node projects/agent-kit/tests/judge-replay.mjs --as-hook | tail -1 | awk '{print ($2 == 0 && $4 != "" && $4 <= 20) ? 1 : 0}'` → = 1
- **Readiness sign:** both runs print `as-hook 0`, the short one a median of at most 20 s.
- **Verified by:** the runs and `pnpm run agent-kit:check` — exit 0 both.

### 3. The live runs

- **Steps:**
    1. The live runs on this branch after the edit stay within the bound
       Check: `node projects/agent-kit/tests/judge-replay.mjs --live | tail -1 | awk '{print ($2 >= 10 && $4 <= 20 && $6 * 20 <= $2) ? 1 : 0}'` → = 1
- **Readiness sign:** the line `live <runs> median <s> timeouts <n>` with at least ten runs.
- **Verified by:** the live line.

## What this work does not do

- The verdict rules of the judge are not changed: what it lets end and what it holds stays.
- The question judge on the menu tool (`ask-judge`) is not touched.
- The consumers of the package get no hook declaration (RT-3421).
- The week after the merge is not measured inside the task: the metric judges it.
