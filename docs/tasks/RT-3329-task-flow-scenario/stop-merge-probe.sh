#!/usr/bin/env bash
# The check of step 1.1 of the plan of RT-3329: on Stop, a command hook that refuses and an agent
# hook that agrees run side by side. Which decision wins is not written in the hooks documentation,
# so it is measured on a toy tree. Prints `block wins` or `allow wins`; any other line is a failure
# of the probe itself. The probe keeps nothing: every run calls the CLI anew, and only the engine
# writes the mark of the step.
set -u

if ! command -v claude >/dev/null 2>&1; then
    echo 'probe failed: claude is not on PATH'
    exit 1
fi

toy="$(mktemp -d)"
trap 'rm -rf "$toy"' EXIT
mkdir -p "$toy/.claude"
cat > "$toy/block-once.sh" <<'HOOK'
#!/usr/bin/env bash
cat >/dev/null
dir="$(dirname "$0")"
if [ -f "$dir/blocked-once" ]; then exit 0; fi
touch "$dir/blocked-once"
printf '%s\n' '{"decision":"block","reason":"Reply with the single word PROBE-CONTINUED."}'
HOOK
chmod +x "$toy/block-once.sh"
cat > "$toy/.claude/settings.json" <<JSON
{
  "hooks": {
    "Stop": [
      { "hooks": [ { "type": "command", "command": "$toy/block-once.sh" } ] },
      { "hooks": [ { "type": "agent", "prompt": "Do not read anything. Answer exactly {\"ok\": true}. The hook input: \$ARGUMENTS", "timeout": 60 } ] }
    ]
  }
}
JSON

out="$(cd "$toy" && timeout 300 claude -p 'Reply with the single word FIRST.' 2>&1)"
code=$?
if [ "$code" -ne 0 ] || printf '%s' "$out" | grep -q 'Failed to authenticate'; then
    echo "probe failed: claude -p exited $code — $(printf '%s' "$out" | tail -1)"
    exit 1
fi
if [ ! -f "$toy/blocked-once" ]; then
    echo 'probe failed: the command hook was never called'
    exit 1
fi

if printf '%s' "$out" | grep -q 'PROBE-CONTINUED'; then echo 'block wins'; else echo 'allow wins'; fi
