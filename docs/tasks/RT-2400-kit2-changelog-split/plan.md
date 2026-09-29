# Plan

**Task:** RT-2400 · **Branch:** RT-2400-kit2-changelog-split
**Behaviour:** unchanged — the owner ordered a separate fix of the release changelog and the release pipeline; no package code changes

## Task footprint

| What      | Where                                     |
| --------- | ----------------------------------------- |
| Changelog | `projects/ui-kit-v2/CHANGELOG.md`         |
| Release   | `.github/workflows/publish-ui-kit-v2.yml` |

## What counts as done

- The file length check passes on the branch.
- The second kit's release splits the changelog before the version commit.

## Stages

### 1. Split and wire

- **Steps:**
    1. Split the second kit's changelog by the split command
    2. Call the split command in the second kit's release
    3. Run the push checks
- **Readiness sign:** the file length check reports no divergences
- **Verified by:** `node tools/check-file-size.mjs` — the output names no divergence

## What this work does not do

- The releases of the first kit, the core, the store and the utilities do not split their
  changelogs either; they are far from the limit and are not touched here.
