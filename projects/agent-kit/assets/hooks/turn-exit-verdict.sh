#!/usr/bin/env bash
# The parsing of the turn record for the turn-exit guard. NOT a guard: it has no `rt-hook:`
# declaration and hooks into no agent event. The guard sources it right after the patterns —
# it was moved out when the guard crossed the file length limit, and the parsing reads apart
# from the tiers that apply its answer.
#
# It expects the patterns to be sourced already and `$transcript` to be set; it prints nothing
# and leaves the answer in `$verdict`.

rt_te_verdict() {
verdict="$(tail -n 400 "$transcript" 2>/dev/null | jq -s -r --arg work "$work_re" --arg read "$read_re" --arg part "$part_re" --arg wait "$wait_re" --arg handover "$handover_re" --arg started "$started_re" '
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
    # A launch in the background as the last action: a role sent to work by the agent tool, or a
    # command sent behind the turn. The launch is an announcement of intent, and what does not
    # depend on it is done while it runs — the turn does not end on the launch itself.
    | (($last_name | test("^(Agent|Task)$")) or (($last_name == "Bash") and ($last | test("&[[:space:]]*$")))) as $launched_last
    | (($last_name == "Bash") and ($last | test($wait))) as $waited
    # A turn woken by a notification about an own background task. The notification is written under
    # the role of the owner, and the turn it opens holds nothing to do while another own task still
    # runs. The launches are read over the whole window; a launch ends with a notification naming its
    # call, whether it woke a turn or arrived as an attachment in the middle of one. Such a turn
    # gets no verdict at all, and the guard lets an empty verdict through: the guard has no room.
    | (if $i == null then false else
        ((.[$i].origin.kind // "") == "task-notification")
        or ((.[$i].message.content // "") | if type == "string" then test("^[[:space:]]*<task-notification>") else false end)
      end) as $woken
    | ([.[] | select(.type == "assistant") | (.message.content // [])[] | select(.type == "tool_use")
        | select(((.name // "") | test("^(Agent|Task)$")) or (((.name // "") == "Bash") and (.input.run_in_background // false)))
        | (.id // empty)]) as $launches
    | ([.[] | ((.message.content // "") | if type == "string" then . else "" end), (.attachment.prompt // "")
        | select(test("<task-notification>"))
        | select(test("<status>(completed|failed|killed|stopped)</status>"))
        | (capture("<tool-use-id>(?<id>[^<]+)</tool-use-id>").id // empty)]) as $finished
    | ($woken and (($uses | length) == 0) and (($launches - $finished) | length) > 0) as $woken_waiting
    # Handing the work over: the tail of the turn after the PR was opened. Everything before it was
    # done on the task handed in and says nothing about the next one.
    | ([$uses[] | select((.name // "") == "Bash") | (.input.command // "")]) as $cmds
    | (($cmds | map(test($handover)) | index(true))) as $handover_at
    | ($handover_at != null) as $handed_over
    | (if $handover_at == null then [] else $cmds[$handover_at:] end) as $tail
    | (($tail | map(test($started)) | any)
        or ($uses | map(.name // "") | any(test("^(Edit|Write|MultiEdit|NotebookEdit)$")))) as $started_next
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
    # What the words of the owner and of the reply mean is judged by the agent hook on the same
    # event, not here: this parsing reads the tree and the calls of the turn. The one line of the
    # reply read below is an agreed marker, not a guess at meaning.
    | ([$turn[] | select(.type == "assistant") | (.message.content // [])[]
          | select(.type == "text") | (.text // "")] | last // "") as $last_say
    # What is left in the tree is named with a reason, and the line «Не отправлено: <reason>» in
    # the reply is that naming: without it the only lawful move was a push made to lift the refusal.
    | ($last_say | test("Не отправлено:[[:space:]]*[^[:space:]]")) as $unpushed_named
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
    | if $woken_waiting then empty else { only_took: $only_took, asked: $asked, handed_by_hand: ($handed and (($asked or $denied) | not)), worked: ($edited or $ran_work), released: ($asked or $denied or $handed), waited: $waited, handed_over: $handed_over, started_next: $started_next, progress_edited: $progress_edited, after_progress: $after_progress, launched_last: $launched_last, ran: $ran, unpushed_named: $unpushed_named } end
' 2>/dev/null)"
}
