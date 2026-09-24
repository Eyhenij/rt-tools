# Plan

**Task:** RT-2342 · **Branch:** RT-2342-material-icons-classic
**Spec:** `docs/specs/ui-kit-v2/table-material-theme/spec.md`
**Behaviour:** unchanged — the kits draw as before; only the first kit's showcase font changes, so that it draws the way the first kit's README sets an application up. Decided by the tree: the rule «both at weight 700» of the spec and the first kit's icon directive.

## Task footprint

| What  | Where                                                                      |
| ----- | -------------------------------------------------------------------------- |
| Specs | `docs/specs/ui-kit-v2/table-material-theme/`                               |
| Rules | `.claude/skills/ui-component-tests/`, `.claude/skills/rt-tools-storybook/` |
| Code  | `projects/ui-kit/.storybook/`                                              |

## What counts as done

- The first kit's showcase draws `mat-icon` with Material Symbols, as its README sets an application up; the icon directive's weight 700 applies.
- The toolbar and the rows of `components-dynamiclist--many-items` match `FirstKitManyItems` of the second kit by the icon drawing on a crop.
- No icon of the first kit's stories falls back to a word: the showcase font carries every name they use.

## Stages

### 1. The first kit's showcase draws with its own font

- **Steps:**
    1. Rebuild the showcase subset of Material Symbols with every icon name the first kit's templates and stories use
    2. Set the showcase icon registry to `material-symbols-outlined`
    3. Compare the list toolbar and rows of both kits on a crop
- **Readiness sign:** a sweep of the first kit's list finds no `mat-icon` wider than its size, and the crops match.
- **Verified by:** `node tools/visual-gate.mjs ui-kit` — «Snapshots:» shows which frames moved

### 2. Frames and handing over

- **Steps:**
    1. Look at the diverged first kit frames and re-take them in the image
    2. Write the reference drawing into the spec
    3. Open the PR into the epic branch
- **Readiness sign:** the image run matches all frames on the second pass, the spec check is green, the PR is open.
- **Verified by:** `node tools/visual-gate.mjs ui-kit` — «Snapshots:» with no failed

## What this work does not do

- The second kit's icon set stays as it is: it already draws what the first kit draws in an application set up by its README.
