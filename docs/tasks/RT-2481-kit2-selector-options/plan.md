# Plan

**Task:** RT-2481 · **Branch:** RT-2481-kit2-selector-options
**Spec:** `docs/specs/ui-kit-v2/dynamic-selector-options/spec.md`
**Behaviour:** changes — new inputs, outputs and a signal; without them the selector and the text input behave and draw as today

## Task footprint

| What       | Where                                                  |
| ---------- | ------------------------------------------------------ |
| Components | `dynamic-selector/`, its list, popup and text input    |
| Spec       | `docs/specs/ui-kit-v2/dynamic-selector-options/`       |
| Showcase   | the selector and text input stories and overview pages |

## What counts as done

- The selector and the text input hide the row bin on request.
- They hide reset and clear on request and keep the add button.
- Edits in the row template keep reset and clear active, and both report.
- The selector's popup starts from a given query without a search event.
- The selector exposes whether its popup is open and reports the change.
- Frames of stories that use nothing new do not change; specs, types, lint, the overview check and
  the snapshots are green.

## Stages

### 1. Behaviour

- **Steps:**
    1. The bin and the reset and clear panel switches
    2. Reset and clear for edits in the row template
    3. The initial query and the popup state
- **Readiness sign:** the selector specs are green
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=dynamic-selector` — all pass

### 2. Texts and showcase

- **Steps:**
    1. The spec of the subdomain, its bindings and scenarios
    2. The overview tables and the stories for the new switches
    3. Snapshots for the new stories
- **Readiness sign:** the overview check and the spec check are green, the snapshot gate is green
- **Verified by:** `node tools/verify-ui-kit-v2-docs.cjs` — exits 0

## What this work does not do

- The initial query and the popup state of the text input — it has no popup.
