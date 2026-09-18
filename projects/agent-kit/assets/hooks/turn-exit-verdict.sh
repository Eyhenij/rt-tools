#!/usr/bin/env bash
# The parsing of the turn record for the turn-exit guard. NOT a guard: it has no `rt-hook:`
# declaration and hooks into no agent event. The guard sources it right after the patterns —
# it was moved out when the guard crossed the file length limit, and the parsing reads apart
# from the tiers that apply its answer.
#
# It expects the patterns to be sourced already and `$transcript` to be set; it prints nothing
# and leaves the answer in `$verdict`.

rt_te_verdict() {
verdict="$(tail -n 400 "$transcript" 2>/dev/null | jq -s -r --arg work "$work_re" --arg read "$read_re" --arg part "$part_re" --arg wait "$wait_re" --arg handover "$handover_re" --arg started "$started_re" --arg promise "$promise_re" --arg standing "$standing_work_re" '
    # A service message — a skill load, a compaction summary — carries the user type and is not the word
    # of the owner: it neither starts a turn nor is read as one.
    def is_service:
        ((.isCompactSummary // false) or (.isMeta // false))
        or ((.message.content // "") | if type == "string" then . elif type == "array"
                then (map(if type == "object" then (.text // "") else "" end) | join("\n")) else "" end
            | test("^[[:space:]]*Stop hook feedback"));
    def is_input:
        .type == "user"
        and (is_service | not)
        and (((.message.content // []) | if type == "array"
                then ([.[] | select(.type == "tool_result")] | length)
                else 0 end) == 0);

    (map(is_input) | rindex(true)) as $i
    | (if $i == null then [] else .[$i:] end) as $turn
    | [$turn[] | select(.type == "assistant") | (.message.content // [])[] | select(.type == "tool_use")] as $uses
    # An edit of a file is work by definition, whatever tool it goes through.
    | ($uses | map(.name // "") | any(test("^(Edit|Write|MultiEdit|NotebookEdit)$"))) as $edited
    | ($uses | map(.name // "") | any(test("AskUserQuestion"))) as $asked
    | ($uses | map((.input.command // "")) | join("\n")) as $ran
    # Work is a part of the command that matched the work pattern and did not match the exploration
    # pattern: switching a branch and reading history in the same turn do not become work.
    | ([$ran | splits($part)] | map(test($work) and (test($read) | not)) | any) as $ran_work
    # The last action of the turn. Waiting for a step by anyone else is never the end of a turn,
    # however much work there was before: the work stays exactly where it stood.
    | ([$uses[] | select((.name // "") == "Bash") | ((.input.command // "") + (if (.input.run_in_background // false) then " &" else "" end))] | last // "") as $last
    | ([$uses[] | (.name // "")] | last // "") as $last_name
    | (($last_name == "Bash") and ($last | test($wait))) as $waited
    # Handing the work over: the tail of the turn after the PR was opened. Everything before it was
    # done on the task handed in and says nothing about the next one.
    | ([$uses[] | select((.name // "") == "Bash") | (.input.command // "")]) as $cmds
    | (($cmds | map(test($handover)) | index(true))) as $handover_at
    | ($handover_at != null) as $handed_over
    | (if $handover_at == null then [] else $cmds[$handover_at:] end) as $tail
    | (($tail | map(test($started)) | any)
        or ($uses | map(.name // "") | any(test("^(Edit|Write|MultiEdit|NotebookEdit)$")))) as $started_next
    # THE LAST ACTION OF THE TURN is the shared sign, and the particular tiers below only derive an
    # understandable refusal from it. Nine incident analyses in a day describe nine different stops,
    # and in all nine the last action of the turn was a text to the owner: a report, a summary, an
    # announcement of intent. A tier for every kind of stop is an endless race: there are as many
    # kinds as there are reasons to start talking. Hence one sign — the LAST action must be work.
    | ([$uses[] | (.name // "")] | last // "") as $last_tool
    | (($last_tool | test("^(Edit|Write|MultiEdit|NotebookEdit)$"))
        or ([$last | splits($part)] | map(test($work) and (test($read) | not)) | any)) as $ended_working
    # A guard refusal and a session handover — both end the turn by the rule. The refusal is read
    # from the LAST tool result: a refusal in the middle of the turn was answered by the work that
    # followed it, and a turn that went on after it is judged by how it ended.
    | ([$turn[] | select(.type == "user") | .message.content // [] | select(type == "array") | .[]
          | select(.type == "tool_result") | .content
          | if type == "string" then .
            elif type == "array" then (map(if type == "object" then (.text // "") else tostring end) | join("\n"))
            else tostring end]) as $outs
    | ($outs | join("\n")) as $out
    | ($outs | last // "") as $last_out
    # The refusal of the closing tool is left out: the refused call was itself the stop, not work.
    | ($last_out | test("BLOCKED by (?!end-conversation-guard)|Refused by the rules gate|Отбито гейтом")) as $denied
    | ($ran | test("handoff")) as $handed
    # The word of the owner about stopping: the reply itself is judged, not its retelling.
    | ([$turn[] | select(.type == "user") | select(is_service | not) | .message.content
          | if type == "string" then . elif type == "array"
            then (map(if type == "object" then (.text // "") else "" end) | join("\n")) else "" end] | join("\n")) as $said
    | ([.[] | select(.type == "user") | select(is_service | not) | .message.content
          | if type == "string" then . elif type == "array"
            then (map(if type == "object" then (.text // "") else "" end) | join("\n")) else "" end] | join("\n")) as $session_said
    | ($session_said | test($standing)) as $standing_work
    | (($said | test("останов|стоп|хватит|подожди|не надо|прерв|отложи|не двигайся|не продолжай|прекрати")) and ($said | test($standing) | not)) as $told_stop
    # A question refused by the conversation guard, and a question appended as prose at the end of
    # the reply. The conversation guard judges the call of the question tool and does not see prose
    # at all: a refused question came back in the same wording one turn later and passed freely.
    | ($out | test("BLOCKED by grill-gate")) as $ask_denied
    | ([$turn[] | select(.type == "assistant") | (.message.content // [])[]
          | select(.type == "text") | (.text // "")] | last // "") as $last_say
    | (($last_say | test("\\?[[:space:]]*$")) and $ask_denied) as $asked_in_prose
    # Waiting for the word of the owner, announced by the executor. That word is read from
    # the owner: without his word in the turn and without a question to him through the tool, the
    # phrase "waiting for your word" is a stop announced by the one it suits. The set of patterns is
    # named and closed.
    | (($last_say | test("[Жж]ду (твоего|вашего|его|её) (слова|указани|решени|ответа|команды|отмашки)|[Жж]ду слова владельца|[Жж]ду, что скаж|[Оо]стаюсь ждать|[Бб]уду ждать (твоего|вашего)"))
        and (($asked or $told_stop or $handed) | not)) as $awaits_word
    | ($last_say | test($promise)) as $promised
    # The next step rewritten into the progress and not begun. The last edit of the progress in the
    # turn is found — by the editing tool or by a writing command naming the file — and after it the
    # turn must hold work other than the commit and the push of it: an edit outside the task folder
    # or a command changing the tree. Four stops of one shape ended with a full report, a moved
    # stage number and an untouched next step; the volume before the line is not the step.
    | ($uses | map(
          (((.name // "") | test("^(Edit|Write|MultiEdit|NotebookEdit)$")) and ((.input.file_path // "") | test("(^|/)progress\\.md$")))
          or (((.name // "") == "Bash") and ((.input.command // "") | test("progress\\.md")) and ((.input.command // "") | test("sed -i|tee |>|python3|cat ")))
      ) | rindex(true)) as $progress_at
    | ($progress_at != null) as $progress_edited
    | (if $progress_at == null then [] else $uses[($progress_at + 1):] end) as $after
    | ($after | map(
          (((.name // "") | test("^(Edit|Write|MultiEdit|NotebookEdit)$")) and ((.input.file_path // "") | test("/tasks/") | not))
          or (((.name // "") == "Bash") and ([(.input.command // "") | splits($part)] | map(test($work) and (test($read) | not) and (test("^[[:space:]]*([^[:space:]]*/)?git[[:space:]]+(add|commit|push)") | not)) | any))
      ) | any) as $after_progress
    | (($last_name == "Bash") and ($last | test($started)) and ($handed_over | not)) as $only_took
    | { promised: $promised, only_took: $only_took, asked: $asked, handed_by_hand: ($handed and (($asked or $denied or $told_stop) | not)), standing_work: $standing_work, worked: ($edited or $ran_work), released: ($asked or $denied or $handed or $told_stop), waited: $waited, handed_over: $handed_over, started_next: $started_next, ended_working: $ended_working, asked_in_prose: $asked_in_prose, awaits_word: $awaits_word, progress_edited: $progress_edited, after_progress: $after_progress, ran: $ran }
' 2>/dev/null)"
}
