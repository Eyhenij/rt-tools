# Grill

## The owner request

> ты … не останавливался, каждый раз когда я нажимал "стоп" - ты выкидывал строку "Стою. Жду вашего слова." и продолжал работу несмотря на нажатый "стоп"

> почему ты продолжаешь работать после "стоп"?

The owner's words of 24.11 written into the epic plan `docs/plans/owner-stop-holds.md`; the plan was approved by
the owner on 24.11, and the epic was given to this copy by the menu answer of 26.11 «Бери RT-3602». The card
RT-3673: after «стоп» the executor goes on calling tools, because background notices and `Monitor` lines wake the
turn, and the work goes on with no word of the owner.

## What the tree already has

- `projects/agent-kit/assets/task-flow/measure/owner.mjs:stopStands` walks the owner's words and returns
  `{stands, by}`; it gives no time of the word that set the stop. `source/owner.mjs:wordsOf` gives every word with
  `at` and `kind`.
- `node tools/task-flow-script.mjs stop` reads `transcript_path` from the hook input and exits 0 while the stop
  stands (`projects/agent-kit/assets/checks/task-flow-script.mjs:runStop`). A PreToolUse input carries the same
  field.
- Three Stop hooks release the turn while the stop stands (RT-3672). No PreToolUse hook reads the stop: after Esc
  a call goes through.
- `projects/agent-kit/assets/task-flow/source/session.mjs` gives background starts with `at` and id
  (`taskStarted`), take-downs by `TaskStop`, `KillShell`, `KillBash` (`STOP_TOOLS`) and notices (`taskOver`).
  `CronDelete` and `ToolSearch` are known nowhere in the package; `Monitor` is left out of background starts.
- Models for a new guard: `projects/agent-kit/assets/hooks/end-conversation-guard.sh` (the smallest PreToolUse
  refusal through `rt_decide`), `window-fill-guard.sh` (refuses everything but an allowed set). A hook is bound to
  its event by its `# rt-hook:` line; `tests/hooks-kind.test.sh` demands the declaration, `FAIL-OPEN`, the reason,
  the lawful moves, `rt_hook_read`, a suite and a spec.
- Records do not show whether the host calls `UserPromptSubmit` on a notice: a hook leaves a record only when it
  prints, and typed messages show none either (0 of 131 in the record of 24.11).
- The last scenario number is SC-AK-2013.

## What the rules already say

- The epic table «Решение», row «Тупик снятия»: allowed are `ToolSearch`, `TaskStop`, `CronDelete` and reading
  output; a dead task and a hook error let the call through; background started before the stop counts, after —
  does not. Row «Время»: a record of 173 MB reads 0.8 s a call, so a cheap filter goes before `node`. Row «Бюджет»:
  two new hooks.
- The epic section «Предел»: whether the host calls `UserPromptSubmit` on a notice is checked on a live session
  as the first step of this task. If it does not, the woken turn has no calls and is released.
- The epic table «Переходы»: after the stop, a question, swearing and «пиши инцидент» keep the stop, and what they
  order is done. So the refusal holds only while no word of the owner came after the word that set the stop.

## Questions and answers

No question is asked: every decision of this task is written in the approved epic plan.

## Decisions

- **The refusal holds while the stop stands and the word that set it is the owner's last word.** A notice or a
  neighbour's message is no word. A question or «пиши инцидент» after the stop is a word: the reply and the incident
  record go through.
- **The measure returns the time of the word that set the stop.** `stopStands` gives `at` too; a take-down of a task
  started after it is refused.

## What is left unclear

- Whether the host calls `UserPromptSubmit` on a notice: the first step of the plan checks it on a live session.
