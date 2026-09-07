#!/usr/bin/env bash
# Local value: .claude/rt-kit/browser-device-id — without it the browser guards let any profile through
# Shared helper: prints the id of the pinned browser profile.
#
# The id is local to the machine and does not go into the package at all. It is taken from an
# environment variable, and if that is missing — from a file next to the layout config. Nothing in
# either place — all browser guards pass: a guard that cannot name the wanted profile offers nothing
# in return, and a blind refusal would only drive the work into a dead end.
#
# The pass is not silent, though. An unconfigured tree gets a line on the error stream — once per
# id, so that it does not drown in every call: silence here cannot be told from "all is well", and
# it reads as permission to drive the browser with any profile at all. The id comes as the first
# argument from the caller; no argument — the mark is for the day.
#
# The file with the id is not committed to the repository: each machine has its own.

. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utf8.sh" 2>/dev/null || true

if [ -n "${RT_BROWSER_DEVICE_ID:-}" ]; then
    printf '%s\n' "$RT_BROWSER_DEVICE_ID"
    exit 0
fi

file="${CLAUDE_PROJECT_DIR:-.}/.claude/rt-kit/browser-device-id"

if [ ! -f "$file" ]; then
    key="${1:-$(date +%Y%m%d 2>/dev/null || printf 'nokey')}"
    marker_dir="${TMPDIR:-/tmp}/claude-browser-guard"
    marker="$marker_dir/silent-$key"
    if [ ! -f "$marker" ]; then
        mkdir -p "$marker_dir" 2>/dev/null && : >"$marker" 2>/dev/null
        echo "No browser profile is named for this tree: neither RT_BROWSER_DEVICE_ID nor .claude/rt-kit/browser-device-id. The browser guards therefore let everything through — that is not permission to drive on but a reason to stop and tell the owner." >&2
    fi
    exit 0
fi

tr -d '[:space:]' <"$file"
printf '\n'
