#!/usr/bin/env bash
# Scenarios of the question asked before the push set: would a PR of this branch open. The run ahead
# starts no step while a condition known before the set is unmet, and names all of them at once.
#
# Scenarios of the agreement: SC-AK-1993, SC-AK-1994, SC-AK-1995, SC-AK-1996.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "a PR asked about before the set"

BOX="$(cd "$(mktemp -d)" && pwd -P)"
trap 'rm -rf "$BOX"' EXIT

# A copy of the package, so that a guard of the tree lies next to the hooks, as it does in a tree.
KIT="$BOX/kit"
mkdir -p "$KIT"
cp -R "$ASSETS/hooks" "$ASSETS/checks" "$ASSETS/task-flow" "$ASSETS/defaults" "$KIT/"
# The guard of the tree: it keeps what it was asked with and refuses where the tree holds `refuse`.
cat >"$KIT/hooks/probe-guard.sh" <<'EOF'
#!/usr/bin/env bash
input="${RT_HOOK_INPUT:-$(cat)}"
printf '%s\n' "$input" >>"$PROBE_LOG"
printf '%s\n' "${CLAUDE_PROJECT_DIR:-none}" >>"$PROBE_LOG.root"
[ -f "$(printf '%s' "$input" | jq -r .cwd)/refuse" ] || exit 0
jq -n '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:"\nBLOCKED by probe-guard: no test of the suite\nsecond line"}}'
EOF
export PROBE_LOG="$BOX/probe"

GIT_ID=(-c user.name=probe -c user.email=probe@example.com -c commit.gpgsign=false)
put() {
    mkdir -p "$1/$(dirname "$2")"
    printf '%s\n' "$3" >"$1/$2"
}
keep() {
    git -C "$1" add -A 2>/dev/null
    git -C "$1" "${GIT_ID[@]}" commit -q --allow-empty -m "${2:-feat: x}" 2>/dev/null
}
ref() { git -C "$1" update-ref "refs/remotes/origin/$2" "${3:-HEAD}"; }

# A tree with a main branch published and a branch of task 7 over it. The profile is ignored by the
# tree, so that the state of the card is changed without a commit.
tree_of() {
    local t
    t="$(cd "$(fixture_repo_branched main "${1:-RT-7-probe}")" && pwd -P)"
    mkdir -p "$t/.claude/rt-kit"
    printf '.claude/\nrefuse\n' >>"$t/.git/info/exclude"
    cat >"$t/.claude/rt-kit/project.sh" <<'EOF'
rt_push_checks() { printf 'touch %s # first\n' "$CLAUDE_PROJECT_DIR/.claude/started"; }
rt_task_branch_ok() { printf '%s' "$1" | grep -qE '^RT-[0-9]+-[a-z-]+$'; }
rt_task_branch_number() { printf '%s' "$1" | sed -nE 's/^RT-([0-9]+)-.*/\1/p'; }
rt_task_state() { cat "$CLAUDE_PROJECT_DIR/.claude/card" 2>/dev/null; }
RT_BOARD_EPIC_LABEL=epic
RT_PUSH_READY_HOOKS='probe-guard.sh missing-guard.sh'
EOF
    ref "$t" main main
    printf '{"exists":true,"epic":null,"labels":[]}\n' >"$t/.claude/card"
    put "$t" src/a.txt a
    keep "$t"
    printf '%s' "$t"
}
card() { printf '%s\n' "$2" >"$1/.claude/card"; }

PLAN='# План

## След задачи

| Что | Где |
| --- | --- |
| Code (правится) | `src/b.txt` |

## Этапы

### 1. Этап

- **Steps:**
    1. Первый
    2. Второй'
PROGRESS='# Progress

## Steps

- [x] 1.1 Первый
- [MARK] 1.2 Второй'

# A folder with a plan of a commit: `$2` — the mark of the second step, `$3` — whether the footprint is touched.
folder_of() {
    local d="docs/tasks/RT-7-probe"
    put "$1" "$d/grill.md" '# Разбор'
    put "$1" "$d/plan.md" "$PLAN"
    put "$1" "$d/progress.md" "${PROGRESS/MARK/>}"
    keep "$1" 'docs: plan'
    put "$1" "$d/progress.md" "${PROGRESS/MARK/$2}"
    [ "$3" = touched ] && put "$1" src/b.txt b
    keep "$1" 'feat: work'
}

# One run of the set: the output in $BOX/log, the code in $code.
run() {
    local t="$1"
    shift
    rm -f "$t/.claude/started" "$PROBE_LOG" "$PROBE_LOG.root"
    (cd "$t" && CLAUDE_PROJECT_DIR="$t" bash "$KIT/hooks/git-guard-push-ahead.sh" "$@" >"$BOX/log" 2>&1)
    code=$?
}
said() { if grep -qF -- "$1" "$BOX/log"; then printf yes; else printf no; fi; }
started() { [ -e "$1/.claude/started" ] && printf started || printf held; }
reasons() { grep -c '^— ' "$BOX/log"; }
verdict() { grep '^push ahead:' "$BOX/log" | tail -1 | cut -c1-32; }
asked_base() { jq -r '.tool_input.command' "$PROBE_LOG" 2>/dev/null | tail -1; }

# --- SC-AK-1993 — the run starts nothing while a PR would not open -----------------------------------
t="$(tree_of)"
folder_of "$t" x touched
run "$t"
report "SC-AK-1993 — a ready branch starts the first step" "$code:$(started "$t")" 0:started
touch "$t/refuse"
folder_of "$t" ' ' untouched
run "$t"
report "SC-AK-1993 — an unmet condition ends the run with 3" "$code" 3
report "SC-AK-1993 — and no step starts" "$(started "$t")" held
report "SC-AK-1993 — the last verdict says not ready" "$(verdict)" 'push ahead: not ready for a PR —'
report "SC-AK-1993 — all reasons in one run" "$(said 'open steps: 1.2'):$(said 'no test of the suite')" yes:yes
report "SC-AK-1993 — a refusal leaves a line in the observations" \
    "$(cat "$t"/.claude/rt-kit/observations/* 2>/dev/null | grep -c '"ev":"push-ready","res":"refused"')" 1
run "$t" --no-pr 'the branch is half done'
report "SC-AK-1993 — with a reason the run is not asked" "$code:$(started "$t"):$(said 'the branch is half done')" 0:started:yes
report "SC-AK-1993 — and says so in the observations" \
    "$(cat "$t"/.claude/rt-kit/observations/* 2>/dev/null | grep -c '"ev":"push-ready","res":"skipped"')" 1
for call in '--no-pr' '--no-pr=x' '--fast now' '--no-pr <reason>' '--no-pr ab' '--no-pr half done'; do
    # shellcheck disable=SC2086
    run "$t" $call
    report "SC-AK-1993 — «${call}» without a reason or another argument starts nothing" "$code:$(started "$t"):$(said usage)" 3:held:yes
done
two_lines='half
push ahead: green'
for reason in 'a  ' 'ab <x' "$two_lines"; do
    run "$t" --no-pr "$reason"
    report "SC-AK-1993 — the reason «${reason%%$'\n'*}» of a wrong form starts nothing" "$code:$(started "$t"):$(said usage)" 3:held:yes
done
rm -rf "$t"

# The question is a step of the run: it reads no input of the caller, and a stop ends what it holds.
t="$(tree_of)"
printf '%s\n' 'rt_task_state() { cat >"$CLAUDE_PROJECT_DIR/.claude/read"; printf "{}"; }' >>"$t/.claude/rt-kit/project.sh"
printf 'typed\n' | (cd "$t" && CLAUDE_PROJECT_DIR="$t" bash "$KIT/hooks/git-guard-push-ahead.sh" >"$BOX/log" 2>&1)
report "SC-AK-1993 — the question reads no input of the caller" "$(wc -c <"$t/.claude/read" | tr -d ' '):$(started "$t")" 0:started
rm -f "$t/.claude/started"
printf 'rt_task_state() { sleep 30.%s; }\n' "$$" >>"$t/.claude/rt-kit/project.sh"
(cd "$t" && CLAUDE_PROJECT_DIR="$t" RT_PUSH_STOP_WAIT=1 exec bash "$KIT/hooks/git-guard-push-ahead.sh" >"$BOX/log" 2>&1) &
asked_pid=$!
for _ in $(seq 50); do
    [ -n "$(pgrep -f "sleep 30[.]$$\$")" ] && break
    sleep 0.2
done
kill -TERM "$(sed -nE 's/^push ahead: base .*, pid ([0-9]+)$/\1/p' "$BOX/log")" 2>/dev/null
wait "$asked_pid"
code=$?
report "SC-AK-1993 — a stop ends the question and what it holds" \
    "$code:$(started "$t"):$(grep '^push ahead:' "$BOX/log" | head -1 | cut -c1-16):$(verdict | cut -c1-19):$(pgrep -f "sleep 30[.]$$\$" | wc -l | tr -d ' ')" \
    '143:held:push ahead: base:push ahead: stopped:0'
rm -rf "$t"

t="$(tree_of probe)"
touch "$t/refuse"
run "$t"
report "SC-AK-1993 — a branch with no task number is not asked" "$code:$(started "$t")" 0:started
rm -rf "$t"

t="$(tree_of RT-7-Probe)"
touch "$t/refuse"
run "$t"
report "SC-AK-1993 — a branch named not by the form of the tree is not asked" "$code:$(started "$t")" 0:started
rm -rf "$t"

# --- SC-AK-1994 — the task folder that cannot be taken apart ------------------------------------------
t="$(tree_of)"
folder_of "$t" '>' touched
run "$t"
report "SC-AK-1994 — an open step is named" "$code:$(reasons):$(said 'the plan has open steps: 1.2')" 3:1:yes
rm -rf "$t"

t="$(tree_of)"
folder_of "$t" x untouched
run "$t"
report "SC-AK-1994 — an untouched footprint is named" "$code:$(reasons):$(said 'is untouched: src/b.txt')" 3:1:yes
rm -rf "$t"

t="$(tree_of)"
folder_of "$t" x touched
put "$t" docs/tasks/RT-7-probe/plan.md "$PLAN
"'слово'
keep "$t" 'docs: plan edited'
run "$t"
report "SC-AK-1994 — a plan edited after its commit is named" \
    "$code:$(reasons):$(said 'differs from the commit of the plan: docs/tasks/RT-7-probe/plan.md')" 3:1:yes
put "$t" docs/tasks/RT-7-probe/grill.md '# Разбор 2'
put "$t" docs/tasks/RT-7-probe/progress.md "${PROGRESS/MARK/>}"
keep "$t" 'docs: more'
run "$t"
report "SC-AK-1994 — two folder reasons are two lines" "$code:$(reasons):$(said 'open steps: 1.2'):$(said 'RT-7-probe/grill.md')" 3:2:yes:yes
rm -rf "$t"

# A step done in the progress with no green mark of the engine.
t="$(tree_of)"
PLAN_KEPT="$PLAN"
PLAN="$PLAN
"'       Check: `true` → exit 0'
folder_of "$t" x touched
PLAN="$PLAN_KEPT"
run "$t"
report "SC-AK-1994 — a step marked past the engine is named" "$code:$(said 'with no green mark of the engine')" 3:yes
rm -rf "$t"

t="$(tree_of)"
put "$t" docs/tasks/RT-7-probe/grill.md '# Разбор'
keep "$t" 'docs: grill'
run "$t"
report "SC-AK-1994 — a folder with no plan is named" "$code:$(said 'holds no plan of a commit')" 3:yes
rm -rf "$t"

# The approval mark of the plan lies on one machine; none of the fixtures holds it.
t="$(tree_of)"
folder_of "$t" x touched
run "$t"
report "SC-AK-1994 — a lost approval mark holds nothing" \
    "$code:$(find "$t/.git" -path '*rt-kit*' -name '*pprov*' 2>/dev/null | wc -l | tr -d ' ')" 0:0
# A description of the flow that does not build: the run says so and goes on.
mkdir -p "$t/.claude/rt-kit/overrides/task-flow"
printf 'broken(\n' >"$t/.claude/rt-kit/overrides/task-flow/flow.js"
folder_of "$t" '>' touched
run "$t"
report "SC-AK-1994 — a broken description is said and judges nothing" "$code:$(said 'the task folder is not judged')" 0:yes
rm -rf "$t"

# The agreement of an epic lives until its last task: the plan that names it holds nothing.
t="$(tree_of)"
PLAN_KEPT="$PLAN"
PLAN="**Draft:** \`docs/specs/x/proposed/y/\`

$PLAN"
put "$t" docs/specs/x/proposed/y/spec.md '# Agreement'
folder_of "$t" x touched
PLAN="$PLAN_KEPT"
run "$t"
report "SC-AK-1994 — an agreement under proposed holds nothing" "$code:$(reasons)" 0:0
rm -rf "$t"

# What the engine reads in another place than the tree has: the run says so and goes on.
t="$(tree_of)"
folder_of "$t" '>' untouched
git -C "$t" update-ref refs/remotes/origin/master main
git -C "$t" update-ref -d refs/remotes/origin/main
printf 'RT_MAIN_BRANCH=master\n' >>"$t/.claude/rt-kit/project.sh"
run "$t"
report "SC-AK-1994 — a tree with another main branch: the folder is not judged" "$code:$(said 'not judged: the copy has no origin/main')" 0:yes
rm -rf "$t"

t="$(tree_of)"
folder_of "$t" '>' untouched
git -C "$t" mv docs/tasks docs/work
keep "$t" 'docs: moved'
printf 'RT_TASKS_DIR=docs/work\n' >>"$t/.claude/rt-kit/project.sh"
run "$t"
report "SC-AK-1994 — a tree with another directory of tasks: the folder is not judged" "$code:$(said 'not judged: the head has no docs/tasks/RT-7-probe')" 0:yes
rm -rf "$t"

t="$(tree_of)"
folder_of "$t" '>' untouched
ref "$t" main RT-7-probe
put "$t" src/d.txt d
keep "$t"
run "$t"
report "SC-AK-1994 — a plan that lies in the main branch: the folder is not judged" "$code:$(said 'already lies in origin/main')" 0:yes
rm -rf "$t"

# An engine that breaks answers nothing, and an engine called by a link judges all the same.
t="$(tree_of)"
folder_of "$t" '>' touched
mv "$KIT/checks/flow-override.mjs" "$BOX/kept.mjs"
run "$t"
report "SC-AK-1994 — a broken engine is said and judges nothing" "$code:$(said 'flow-ready.mjs ended with no answer')" 0:yes
mv "$BOX/kept.mjs" "$KIT/checks/flow-override.mjs"
ln -s "$KIT" "$BOX/link"
rm -f "$t/.claude/started"
(cd "$t" && CLAUDE_PROJECT_DIR="$t" bash "$BOX/link/hooks/git-guard-push-ahead.sh" >"$BOX/log" 2>&1)
report "SC-AK-1994 — an engine called by a link judges the folder" "$(started "$t"):$(said 'open steps: 1.2')" held:yes
rm -rf "$t"

# A taken-apart folder: a fix after the review of an open PR is held by neither the folder nor the base.
t="$(tree_of)"
folder_of "$t" '>' untouched
git -C "$t" rm -rq docs/tasks
keep "$t" 'docs: taken apart'
git -C "$t" checkout -q main
put "$t" src/c.txt c
keep "$t" 'feat: main moved'
ref "$t" main
git -C "$t" checkout -q RT-7-probe
run "$t"
report "SC-AK-1994 — a taken-apart folder is not judged, a moved base neither" "$code:$(reasons)" 0:0
report "SC-AK-1996 — a taken-apart folder: the guards of the tree are asked still" "$(asked_base)" 'gh pr create --base main'
rm -rf "$t"

# The branch of an epic: the folders of its tasks.
t="$(tree_of RT-9-epic)"
card "$t" '{"exists":true,"epic":null,"labels":["epic"]}'
put "$t" docs/tasks/RT-7-probe/grill.md '# Разбор'
put "$t" docs/tasks/_template/grill.md '# Grill'
keep "$t" 'docs: task'
run "$t"
report "SC-AK-1994 — epic folders left are named" "$code:$(said 'still carries the folders of its tasks — RT-7-probe')" 3:yes
report "SC-AK-1994 — epic folders left: no mark of the decider in the words" "$(said '{first}')" no
git -C "$t" rm -rq docs/tasks/RT-7-probe
keep "$t" 'docs: taken apart'
git -C "$t" checkout -q main
put "$t" src/c.txt c
keep "$t" 'feat: main moved'
ref "$t" main
git -C "$t" checkout -q RT-9-epic
run "$t"
report "SC-AK-1995 — an epic branch with a moved main goes on" "$code:$(reasons)" 0:0
rm -rf "$t"

# --- SC-AK-1995 — the base of the future PR -----------------------------------------------------------
# A task of the epic 9 with its branch published; `$1` — the call that moves the branch of the epic.
epic_tree() {
    local t
    t="$(cd "$(fixture_repo_branched main RT-9-epic)" && pwd -P)"
    put "$t" src/e.txt e
    keep "$t" 'docs: epic'
    ref "$t" main main
    ref "$t" RT-9-epic
    git -C "$t" checkout -q -b RT-7-probe
    mkdir -p "$t/.claude/rt-kit"
    printf '.claude/\nrefuse\n' >>"$t/.git/info/exclude"
    cat "$BOX/profile" >"$t/.claude/rt-kit/project.sh"
    card "$t" '{"exists":true,"epic":9,"labels":[]}'
    folder_of "$t" x touched
    printf '%s' "$t"
}
t="$(tree_of)"
cp "$t/.claude/rt-kit/project.sh" "$BOX/profile"
rm -rf "$t"

t="$(epic_tree)"
run "$t"
report "SC-AK-1995 — a branch carrying the tip of its epic is ready" "$code:$(reasons)" 0:0
report "SC-AK-1996 — the guards are asked with the branch of the epic" "$(asked_base)" 'gh pr create --base RT-9-epic'
git -C "$t" checkout -q RT-9-epic
put "$t" src/c.txt c
keep "$t" 'docs: epic edited'
ref "$t" RT-9-epic
git -C "$t" checkout -q RT-7-probe
run "$t"
report "SC-AK-1995 — an epic moved by a plain commit is named" "$code:$(said 'git merge origin/RT-9-epic'):$(started "$t")" 3:yes:held
report "SC-AK-1996 — an epic moved by a plain commit: the guards are asked with its branch" "$(asked_base)" 'gh pr create --base RT-9-epic'
card "$t" ''
run "$t"
report "SC-AK-1995 — a silent host: the base is not judged" "$code:$(reasons)" 0:0
card "$t" '{"exists":true,"epic":9,"labels":[]}'
git -C "$t" update-ref refs/remotes/origin/RT-9-second main
run "$t"
report "SC-AK-1995 — several branches of one epic judge no base" "$code:$(reasons)" 0:0
report "SC-AK-1996 — several branches of one epic: the guards are asked with the base of the set" "$(asked_base)" 'gh pr create --base main'
rm -rf "$t"

# The merge of the host is told by its committer.
t="$(epic_tree)"
git -C "$t" checkout -q -b RT-8-other RT-9-epic
put "$t" src/o.txt o
keep "$t" 'feat: other'
git -C "$t" checkout -q RT-9-epic
GIT_COMMITTER_NAME=GitHub GIT_COMMITTER_EMAIL=noreply@github.com git -C "$t" -c commit.gpgsign=false \
    -c user.name=GitHub -c user.email=noreply@github.com merge -q --no-ff -m 'merge' RT-8-other 2>/dev/null
ref "$t" RT-9-epic
git -C "$t" checkout -q RT-7-probe
run "$t"
report "SC-AK-1995 — an epic moved by a merge is named" "$code:$(reasons):$(said 'git merge origin/RT-9-epic')" 3:1:yes
rm -rf "$t"

# A chain: the base of the set is the branch below, and the epic moved all the same.
t="$(epic_tree)"
git -C "$t" update-ref refs/remotes/origin/RT-6-lower 'RT-7-probe~1'
run "$t"
report "SC-AK-1996 — the lower branch of a chain is the base the guards are asked with" "$(asked_base)" 'gh pr create --base RT-6-lower'
report "SC-AK-1995 — the lower branch of a chain with the epic in it is ready" "$code:$(reasons)" 0:0
git -C "$t" checkout -q RT-9-epic
put "$t" src/c.txt c
keep "$t" 'docs: epic edited'
ref "$t" RT-9-epic
git -C "$t" checkout -q RT-7-probe
run "$t"
report "SC-AK-1995 — the lower branch of a chain does not hide a moved epic" "$code:$(reasons):$(said 'git merge origin/RT-9-epic')" 3:1:yes
rm -rf "$t"

t="$(tree_of)"
folder_of "$t" x touched
git -C "$t" checkout -q main
put "$t" src/c.txt c
keep "$t" 'feat: main moved'
ref "$t" main
git -C "$t" checkout -q RT-7-probe
run "$t"
report "SC-AK-1995 — main moved outside an epic is named" "$code:$(reasons):$(said 'git merge origin/main')" 3:1:yes
words="$(grep 'unmet branch_has_main_tip no' "$ASSETS/hooks/git-guard-delivery.sh" | sed 's/^ *//')"
report "SC-AK-1995 — main moved: the words are those of the delivery guard" \
    "$(printf '%s\n' "$words" | grep -c .):$(sed 's/^ *//' "$ASSETS/hooks/git-guard-push-ready.sh" | grep -cxF -- "$words")" 1:1
card "$t" ''
run "$t"
report "SC-AK-1995 — main moved and a silent host: the base is not judged" "$code:$(reasons)" 0:0
card "$t" '{"exists":false}'
run "$t"
report "SC-AK-1995 — main moved and a card the host does not know: the base is not judged" "$code:$(reasons)" 0:0
rm -rf "$t"

# --- SC-AK-1996 — the guards of the tree and the copy that is judged ----------------------------------
t="$(tree_of)"
touch "$t/refuse"
run "$t"
report "SC-AK-1996 — the reason of a guard of the tree is one line" "$code:$(reasons):$(said 'second line')" 3:1:no
rm -f "$t/refuse"
run "$t"
report "SC-AK-1996 — a guard that passes and one that is absent hold nothing" "$code:$(reasons)" 0:0

# The run inherits the parsed input of a hook around it: the guards read the call they are given.
(
    export RT_HOOK_PARSED=1 RT_HOOK_INPUT='{"cwd":"/nowhere","tool_input":{"command":"git push"}}' RT_HOOK_CMD='git push'
    run "$t"
    printf '%s' "$(asked_base)" >"$BOX/asked"
)
report "SC-AK-1996 — an inherited hook input is not what the guards are asked with" "$(cat "$BOX/asked")" 'gh pr create --base main'

# A run started in another copy than the one the session stands in judges the copy it runs in.
other="$(tree_of)"
touch "$t/refuse"
rm -f "$PROBE_LOG" "$PROBE_LOG.root"
(cd "$other" && CLAUDE_PROJECT_DIR="$t" bash "$KIT/hooks/git-guard-push-ahead.sh" >"$BOX/log" 2>&1)
report "SC-AK-1996 — the copy the run stands in is judged, not another copy" \
    "$(jq -r .cwd "$PROBE_LOG" | tail -1):$(tail -1 "$PROBE_LOG.root"):$(reasons)" "$other:$other:0"
rm -rf "$t" "$other"

# Without the helper the set runs as before.
rm -f "$KIT/hooks/git-guard-push-ready.sh"
t="$(tree_of)"
touch "$t/refuse"
run "$t"
report "SC-AK-1996 — with no helper laid out the set runs as before" "$code:$(started "$t")" 0:started
rm -rf "$t"

suite_result "a PR asked about before the set"
