# Plan

**Task:** RT-2872 · **Branch:** RT-2872-ui-kit-v2-dynamic-selector-parts
**Behaviour:** unchanged — the epic plan of the owner: the root inputs do not change, so applications edit nothing

## Task footprint

| What      | Where                                                     |
| --------- | --------------------------------------------------------- |
| Specs     | none: the behaviour stays                                 |
| Laws      | none                                                      |
| Rules     | none                                                      |
| Code      | `projects/ui-kit-v2/src/lib/components/dynamic-selector/` |
| Snapshots | none change: the popup frame draws the same markup        |

## What counts as done

- The root template passes no input to `rt-dynamic-selector-popup` or `rt-dynamic-selector-list`.
- Both parts read one service the root provides.
- The barrel marks both parts deprecated; `rt-dynamic-input` stays as it is.
- The kit tests are green, and the showcase snapshots pass unchanged.

## Stages

### 1. The parts read the root

- **Steps:**
    1. Write the parts service and its source type.
    2. Move the popup and the list onto it, and bind the root.
    3. Give the popup specs and the showcase matrix a frame that provides the service.
    4. Mark the parts deprecated in the barrel.
- **Readiness sign:** the root template binds no input of a part.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2` — green; `pnpm exec nx run @rt-tools/ui-kit-v2:typecheck` — clean.

### 2. The check before the push

- **Steps:**
    1. Run the push gate set, the showcase snapshots included.
- **Readiness sign:** the push passes.
- **Verified by:** `git push` — the push gate lets the branch through.

## What this work does not do

- Removing the deprecated exports — the next release.
- `rt-dynamic-input`: it is a field of its own.
