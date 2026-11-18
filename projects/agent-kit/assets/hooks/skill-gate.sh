#!/usr/bin/env bash
# rt-hook: PreToolUse Edit|Write|MultiEdit|Bash|mcp__webstorm__create_new_file|mcp__webstorm__execute_terminal_command|mcp__webstorm__execute_tool|mcp__claude-in-chrome__.*|mcp__figma__use_figma
# Requires: checks/decide.mjs, hooks/decide.sh, hooks/deny-tail.sh
# The rules gate: it does not let a file be edited until the rule it falls under has been loaded.
#
# A law and a rule nobody opens do not act. A reminder in the prompt helps right up to the first
# rush, so the requirement is held by a hook: an edit is refused ONCE per session for each area,
# and after the rule is loaded the same area passes silently — there are no repeats, and it costs
# almost nothing.
#
# One thing does cancel the mark, and on purpose: compaction or clearing of the session window.
# `hooks/skill-gate-rearm.sh` removes the record then, and every area asks for its rule once more.
# The mark says "the rule is in the window", not "the rule was once read": after the compaction the
# text is gone from the window, and a gate that kept letting through would be letting the session
# work from a retelling. The re-arming is told to the session in words, so that it is not read as
# breakage.
#
# The "file — rule" map lives not here but in two files next door, and that is not duplication.
# The default — `.claude/rt-kit/defaults/gate-map.sh` — is carried by the package: the trees of
# this workshop are built alike, and rewriting one and the same map in each of them anew would
# mean as many editions of it as there are repositories. The override —
# `.claude/rt-kit/gate-map.sh` — is written by the project, and it is optional: a showcase, a file
# kind of its own, someone else's layout are not in every tree. Both declare
# `skill_for <call kind> <target> <edit text>`, printing rule names separated by a space; the
# override is loaded second and may call the default back — `skill_for_default`. There is neither
# — the gate passes everything: an empty gate is better than a gate that refuses at random.
#
# The call kind is `edit`, `bash`, `browser` or `design`. Browser verification and the design tool
# are the areas where a rule is needed not for a file edit but for a tool: what lies there is not
# the files but the stand and the coordinates, or the sheet of mockups. A rule the tree lacks is not
# demanded, so the design kind costs a tree without mockups nothing.
#
# FAIL-OPEN: any error and any unrecognised path let the edit through (exit 0). A broken gate has
# no right to stop the work altogether.

. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utf8.sh" 2>/dev/null || true
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/hook-input.sh" 2>/dev/null || true

rt_hook_read
input="$RT_HOOK_INPUT"
[ -z "$input" ] && exit 0

sid="$(printf '%s' "$input" | jq -r '.session_id // "nosession"' 2>/dev/null)"
tool="$(rt_hook_tool)"

# The default map is looked for next to the hook itself too: they travel together.
rt_hooks_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
for map in "$rt_hooks_dir/../rt-kit/defaults/gate-map.sh" "$rt_hooks_dir/../defaults/gate-map.sh" "${CLAUDE_PROJECT_DIR:-.}/.claude/rt-kit/defaults/gate-map.sh" "${CLAUDE_PROJECT_DIR:-.}/.claude/rt-kit/gate-map.sh"; do
    # shellcheck disable=SC1090
    [ -f "$map" ] && . "$map" 2>/dev/null
done
command -v skill_for >/dev/null 2>&1 || exit 0

# A working copy of the tree lies inside the tree's own agent directory, and the map branch for
# that directory caught every file of the copy: the gate demanded nothing there. The path is
# brought to the form it has in the main copy before the map reads it.
rt_gate_copy_path() {
    case "$1" in
        */.claude/worktrees/*/*) printf '%s' "$1" | sed -E 's#/\.claude/worktrees/[^/]+/#/#' ;;
        *) printf '%s' "$1" ;;
    esac
}

req=""
target=""
kind=""
case "$tool" in
    # The environment tool creates a file with the same two pieces of data, only it calls them
    # differently — without this branch a file was created past the gate.
    Edit|Write|MultiEdit|mcp__webstorm__create_new_file)
        target="$(printf '%s' "$input" | jq -r '.tool_input.file_path // .tool_input.pathInProject // empty' 2>/dev/null)"
        [ -z "$target" ] && exit 0
        # A path from the project root is brought to absolute once: otherwise the map would have
        # to be written in two forms, and the second would silently diverge from the first.
        case "$target" in
            /*) ;;
            ?*) target="${CLAUDE_PROJECT_DIR:-.}/$target" ;;
        esac
        # The rules of this tree act on the files of this tree. Without the root check the gate
        # would catch a neighbouring repository on the same machine too.
        case "$target" in
            "${CLAUDE_PROJECT_DIR:-.}"/*) ;;
            *) exit 0 ;;
        esac
        target="$(rt_gate_copy_path "$target")"
        # The edit text goes to the map as a second argument: there are rules that come into
        # force not from WHAT file is edited but from WHAT is written into it — a call to the
        # runtime arrives in an ordinary service, and a setting number in an ordinary class.
        written="$(printf '%s' "$input" | jq -r '[.tool_input.content, .tool_input.text, .tool_input.new_string, (.tool_input.edits[]?.new_string)] | map(select(. != null)) | join("\n")' 2>/dev/null)"
        req="$(skill_for edit "$target" "$written" 2>/dev/null)"
        # The layers on top of the domain rule lie in a separate file and are called in this same
        # shell: the domain rule is chosen once by the path, while there are a dozen and a half
        # layers, and together they do not fit into a map that is read whole. No file — the gate
        # stays one layer.
        # shellcheck disable=SC1090
        [ -f "$rt_hooks_dir/skill-gate-layers.sh" ] && . "$rt_hooks_dir/skill-gate-layers.sh" 2>/dev/null
        # The edit kind for the observation. One extension, without the path and without the file
        # name: an observation travels outside, and everything but the kind would be an address of
        # this tree there.
        case "${target##*/}" in
            *.*) kind="${target##*.}" ;;
            *) kind="none" ;;
        esac
        ;;
    # The environment terminal runs the same command line and puts it into the same field: without
    # this branch a commit from it required no rule, while the same commit from the shell did.
    Bash|mcp__webstorm__execute_terminal_command|mcp__webstorm__execute_tool)
        target="$(printf '%s' "$input" | jq -r '.tool_input.command // empty' 2>/dev/null)"
        [ -z "$target" ] && exit 0
        # The universal runner hides the real command in a nested string.
        if [ "$tool" = "mcp__webstorm__execute_tool" ] && command -v perl >/dev/null 2>&1; then
            inner="$(printf '%s' "$target" | perl -0ne '
                if (/--command(?:=|\s+)(?:"((?:[^"\\]|\\.)*)"|\x27([^\x27]*)\x27|(.+))/s) {
                    print defined $1 ? $1 : (defined $2 ? $2 : $3);
                }
            ' 2>/dev/null)"
            [ -n "$inner" ] && target="$inner"
        fi
        req="$(skill_for bash "$target" "" 2>/dev/null)"
        kind="command"
        # A shell command that writes a file is the same edit, and it needs the same rule. Without
        # this tier the gate is bypassed by changing not the tool but the way of writing: a refused
        # edit was laid down by a command twice within one session. The analysis is
        # `2026-08-15-guard-denied-shell-wrote-anyway.md`.
        for profile in "$rt_hooks_dir/../rt-kit/defaults/project.sh" "$rt_hooks_dir/../defaults/project.sh" "${CLAUDE_PROJECT_DIR:-.}/.claude/rt-kit/defaults/project.sh" "${CLAUDE_PROJECT_DIR:-.}/.claude/rt-kit/project.sh"; do
            # shellcheck disable=SC1090
            [ -f "$profile" ] && . "$profile" 2>/dev/null
        done
        if command -v rt_shell_writes >/dev/null 2>&1 && command -v rt_shell_paths >/dev/null 2>&1 \
            && rt_shell_writes "$target"; then
            while IFS= read -r written_path; do
                [ -z "$written_path" ] && continue
                case "$written_path" in
                    /*) ;;
                    *) written_path="${CLAUDE_PROJECT_DIR:-.}/$written_path" ;;
                esac
                case "$written_path" in
                    "${CLAUDE_PROJECT_DIR:-.}"/*) ;;
                    *) continue ;;
                esac
                written_path="$(rt_gate_copy_path "$written_path")"
                more="$(skill_for edit "$written_path" "" 2>/dev/null)"
                [ -n "$more" ] && req="$req $more"
            done <<EOF
$(rt_shell_paths "$target")
EOF
        fi
        ;;
    mcp__claude-in-chrome__*)
        req="$(skill_for browser "$tool" "" 2>/dev/null)"
        kind="browser"
        ;;
    mcp__figma__use_figma)
        req="$(skill_for design "$tool" "" 2>/dev/null)"
        kind="design"
        ;;
    *) exit 0 ;;
esac

# Every file edit the gate sees, with a rule or without one: the share of edits that met a rule not
# yet loaded needs its denominator. A call of a tool is not an edit.
case "$kind" in
    command | browser | design | '') ;;
    *)
        # shellcheck disable=SC1091
        . "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/observe.sh" 2>/dev/null \
            && rt_note edit-seen "kind=$kind" "sid=$sid"
        ;;
esac

[ -z "$req" ] && exit 0

# The map may name several rules: the domain rule and the one that acts as a second layer. The
# first unloaded one is demanded, not all at once: a refusal listing three rules reads as "load
# three", and they get loaded one after another, losing that very one-time-ness.
# A subagent has a context of its own: a rule delivered there is recorded under its id, never for
# the parent, or the parent's edits would pass unread.
agent="$(printf '%s' "$input" | jq -r '.agent_id // empty' 2>/dev/null)"
loaded="${TMPDIR:-/tmp}/claude-skill-gate/${agent:-$sid}.loaded"
root="${CLAUDE_PROJECT_DIR:-.}"
rules_dir="${RT_RULES_DIR:-.claude/skills}"
want=""
for name in $req; do
    # A rule the tree does not have, the gate does not demand. The default map names what the tree
    # dropped by a list too: a rule of a subject area, someone else's file kind. A refusal "load
    # rule X" on such a name is a refusal with nothing to do: there is nothing to load, and the
    # work stops altogether.
    [ -f "$root/$rules_dir/${name}/SKILL.md" ] || continue
    # Both a bare rule name and a name with a directory area ("<directory>:<name>") are accepted.
    if [ -f "$loaded" ] && grep -qE "^([^:]*:)?$(printf '%s' "$name" | sed 's/[][\.*^$/]/\\&/g')$" "$loaded" 2>/dev/null; then
        continue
    fi
    want="$name"
    break
done
[ -z "$want" ] && exit 0

# What will be needed further along this same command. Still one rule at a time is demanded, but
# the session sees the length of the path from the first refusal: on a sweeping edit the refusals
# come one per call and read as different requirements — thirteen in a row for one task, and each
# cost a turn.
ahead=""
for name in $req; do
    [ "$name" = "$want" ] && continue
    [ -f "$root/$rules_dir/${name}/SKILL.md" ] || continue
    if [ -f "$loaded" ] && grep -qE "^([^:]*:)?$(printf '%s' "$name" | sed 's/[][\.*^$/]/\\&/g')$" "$loaded" 2>/dev/null; then
        continue
    fi
    ahead="${ahead}${ahead:+, }${name}"
done

# The delivery. Every rule of the call not yet loaded arrives in the session by this very answer,
# and the call goes on: a refusal "load and repeat" was followed by a load almost every time and
# caught nothing. The text is the tree's SKILL.md byte for byte; the host puts a context field of
# up to the limit into the session whole and cuts a longer one, so a text over the limit is not
# delivered — the refusal below stays for it. A call without a session id has no record to write
# into and is refused too: every call of it would deliver anew.
gate_limit="${RT_GATE_CONTEXT_LIMIT:-10000}"
case "$gate_limit" in '' | *[!0-9]*) gate_limit=10000 ;; esac
# Reads a file into `gate_body` byte for byte: a command substitution strips trailing newlines,
# so the text is read with a marker after it and the marker is cut off in place.
rt_gate_read() {
    gate_body=""
    [ -r "$1" ] || return 1
    gate_body="$(cat "$1" 2>/dev/null && printf x)" || return 1
    gate_body="${gate_body%x}"
}
rt_gate_law_path() {
    local law path
    law="$(sed -n 's/^law:[[:space:]]*//p' "$root/$rules_dir/$1/SKILL.md" 2>/dev/null | head -1)"
    [ -z "$law" ] && return 0
    path="${RT_LAWS_DIR:-docs/constitution}/${law}.md"
    [ -f "$root/$path" ] || path="${RT_LAWS_DIR:-docs/constitution}/application/${law}.md"
    [ -f "$root/$path" ] && printf '%s' "$path"
    return 0
}
need=()
for name in $req; do
    [ -f "$root/$rules_dir/${name}/SKILL.md" ] || continue
    if [ -f "$loaded" ] && grep -qE "^([^:]*:)?$(printf '%s' "$name" | sed 's/[][\.*^$/]/\\&/g')$" "$loaded" 2>/dev/null; then
        continue
    fi
    # Two writes of one command may name the same rule: it is delivered once.
    case " ${need[*]} " in *" $name "*) continue ;; esac
    need+=("$name")
done
gate_unread=""
gate_why=""
if [ "$sid" != "nosession" ] && [ "${#need[@]}" -gt 0 ]; then
    head_line="Passed by the rules gate: the call went through, and the text of"
    i=0
    for name in "${need[@]}"; do
        lp="$(rt_gate_law_path "$name")"
        [ "$i" -gt 0 ] && head_line="${head_line},"
        head_line="${head_line} the rule «${name}»${lp:+ (it applies the law ${lp} to this tree)}"
        i=$((i + 1))
    done
    head_line="${head_line} arrived below whole, the same as a load by the tool Skill. For this area it happens once per session."
    rules=()
    comps=()
    for name in "${need[@]}"; do
        rt_gate_read "$root/$rules_dir/${name}/SKILL.md" || { gate_unread="$name"; break; }
        rules+=("

=== ${rules_dir}/${name}/SKILL.md ===
${gate_body}")
        comps+=("")
    done
    # Assembles the delivered text into `text`, in place: a substitution would cut its tail.
    rt_gate_text() {
        local k
        text="$head_line"
        for k in "${!rules[@]}"; do text="${text}${rules[$k]}${comps[$k]}"; done
    }
    rt_gate_text
    if [ -z "$gate_unread" ] && [ "${#text}" -le "$gate_limit" ]; then
        # The companions go after the rules fit: a companion falls back to its path before a rule
        # is dropped. Each is placed whole right after its rule while the whole text still fits.
        for k in "${!need[@]}"; do
            comp="$rules_dir/${need[$k]}/implementation.md"
            [ -f "$root/$comp" ] || continue
            if rt_gate_read "$root/$comp"; then
                comps[k]="

=== ${comp} ===
${gate_body}"
                rt_gate_text
                [ "${#text}" -le "$gate_limit" ] && continue
            fi
            comps[k]="

The companion of the rule — ${comp} — did not fit here and is read as a file: the rule says what must be true, the companion — by what that is true here."
            rt_gate_text
            if [ "${#text}" -gt "$gate_limit" ]; then
                comps[k]=""
                rt_gate_text
            fi
        done
        dir="${TMPDIR:-/tmp}/claude-skill-gate"
        recorded=1
        mkdir -p "$dir" 2>/dev/null || recorded=0
        if [ "$recorded" = 1 ]; then
            printf '%s\n' "${need[@]}" >> "$loaded" 2>/dev/null || recorded=0
        fi
        # shellcheck disable=SC1091
        . "$rt_hooks_dir/observe.sh" 2>/dev/null
        if command -v rt_note >/dev/null 2>&1; then
            # An unwritten name costs one more delivery of the same rule; the note says so.
            unrec=""
            [ "$recorded" = 1 ] || unrec="unrecorded=yes"
            for name in "${need[@]}"; do
                rt_note gate-deliver "res=$name" "kind=$kind" "sid=$sid" $unrec
            done
        fi
        jq -cn --arg c "$text" '{hookSpecificOutput:{hookEventName:"PreToolUse",additionalContext:$c}}'
        exit 0
    fi
    # Why nothing was delivered: the refusal names it, and the week report counts by it.
    if [ -n "$gate_unread" ]; then
        gate_why="not-read"
        want="$gate_unread"
    else
        gate_why="together"
        for k in "${!rules[@]}"; do
            alone="${head_line}${rules[$k]}"
            if [ "${#alone}" -gt "$gate_limit" ]; then
                gate_why="too-long"
                want="${need[$k]}"
                break
            fi
        done
    fi
fi

req="$want"

# A refusal is an observation: the rule that has to be demanded more often than the rest, and the
# edit kind on which that happens, say more about the rules layer than a list of what was loaded.
# The decider writes it when the table refuses, named by the decision: «gate-<decision>».
[ "$sid" = "nosession" ] && gate_why="no-session"
RT_DECIDE_NOTE="gate res=$req kind=$kind sid=$sid${gate_why:+ why=$gate_why}"

# The fallback move is named in the refusal itself: a rule created in this same branch is unknown
# to the rules registry — it is assembled at session start, while the gate reads the disk. Without
# this line the next session looks for a bypass by trial and usually finds the wrong one.
fallback="If the tool does not know such a name, the rule was created after the session began — read ${rules_dir}/${req}/SKILL.md and the companion next to it."
reason="Refused by the rules gate: load the rule «${req}» by the tool Skill and repeat the action. ${fallback} For this area it happens once per session."

# A rule names its law in one word, while there are two layers of laws: the shared one lies at the
# root, the application law in a directory under it. The path is looked for, not assembled from
# the name, otherwise the refusal leads to a file that does not exist for exactly those rules
# whose law is subject-specific.
laws_dir="${RT_LAWS_DIR:-docs/constitution}"
law="$(sed -n 's/^law:[[:space:]]*//p' "$root/$rules_dir/${req}/SKILL.md" 2>/dev/null | head -1)"
if [ -n "$law" ]; then
    law_path="$laws_dir/${law}.md"
    [ -f "$root/$law_path" ] || law_path="$laws_dir/application/${law}.md"
    [ -f "$root/$law_path" ] \
        && reason="Refused by the rules gate: load the rule «${req}» by the tool Skill — it applies the law ${law_path} to this tree — and repeat the action. ${fallback} For this area it happens once per session."
fi

# The article this edit falls under. A rule weighs from twenty to sixty kilobytes, and a refusal
# that calls it whole pays the full price of the rule for one decision. An article says whether it
# applies itself — a helper next door parses that; there is no helper or there are no marked
# articles, the refusal stays as it was, and that is the same fail-open as everywhere.
#
# The article does not cancel loading the rule: it removes reading the rule whole, not the refusal
# itself. The rule whole stays the second move — for whoever finds the article not enough.
# shellcheck disable=SC1090
[ -f "$rt_hooks_dir/rule-article.sh" ] && . "$rt_hooks_dir/rule-article.sh" 2>/dev/null
if [ "$kind" != "command" ] && [ "$kind" != "browser" ] && [ "$kind" != "design" ] && command -v rt_rule_article_heads >/dev/null 2>&1; then
    article="$(rt_rule_article_heads "$root/$rules_dir/${req}/SKILL.md" "$target" 2>/dev/null)"
    if [ -n "$article" ]; then
        reason="Refused by the rules gate. This edit falls under the articles of the rule «${req}»:

${article}

The text of these articles arrives with the rule itself, and retelling it here would mean paying for one text twice: load the rule «${req}» by the tool Skill and repeat the action. ${fallback} For this area it happens once per session."
    fi
fi

# What will be needed further along this same command. The line stands after all the text
# branches: there are three of them, and each rewrites the reason whole.
[ -n "$ahead" ] && reason="${reason} Further along this same command these will be needed: ${ahead}."

# Why the gate did not put the rule into the session itself. Rules that do not fit together are
# refused together and named all at once: nothing was delivered, so they are loaded in one turn.
case "$gate_why" in
    too-long)
        reason="${reason} The rule «${req}» is longer than the host limit of ${gate_limit} characters, so the gate does not put it into the session: read ${rules_dir}/${req}/SKILL.md by the tool Read, and the read counts as a load."
        ;;
    not-read)
        reason="${reason} The gate could not read ${rules_dir}/${req}/SKILL.md, so it did not put the rule into the session."
        ;;
    together)
        names=""
        for name in "${need[@]}"; do names="${names}${names:+, }«${name}»"; done
        reason="Refused by the rules gate: the rules ${names} of this call do not fit the host limit of ${gate_limit} characters together, so none of them arrived: load all of them by the tool Skill in one turn and repeat the action. ${fallback}"
        ;;
esac

# The companion is called by a sentence of its own and for all kinds of refusal at once. Before,
# it was named only as a fallback move — "if the tool does not know such a name" — and a reader
# who had the name known never got to it at all. The price of that: the rule names a way, and the
# companion next door declares it impossible here; work done the way the rule names ended in a
# result that did not exist for the one who ordered it, while the sections of the companion were
# not opened once in that session.
companion="$rules_dir/${req}/implementation.md"
[ -f "$root/$companion" ] && reason="${reason}

The companion of the rule — ${companion} — is read together with it: the rule says what must be true, the companion — by what that is true here and what is named impossible here. It is not loaded by the tool, it is read as a file."

# The decision and the move come from the decision table; the text is built here — the rule, its
# law, the articles of the edit and the companion are read from the tree — and the table carries it
# as the slot `{reason}`. The action is the class of this call.
# shellcheck disable=SC1091
. "$rt_hooks_dir/decide.sh" 2>/dev/null
command -v rt_decide >/dev/null 2>&1 \
    && rt_decide skill-gate.sh "?edit_code" '{"rule_loaded":"no"}' "$(jq -cn --arg r "$reason" '{reason:$r}')" PreToolUse "$input"
exit 0
