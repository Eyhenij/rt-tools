#!/usr/bin/env bash
# PreToolUse gate for Edit|Write|MultiEdit and Bash(git commit/push).
# Blocks the action ONCE per (session, domain) until the matching skill has been loaded this
# session (recorded by skill-loaded.sh). After the skill is loaded the same domain passes
# silently for the rest of the session — so there is no repetition and negligible token cost.
#
# FAIL-OPEN: on any error or unmapped path the action is ALLOWED (exit 0). A buggy gate must
# never wedge editing.

input="$(cat 2>/dev/null)"
[ -z "$input" ] && exit 0

sid="$(printf '%s' "$input" | jq -r '.session_id // "nosession"' 2>/dev/null)"
tool="$(printf '%s' "$input" | jq -r '.tool_name // empty' 2>/dev/null)"

req=""
target=""
case "$tool" in
    Edit|Write|MultiEdit)
        target="$(printf '%s' "$input" | jq -r '.tool_input.file_path // empty' 2>/dev/null)"
        [ -z "$target" ] && exit 0
        # Most specific first — the first match wins. A story/spec is never a component file,
        # so both must be tested before *.component.ts; the barrels must be tested before the
        # *.ts catch-all.
        case "$target" in
            */.claude/*)                        exit 0 ;;
            *.stories.ts)                       req="rt-tools-storybook" ;;
            */stories/*.ts|*/strories/*.ts)     req="rt-tools-storybook" ;;
            # Component overview pages are showcase docs, not prose: same rule as the stories.
            *.mdx)                              req="rt-tools-storybook" ;;
            *.spec.ts)                          req="rt-tools-testing" ;;
            *.component.ts|*.component.html)    req="rt-tools-component" ;;
            *.scss)                             req="rt-tools-styling" ;;
            */public-api.ts|*/index.ts)         req="rt-tools-public-api" ;;
            *.ts)                               req="rt-tools-typescript" ;;
            *) exit 0 ;;
        esac
        ;;
    Bash)
        target="$(printf '%s' "$input" | jq -r '.tool_input.command // empty' 2>/dev/null)"
        case "$target" in
            *git\ commit*|*git\ push*|*gh\ pr\ create*) req="rt-tools-ship-pr" ;;
            *) exit 0 ;;
        esac
        ;;
    *) exit 0 ;;
esac

[ -z "$req" ] && exit 0

# Accept both the bare skill name and a directory-scoped one ("<dir>:<name>").
loaded="${TMPDIR:-/tmp}/claude-skill-gate/${sid}.loaded"
if [ -f "$loaded" ] && grep -qE "^([^:]*:)?$(printf '%s' "$req" | sed 's/[][\.*^$/]/\\&/g')$" "$loaded" 2>/dev/null; then
    exit 0
fi

reason="BLOCKED by skill-gate: load the '${req}' skill via the Skill tool BEFORE this action, then retry. This fires once per session for this domain."
jq -n --arg r "$reason" '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:$r}}' 2>/dev/null \
    || printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"Load the %s skill first, then retry."}}\n' "$req"

exit 0
