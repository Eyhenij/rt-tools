#!/usr/bin/env bash
# Scenarios of choosing the push set steps a change reaches, by a record of what each step reads.
# The steps are made up in a scratch repository: one reads the texts of `docs/`, one the history.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "the push set: steps a change reaches, by the record of their reads"

src="$(cd "$(dirname "${BASH_SOURCE[0]}")/../assets" && pwd)"
tree="$(mktemp -d)"
trap 'rm -rf "$tree"' EXIT
mkdir -p "$tree/tools" "$tree/docs" "$tree/src" "$tree/.claude/rt-kit"
cp "$src/checks/push-inputs.mjs" "$src/checks/push-trace.mjs" "$src/checks/push-shell.mjs" "$tree/tools/"
cat >"$tree/tools/check-texts.mjs" <<'EOF'
import { readdirSync, readFileSync } from 'node:fs';
for (const name of readdirSync('docs')) if (name.endsWith('.md')) readFileSync(`docs/${name}`, 'utf8');
EOF
cat >"$tree/tools/check-history.mjs" <<'EOF'
import { execFileSync } from 'node:child_process';
execFileSync('git', ['log', '-1', '--format=%H']);
EOF
# A step that lists the root alone, as the package manager does on start.
cat >"$tree/tools/check-root.mjs" <<'EOF'
import { readdirSync } from 'node:fs';
readdirSync('.');
EOF
# A step that reads through a shell, a copy and the history of one path.
cat >"$tree/tools/check-shell.mjs" <<'EOF'
import { copyFileSync, mkdtempSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
execFileSync('bash', ['tools/read.sh'], { stdio: 'ignore' });
copyFileSync('src/kept.txt', join(mkdtempSync(join(tmpdir(), 'rt-copy-')), 'kept.txt'));
execFileSync('git', ['log', '--format=%H', '--', 'docs']);
EOF
cat >"$tree/tools/read.sh" <<'EOF'
dir=docs
cat "$dir/a.md" >/dev/null
EOF
cat >"$tree/tools/read-redirect.sh" <<'EOF'
while read -r line; do :; done < "$1"
EOF
cat >"$tree/tools/check-redirect.mjs" <<'EOF'
import { execFileSync } from 'node:child_process';
execFileSync('bash', ['tools/read-redirect.sh', 'docs/a.md'], { stdio: 'ignore' });
EOF
# Two steps that declare what they are about: one looks at the kit files of the change, one counts days.
cat >"$tree/tools/check-change.mjs" <<'EOF'
import { execFileSync } from 'node:child_process';
export function pushReadsChange(path) {
    return path.startsWith('kit/');
}
if (import.meta.url.endsWith(process.argv[1].split('/').pop())) execFileSync('git', ['diff', '--name-only', 'HEAD']);
EOF
cat >"$tree/tools/check-days.mjs" <<'EOF'
import { execFileSync } from 'node:child_process';
export const PUSH_EVERY_CHANGE = 'counts the days';
execFileSync('git', ['log', '-1', '--format=%cI', '--', 'docs']);
EOF
# A step that writes and reads a mark file under a new name each run, in a directory git ignores.
cat >"$tree/tools/check-marks.mjs" <<'EOF'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
mkdirSync('marks', { recursive: true });
const mark = `marks/pending-${process.pid}`;
writeFileSync(mark, 'x');
readFileSync(mark, 'utf8');
readFileSync('docs/a.md', 'utf8');
EOF
printf 'marks/\n' >"$tree/.gitignore"
printf 'a\n' >"$tree/docs/a.md"
printf 'b\n' >"$tree/docs/b.ts"
printf 'k\n' >"$tree/src/kept.txt"
(cd "$tree" && git init -q -b main && git add -A && git -c user.email=t@t -c user.name=t commit -qm base)

texts='node tools/check-texts.mjs'
history='node tools/check-history.mjs'
rootls='node tools/check-root.mjs'
shell='node tools/check-shell.mjs'
redirect='node tools/check-redirect.mjs'
change='node tools/check-change.mjs'
days='node tools/check-days.mjs'
marks='node tools/check-marks.mjs'
steps="$(printf '%s\n' "$texts" "$history" 'node tools/check-new.mjs' 'node tools/push-inputs.mjs verify' "$rootls" "$shell" "$redirect" "$change" "$days")"

(cd "$tree" && printf '%s\n' "$texts" "$history" "$rootls" "$shell" "$redirect" "$change" "$days" "$marks" | node tools/push-inputs.mjs record 2>/dev/null)
entry() { (cd "$tree" && node -e 'const t=require("./.claude/rt-kit/push-inputs.json");console.log(JSON.stringify(t.steps[process.argv[1]][process.argv[2]]))' "$1" "$2"); }
report "SC-AK-1353 — the record names the directory a step walks and what it reads there" "$(entry "$texts" walks)" '[{"dir":"docs","deep":true,"exts":[".md"]}]'
report "SC-AK-1356 — a listing of the root alone is recorded as one directory" "$(entry "$rootls" walks)" '[{"dir":".","deep":false,"exts":[]}]'
report "SC-AK-1357 — a shell, a copy and a git call with a path leave no unseen start" "$(entry "$shell" untraced)" '[]'
report "SC-AK-1357 — the history of a named path is recorded as that path" "$(entry "$shell" logs)" '["docs"]'
report "SC-AK-1357 — a shell reading through a redirection stays unseen" "$(entry "$redirect" untraced)" '["bash <"]'
report "SC-AK-1359 — the record names the tracked text and not the ignored mark file" "$(entry "$marks" files)" '["docs/a.md","tools/check-marks.mjs"]'

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

report "SC-AK-1356 — an edit deep under a listed root does not start the step" "$(runs "$(pick "$(printf 'M\tdocs/a.md')")" "$rootls")" no
report "SC-AK-1356 — a file added at the listed root starts the step" "$(runs "$(pick "$(printf 'A\tnew.md')")" "$rootls")" yes
report "SC-AK-1356 — a new directory under the listed root starts the step" "$(runs "$(pick "$(printf 'A\tfresh/deep/x.md')")" "$rootls")" yes
report "SC-AK-1357 — a file the shell reads starts the step" "$(runs "$(pick "$(printf 'M\tdocs/a.md')")" "$shell")" yes
report "SC-AK-1357 — a file the step copies starts the step" "$(runs "$(pick "$(printf 'M\tsrc/kept.txt')")" "$shell")" yes
report "SC-AK-1357 — a change of a path whose history it reads starts the step" "$(runs "$(pick "$(printf 'A\tdocs/e.txt')")" "$shell")" yes
report "SC-AK-1357 — a change elsewhere does not start the step" "$(runs "$(pick "$(printf 'M\tsrc/x.md')")" "$shell")" no
report "SC-AK-1357 — a shell reading through a redirection runs on any change" "$(runs "$(pick "$(printf 'M\tsrc/x.md')")" "$redirect")" yes
report "SC-AK-1358 — a step runs on the change its own filter takes" "$(runs "$(pick "$(printf 'M\tkit/a.ts')")" "$change")" yes
report "SC-AK-1358 — a step does not run on a change its own filter leaves" "$(runs "$(pick "$(printf 'M\tdocs/a.md')")" "$change")" no
report "SC-AK-1358 — a step that counts days runs on any change" "$(runs "$(pick "$(printf 'M\tsrc/x.md')")" "$days")" yes

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
report "SC-AK-1359 — a mark file written anew under another name leaves the table check green" \
    "$(cd "$tree" && node tools/push-inputs.mjs verify 2>&1 | grep -c 'check-marks')" 0
printf 'c\n' >"$tree/src/c.txt"
printf "import { readFileSync as readMore } from 'node:fs';\nreadMore('src/c.txt', 'utf8');\n" >>"$tree/tools/check-texts.mjs"
said="$(cd "$tree" && node tools/push-inputs.mjs verify 2>&1)"
report "SC-AK-1355 — a step that reads past the table makes the table check red" "$?" 1
report "SC-AK-1355 — the refusal names the step and the path" \
    "$(printf '%s' "$said" | grep -qF "$texts: reads src/c.txt" && echo yes)" yes

suite_result "push-inputs"
