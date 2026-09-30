# Plan

**Task:** RT-2366 · **Branch:** RT-2366-kit2-message-composer
**Spec:** `docs/specs/ui-kit-v2/message-composer/spec.md`
**Behaviour:** changes

## Task footprint

| What  | Where                                                                          |
| ----- | ------------------------------------------------------------------------------ |
| Specs | `docs/specs/ui-kit-v2/message-composer/`, `docs/specs/ui-kit-v2/scenarios.md`  |
| Rules | `.claude/skills/rt-tools-storybook/`, `.claude/skills/ui-component-tests/`     |
| Code  | `projects/ui-kit-v2/src/rich-editor/lib/components/message-composer/`, `i18n/` |
| Admin | `apps/message-bus-admin-e2e/` — the frames of the screens that show the chat   |

## What counts as done

- The composer is a capsule with radius 24: a round attach button on the left, a round send button
  with an arrow on the right, both pressed to the bottom; the text grows to six lines.
- The send button is pale while there is nothing to send, blue with text, spinning while sending.
- The focus draws the border and the ring of the kit's fields; the disabled capsule is pale.
- The attachments stand inside the capsule; the optional hint stands under it.
- Specs, stories, snapshots and the admin frames cover it.

## Stages

### 1. Agreement

- **Steps:**
    1. Write the message-composer subdomain spec
    2. Write its scenarios and binding lines
- **Readiness sign:** the spec check names no divergence of the subdomain
- **Verified by:** `npm run check:specs` — the output names no divergence

### 2. The capsule

- **Steps:**
    1. Redraw the template and the styles of the composer as the capsule with the round buttons
    2. Add the spinner of sending and the hint under the field
    3. Cover the states by the component spec
- **Readiness sign:** the composer spec passes
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=rt-message-composer` — all tests pass

### 3. Showcase and frames

- **Steps:**
    1. Show the nine states of the mockup and the hint in the stories
    2. Rewrite the overview page and the context of the composer
    3. Re-take the snapshots of the composer and the chat
    4. Re-take the admin frames that show the chat
- **Readiness sign:** the docs check, the snapshot run and the admin suite are green
- **Verified by:** `node tools/verify-ui-kit-v2-docs.cjs` — no divergence

### 4. Closing

- **Steps:**
    1. Run the full set of checks
- **Readiness sign:** lint, types, tests, build and the style checks are green
- **Verified by:** `pnpm exec nx run-many -t lint typecheck test build -p @rt-tools/ui-kit-v2` — all targets succeed

## What this work does not do

- The visitor's widget on the site — task RT-2365.
