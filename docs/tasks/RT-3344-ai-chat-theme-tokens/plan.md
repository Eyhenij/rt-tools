# Plan

**Task:** RT-3344 · **Branch:** RT-3344-ai-chat-theme-tokens
**Draft:** `docs/specs/ui-kit-v2/proposed/ai-chat-theme-tokens/`
**Behaviour:** changes

## Points

- **A:** the application fits the look of `rt-ai-chat` by overriding internal classes of the kit; a
  layout edit of the kit breaks those overrides without warning.
- **This task reaches:** the application sets the chat font, the accent colour, the header, the
  suggestion cards, the backgrounds and the row menu by `--rt-ai-chat-*` handles and hides the author
  label by the input `questionAuthor`, with no selector of an internal class.
- **Sign:** the three `Properties` stories in the showcase set every handle by a rule on the
  `rt-ai-chat` element, with no selector of an internal class, and the owner approved them; every
  existing chat story matches its reference unchanged.
- **Milestone G of the epic:** the published kit lets an application set the look of the chat by
  handles alone. Sign: in the packed next version the built styles hold `--rt-ai-chat-send-bg`,
  `--rt-ai-chat-header-height` and `--rt-ai-chat-suggestion-width`, and the types hold
  `questionAuthor`. Whether this task goes into the next release is the owner's word, asked with the
  plan. The epic milestone G2 still names `Reply` of the dropped RT-3343; the epic plan drops it in
  this branch.
- **Metric:** нет: the look of the chat could not be set without internal classes.

## Task footprint

| What  | Where |
| ----- | ----- |
| Specs | `docs/specs/ui-kit-v2/proposed/ai-chat-theme-tokens/`, `docs/specs/ui-kit-v2/ai-chat/`, `docs/specs/ui-kit-v2/spec.md` |
| Rules | `.claude/skills/rt-tools-styling/`, `.claude/skills/rt-tools-storybook/`, `.claude/skills/ui-component-tests/` |
| Code  | `projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/`, `projects/ui-kit-v2/src/lib/components/markdown-text/`, `projects/ui-kit-v2/src/lib/components/ai-prompt-input/`, `projects/ui-kit-v2/src/lib/components/thread-list/`, `projects/ui-kit-v2/README.md` |

## What counts as done

- Each of the eight card items is set by a handle or by the input, as the agreement lists them.
- Without the new handles every existing chat, prompt input, markdown text and conversation list
  story matches its reference.
- The `Properties` stories show a default cell and every item, and the owner approved them.
- The epic plan drops RT-3343 and its `Reply` from the milestone G2.
- Scenarios SC-UKV-1582…1596 are covered by a test or marked «Not covered» with the story named.

## Stages

### 0. The agreement and the plan

- **Steps:**
    1. the exploration and the grill
    2. the agreement
    3. the plan and the owner's word
- **Readiness sign:** the agreement and the plan are committed, and the owner approved the plan.
- **Verified by:** `npm run -s check:docs` — no divergence.

### 1. Handles of the parts

- **Steps:**
    1. handles of `rt-markdown-text`
    2. handles of `rt-ai-prompt-input`
    3. handles of `rt-thread-list`
- **Readiness sign:** the three parts read their new handles with today's values as defaults.
- **Verified by:** `pnpm exec nx run @rt-tools/ui-kit-v2:typecheck` — exits 0.

### 2. Handles and the input of the chat

- **Steps:**
    1. chat root handles and the pass-down to the parts
    2. the input `questionAuthor`
    3. specs of the handles and the input
- **Readiness sign:** the specs of the new scenarios pass.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=rt-ai-chat` — all tests pass.

### 3. The showcase

- **Steps:**
    1. the three `Properties` stories
    2. references of the new story and the run over all stories
    3. the live check against the agreement
- **Readiness sign:** the new story has references; the old references match.
- **Verified by:** `node tools/visual-gate.mjs ui-kit-v2` — no divergence.

### 4. Review and the owner

- **Steps:**
    1. review round one and its fixes
    2. review round two and its fixes
    3. the owner's word on the showcase
- **Readiness sign:** two commits named by the rounds; the owner's approval quoted in the progress.
- **Verified by:** `npm run -s check:specs` — no divergence in the new subdomain.

### 5. Texts and delivery

- **Steps:**
    1. overviews of the chat and the parts, the README exception, the epic plan
    2. the agreement merged into the domain spec, the folder taken apart
    3. the push set and the PR into the branch of RT-3340
- **Readiness sign:** the PR is open with a reviewer.
- **Verified by:** `npm run -s check:docs` — no divergence.

## What this work does not do

- Handles for parts the card does not name, and a theme preset of the chat.
- The search width of the conversation list: the tree already has it without a cap.
