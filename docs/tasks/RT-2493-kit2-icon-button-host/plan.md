# Plan

**Task:** RT-2493 · **Branch:** RT-2493-kit2-icon-button-host
**Spec:** `docs/specs/ui-kit-v2/icon-button-host/spec.md`
**Behaviour:** changes — the size and background set on the tag reach the button, and two smaller sizes appear; without them the icon button draws as today

## Task footprint

| What       | Where                                                              |
| ---------- | ------------------------------------------------------------------ |
| Components | `icon-button/`, `header/`                                          |
| Handles    | `tools/tokens-handles.json`, `projects/ui-kit-v2/docs/Theming.mdx` |
| Spec       | `docs/specs/ui-kit-v2/icon-button-host/`                           |
| Showcase   | the icon button stories and its overview page                      |

## What counts as done

- A size and a background set on the icon button's tag reach the button; the hover background has
  its own property.
- The sizes `xs` (22 px) and `2xs` (20 px) exist, with a 16 px icon.
- The header draws its icon buttons as today.
- Frames of stories that use nothing new do not change; specs, types, lint, the overview check,
  the token checks and the snapshots are green.

## Stages

### 1. Code

- **Steps:**
    1. Private steps for size and background, read under the public properties
    2. The sizes xs and 2xs
    3. The header without its dead override
- **Readiness sign:** the icon button and header specs are green, the token checks are green
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=icon-button` — all pass

### 2. Texts and showcase

- **Steps:**
    1. The spec of the subdomain, its bindings and scenarios
    2. The overview tables and the stories for the new sizes and the host rule
    3. Snapshots for the new stories
- **Readiness sign:** the overview check and the spec check are green, the snapshot gate is green
- **Verified by:** `node tools/verify-ui-kit-v2-docs.cjs` — exits 0

## What this work does not do

- The header's own button size — it stays 40 as it draws today.
- A colour handle for each kind — the request names size and background only.
