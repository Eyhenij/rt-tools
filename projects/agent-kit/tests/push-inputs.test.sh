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
printf 'c\n' >"$tree/src/c.txt"
printf "import { readFileSync as readMore } from 'node:fs';\nreadMore('src/c.txt', 'utf8');\n" >>"$tree/tools/check-texts.mjs"
said="$(cd "$tree" && node tools/push-inputs.mjs verify 2>&1)"
report "SC-AK-1355 — a step that reads past the table makes the table check red" "$?" 1
report "SC-AK-1355 — the refusal names the step and the path" \
    "$(printf '%s' "$said" | grep -qF "$texts: reads src/c.txt" && echo yes)" yes

suite_result "push-inputs"
