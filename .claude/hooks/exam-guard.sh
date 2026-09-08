#!/usr/bin/env bash
# rt-kit v0.25.0 · hooks/exam-guard.sh · d0e6e77c6acd · правится надстройкой, не здесь
# rt-hook: PreToolUse Edit|Write|MultiEdit|mcp__webstorm__create_new_file|Bash|mcp__webstorm__execute_terminal_command
# Requires: agents/strict-teacher.md, hooks/roles.sh, hooks/deny-tail.sh, hooks/write-targets.sh
# Exam guard: no edit goes through until the exam on the loaded rules has been passed this session.
#
# Why this way. The rules gate demands that a rule be loaded before an edit, and ends there: to
# the tree, a loaded rule and a read rule cannot be told apart. A rule of four hundred lines goes
# into the context whole and is carried out selectively — misses happen after the rule was loaded.
# The examiner role asks, and the guard judges its verdict.
#
# The role gives its verdict in the first line: "ЭКЗАМЕН: сдано N из 5". Passed means five out of
# five; any other number means the rule is reread whole and the exam is retaken.
#
# A copied answer does not count as an exam. The role cannot tell it from knowledge — the guard
# can: between the questions and the answers there must be no reading of the same rules. The sign
# is crude and does not hide its boundary: reading a neighbouring rule it counts as copying too.
#
# The verdict is looked for in every form of the turn record, not in one. The delivery form is
# chosen by the host: a role running in the background returns its result as a completion notice,
# and has no record of the "tool result" kind at all. A tree where the role works that way was
# locked by the guard entirely — five rounds of the exam with a full verdict let no edit through;
# the analysis is in the incident records.
#
# Two forms are discarded, both on purpose. The assistant's own text is never a verdict: writing
# the needed line in a reply costs one move. Results of the reading and writing tools are discarded
# too: echoing the same line or reading a file with it would pass the guard, so forgery would
# become the only reachable way. What counts is the result of a tool that cannot read or write
# files — the one the role is launched with.
#
# Taken out from under the guard: the tree settings, their overrides and the session handover.
# The setting that switches the guard off is not locked by this guard — otherwise there is no way
# out of the refusal at all. Sending cargo to the intake was locked by the same hole: the intake
# address lives in the same settings.
#
# FAIL-OPEN: no jq, no turn record, a foreign tool → pass. A broken guard must not get in the
# way of work.

# Its own name in observations: the refusal is written by the shared deny tail, not by the guard.
RT_GUARD_NAME=exam-guard

. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utf8.sh" 2>/dev/null || true
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/hook-input.sh" 2>/dev/null || true

rt_hook_read
input="$RT_HOOK_INPUT"
[ -z "$input" ] && exit 0
command -v jq >/dev/null 2>&1 || exit 0

# A role disabled by the tree does not hold the guard: the list of disabled roles lies in the tree
# settings, and a helper next door reads it. Unreadable settings do not count as disabling — the
# guard works as before.
rt_hooks_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=SC1090
[ -f "$rt_hooks_dir/roles.sh" ] && . "$rt_hooks_dir/roles.sh" 2>/dev/null
command -v rt_role_off >/dev/null 2>&1 && rt_role_off strict-teacher && exit 0

# Write targets are parsed by the shared helper — the same one the edit-location guard uses.
# shellcheck disable=SC1090
[ -f "$rt_hooks_dir/write-targets.sh" ] && . "$rt_hooks_dir/write-targets.sh" 2>/dev/null
command -v rt_write_targets >/dev/null 2>&1 || rt_write_targets() { cat >/dev/null; }

# Paths the guard does not judge: the tree settings, their overrides and the session handover
# directory. Prints "да" if every named target is out from under the guard.
rt_exam_free_paths() {
    free=1
    while IFS= read -r target; do
        [ -z "$target" ] && continue
        case "$target" in
            *.claude/rt-kit.json | *.claude/rt-kit/* | *.claude/handoff/*) ;;
            *) free=0 ;;
        esac
    done
    [ "$free" = "1" ] && printf 'yes'
}

tool="$(rt_hook_tool)"
# The second exam is asked when the draft is lifted: the work is over, and by then the delivery
# rules were read long ago — the whole session passed between their reading and this minute.
ready=0
case "$tool" in
    Edit | Write | MultiEdit | mcp__webstorm__create_new_file)
        target="$(printf '%s' "$input" | jq -r '.tool_input.file_path // .tool_input.pathInProject // empty' 2>/dev/null)"
        [ -n "$target" ] && [ "$(printf '%s\n' "$target" | rt_exam_free_paths)" = "yes" ] && exit 0
        ;;
    Bash | mcp__webstorm__execute_terminal_command)
        cmd="$(rt_hook_cmd)"
        # Lifting the draft is a client call, not an occurrence of the words: a command that only
        # writes about lifting — a line in the proposals file, a commit body, an incident analysis
        # — was checked the same as the lifting itself, and the refusal came on an attempt to
        # describe this defect.
        if printf '%s' "$cmd" | grep -qE "${RT_CMD_BOUND}(gh[[:space:]]+pr[[:space:]]+ready|glab[[:space:]]+mr[[:space:]]+update[^|;&]*--ready)([[:space:]]|\$)"; then
            ready=1
        else
            # Writing a file through a shell call is judged the same as an edit: an honest path
            # closed while the bypass stays open means the guard holds whoever follows the rules
            # and lets through whoever bypasses them.
            targets="$(printf '%s' "$cmd" | rt_write_targets)"
            [ -z "$targets" ] && exit 0
            [ "$(printf '%s\n' "$targets" | rt_exam_free_paths)" = "yes" ] && exit 0
        fi
        ;;
    *) exit 0 ;;
esac

transcript="$(printf '%s' "$input" | jq -r '.transcript_path // empty' 2>/dev/null)"
[ -z "$transcript" ] && exit 0
[ -f "$transcript" ] || exit 0

# The shared deny tail: two lawful moves and the lawful form of bypass, if the refusal has one.
# The file may not be laid out — then there is no tail, and the reason for the refusal stays.
# shellcheck disable=SC1090
[ -f "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" ] \
    && . "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" 2>/dev/null
command -v rt_deny_tail >/dev/null 2>&1 || rt_deny_tail() { :; }

# The second way out of the refusal — one that does not require lifting protection.
#
# The guard used to name the list of disabled roles in the tree settings as the only way out. The
# environment the executor works in forbids editing such a list by a mechanism of its own, which
# the guard knows nothing about: one rule says "get out of here", the other says "not this way",
# and the work stands with a green suite and the owner's word given.
#
# The bypass is declared by the line `Exam-skip: <reason>` in the body of the last commit of the
# branch: it stays in history and is visible to the owner on the PR page. The reason is mandatory —
# a placeholder in its place does not count as a bypass, as with the documents guard.
rt_exam_declared_skip() {
    git -C "${CLAUDE_PROJECT_DIR:-.}" log -1 --format=%B 2>/dev/null \
        | grep -qE '^Exam-skip:[[:space:]]*[^[:space:]<]'
}

deny() {
    if rt_exam_declared_skip; then
        printf 'the exam guard: a bypass is declared in the body of the last commit by the line Exam-skip. The call is let through, the record stays in the history.\n' >&2
        exit 0
    fi

    reason="$1"
    tail_text="$(rt_deny_tail "$2")"
    [ -n "$tail_text" ] && reason="$1 ${tail_text}"
    jq -n --arg r "$reason" '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:$r}}' 2>/dev/null \
        || printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"%s"}}\n' "$reason"
    exit 0
}

# The whole session is judged, not the last turn: the exam is passed once at the start and holds
# to the end.
verdict="$(jq -s -r '
    def textof:
        if type == "string" then .
        elif type == "array" then (map(if type == "object" then (.text // "") else tostring end) | join("\n"))
        else tostring end;

    # The call whose answer is discarded is recognised by its identifier, and the identifier is
    # bound by a name: a dot after a pipe means the list itself, the search over it answers zero
    # on any non-empty list, and every answer of every tool gets muted at once — that is, the
    # verdict is looked for in the host records alone.
    #
    # Tools that read and write files: their result does not count as a verdict — otherwise
    # echoing the same line or reading a file with it passes the guard, and the real verdict
    # does not.
    ["Bash", "Read", "Grep", "Glob", "Edit", "Write", "MultiEdit", "NotebookEdit"] as $mute
    | [.[] | select(.type == "assistant") | (.message.content // [])[]
         | select(.type == "tool_use") | select(.name as $n | $mute | index($n) != null) | (.id // "")] as $muted

    | [ .[]
        # The assistant text is never a verdict: writing the needed line in a reply costs one
        # move.
        | if .type == "assistant" then ""
          elif .type == "user" then
              ([ ((.message.content // []) | if type == "array" then .[] else empty end
                    | select(.type == "tool_result")
                    | select(((.tool_use_id // "") | if . == "" then null else . end) as $id
                             | $id == null or ($muted | index($id)) == null)
                    | .content | textof),
                 ((.message.content // "") | if type == "string" then . else "" end),
                 # The call result field: the same record, another form. Discarded only when
                 # this result belongs to a reading or writing tool.
                 (. as $rec
                  | if ($rec.toolUseResult // null) == null then ""
                    elif ([($rec.message.content // []) | if type == "array" then .[] else empty end
                            | select(.type == "tool_result") | (.tool_use_id // "")]
                          | map(. as $id | $muted | index($id)) | any(. != null)) then ""
                    else ($rec.toolUseResult | textof) end)
               ] | join("\n"))
          # Host records — the role completion notice and the attachment: the host chooses their
          # form, and they count whole.
          else tostring end ] | join("\n")
    | [scan("(ЭКЗАМЕН:[[:space:]]*сдано|EXAM:[[:space:]]*passed)[[:space:]]*([0-9]+)[[:space:]]*(из|of)[[:space:]]*([0-9]+)")]
    | if length == 0 then "none"
      else (.[-1] | if .[1] == .[3] then "passed" else "failed" end)
      end
' "$transcript" 2>/dev/null)"

# The second exam is the one placed after the PR is opened. The first does not replace it: they
# ask about different things, and the whole work lies between them.
if [ "$ready" = "1" ]; then
    # Records are brought into one stream in order of appearance: the command and the tool result
    # lie in different fields, and an index from one array means nothing in the other.
    after="$(jq -s -r '
        def textof:
            if type == "string" then .
            elif type == "array" then (map(if type == "object" then (.text // "") else tostring end) | join("\n"))
            else tostring end;

        # The same set of forms as in the wide selection: the verdict arrives in the form the host
        # chose, and a role running in the background returns it as a completion notice — it has
        # no record of the "tool result" kind. Before, this selection read only the assistant
        # commands and the tool results, and the second exam in such a tree did not count: five
        # rounds with a full verdict let no edit through.
        ["Bash", "Read", "Grep", "Glob", "Edit", "Write", "MultiEdit", "NotebookEdit"] as $mute
        | [.[] | select(.type == "assistant") | (.message.content // [])[]
             | select(.type == "tool_use") | select(.name as $n | $mute | index($n) != null) | (.id // "")] as $muted

        # A record gives two strings: the command — by it the moment of opening the PR is found —
        # and the verdict, checked by the same rules as in the wide selection. The order is the
        # same, so counting from the found command stays correct.
        | [ .[] | {
              cmd: (if .type == "assistant"
                    then ([(.message.content // [])[] | select(.type == "tool_use") | (.input.command // "")] | join("\n"))
                    else "" end),
              say: (if .type == "assistant" then ""
                    elif .type == "user" then
                        ([ ((.message.content // []) | if type == "array" then .[] else empty end
                              | select(.type == "tool_result")
                              | select(((.tool_use_id // "") | if . == "" then null else . end) as $id
                                       | $id == null or ($muted | index($id)) == null)
                              | .content | textof),
                           ((.message.content // "") | if type == "string" then . else "" end),
                           (. as $rec
                            | if ($rec.toolUseResult // null) == null then ""
                              elif ([($rec.message.content // []) | if type == "array" then .[] else empty end
                                      | select(.type == "tool_result") | (.tool_use_id // "")]
                                    | map(. as $id | $muted | index($id)) | any(. != null)) then ""
                              else ($rec.toolUseResult | textof) end)
                         ] | join("\n"))
                    else tostring end)
          } ] as $flow
        | ($flow | map(.cmd | test("pr[[:space:]]+create|mr[[:space:]]+create")) | index(true)) as $opened
        | if $opened == null then "no-pr"
          else ($flow[($opened + 1):] | map(.say) | join("\n")
                | [scan("(ЭКЗАМЕН:[[:space:]]*сдано|EXAM:[[:space:]]*passed)[[:space:]]*([0-9]+)[[:space:]]*(из|of)[[:space:]]*([0-9]+)")]
                | if length == 0 then "none"
                  elif (.[-1] | .[1] == .[3]) then "passed"
                  else "failed" end)
          end
    ' "$transcript" 2>/dev/null)"
    case "$after" in
        passed | no-pr) exit 0 ;;
        *)
            deny "BLOCKED by exam-guard: the draft is lifted after the second exam, and there was none in this session. Call the role strict-teacher with the rules of delivery and with what the task demanded: a whole session passed between reading those rules and lifting the draft. The way out through the list of switched-off roles requires removing the protection, and the runtime may forbid such an edit; the second way out does not require it — declare the bypass by the line «Exam-skip: причина» in the body of the last commit of the branch: it stays in the history and is visible to the owner on the page of the request."
            ;;
    esac
fi

case "$verdict" in
    passed) exit 0 ;;
    failed)
        deny "BLOCKED by exam-guard: the exam on the loaded rules is failed. Read the rule whole again — not the piece that was asked about — and call the role strict-teacher anew. The answer shown gives knowledge of one line, not of the rule. The way out through the list of switched-off roles requires removing the protection, and the runtime may forbid such an edit; the second way out does not require it — the bypass is declared by the line «Exam-skip: причина» in the body of the last commit of the branch."
        ;;
    *)
        deny "BLOCKED by exam-guard: there was no exam on the loaded rules in this session. Call the role strict-teacher, hand it the list of loaded rules, answer its questions from memory and return the answers to it — the verdict it gives by the line «ЭКЗАМЕН: сдано N из 5». It counts from the answer of the role in whatever form the host delivered it, but not from the output of the shell and not from your own text: printing that line as an echo does not release the guard. The role was already called and the verdict received — then it arrived in a form the guard does not see: that is a defect of the guard, and an edit of `.claude/rt-kit.json` is taken out from under it. A loaded rule and a read rule are different things, and the price of that difference is paid by the owner."
        ;;
esac
