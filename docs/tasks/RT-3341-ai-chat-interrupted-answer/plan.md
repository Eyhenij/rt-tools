# Plan

**Task:** RT-3341 · **Branch:** RT-3341-ai-chat-interrupted-answer
**Draft:** `docs/specs/ui-kit-v2/proposed/ai-chat-interrupted/`
**Behaviour:** changes

## Points

- **A:** an answer cut by a lost connection or a cancel comes back empty or truncated with no mark;
  the person cannot tell it is incomplete and cannot ask again from the answer itself.
- **This task reaches:** the application's developer sets `interrupted: true` on an answer and gets
  `askAgain` with its id; the end user sees «Answer interrupted» and «Ask again» under that answer.
- **Sign:** the showcase stories of a partial and an empty interrupted answer in light and dark, at
  240, 328, 386 and 640, matched against the approved mockup; the spec run names SC-UKV-1563…1575,
  1578 and 1579, the showcase play steps SC-UKV-1576, 1577 and 1580.
- **Milestone G of the epic:** a contribution to G2; the milestone is reached by the release after
  the cascade is merged — the steps are in the epic plan. After that release the downloaded package
  (`npm pack`) holds the field `interrupted`, the output `askAgain` and the label key.
- **Metric:** нет: a new kit feature, not an improvement of a rule.

## Task footprint

| What  | Where                                                                 |
| ----- | --------------------------------------------------------------------- |
| Specs | `docs/specs/ui-kit-v2/proposed/ai-chat-interrupted/`, `docs/specs/ui-kit-v2/ai-chat/` |
| Laws  | `docs/constitution/mockups.md`, `docs/constitution/frontend-application.md` |
| Rules | `.claude/skills/kit-approval/`, `.claude/skills/ui-component-tests/`, `.claude/skills/rt-tools-storybook/` |
| Code  | `projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/`, `projects/ui-kit-v2/src/lib/i18n/` |

## What counts as done

- An interrupted answer with text and without text is drawn with the label and the action, as on the
  approved mockup, in both themes and at 240, 328, 386 and 640.
- A press on the action emits `askAgain` with the id of that answer; while `sending` it is disabled.
- The showcase has both stories, and the owner approved the mockup and the showcase; both quotes and
  the match line lie in `approvals.md`.

## Stages

### 0. The mockup approval

- **Steps:**
    1. the owner's word on the mockup node 8451-922, written in `approvals.md`
- **Readiness sign:** the line «Макет» with the owner's quote; no code before it.
- **Verified by:** `grep -c 'Макет:' docs/tasks/RT-3341-ai-chat-interrupted-answer/approvals.md` — 1.

### 1. The model, the label and the event

- **Steps:**
    1. the field `interrupted` on `IRtAiChat.AssistantMessage` and the label key in the English and the showcase Russian sets
    2. the row in the answer template, the input `sending` and the output to the chat
    3. the output `askAgain` of `rt-ai-chat` and the binding of `sending`
- **Readiness sign:** the types build.
- **Verified by:** `pnpm exec nx run @rt-tools/ui-kit-v2:typecheck` — exit 0.

### 2. Styles and specs

- **Steps:**
    1. the row styles: gap, wrap, the focus ring not clipped, right to left
    2. the spec next to the chat with SC-UKV-1563…1575, 1578 and 1579 in the titles
- **Readiness sign:** a press emits `askAgain` with the id and nothing while `sending`; every
  scenario of the draft has a test or a showcase step.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=rt-ai-chat.interrupted.spec.ts` — all green.

### 3. The showcase and the match

- **Steps:**
    1. the stories of a partial and an empty interrupted answer, the widths 240…640, right to left, dark, with play steps SC-UKV-1576, 1577, 1580
    2. the match of the showcase with the mockup by numbers and by overlay, hover and focus included, the line «Совпадение» in `approvals.md`
    3. the owner's approval of the showcase, the line «Витрина» in `approvals.md`
- **Readiness sign:** both lines in `approvals.md`; the story references taken after the frames are looked at.
- **Verified by:** `node tools/check-kit-approval.mjs` — no refusal.

### 4. Review rounds and closing

- **Steps:**
    1. review round 1 and its fixes
    2. review round 2 and its fixes
    3. the agreement merged into the domain spec, the texts brought up to date, the folder taken apart
    4. the push set, the push and the PR into the RT-3340 branch
- **Readiness sign:** the PR is open with both rounds in its body.
- **Verified by:** `bash .claude/hooks/git-guard-push-ahead.sh` — «the set is green».
