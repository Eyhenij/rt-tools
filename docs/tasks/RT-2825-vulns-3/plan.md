# Plan

**Task:** RT-2825 · **Branch:** RT-2825-vulns-3
**Behaviour:** unchanged — a dependency pin of the build tooling, invisible from outside. Подтверждено владельцем: «делай всё сам».

## Task footprint

| What  | Where                                   |
| ----- | --------------------------------------- |
| Specs | `docs/specs/ui-kit-v2/`                 |
| Laws  | `docs/constitution/delivery.md`         |
| Rules | `.claude/skills/dependencies/`          |
| Code  | `pnpm-workspace.yaml`, `pnpm-lock.yaml` |

## What counts as done

- `pnpm why webpack-dev-middleware` shows no 6.1.3.
- `pnpm audit` lists no record for `webpack-dev-middleware`.
- Both showcases build.
- The branch is pushed through the gate.

## Stages

### 1. Raise the line 6

- **Steps:**
    1. Add the pin for the line 6 to the overrides and rebuild the snapshot.
    2. Check the resolved versions and the audit.
    3. Build both showcases.
- **Readiness sign:** the line 6 resolves to 7.4.6 and the audit has no record of the package.
- **Verified by:** `pnpm why webpack-dev-middleware` — no line `webpack-dev-middleware@6`.

## What this work does not do

- It does not touch `braces`, `sprintf-js` and `quill`: they have no fixed version.
