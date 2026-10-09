# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 2 of 2 — Documents and delivery
- **Done:** label, input `threadMenu`, `triggerSize` of `rt-menu`, unit tests
- **Next step:** spec, scenarios, CONTEXT, Overview, stories
- **Uncommitted:** no
- **Waiting for the owner:** no
- **PR:** not open yet — «Do NOT open a PR»

## Steps

- [x] 1.1 Label `aiCopyThreadId` in the English set and the showcase Russian set
- [x] 1.2 Input `threadMenu` and the menu in the row actions of `rt-ai-chat`
- [x] 1.3 Row actions stay visible while their menu is open
- [x] 1.4 Unit tests of the menu
- [>] 2.1 Spec, scenarios, implementation, CONTEXT, Overview, stories
- [ ] 2.2 Dist build
- [ ] 2.3 Push gate and push

## Decisions along the way

- **`rt-menu` takes `triggerSize`** — its trigger was always `md` with an `md` icon; the row action stands at `xs` with a 16px icon like the delete button. Affected stage of the plan: 1.

## Sessions

### 2026-10-09

- Task #2729, branch from `origin/main`.
- `nx test @rt-tools/ui-kit-v2`: 217 suites, 2635 tests green.
