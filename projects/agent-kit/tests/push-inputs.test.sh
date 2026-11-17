#!/usr/bin/env bash
# Scenarios of choosing the push set steps a change reaches, by a record of what each step reads.
# The steps are made up in a scratch repository: one reads the texts of `docs/`, one the history.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "the push set: steps a change reaches, by the record of their reads"

src="$(cd "$(dirname "${BASH_SOURCE[0]}")/../assets" && pwd)"
tree="$(mktemp -d)"
trap 'rm -rf "$tree"' EXIT
mkdir -p "$tree/tools" "$tree/docs" "$tree/src" "$tree/.claude/rt-kit"
cp "$src/checks/push-inputs.mjs" "$src/checks/push-trace.mjs" "$tree/tools/"
cat >"$tree/tools/check-texts.mjs" <<'EOF'
import { readdirSync, readFileSync } from 'node:fs';
for (const name of readdirSync('docs')) if (name.endsWith('.md')) readFileSync(`docs/${name}`, 'utf8');
EOF
cat >"$tree/tools/check-history.mjs" <<'EOF'
import { execFileSync } from 'node:child_process';
execFileSync('git', ['log', '-1', '--format=%H']);
EOF
printf 'a\n' >"$tree/docs/a.md"
printf 'b\n' >"$tree/docs/b.ts"
(cd "$tree" && git init -q -b main && git add -A && git -c user.email=t@t -c user.name=t commit -qm base)

texts='node tools/check-texts.mjs'
history='node tools/check-history.mjs'
steps="$(printf '%s\n%s\n%s\n%s\n' "$texts" "$history" 'node tools/check-new.mjs' 'node tools/push-inputs.mjs verify')"

(cd "$tree" && printf '%s\n%s\n' "$texts" "$history" | node tools/push-inputs.mjs record 2>/dev/null)
walk="$(cd "$tree" && node -e 'const t=require("./.claude/rt-kit/push-inputs.json");console.log(JSON.stringify(t.steps[process.argv[1]].walks))' "$texts")"
report "SC-AK-1353 — the record names the directory a step walks and what it reads there" "$walk" '[{"dir":"docs","exts":[".md"]}]'

pick() {
    printf '%s\n' "$1" >"$tree/changes"
    (cd "$tree" && printf '%s\n' "$steps" | node tools/push-inputs.mjs select base --changes changes 2>/dev/null)
}
runs() { printf '%s\n' "$1" | grep -qxF -- "$2" && printf yes || printf no; }

report "SC-AK-1353 — an edit of a text the step reads starts it" "$(runs "$(pick "$(printf 'M\tdocs/a.md')")" "$texts")" yes
report "SC-AK-1353 — an edit of a new text of the kind it reads starts it" "$(runs "$(pick "$(printf 'M\tdocs/c.md')")" "$texts")" yes
report "SC-AK-1353 — an edit of a file of a kind it never reads does not start it" "$(runs "$(pick "$(printf 'M\tdocs/b.ts')")" "$texts")" no
report "SC-AK-1353 — an edit outside what it reads does not start it" "$(runs "$(pick "$(printf 'M\tsrc/x.md')")" "$texts")" no
report "SC-AK-1353 — a file added to a directory it walks starts it" "$(runs "$(pick "$(printf 'A\tdocs/d.ts')")" "$texts")" yes
report "SC-AK-1353 — a file renamed out of a directory it walks starts it" "$(runs "$(pick "$(printf 'R100\tdocs/b.ts\tsrc/b.ts')")" "$texts")" yes
report "SC-AK-1353 — an edit of the step itself starts it" "$(runs "$(pick "$(printf 'M\ttools/check-texts.mjs')")" "$texts")" yes

report "SC-AK-1354 — a step that reads the history runs on any change" "$(runs "$(pick "$(printf 'M\tsrc/x.md')")" "$history")" yes
report "SC-AK-1354 — a step absent from the table runs on any change" "$(runs "$(pick "$(printf 'M\tsrc/x.md')")" 'node tools/check-new.mjs')" yes
report "SC-AK-1355 — the table check does not run when no step is touched" "$(runs "$(pick "$(printf 'M\tdocs/a.md')")" 'node tools/push-inputs.mjs verify')" no
report "SC-AK-1355 — the table check runs when a step is touched" "$(runs "$(pick "$(printf 'M\ttools/check-texts.mjs')")" 'node tools/push-inputs.mjs verify')" yes

# Through the helper both runners call, against a real commit over the base.
base="$(cd "$tree" && git rev-parse HEAD)"
(cd "$tree" && printf 'b2\n' >docs/b.ts && git -c user.email=t@t -c user.name=t commit -qam ts)
helper() {
    (cd "$tree" && CLAUDE_PROJECT_DIR="$tree" bash -c '. "$1"; printf "%s\n" "$2" | rt_push_select "$3"' _ \
        "$src/hooks/git-guard-push-marks.sh" "$steps" "$1" 2>/dev/null)
}
report "SC-AK-1353 — the runners' helper leaves out a step the commit does not reach" "$(runs "$(helper "$base")" "$texts")" no
report "SC-AK-1354 — the runners' helper keeps a step that reads the history" "$(runs "$(helper "$base")" "$history")" yes
report "SC-AK-1354 — without a base every step runs" "$(runs "$(helper '')" "$texts")" yes
mv "$tree/.claude/rt-kit/push-inputs.json" "$tree/table.json"
report "SC-AK-1354 — without a table every step runs" "$(runs "$(helper "$base")" "$texts")" yes
mv "$tree/table.json" "$tree/.claude/rt-kit/push-inputs.json"

(cd "$tree" && node tools/push-inputs.mjs verify >/dev/null 2>&1)
report "SC-AK-1355 — the table check is green while the steps read what was recorded" "$?" 0
mkdir -p "$tree/.claude/rt-kit/observations/.marks"
printf 'x\n' >"$tree/.claude/rt-kit/observations/.marks/refusal-1"
printf "import { readFileSync as readMark } from 'node:fs';\nreadMark('.claude/rt-kit/observations/.marks/refusal-1', 'utf8');\n" >>"$tree/tools/check-texts.mjs"
(cd "$tree" && node tools/push-inputs.mjs verify >/dev/null 2>&1)
report "SC-AK-1355 — a read of the agent's observations is no read of the step" "$?" 0
mkdir -p "$tree/src/tests/.claude/rt-kit/observations/.marks"
printf 'x\n' >"$tree/src/tests/.claude/rt-kit/observations/.marks/refusal-2"
printf "import { readFileSync as readNested } from 'node:fs';\nreadNested('src/tests/.claude/rt-kit/observations/.marks/refusal-2', 'utf8');\n" >>"$tree/tools/check-texts.mjs"
(cd "$tree" && node tools/push-inputs.mjs verify >/dev/null 2>&1)
report "SC-AK-1355 — observations a scenario left in a nested directory are no read of the step" "$?" 0
printf 'c\n' >"$tree/src/c.txt"
(cd "$tree" && git add src/c.txt && git -c user.email=t@t -c user.name=t commit -qm c)
printf "import { readFileSync as readMore } from 'node:fs';\nreadMore('src/c.txt', 'utf8');\n" >>"$tree/tools/check-texts.mjs"
said="$(cd "$tree" && node tools/push-inputs.mjs verify 2>&1)"
report "SC-AK-1355 — a step that reads past the table makes the table check red" "$?" 1
report "SC-AK-1355 — the refusal names the step and the path" \
    "$(printf '%s' "$said" | grep -qF "$texts: reads src/c.txt" && echo yes)" yes

# A copy with a file outside the history and a copy without it share one table.
printf '.env\n' >"$tree/.gitignore"
(cd "$tree" && git add .gitignore && git -c user.email=t@t -c user.name=t commit -qm ignore)
cat >"$tree/tools/check-env.mjs" <<'EOF'
import { existsSync, readFileSync } from 'node:fs';
if (existsSync('.env')) readFileSync('.env', 'utf8');
EOF
cat >"$tree/tools/check-db.mjs" <<'EOF'
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
if (existsSync('.env')) spawnSync('true');
EOF
env_step='node tools/check-env.mjs'
db_step='node tools/check-db.mjs'
(cd "$tree" && printf '%s\n' "$env_step" | node tools/push-inputs.mjs record --table env.json 2>/dev/null)
printf 'DATABASE_URL=x\n' >"$tree/.env"
(cd "$tree" && node tools/push-inputs.mjs verify --table env.json >/dev/null 2>&1)
report "SC-AK-1550 — a read of a file the repository ignores is no read of the step" "$?" 0

(cd "$tree" && printf '%s\n' "$db_step" | node tools/push-inputs.mjs record --table db.json 2>/dev/null)
rm "$tree/.env"
(cd "$tree" && printf '%s\n' "$db_step" | node tools/push-inputs.mjs record --table db.json 2>/dev/null)
kept="$(cd "$tree" && node -e 'const t=require("./db.json");console.log(t.steps[process.argv[1]].untraced.join(","))' "$db_step")"
report "SC-AK-1551 — a record on a copy that does not start the process keeps the kind seen before" "$kept" true
printf 'DATABASE_URL=x\n' >"$tree/.env"
(cd "$tree" && node tools/push-inputs.mjs verify --table db.json >/dev/null 2>&1)
report "SC-AK-1551 — the copy that starts the process passes the table check" "$?" 0
rm "$tree/.env"
(cd "$tree" && printf '%s\n' "$db_step" | node tools/push-inputs.mjs record --table db-first.json 2>/dev/null)
printf 'DATABASE_URL=x\n' >"$tree/.env"
(cd "$tree" && node tools/push-inputs.mjs verify --table db-first.json >/dev/null 2>&1)
report "SC-AK-1551 — a table first recorded without the process is refused once where it starts" "$?" 1
(cd "$tree" && printf '%s\n' "$db_step" | node tools/push-inputs.mjs record --table db-first.json 2>/dev/null)
(cd "$tree" && node tools/push-inputs.mjs verify --table db-first.json >/dev/null 2>&1)
report "SC-AK-1551 — one record there settles the table for that copy" "$?" 0
rm "$tree/.env"
(cd "$tree" && node tools/push-inputs.mjs verify --table db-first.json >/dev/null 2>&1)
report "SC-AK-1551 — and for the copy without the process" "$?" 0
printf 'DATABASE_URL=x\n' >"$tree/.env"

# A step that already starts a process starts a new kind on another machine.
cat >"$tree/tools/check-tool.mjs" <<'EOF'
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
spawnSync('true');
if (existsSync('.tool')) spawnSync('false');
EOF
tool_step='node tools/check-tool.mjs'
(cd "$tree" && printf '%s\n' "$tool_step" | node tools/push-inputs.mjs record --table tool.json 2>/dev/null)
printf 'x\n' >"$tree/.tool"
(cd "$tree" && node tools/push-inputs.mjs verify --table tool.json >/dev/null 2>&1)
report "SC-AK-1594 — a new process kind of a step that already runs always is no refusal" "$?" 0
rm "$tree/.tool"

# The filter of ignored files: a non-ASCII name, a path beyond a symbolic link, a global ignore file.
printf '.env\n*.local\n' >"$tree/.gitignore"
printf 'x\n' >"$tree/данные.local"
printf 'x\n' >"$tree/global.only"
ln -s src "$tree/link"
printf 'global.only\n' >"$tree/global-ignore"
printf '[core]\n\texcludesFile = %s\n' "$tree/global-ignore" >"$tree/global-config"
cat >"$tree/tools/check-local.mjs" <<'EOF'
import { readFileSync } from 'node:fs';
for (const p of ['данные.local', '.env', 'link/c.txt']) readFileSync(p, 'utf8');
EOF
cat >"$tree/tools/check-global.mjs" <<'EOF'
import { readFileSync } from 'node:fs';
for (const p of ['.env', 'global.only']) readFileSync(p, 'utf8');
EOF
local_step='node tools/check-local.mjs'
global_step='node tools/check-global.mjs'
(cd "$tree" && printf '%s\n%s\n' "$local_step" "$global_step" | GIT_CONFIG_GLOBAL="$tree/global-config" \
    node tools/push-inputs.mjs record --table local.json 2>/dev/null)
read_by() {
    (cd "$tree" && node -e 'const t=require("./local.json");const e=t.steps[process.argv[1]];
        console.log([...e.files,...e.walks.map((w)=>w.dir)].includes(process.argv[2])?"kept":"dropped")' "$1" "$2")
}
report "SC-AK-1595 — an ignored file with a non-ASCII name is no read of the step" "$(read_by "$local_step" 'данные.local')" dropped
report "SC-AK-1595 — a path beyond a symbolic link does not stop the filter for the rest" "$(read_by "$local_step" '.env')" dropped
report "SC-AK-1596 — a file only the machine's own ignore file hides stays a read of the step" "$(read_by "$global_step" 'global.only')" kept
report "SC-AK-1596 — a file the repository ignores is dropped next to it" "$(read_by "$global_step" '.env')" dropped

# A draft lying in the copy, neither in the history nor ignored.
cat >"$tree/tools/check-root.mjs" <<'EOF'
import { readdirSync, readFileSync, statSync } from 'node:fs';
for (const name of readdirSync('docs')) if (statSync(`docs/${name}`).isFile()) readFileSync(`docs/${name}`, 'utf8');
EOF
root_step='node tools/check-root.mjs'
(cd "$tree" && git add tools/check-root.mjs && git -c user.email=t@t -c user.name=t commit -qm root)
(cd "$tree" && printf '%s\n' "$root_step" | node tools/push-inputs.mjs record --table root.json 2>/dev/null)
printf 'draft\n' >"$tree/docs/pr-body.txt"
mkdir -p "$tree/docs/scratch" && printf 'x\n' >"$tree/docs/scratch/n.rej"
(cd "$tree" && node tools/push-inputs.mjs verify --table root.json >/dev/null 2>&1)
report "SC-AK-1597 — a draft lying in the copy outside the history is no read of the step" "$?" 0
(cd "$tree" && git add docs/pr-body.txt && git -c user.email=t@t -c user.name=t commit -qm draft)
(cd "$tree" && node tools/push-inputs.mjs verify --table root.json >/dev/null 2>&1)
report "SC-AK-1597 — the same file taken into the history is a read again" "$?" 1

suite_result "push-inputs"
