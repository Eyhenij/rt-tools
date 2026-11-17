#!/usr/bin/env bash
# The answers of the hosting the readers ask for, recorded once for the suites on saved data.
#
#   bash record-host.sh <fixtures/real-host directory>
#
# A wrapper takes the place of `gh` through `GH_BIN` and calls the real client. Each call lands in a
# file of its own: the arguments, the kind of the token the call came with (`machine` — the token of
# the machine account, `none` — the account the client is signed in as), the answer, the error
# stream and the code. The token itself never lands in a file: only its kind is named.
#
# The readers run as they run in work: the work queue audit, the table of the epic, the last run of
# the main branch, and the PRs of a merged branch the task flow engine reads through `host.mjs`. Two calls are made by hand on top: the login of the machine token, and a pull
# request read with that token — the read the hosting refuses by the rights of the account.
#
# Run it by hand when the readers change what they ask; the suite replays what lies here.
set -u
OUT="${1:?the directory of the recorded answers}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd)"
TOKEN_FILE="${RT_BOT_TOKEN_FILE:-$HOME/.config/rt-tools-bot-token}"
REAL_GH="${RT_REAL_GH:-/opt/homebrew/bin/gh}"
[ -x "$REAL_GH" ] || REAL_GH="$(command -v gh)"
[ -f "$TOKEN_FILE" ] || { echo "record-host: no machine token in $TOKEN_FILE" >&2; exit 2; }

mkdir -p "$OUT"
rm -f "$OUT"/*.json
WRAP="$(mktemp -d)"
trap 'rm -rf "$WRAP"' EXIT

cat > "$WRAP/gh" <<'WRAPPER'
#!/usr/bin/env bash
kind=none
[ -n "${GH_TOKEN:-}" ] && [ "$GH_TOKEN" = "$(cat "$RT_RECORD_TOKEN_FILE")" ] && kind=machine
[ -n "${GH_TOKEN:-}" ] && [ "$kind" = none ] && kind=other
out="$("$RT_RECORD_GH" "$@" 2>"$RT_RECORD_DIR/.stderr")"
code=$?
n=$(ls "$RT_RECORD_DIR"/*.json 2>/dev/null | wc -l | tr -d ' ')
node -e '
const [file, kind, code, out, errFile, ...args] = process.argv.slice(1);
const fs = require("fs");
const token = fs.readFileSync(process.env.RT_RECORD_TOKEN_FILE, "utf8").trim();
const clean = (text) => text.split(token).join("<token>");
const record = { args, token: kind, code: Number(code), stdout: clean(out), stderr: clean(fs.readFileSync(errFile, "utf8")) };
// A JSON answer is also kept parsed: a person and a search read its fields, not an escaped line.
try { record.json = JSON.parse(record.stdout); } catch {}
fs.writeFileSync(file, JSON.stringify(record, null, 1) + "\n");
' "$(printf '%s/%04d.json' "$RT_RECORD_DIR" "$n")" "$kind" "$code" "$out" "$RT_RECORD_DIR/.stderr" "$@"
printf '%s' "$out"
[ -s "$RT_RECORD_DIR/.stderr" ] && cat "$RT_RECORD_DIR/.stderr" >&2
exit "$code"
WRAPPER
chmod +x "$WRAP/gh"

export GH_BIN="$WRAP/gh" RT_RECORD_GH="$REAL_GH" RT_RECORD_DIR="$OUT" RT_RECORD_TOKEN_FILE="$TOKEN_FILE"
cd "$ROOT" || exit 2
node tools/check-board.mjs > "$OUT/.audit.txt" 2>&1
echo "$?" > "$OUT/.audit.code"
node tools/epic-table.mjs 3302 > "$OUT/.epic-table.txt" 2>&1
node tools/main-run.mjs > "$OUT/.main-run.txt" 2>&1
node "$ROOT/projects/agent-kit/tests/real-data/host-read.mjs" "$ROOT" RT-3355-hooks-read-table > "$OUT/.host.txt" 2>&1
GH_TOKEN="$(cat "$TOKEN_FILE")" "$GH_BIN" api user --jq '{login: .login}' > /dev/null 2>&1
GH_TOKEN="$(cat "$TOKEN_FILE")" "$GH_BIN" pr list --state open --limit 1 --json number,reviewRequests > /dev/null 2>&1
rm -f "$OUT/.stderr"
# The answers and the outputs name people, the paths of this machine and other projects; they are cut.
node "$ROOT/projects/agent-kit/tests/real-data/scrub-host.mjs" "$OUT"
echo "record-host: $(ls "$OUT"/*.json | wc -l | tr -d ' ') answers"
