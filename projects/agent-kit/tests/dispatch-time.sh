#!/usr/bin/env bash
# The time of one pass of the dispatcher over an allowed command, in the tree it is called from:
# five passes of the package dispatcher on `ls`, the median in milliseconds — `median N ms`.
#
# Why it exists. Every tool call of the agent goes through the dispatcher, and a guard that starts a
# program costs every call, not only a refused one. A change that moves the decisions of the guards
# into one decider is judged by this number before and after it; the median, because the first pass
# warms the file cache and one pass in five meets a busy machine.
#
# Not a scenario file: it measures and judges nothing, so `run.sh` does not pick it.
set -u

root="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
dispatch="$(cd "$(dirname "${BASH_SOURCE[0]}")/../assets/hooks" && pwd)/dispatch.sh"
input="$(jq -cn --arg cwd "$root" '{session_id:"dispatch-time",hook_event_name:"PreToolUse",tool_name:"Bash",tool_input:{command:"ls"},cwd:$cwd}')"

node -e '
const { spawnSync } = require("node:child_process");
const [dispatch, input, root] = process.argv.slice(1);
const times = [];
for (let i = 0; i < 5; i++) {
    const start = process.hrtime.bigint();
    spawnSync("bash", [dispatch, "PreToolUse"], { input, cwd: root, env: { ...process.env, CLAUDE_PROJECT_DIR: root }, stdio: ["pipe", "ignore", "ignore"] });
    times.push(Number(process.hrtime.bigint() - start) / 1e6);
}
times.sort((a, b) => a - b);
console.log(`median ${Math.round(times[2])} ms`);
' "$dispatch" "$input" "$root"
