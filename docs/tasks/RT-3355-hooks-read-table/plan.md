# Plan

**Task:** RT-3355 · **Branch:** RT-3355-hooks-read-table
**Behaviour:** unchanged — the edit moves the decisions of the package hooks into one decider; no
application code is touched, and every check keeps the decisions it makes today.

After it is written this file is not edited. A stage revision goes to `progress.md` as a decision
along the way.

## Points

- **A:** each deciding hook of the package decides by its own bash conditions and writes its own
  refusal text; 50 hook files hold a refusal path (`fault`, `deny`, `exit 1|2`, `BLOCKED`, a
  decision JSON), the decider and the dispatcher apart. The decision table of RT-3275 only describes
  them: a rule edited in a hook and not in the table diverges silently. A refusal asks its
  neighbours by re-running up to eight of them as subprocesses.
- **This task reaches:** a hook gathers facts and asks one decider; the decision, the named move and
  the refusal text come from the table. Flip a row of the table to «allow», and its hook allows.
- **Sign:** the mutation sweep — every refusal row flipped to «allow» in a copy of the table makes its
  probe allow; the snapshot of all probe answers taken before the work matches after it; the walk
  and the chains run over the rows the decider computes, as many as today.
- **Milestone G of the epic:** fewer than five refusals per hundred commands and no dead end. This
  task keeps the proof «no dead end» true for what the agent meets: the walk judges the very data
  the hooks decide by. The refusal rate is not measured here (RT-3270, RT-3283).
- **Metric:** hook files with a refusal path past the decider — 50 now, 0 after; rows followed by
  their hooks under mutation — 0 now, all after.

## Task footprint

| What  | Where |
| ----- | ----- |
| Specs | `docs/specs/agent-kit/decision-table/`, the hook specs under `docs/specs/agent-kit/` named by `node tools/spec-of.mjs` for each switched hook |
| Laws  | none |
| Rules | `.claude/skills/agent-kit-source/` (if the hook mechanism it names goes away) |
| Code  | `projects/agent-kit/assets/hooks/`, `projects/agent-kit/assets/checks/decision-table.*`, `projects/agent-kit/assets/checks/decide.mjs`, `projects/agent-kit/tests/` |

## What counts as done

- Every refusal row is followed by its hook under mutation: the hook takes the decision from the
  table.
- No hook file except the decider and the dispatcher holds a refusal path.
- The answers of all probes match the snapshot taken before the work: no check decides otherwise.
- The walk, the conform mode and the chains run over the rows the decider computes — 999 rows and
  3584 pairs, not fewer.
- The conform mode also checks each refusal's named move in the state of that refusal (Q-1).
- `pre-push.sh`, `commit-msg.sh` and every helper that refused before are guards with rows (Q-2).
- The decider failing lets the action through (FAIL-OPEN).
- A dispatcher pass over an allowed command is no slower than today's 2.0 s by more than 0.3 s.
- The number of `.sh` hook files is named before (83) and after, and the «after» equals the
  directory; each removed file is named in the progress. The owner's 82 was the count when the task
  was created; RT-3275 split one file out of the delivery guard; the table's 85 adds the two model
  files.
- All package suites are green on a full run.

## Stages

All checks run from the tree root.

### 1. The snapshot and the measures

- **Steps:**
    1. The answers of all probes today — decision and full text — are saved as the snapshot
       Check: `node projects/agent-kit/assets/checks/decision-table.mjs --snapshot-save docs/tasks/RT-3355-hooks-read-table/probes-before.json | tail -1` → /^saved 999$/
    2. The mutation sweep exists and shows that no hook follows the table yet
       Check: `node projects/agent-kit/assets/checks/decision-table.mjs --mutate | tail -1` → /^rows 999, followed 0$/
    3. The dispatcher time is measured by a script of the suites
       Check: `bash projects/agent-kit/tests/dispatch-time.sh | tail -1` → /^median [0-9]+ ms$/
- **Readiness sign:** the work has a fixed «before» to be compared with.
- **Verified by:** the three checks.

### 2. The decider

- **Steps:**
    1. Every refusal row carries its full text in the field `text`, with `{name}` slots the hook fills
       Check: `node -e 'const t=JSON.parse(require("fs").readFileSync("projects/agent-kit/assets/checks/decision-table.json","utf8").replace(/^#[^\n]*\n/,""));console.log(t.rows.filter(r=>r.decision!=="allow"&&!r.text).length)'` → = 0
    2. `decide.mjs` answers every row of the table as the table says, and composes «this comes first» from the rows of the named move
       Check: `bash projects/agent-kit/tests/decide.test.sh 2>&1 | tail -1` → /^rows ([0-9]+), ok \1$/
    3. The walk, the conform mode and the chains take their rows from the decider; the stored composition rows leave the table
       Check: `node projects/agent-kit/assets/checks/decision-table.mjs --chains --decided | tail -1` → `derived 3584 decided, scenarios 3584, uncovered 0`
    4. `hooks/decide.sh` gives `rt_decide`; a decider that fails or is absent lets the action through
       Check: `bash projects/agent-kit/tests/decide.test.sh 2>&1 | grep -c 'FAIL-OPEN ok'` → = 1
- **Readiness sign:** the decider answers as the table says, and the walk judges as many rows as today.
- **Verified by:** `node projects/agent-kit/assets/checks/decision-table.mjs --walk | tail -1` → `dead 0, unnamed 0`.

### 3. The shared facts

- **Steps:**
    1. `hooks/facts.sh` computes the branch, the fresh base, the window, the loaded rules and the conversation record once per call
       Check: `grep -cE '^rt_fact_[a-z_]+\(\)' projects/agent-kit/assets/hooks/facts.sh` → >= 5
    2. No hook computes these facts past `facts.sh`
       Check: `cd projects/agent-kit/assets/hooks && grep -lE '^[^#]*(git branch --show-current|git symbolic-ref|rev-parse --abbrev-ref|ls-remote origin|transcript_path|claude-window-stop)' *.sh | grep -vxE 'facts.sh|dispatch.sh' | grep -c . || true` → = 0
- **Readiness sign:** a fact has one place that computes it.
- **Verified by:** the second check.

### 4. The hooks switched to the decider

- **Steps:**
    1. The hooks of the course of work decide by `rt_decide`: task-flow, task-flow-draft, flow-step, exam, window-fill, handoff-entry, docs, skill-gate, turn-exit
       Check: `cd projects/agent-kit/assets/hooks && grep -lE '^[^#]*(\bfault\b|rt_task_flow_deny|\bdeny\b|exit [12]\b|permissionDecision|BLOCKED)' task-flow-*.sh flow-step-guard.sh exam-guard.sh window-fill-guard.sh handoff-entry-guard.sh docs-guard.sh skill-gate.sh turn-exit-guard.sh | grep -c . || true` → = 0
    2. The hooks of delivery and of git decide by `rt_decide`: git-guard-* with every helper, pre-push, commit-msg; the helpers that refused become guards with rows
       Check: `cd projects/agent-kit/assets/hooks && grep -lE '^[^#]*(\bfault\b|\bdeny\b|exit [12]\b|permissionDecision|BLOCKED)' git-guard-*.sh pre-push.sh commit-msg.sh | grep -c . || true` → = 0
    3. The other hooks decide by `rt_decide`; a content analysis (prose-style, qa-dataid, reuse-first, sql) gives a fact
       Check: `cd projects/agent-kit/assets/hooks && grep -lE '^[^#]*(\bfault\b|rt_task_flow_deny|\bdeny\b|exit [12]\b|permissionDecision|BLOCKED)' *.sh | grep -vxE 'dispatch.sh|decide.sh' | grep -c . || true` → = 0
    4. No hook re-runs its neighbours: `rt_move_first` is gone
       Check: `grep -l 'rt_move_first' projects/agent-kit/assets/hooks/*.sh | grep -c . || true` → = 0
- **Readiness sign:** the search over the hook files finds no refusal path past the decider.
- **Verified by:** the third check.

### 5. The proof both ways

- **Steps:**
    1. Every refusal row flipped to «allow» makes its hook allow
       Check: `node projects/agent-kit/assets/checks/decision-table.mjs --mutate | tail -1` → /^rows ([0-9]+), followed \1$/
    2. All probes answer as in the snapshot
       Check: `node projects/agent-kit/assets/checks/decision-table.mjs --snapshot-compare docs/tasks/RT-3355-hooks-read-table/probes-before.json | tail -1` → /^rows 999, changed 0$/
    3. The reverse probe: the hook of each refusal's named move is run in the state of that refusal
       Check: `node projects/agent-kit/assets/checks/decision-table.mjs --reverse | tail -1` → /^moves [0-9]+, refused 0$/
    4. The coverage counts the git hooks and the helpers that refused among the guards
       Check: `node projects/agent-kit/assets/checks/decision-table.mjs --coverage | tail -1 | grep -oE '^deciding [0-9]+ of [0-9]+' | awk '$2==$4{print $2}'` → >= 33
    5. The dispatcher is no slower than 2300 ms on an allowed command
       Check: `bash projects/agent-kit/tests/dispatch-time.sh | tail -1 | grep -oE '[0-9]+'` → <= 2300
- **Readiness sign:** the table and the hooks agree in both directions, and nothing decides otherwise.
- **Verified by:** the five checks.

### 6. Files, texts, layout, suites

- **Steps:**
    1. Files left with no code are removed and named in the progress; the spec names the count before and after, and «after» equals the directory
       Check: `n=$(ls projects/agent-kit/assets/hooks/*.sh | grep -c .); grep -c "hook files: 83 before, $n after" docs/specs/agent-kit/decision-table/spec.md` → = 1
    2. The specs and bindings name the decider; the spec check is green
       Check: `node tools/check-specs.mjs > /dev/null && grep -c 'decide.mjs:' docs/specs/agent-kit/decision-table/implementation.md` → >= 1
    3. The layout matches the package, the decider laid out with it
       Check: `test -f .claude/hooks/decide.sh && pnpm run -s agent-kit:check 2>&1 | grep -c 'сходится с пакетом'` → = 1
    4. All package suites are green on a full run, the decider's suite among them
       Check: `test -f projects/agent-kit/tests/decide.test.sh && env -u RT_SUITES_BASE bash projects/agent-kit/tests/run.sh 2>&1 | tail -1` → `ВСЕ НАБОРЫ ЗЕЛЁНЫЕ`
- **Readiness sign:** the texts describe the decider, the tree matches the package, every suite is green.
- **Verified by:** the four checks.

## What this work does not do

- The content analysis of prose-style, qa-dataid, reuse-first and sql is not rewritten: it becomes
  a fact.
- The guards of this tree outside the package (`.claude/rt-kit/overrides/`, the tree's own hooks)
  are not switched.
- The refusal rate of milestone G is not measured: RT-3270 and RT-3283 of the epic.
