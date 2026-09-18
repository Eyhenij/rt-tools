# Plan

**Task:** RT-2233 · **Branch:** RT-2233-scenario-ids-collide
**Behaviour:** unchanged — правятся номера сценариев в описании домена и заголовки тестов пакета правил; владелец велел брать RT-2228 в работу сразу, а отправка стоит на красной проверке описаний.

## Task footprint

| What  | Where                                                                                                                                  |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Specs | `docs/specs/agent-kit/turn-guards/exit/scenarios.md`                                                                                   |
| Laws  | none                                                                                                                                   |
| Rules | none                                                                                                                                   |
| Code  | `projects/agent-kit/tests/turn-exit-guard.test.sh`, `projects/agent-kit/tests/turn-exit-epic.test.sh`, `.claude/rt-kit/assignments.md` |

## What counts as done

- `node tools/check-specs.mjs` names no taken identifier; both exit suites are green with the new numbers.
- The assignment row of the copy `rt-worktree-2` names RT-2228, by the owner's word «впиши сам».

## Stages

### 1. The four scenarios of the exit spec get free numbers

- **What is done:** SC-AK-1113…1116 in the exit scenarios become SC-AK-1123…1126; the titles in both test suites are edited by the same commit. The assignment row is committed apart.
- **Readiness sign:** the spec audit is green and the suites are green.
- **Verified by:** `npm run check:specs` — exit code 0; `bash projects/agent-kit/tests/turn-exit-guard.test.sh` — `90 ok, 0 провалов`; `bash projects/agent-kit/tests/turn-exit-epic.test.sh` — `25 ok, 0 провалов`.

## What this work does not do

- Does not touch the numbers of the neighbouring domains: another session edits them now.
