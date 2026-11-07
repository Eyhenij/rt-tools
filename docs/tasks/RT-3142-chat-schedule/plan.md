# Plan

**Task:** RT-3142 · **Branch:** RT-3142-chat-schedule
**Spec:** `docs/specs/ui-kit-v2/chat-draft/spec.md`
**Behaviour:** changes

## Points

- **A:** a consumer of `rt-chat` cannot put its own label on a bubble, content above the reply field
  or read the draft.
- **This task reaches:** a bubble shows a label with an icon, a bar stands above the field, and the
  consumer reads the draft. The kit version with these three is published.
- **Sign:** the showcase story at 1440, 768 and 375 matches the frames by `tools/kit-match.mjs`, and
  the owner approves it.
- **Milestone G of the epic:** none, the owner took the work outside an epic.

## Task footprint

| What  | Where                                                                 |
| ----- | --------------------------------------------------------------------- |
| Specs | `docs/specs/ui-kit-v2/chat-draft/`                                    |
| Laws  | `docs/constitution/mockups.md`                                        |
| Rules | `.claude/skills/kit-approval/`, `.claude/skills/rt-tools-storybook/`  |
| Code  | `projects/ui-kit-v2/src/rich-editor/lib/components/chat/`             |
| Code  | `projects/ui-kit-v2/src/rich-editor/lib/components/message-composer/` |
| Code  | `projects/ui-kit-v2/src/lib/components/ai-prompt-input/`              |
| Code  | `apps/auth-example-admin/`, `apps/auth-example-e2e/`                  |

## What counts as done

- `dateLabel` replaces the time, and `dateIcon` stands in place of the status icon.
- The footer stays inside the bubble at 375, and day labels still count from `createdAt`.
- `[rtChatComposerBar]` stands above every kind of the field, and an empty slot takes no place.
- `draftText()` returns the text of every kind of the field and leaves the files alone.
- Specs, stories and an end-to-end case cover the three additions.
- The showcase matches the frames at 1440, 768 and 375, and the owner approved it.
- The PR is merged and a new kit version is out.

## Stages

### 1. The label on a bubble

- **Steps:**
    1. Add `dateLabel` and `dateIcon` to the message model
    2. Render them in the bubble footer with specs
    3. Keep the footer inside the bubble at 375
- **Readiness sign:** the chat specs pass with the new cases.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=rt-chat.component.spec.ts` — no failed tests.

### 2. The bar above the field

- **Steps:**
    1. Add the slot above all kinds of the field with specs
- **Readiness sign:** the slot stands first in each kind, and an empty one has no height.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=rt-chat.component.spec.ts` — no failed tests.

### 3. Reading the draft

- **Steps:**
    1. Add `draftText` to the chat and its fields with specs
    2. Add the scenarios to the subdomain
- **Readiness sign:** the method returns the text in three kinds of the field.
- **Verified by:** `pnpm run check:specs` — no refusal about the new scenarios.

### 4. The showcase

- **Steps:**
    1. Add the stories of the label and the bar
    2. Measure the stories against the frames at three widths
    3. Show the showcase to the owner and record the answer
- **Readiness sign:** `approvals.md` holds both quotes and the match line.
- **Verified by:** `node tools/kit-match.mjs numbers <figma.json> <showcase.json>` — every number is equal.

### 5. The delivery

- **Steps:**
    1. Add the case to the example application and its suite
    2. Update the kit description and take the folder apart
    3. Run the push set and open the PR
- **Readiness sign:** the PR is open with both approvals.
- **Verified by:** `bash .claude/hooks/git-guard-push-ahead.sh` — the set is green.

The merge and the release follow the owner's word.
