# Grill

**Spec:** `docs/specs/agent-kit/turn-guards/flow-script/guard/`

## The owner request

> Взять задачу из очереди

The owner's choice in the menu of 25.11.2026, after the night work ended: RT-3530 waits for review
and RT-3605 is postponed. The task taken is #3621, its body verbatim:

> На Mac без GNU coreutils нет команды `timeout`, и стражи пакета правил, которые зовут движок через
> `timeout 60 node …`, молча пропускают любую правку: команда не находится, вызов падает, страж
> выходит с разрешением. Так было на машине владельца до 24.11.2026: страж хода работы разрешал всё,
> что должен запрещать.
>
> Что нужно: страж без `timeout` либо зовёт движок без предела времени, либо берёт `gtimeout`, либо
> отказывает с понятным текстом — но не пропускает молча. То же для других хуков пакета, где стоит
> `timeout`.
>
> Красная проверка — `bash projects/agent-kit/tests/flow-step-guard.test.sh` без `timeout` в PATH:
> 69 провалов из 118.

## What the tree already has

- One hook of the package calls `timeout` unguarded: `projects/agent-kit/assets/hooks/flow-step-guard.sh`,
  lines 50 and 54 (51 and 55 in the laid-out copy), `timeout 60 node … || exit 0`. A missing command
  exits 127, and `|| exit 0` passes the call.
- The tree's own hook `.claude/hooks/git-guard-draft-ready.sh` already asks `command -v timeout`
  before the call and runs without a limit otherwise. `git-guard-delivery.sh` sets its limits by git
  variables. The other package files name `timeout` only to parse a command.
- On this machine `timeout` is present since 24.11 (`~/.local/bin/timeout` → `gtimeout`), so the
  suite under the usual PATH is green without any fix: a check proves the fix only under a PATH
  without the limiters.
- The dispatcher `dispatch.sh` limits a branch by `perl -e 'alarm shift; exec @ARGV'` when perl is
  there: the same limit, without `timeout`.
- Reproduced on this machine: with `timeout` and `gtimeout` replaced by a command that is not found,
  the suite prints «49 ok, 69 провалов».
- The spec of the guard says: «The guard lets a call through when the engine is absent, fails or
  prints nothing.» A missing limiter is none of the three, and the spec does not name it.

## What the rules already say

- `agent-kit-source`: the source is edited, then built and laid out; a laid-out copy is not edited.
- `task-delivery-loop`: a live check and two review rounds before the push, for hooks too.

## Questions and answers

**Взять задачу из очереди или ждать?** (25.11.2026)
«Взять задачу из очереди»

## Decisions

- **The engine runs under the first limiter the machine has: `timeout`, `gtimeout`, perl `alarm`;
  with none of them it runs without a limit** — the task names both ways, and a refusal «install
  coreutils» would stop every edit on a bare Mac. The cost of a mistake: an engine that hangs holds
  the call until the host stops the hook. Rejected: a refusal with a text — it stops all work on a
  machine where the engine itself is fine.
- **The limiter is a function of the guard itself, not a new shared file** — one hook uses it; a
  shared helper for one caller adds a file the layout has to carry.

## What is left unclear

- Nothing blocks the work.
