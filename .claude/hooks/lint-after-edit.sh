#!/usr/bin/env bash
# rt-kit v0.25.0 · hooks/lint-after-edit.sh · 470b9558ee09 · правится надстройкой, не здесь
# rt-hook: PostToolUse Edit|Write|MultiEdit|Bash|mcp__webstorm__create_new_file
# Requires: hooks/profile-check.sh
# The linter in the footsteps of an edit. PostToolUse.
#
# Two entries. A file edit — the one changed file is linted. A shell command — what it wrote is
# linted: a move changes the lib, and with it the boundaries, and an import lawful in the old
# place is already forbidden in the new one; a write by redirect, by append or by an interpreter
# changes the file itself, and before that it never got a linter at all. That is exactly how a
# forbidden import leaves for the shared lib silently, and an edited check slips out from under
# the formatter: the rule would have fired — but nobody ran it.
#
# What a command writes and where, the tree profile knows, and it knows it in one way for all:
# the rules gate reads the same sign.
#
# The full suite is run by the guard on push, but that is the end of the work: by the time the
# rule fires, a dozen edits lie on top of the violation, and the analysis turns into archaeology.
# Here is the same linter, but over the touched files — seconds, right after the action, while
# the context is still one's own.
#
# Findings come back as added context, not as a refusal: the action is already applied, and an
# unfinished intermediate file has the right to be red. They must be fixed before the end of the
# task — all of them, including those that lay in the file before.
#
# What is called what here, the tree profile knows:
#   rt_lint_for      — what this file is linted with;
#   rt_shell_writes  — whether this command writes;
#   rt_shell_paths   — which paths it wrote;
#   rt_is_app_code   — where the code the linters apply to at all lives;
#   RT_LINT_SKIP_RE  — what is excluded from it;
#   rt_push_checks   — what the push gate runs. It also decides whether a finding catches up
#                      later: a linter that is not in the gate is caught only by this hook.
# No profile or no function — the hook stays silent.
#
# FAIL-OPEN and silent: no linter, a file outside the tree, a green result — empty output.

# How many files are linted per move. A lib move touches dozens of files, and a run over each
# would turn the hook into a minute-long pause; the first ones are enough for a boundary
# violation.
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utf8.sh" 2>/dev/null || true
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/hook-input.sh" 2>/dev/null || true

MAX_FILES=12

rt_hook_read
input="$RT_HOOK_INPUT"
[ -z "$input" ] && exit 0
command -v jq >/dev/null 2>&1 || exit 0

tool="$(rt_hook_tool)"
case "$tool" in
    Edit | Write | MultiEdit | mcp__webstorm__create_new_file) mode="edit" ;;
    Bash) mode="move" ;;
    *) exit 0 ;;
esac

# Screening before any work: the hook hangs on every shell command, and a minority of them
# write. An empty command is screened out right here — there is nothing to ask it the write sign
# about.
command_text=""
if [ "$mode" = "move" ]; then
    command_text="$(printf '%s' "$input" | jq -r '.tool_input.command // empty' 2>/dev/null)"
    [ -z "$command_text" ] && exit 0
fi

workdir="$(rt_hook_cwd)"
[ -z "$workdir" ] && workdir="${CLAUDE_PROJECT_DIR:-.}"
cd "$workdir" 2>/dev/null || exit 0
[ -f package.json ] || exit 0

# The tree profile: the package default first, the project override on top of it if there is one.
rt_hooks_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
for profile in "$rt_hooks_dir/../rt-kit/defaults/project.sh" "$rt_hooks_dir/../defaults/project.sh" "${CLAUDE_PROJECT_DIR:-.}/.claude/rt-kit/defaults/project.sh" "${CLAUDE_PROJECT_DIR:-.}/.claude/rt-kit/project.sh"; do
    # shellcheck disable=SC1090
    [ -f "$profile" ] && . "$profile" 2>/dev/null
done

# A word about a missing profile function: a hook that exited silently cannot be told from a
# working one. The file may not be laid out — then the old behaviour, the silent one, stays.
# shellcheck disable=SC1090
[ -f "$rt_hooks_dir/profile-check.sh" ] && . "$rt_hooks_dir/profile-check.sh"
command -v rt_needs >/dev/null 2>&1 || rt_needs() { command -v "$1" >/dev/null 2>&1; }
rt_needs rt_lint_for lint-after-edit || exit 0

# The write sign is asked after the profile: before it there are no functions yet. A tree that
# has not declared the sign keeps the old behaviour — a single move is parsed.
if [ "$mode" = "move" ] && rt_needs rt_shell_writes lint-after-edit; then
    case "$command_text" in
        *"git mv "*) ;;
        *) rt_shell_writes "$command_text" || exit 0 ;;
    esac
fi

# --- which files are checked -----------------------------------------------------------

# The destination paths of all moves in the command. A command can be compound, so it is cut by
# separators, and each piece is parsed on its own.
collect_moved() {
    # The trailing newline is mandatory: reading without it loses the last piece, and a command
    # most often consists of exactly one.
    printf '%s\n' "$1" | tr ';&\n' '\n\n\n' | while IFS= read -r segment; do
        case "$segment" in
            *"git mv "*) ;;
            *) continue ;;
        esac

        # shellcheck disable=SC2086 # splitting by spaces is exactly what is wanted here
        set -- ${segment#*git mv }
        args=''
        for arg in "$@"; do
            case "$arg" in
                -*) continue ;;
            esac
            args="${args}${args:+ }${arg}"
        done

        # shellcheck disable=SC2086
        set -- $args
        [ "$#" -lt 2 ] && continue

        dest=''
        for arg in "$@"; do dest="$arg"; done

        # The destination is a directory: the file name stays as it was, only the path changes.
        if [ -d "$dest" ]; then
            for arg in "$@"; do
                [ "$arg" = "$dest" ] && continue
                printf '%s/%s\n' "${dest%/}" "${arg##*/}"
            done
        else
            printf '%s\n' "$dest"
        fi
    done
}

# A directory is expanded into the files lying in it: a move can shift whole layers.
expand() {
    if [ -d "$1" ]; then
        find "$1" -type f \( -name '*.ts' -o -name '*.html' -o -name '*.scss' \) 2>/dev/null
    elif [ -f "$1" ]; then
        printf '%s\n' "$1"
    fi
}

if [ "$mode" = "edit" ]; then
    path="$(printf '%s' "$input" | jq -r '.tool_input.file_path // .tool_input.pathInProject // empty' 2>/dev/null)"
    [ -z "$path" ] && exit 0
    # A path from the tree root is made absolute once, so that the patterns do not double.
    case "$path" in
        /*) ;;
        *) path="${CLAUDE_PROJECT_DIR:-.}/$path" ;;
    esac
    candidates="$(expand "$path")"
else
    # A move expands a directory: it shifts whole layers. A write does not: writes always go to
    # a file, and a directory in a write command is the working directory, and expanded it hands
    # the linter half of the tree. So of the written paths only existing files are taken.
    written=""
    if rt_needs rt_shell_paths lint-after-edit; then
        written="$(rt_shell_paths "$command_text" 2>/dev/null | while IFS= read -r path; do
            [ -f "$path" ] && printf '%s\n' "$path"
        done)"
    fi
    candidates="$( { collect_moved "$command_text" | while IFS= read -r moved; do expand "$moved"; done
        printf '%s\n' "$written"; } | sort -u)"
fi

[ -z "$candidates" ] && exit 0

# --- screening out what the tree's linters do not cover ---------------------------------

lintable() {
    if rt_needs rt_is_app_code lint-after-edit; then
        rt_is_app_code "$1" || return 1
    fi
    if [ -n "${RT_LINT_SKIP_RE:-}" ] && printf '%s' "$1" | grep -qE "$RT_LINT_SKIP_RE"; then
        return 1
    fi

    return 0
}

# The linter name in the command is the first word that is not a launcher. It goes into the
# heading, and the push gate is searched by it too.
linter_name() {
    printf '%s' "$1" | awk '{
        for (i = 1; i <= NF; i++) {
            if ($i ~ /^(npx|pnpm|yarn|bun|npm|exec|run|dlx|--no-install)$/) { continue }
            print $i; exit
        }
    }'
}

# --- the run ----------------------------------------------------------------------------

push_checks="$(rt_needs rt_push_checks lint-after-edit && rt_push_checks 2>/dev/null)"

report=""
linters=""
covered=1
checked=0
path_gap=0

while IFS= read -r file; do
    [ -z "$file" ] && continue
    lintable "$file" || continue
    [ "$checked" -ge "$MAX_FILES" ] && break

    lint="$(rt_lint_for "$file" 2>/dev/null)"
    [ -z "$lint" ] && continue
    checked=$((checked + 1))

    # A command without the path of the edited file reads as a clean linter, and does one of two
    # things: walks the whole tree or checks nothing. There is nothing to tell it from an honest
    # run over the whole suite, so here is a word, not a refusal; said once per session — like
    # the word about a missing profile function.
    case "$lint" in
        *"$file"*) ;;
        *) path_gap=1 ;;
    esac

    out="$(eval "$lint" 2>&1)" && continue

    # There is no linter, or it crashed on its own — that is not a finding about the file, we
    # stay silent.
    printf '%s' "$out" | grep -qiE 'command not found|could not determine executable|Cannot find module' && continue

    linter="$(linter_name "$lint")"
    case " $linters " in
        *" $linter "*) ;;
        *) linters="${linters}${linters:+ }${linter}" ;;
    esac
    printf '%s' "$push_checks" | grep -qF "$linter" || covered=0

    report="${report}
${file}:
$(printf '%s' "$out" | head -c 2500 | tr -d '\000')
"
done <<EOF
$candidates
EOF

# The mark lives in the temporary files directory: on every edit the same line would repeat
# dozens of times per session and would stop being read.
if [ "$path_gap" = 1 ]; then
    gap_key="$(printf '%s' "$input" | jq -r '.session_id // empty' 2>/dev/null)"
    [ -z "$gap_key" ] && gap_key="$(date +%Y%m%d 2>/dev/null || printf 'nosession')"
    gap_mark="${TMPDIR:-/tmp}/rt-kit-lint-path-gap-$gap_key"
    if [ ! -f "$gap_mark" ]; then
        printf 'the linter on the trail of an edit: the command of the profile did not name the
' >&2
        printf 'edited file. It either walks the whole tree or checks nothing at all, and in both
' >&2
        printf 'cases looks like a clean linter. The path is substituted when the command is
' >&2
        printf 'printed — the sample stands in the default of the profile, the function rt_lint_for.
' >&2
        : >"$gap_mark" 2>/dev/null || true
    fi
fi

[ -z "$report" ] && exit 0

# Long output is cut: the fact and the first violations matter, the rest is visible in a full run.
report="$(printf '%s' "$report" | head -c 6000)"

if [ "$covered" -eq 1 ]; then
    tail_line="The push will not pass anyway while the suite is red."
else
    tail_line="Fix them now: this linter is not part of the push gate, and a postponed finding travels into the main branch in silence."
fi

case "$mode:$command_text" in
    # A move is named separately: a finding after it is explained not by an edit of the file but
    # by a change of its place, and without this line the reader looks for a miss in text that
    # nobody changed.
    move:*"git mv "*)
        head_line="THE LINTER (${linters}) FOUND ISSUES AFTER A MOVE. A move changes the lib, and with it the boundaries: an import lawful in the former place may be forbidden in the new one." ;;
    move:*)
        head_line="THE LINTER (${linters}) FOUND ISSUES AFTER A WRITE BY A COMMAND:" ;;
    *)
        head_line="THE LINTER (${linters}) FOUND ISSUES:" ;;
esac

ctx="${head_line}
${report}

Fix them before the task ends — ALL the issues in the touched file are fixed, the new ones and those that lay there before: accumulated violations drown the signal about fresh ones. ${tail_line}"

jq -n --arg c "$ctx" '{hookSpecificOutput:{hookEventName:"PostToolUse",additionalContext:$c}}' 2>/dev/null

exit 0
