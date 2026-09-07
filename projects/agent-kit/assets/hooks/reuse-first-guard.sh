#!/usr/bin/env bash
# rt-hook: PreToolUse Edit|Write|MultiEdit|Bash|mcp__webstorm__create_new_file|mcp__webstorm__execute_terminal_command|mcp__webstorm__execute_tool
# Requires: hooks/profile-check.sh, hooks/deny-tail.sh
# The "nothing is written from scratch" guard. PreToolUse on an edit of code and markup.
#
# Linters know the rules, but they do not know the INVENTORY: the style linter catches a raw
# colour, the code linter an untyped value, but neither of them knows that a ready-made message is
# already written, and both silently let through a notification area of one's own with its text,
# its button and its styles. The guard closes exactly this hole: it checks what is being written
# against what the tree already has.
#
# The rule as a whole is `reuse-first`.
#
# What counts as a reinvention is known by the tree profile: the function `rt_reinvented_in <file>`
# prints a line per rule, four fields separated by tabs:
#
#   <over what>  <pattern>  <cancelling pattern>  <what to use instead>
#
# "Over what" is `added` (only the new text of the edit) or `whole` (the edit together with the
# content of the file). The second is needed where the sign is visible only as a whole: inheriting
# a base and the mark of a procedure do not get into a point edit. The "cancelling pattern" puts
# the rule out: a mapper that already inherits the shared base is never a reinvention; an empty
# field puts nothing out.
#
# The function gets the path and may decide by it on its own — look into the kit inventory, tell
# the layers of the tree apart, stay silent on a file that already exists. No profile or no
# function — the guard lets through: the package cannot know the inventory of the tree.
#
# The patterns are parsed by `perl`: conjunction and negation are written by lookahead, and without
# them a hand-made overlay is not to be told from a sticky header, nor a native button from a kit
# button.
#
# The deliberate exit: the departure marker in the text of the edit. It explains what exactly is
# missing; "these lines were here before" does not count as a reason, and that is why only the NEW
# text is checked.
#
# FAIL-OPEN: no parser, broken input, a foreign tool — let through.

# Its own name in the observations: the refusal is written by the shared deny tail, not by the
# guard itself.
RT_GUARD_NAME=reuse-first-guard

. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utf8.sh" 2>/dev/null || true
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/hook-input.sh" 2>/dev/null || true

rt_hook_read
input="$RT_HOOK_INPUT"
[ -z "$input" ] && exit 0
command -v jq >/dev/null 2>&1 || exit 0
command -v perl >/dev/null 2>&1 || exit 0

tool="$(rt_hook_tool)"
shell_cmd=""
case "$tool" in
    # The environment tool creates a file with the same two pieces of data, it only calls them
    # differently — without this branch a file was created past every check.
    Edit | Write | MultiEdit | mcp__webstorm__create_new_file) ;;
    # A shell command that writes a file is the same edit. Without this branch the guard is
    # bypassed by changing not the tool but the way of writing; the text of the edit is then the
    # command itself, and what it creates in a heredoc is read on a par with the body of the edit.
    # Incident analysis — `2026-08-15-guard-denied-shell-wrote-anyway.md`.
    #
    # The environment terminal runs the same command line and puts it in the same field: without
    # these two names the guard would stand declared on them and let through silently — a state
    # worse than an undeclared one, because from the outside it looks closed.
    Bash | mcp__webstorm__execute_terminal_command | mcp__webstorm__execute_tool)
        shell_cmd="$(rt_hook_cmd)"
        [ -z "$shell_cmd" ] && exit 0
        # The universal executor hides the real command in a nested string: without parsing it the
        # path stands behind a quote, and no pattern reaches it.
        if [ "$tool" = "mcp__webstorm__execute_tool" ] && command -v perl >/dev/null 2>&1; then
            inner="$(printf '%s' "$shell_cmd" | perl -0ne '
                if (/--command(?:=|\s+)(?:"((?:[^"\\]|\\.)*)"|\x27([^\x27]*)\x27|(.+))/s) {
                    print defined $1 ? $1 : (defined $2 ? $2 : $3);
                }
            ' 2>/dev/null)"
            [ -n "$inner" ] && shell_cmd="$inner"
        fi
        ;;
    *) exit 0 ;;
esac

# The tree profile: first the package default, and the project override on top of it, if there is
# one. It is read before the path is parsed: the paths out of a shell command are extracted by the
# profile itself.
rt_hooks_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
for profile in "$rt_hooks_dir/../rt-kit/defaults/project.sh" "$rt_hooks_dir/../defaults/project.sh" "${CLAUDE_PROJECT_DIR:-.}/.claude/rt-kit/defaults/project.sh" "${CLAUDE_PROJECT_DIR:-.}/.claude/rt-kit/project.sh"; do
    # shellcheck disable=SC1090
    [ -f "$profile" ] && . "$profile" 2>/dev/null
done

if [ -n "$shell_cmd" ]; then
    command -v rt_shell_writes >/dev/null 2>&1 && command -v rt_shell_paths >/dev/null 2>&1 || exit 0
    rt_shell_writes "$shell_cmd" || exit 0
    # Out of the command the first path is taken whose extension the guard cares about: the rest
    # are indifferent to it.
    path=""
    while IFS= read -r candidate; do
        case "$candidate" in
            *.html | *.scss | *.ts) path="$candidate"; break ;;
        esac
    done <<EOF
$(rt_shell_paths "$shell_cmd")
EOF
    [ -z "$path" ] && exit 0
else
    path="$(printf '%s' "$input" | jq -r '.tool_input.file_path // .tool_input.pathInProject // empty' 2>/dev/null)"
fi
# A path from the root of the tree is made absolute once, so that the patterns do not double up.
case "$path" in
    /*) ;;
    ?*) path="${CLAUDE_PROJECT_DIR:-.}/$path" ;;
esac
case "$path" in
    *.html | *.scss | *.ts) ;;
    *) exit 0 ;;
esac

# A word about a missing profile function: a hook that left silently is indistinguishable from a
# working one. The file may be not laid out — then the previous behaviour stays, the silent one.
# shellcheck disable=SC1090
[ -f "$rt_hooks_dir/profile-check.sh" ] && . "$rt_hooks_dir/profile-check.sh"
command -v rt_needs >/dev/null 2>&1 || rt_needs() { command -v "$1" >/dev/null 2>&1; }
rt_needs rt_reinvented_in reuse-first-guard || exit 0

# The rules of this tree apply to the code of this tree: without a positive check the guard would
# demand assembling from the ready-made in a draft outside the tree as well.
if rt_needs rt_is_app_code reuse-first-guard; then
    rt_is_app_code "$path" || exit 0
fi

# The ready-made is assembled where it belongs: inside the kit native controls and primitives are
# in place, and the showcase and the tests are not this guard's concern either.
if [ -n "${RT_REUSE_SKIP_RE:-}" ] && printf '%s' "$path" | grep -qE "$RT_REUSE_SKIP_RE"; then
    exit 0
fi

# Only the new text: a line that already lay in the file was not created by this edit. For a shell
# command that text is the command itself: what it puts into the file lies in it.
if [ -n "$shell_cmd" ]; then
    added="$shell_cmd"
else
    added="$(printf '%s' "$input" | jq -r '
        [ .tool_input.content?, .tool_input.text?, .tool_input.new_string?, (.tool_input.edits[]?.new_string) ]
        | map(select(. != null)) | join("\n")
    ' 2>/dev/null)"
fi
[ -z "$added" ] && exit 0

# An explicit refusal of the rule: there is no such ready-made, the author realised it and marked
# it. It is counted by the source text of the edit, before the crossing-out below: the marker
# usually stands on a line that already lies in the file, and a crossed-out marker would refuse an
# edit of the neighbouring line.
case "$added" in
    *native-ok*) exit 0 ;;
esac

# A move is not writing anew. A line that already lies in the file the guard crosses out of the
# text being checked: a block that travelled together with a screen from one place of the file to
# another was refused on a par with a new one, and the departure marker had to be set blindly.
#
# The comparison goes without indentation: on a move a block changes its indent while staying the
# same code.
if [ -f "$path" ]; then
    added="$(
        printf '%s' "$added" | awk '
            NR == FNR {
                line = $0
                gsub(/^[ \t]+|[ \t]+$/, "", line)
                if (line != "") { existing[line] = 1 }
                next
            }
            {
                line = $0
                gsub(/^[ \t]+|[ \t]+$/, "", line)
                if (line == "" || !(line in existing)) { print }
            }
        ' "$path" - 2>/dev/null
    )"
    [ -z "${added//[[:space:]]/}" ] && exit 0
fi

# A sign visible only as a whole over the file (inheriting a base, the mark of a procedure) is
# counted by the resulting content: a point edit brings a piece without the class declaration.
whole="$added"
if [ -f "$path" ]; then
    whole="$added
$(cat "$path" 2>/dev/null)"
fi

has_re() {
    printf '%s' "$1" | RT_RE="$2" perl -0777 -ne 'exit(/$ENV{RT_RE}/s ? 0 : 1)' 2>/dev/null
}

# What the tree declared as its own: the sets of signs and the file of its own ones. The checks
# settings are the same ones the full check reads; the directory of the sets is named by the tree
# profile, because the layout of the checks is each tree's own.
rt_checks_json="${CLAUDE_PROJECT_DIR:-.}/.claude/rt-kit/checks.json"
rt_bundles=''
rt_own_signals=''
rt_backend_roots=''
if [ -f "$rt_checks_json" ]; then
    rt_bundles="$(jq -r '.reuse.bundles[]? // empty' "$rt_checks_json" 2>/dev/null | tr '\n' ' ')"
    own="$(jq -r '.reuse.signals // empty' "$rt_checks_json" 2>/dev/null)"
    [ -n "$own" ] && rt_own_signals="${CLAUDE_PROJECT_DIR:-.}/$own"
    # By the same key the full check reads them: a second declaration of the same roots would
    # diverge from the first silently.
    rt_backend_roots="$(jq -r '.backendRoots[]? // empty' "$rt_checks_json" 2>/dev/null | tr '\n' ' ')"
fi

# A path from the root of the tree: the pattern in a sign is written by the tree, and it cannot
# write it from the root of the machine. The absolute path is needed only to read the file from disk.
rel_path="${path#"${CLAUDE_PROJECT_DIR:-.}"/}"
rt_signals_dir="${CLAUDE_PROJECT_DIR:-.}/${RT_REUSE_SIGNALS_DIR:-tools/signals}"

# The signs of the declared sets: the full check reads the same files. If the key of a sign matched
# the key of the tree, the tree wins: it sees its own ready-made, and the package did not see it.
signals_json() {
    [ -n "$rt_signals_dir" ] || return 0
    [ -d "$rt_signals_dir" ] || return 0
    # The layout header is stripped before parsing: JSON has no comment, and the parse falls on it.
    for name in $rt_bundles; do
        file="$rt_signals_dir/$name.json"
        [ -f "$file" ] && grep -v '^# rt-kit ' "$file" | jq -c '.signals[]?' 2>/dev/null
    done
    [ -n "$rt_own_signals" ] && [ -f "$rt_own_signals" ] && grep -v '^# rt-kit ' "$rt_own_signals" | jq -c '.signals[]?' 2>/dev/null
}

# The fields are read one by one, not by parsing the line: a tab in `IFS` is a whitespace separator,
# and an empty field in the middle collapses, because of which the advice travels into the
# cancelling pattern and puts the sign out silently.
field() { printf '%s' "$1" | jq -r "$2 // empty" 2>/dev/null; }

found=''
signals_seen=0
while IFS= read -r signal; do
    [ -z "$signal" ] && continue
    signals_seen=1
    ext="$(field "$signal" '.ext')"
    case "$ext" in
        '') ;;
        *) case "$path" in *"$ext") ;; *) continue ;; esac ;;
    esac
    # Skipping the backend roots: a sign declared with it does not apply on the backend at all —
    # another way is accepted there, and the backend has no base class the sign demands. The full
    # check reads the field too; reading it in one of the two would mean refusing by the guard
    # exactly the edit the check lets through — and there would be nothing else to put it through
    # with: the departure marker declares a bypass of the ready-made, and there was no bypass here.
    if [ "$(field "$signal" '.skipBackendRoots')" = 'true' ] && [ -n "$rt_backend_roots" ]; then
        skip_backend=''
        for backend_root in $rt_backend_roots; do
            case "$rel_path" in "$backend_root"*) skip_backend=1 ;; esac
        done
        [ -n "$skip_backend" ] && continue
    fi

    # The name pattern is checked against the path from the root of the tree, not against the file
    # name: the layers the sign separates call their files alike, and by name they are
    # indistinguishable. The full check checks against the path — they must not diverge.
    only_named="$(field "$signal" '.onlyNamed')"
    if [ -n "$only_named" ]; then
        printf '%s' "$rel_path" | grep -qE "$only_named" || continue
    fi

    # The other side of the name pattern: a tree that writes the ready-made itself takes the source
    # folders of that ready-made out from under the sign. Without it such a tree has one choice —
    # not to take the set at all, and then inside the set of ready-made components nothing catches
    # a bypass of the ready-made. The full check reads the field too: they must not diverge.
    except_named="$(field "$signal" '.exceptNamed')"
    if [ -n "$except_named" ]; then
        printf '%s' "$rel_path" | grep -qE "$except_named" && continue
    fi

    case "$(field "$signal" '.scope')" in
        whole) text="$whole" ;;
        *) text="$added" ;;
    esac

    pattern="$(field "$signal" '.find')"
    [ -z "$pattern" ] && continue
    strip="$(field "$signal" '.strip')"
    [ -n "$strip" ] && text="$(printf '%s' "$text" | RT_RE="$strip" perl -0777 -pe 's/$ENV{RT_RE}//gs' 2>/dev/null)"

    has_re "$text" "$pattern" || continue

    cancel="$(field "$signal" '.cancel')"
    [ -n "$cancel" ] && has_re "$text" "$cancel" && continue

    skip_signal=''
    while IFS= read -r one; do
        [ -z "$one" ] && continue
        has_re "$text" "$one" || skip_signal=1
    done <<ALL
$(printf '%s' "$signal" | jq -r '.all[]? // empty' 2>/dev/null)
ALL
    [ -n "$skip_signal" ] && continue

    found="${found}
  - $(field "$signal" '.instead')"
done <<EOF
$(signals_json | jq -s -c 'reduce .[] as $one ({}; .[$one.key] = $one) | .[]' 2>/dev/null)
EOF

# The profile function stays the second source: trees have already written it. The fields are read
# line by line, by the same four columns declared above.
while IFS= read -r line; do
    [ -z "$line" ] && continue
    signals_seen=1
    scope="$(printf '%s' "$line" | cut -f1)"
    pattern="$(printf '%s' "$line" | cut -f2)"
    cancel="$(printf '%s' "$line" | cut -f3)"
    replacement="$(printf '%s' "$line" | cut -f4)"
    [ -z "$pattern" ] && continue
    case "$scope" in
        whole) text="$whole" ;;
        *) text="$added" ;;
    esac
    has_re "$text" "$pattern" || continue
    [ -n "$cancel" ] && has_re "$text" "$cancel" && continue
    found="${found}
  - ${replacement}"
done <<EOF
$(rt_reinvented_in "$path" 2>/dev/null)
EOF

# A guard without a single sign is indistinguishable from a guard that has nothing to refuse. It
# lets the edit through — there is nothing to stop the work over an unconfigured tree for — but it
# says what this is configured with.
if [ "$signals_seen" = 0 ]; then
    printf '%s\n' 'reuse-first-guard: признаков нет — объявите наборы ключом `reuse.bundles` в настройке проверок' >&2
    exit 0
fi

[ -z "$found" ] && exit 0

reason="BLOCKED: это уже написано. Файл: ${path##*/}
${found}

Порядок действий: 1) открой готовое — барель кита или базовый класс — и используй его; 2) найди в дереве экран, где этот случай уже собран, и повтори сборку; 3) если готового правда не хватает — расширяй его на месте, у готового, а не клонируй рядом: клон забирает правки на себя и расходится с оригиналом с первой же.
Свой примитив, своя основа и свои инлайновые стили заводятся только с явного одобрения владельца, и спрашивается это до первого написанного файла. Разовое исключение помечается маркером отступления в той же строке, с объяснением, чего именно нет в готовом. Переименованием файла это не обходится."

# The shared refusal tail: the two lawful moves and the lawful form of the bypass, if the refusal
# has one. The file may be not laid out — then there is no tail, and the reason for the refusal
# stays as it was.
# shellcheck disable=SC1090
[ -f "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" ] \
    && . "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" 2>/dev/null
command -v rt_deny_tail >/dev/null 2>&1 || rt_deny_tail() { :; }
deny_tail_text="$(rt_deny_tail "маркер отступления в той же строке, с объяснением, чего именно нет в готовом")"
[ -n "$deny_tail_text" ] && reason="${reason}

${deny_tail_text}"

jq -n --arg r "$reason" '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:$r}}' 2>/dev/null \
    || printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"Написано своё там, где готовое уже есть."}}\n'

exit 0
