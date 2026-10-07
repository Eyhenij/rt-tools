# Plan

**Task:** RT-2619 · **Branch:** RT-2619-kit2-selector-action-bar-tokens
**Spec:** `docs/specs/ui-kit-v2/dynamic-selectors/spec.md`, `docs/specs/ui-kit-v2/action-bar/spec.md`
**Behaviour:** changes

## Task footprint

| What  | Where                                                                                                      |
| ----- | ---------------------------------------------------------------------------------------------------------- |
| Specs | `docs/specs/ui-kit-v2/dynamic-selectors/`, `docs/specs/ui-kit-v2/action-bar/`                              |
| Rules | `.claude/skills/rt-tools-styling-tokens/`, `.claude/skills/styling-bem/`                                   |
| Code  | `projects/ui-kit-v2/src/lib/components/dynamic-selector/`, `action-bar/`, `empty-state/`, `icon/`          |
| Data  | `tools/tokens-handles.json`, `projects/ui-kit-v2/docs/Theming.mdx`, `projects/ui-kit-v2/src/assets/icons/` |

## What counts as done

- Every item of the three owner lists is either in the kit or named in the PR with the reason.
- The popup search keeps the `rt-input` layout: no `display: block` on it.
- A value set on an ancestor reaches the action bar and its holder.
- Stories show the new inputs; snapshots of the touched stories are taken anew and read by eye.

## Stages

### 1. Dynamic selector

- **Steps:**
    1. Remove `display: block` from the popup search
    2. Add inputs invitationButtonIcon, invitationButtonAppearance, clearIcon, searchAppearance, emptyResultsText
    3. Add the popup and list properties of items 8–24 and the empty-state property of item 25
- **Readiness sign:** the selector specs are green, and the inputs reach the template.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=dynamic-selector` — «Tests:» with no failed.

### 2. Icon trash-x

- **Steps:**
    1. Draw trash-x and add it to the name union
    2. Pair delete_forever with trash-x in the Material map
- **Readiness sign:** the map check passes with the new pair.
- **Verified by:** `node tools/check-icon-map.mjs` — no refusal.

### 3. Dynamic input

- **Steps:**
    1. Add inputs invitationButtonIcon, invitationButtonAppearance, clearIcon, fieldAppearance
- **Readiness sign:** the dynamic-input spec is green.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=rt-dynamic-input` — «Tests:» with no failed.

### 4. Action bar

- **Steps:**
    1. Turn the bar and holder properties into consumer handles with defaults
    2. Add the seven new bar properties
    3. Add glyph to the action and closeIcon to the bar and holder
    4. List the handles in tokens-handles.json and Theming.mdx
- **Readiness sign:** the token graph check passes, the bar specs are green.
- **Verified by:** `pnpm run check:tokens-graph` — no dead reference.

### 5. Texts, stories and checks

- **Steps:**
    1. Update Overview.mdx, CONTEXT.md and the two domain specs
    2. Add the new inputs to the stories and take the touched snapshots anew
    3. Check the popup and the bar in the browser on :6007
    4. Run lint, types, tests, the styles linter and the build of the kit
- **Readiness sign:** all checks green, the snapshot suite green on a second run.
- **Verified by:** `node tools/visual-gate.mjs ui-kit-v2` — every frame matches.

## What this work does not do

- The popup, list and empty-state properties are not turned into handles: not asked.
- The epic RT-2542 is not touched: this work is outside it by the owner's word.
