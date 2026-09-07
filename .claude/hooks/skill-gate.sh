#!/usr/bin/env bash
# rt-kit v0.25.0 · hooks/skill-gate.sh · c2c089ad24e6 · правится надстройкой, не здесь
# rt-hook: PreToolUse Edit|Write|MultiEdit|Bash|mcp__webstorm__create_new_file|mcp__webstorm__execute_terminal_command|mcp__webstorm__execute_tool|mcp__claude-in-chrome__.*
# Requires: hooks/deny-tail.sh
# The rules gate: it does not let a file be edited until the rule it falls under has been loaded.
#
# A law and a rule nobody opens do not act. A reminder in the prompt helps right up to the first
# rush, so the requirement is held by a hook: an edit is refused ONCE per session for each area,
# and after the rule is loaded the same area passes silently — there are no repeats, and it costs
# almost nothing.
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
# The call kind is `edit`, `bash` or `browser`. Browser verification is the only area where a rule
# is needed not for a file edit but for a tool: what lies there is not the files but the stand and
# the coordinates.
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
    *) exit 0 ;;
esac

[ -z "$req" ] && exit 0

# The map may name several rules: the domain rule and the one that acts as a second layer. The
# first unloaded one is demanded, not all at once: a refusal listing three rules reads as "load
# three", and they get loaded one after another, losing that very one-time-ness.
loaded="${TMPDIR:-/tmp}/claude-skill-gate/${sid}.loaded"
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

req="$want"

# A refusal is an observation: the rule that has to be demanded more often than the rest, and the
# edit kind on which that happens, say more about the rules layer than a list of what was loaded.
# shellcheck disable=SC1090
[ -f "$rt_hooks_dir/observe.sh" ] && . "$rt_hooks_dir/observe.sh" 2>/dev/null
command -v rt_note >/dev/null 2>&1 && rt_note gate-deny "res=$req" "kind=$kind" "sid=$sid"

# The fallback move is named in the refusal itself: a rule created in this same branch is unknown
# to the rules registry — it is assembled at session start, while the gate reads the disk. Without
# this line the next session looks for a bypass by trial and usually finds the wrong one.
fallback="Если инструмент такого имени не знает, правило завели после начала сессии — прочитай ${rules_dir}/${req}/SKILL.md и спутник рядом с ним."
reason="Отбито гейтом правил: загрузи правило «${req}» инструментом Skill и повтори действие. ${fallback} Для этой области это происходит один раз за сессию."

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
        && reason="Отбито гейтом правил: загрузи правило «${req}» инструментом Skill — оно применяет закон ${law_path} к этому дереву — и повтори действие. ${fallback} Для этой области это происходит один раз за сессию."
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
if [ "$kind" != "command" ] && [ "$kind" != "browser" ] && command -v rt_rule_article_heads >/dev/null 2>&1; then
    article="$(rt_rule_article_heads "$root/$rules_dir/${req}/SKILL.md" "$target" 2>/dev/null)"
    if [ -n "$article" ]; then
        reason="Отбито гейтом правил. Под эту правку подпадают статьи правила «${req}»:

${article}

Текст этих статей придёт в контекст вместе с правилом, и пересказывать его здесь значило бы платить за один текст дважды: загрузи правило «${req}» инструментом Skill и повтори действие. ${fallback} Для этой области это происходит один раз за сессию."
    fi
fi

# What will be needed further along this same command. The line stands after all the text
# branches: there are three of them, and each rewrites the reason whole.
[ -n "$ahead" ] && reason="${reason} Дальше по этой команде потребуются: ${ahead}."

# The companion is called by a sentence of its own and for all kinds of refusal at once. Before,
# it was named only as a fallback move — "if the tool does not know such a name" — and a reader
# who had the name known never got to it at all. The price of that: the rule names a way, and the
# companion next door declares it impossible here; work done the way the rule names ended in a
# result that did not exist for the one who ordered it, while the sections of the companion were
# not opened once in that session.
companion="$rules_dir/${req}/implementation.md"
[ -f "$root/$companion" ] && reason="${reason}

Спутник правила — ${companion} — читается вместе с ним: правило говорит, что должно быть верно, а спутник — чем это верно здесь и что здесь названо невозможным. Инструментом он не грузится, его читают файлом."

# The shared deny tail: the two lawful moves and the lawful form of bypass, if the refusal has one.
# The file may not be laid out — then there is no tail, and the reason for the refusal stays as it
# was.
# shellcheck disable=SC1090
[ -f "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" ] \
    && . "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" 2>/dev/null
command -v rt_deny_tail >/dev/null 2>&1 || rt_deny_tail() { :; }
deny_tail_text="$(rt_deny_tail "")"
[ -n "$deny_tail_text" ] && reason="${reason}

${deny_tail_text}"

jq -n --arg r "$reason" '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:$r}}' 2>/dev/null \
    || printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"Загрузи правило %s и повтори."}}\n' "$req"

exit 0
