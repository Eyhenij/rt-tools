#!/usr/bin/env bash
# Shared helper: prints RT_TOOLS_BROWSER_DEVICE_ID from the project's .env, or nothing.
#
# .env is gitignored and per-developer, so the browser guards configure themselves from it.
# An unset/empty value means "not configured" and every guard must then allow the action —
# a shared hook must never block a teammate who has not set this up.

env_file="${CLAUDE_PROJECT_DIR:-.}/.env"
[ -r "$env_file" ] || exit 0

sed -n 's/^[[:space:]]*RT_TOOLS_BROWSER_DEVICE_ID[[:space:]]*=[[:space:]]*//p' "$env_file" \
    | head -n 1 \
    | sed -e 's/^"//' -e "s/^'//" -e 's/"[[:space:]]*$//' -e "s/'[[:space:]]*$//" -e 's/[[:space:]]*$//'
