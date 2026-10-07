# Plan

**Task:** RT-2579 · **Branch:** RT-2579-mb-auth-import
**Spec:** `docs/specs/message-bus/people-transfer/spec.md`
**Behaviour:** changes

## Task footprint

| What  | Where                                                                       |
| ----- | --------------------------------------------------------------------------- |
| Specs | `docs/specs/message-bus/people-transfer/`, `docs/specs/message-bus/spec.md` |
| Laws  | `docs/constitution/application/access.md`                                   |
| Rules | `.claude/skills/testing/`, `.claude/skills/doc-style/`                      |
| Code  | `tools/bus-people-transfer.mjs`, `tools/bus-people-transfer.lib.mjs`        |
| Tests | `tools/tests/bus-people-transfer.test.sh`                                   |
| Docs  | `docs/PROD.md`                                                              |

## What counts as done

- `node tools/bus-people-transfer.mjs export` writes the transfer file for `rt-auth-import` and the
  key map, both outside the repository.
- `node tools/bus-people-transfer.mjs rekey` rewrites the operator column to the Keycloak keys.
- The scenarios `SC-MB-418`…`SC-MB-423` are covered by the test set of the tools.
- The production guide names the order: export, deploy, import, rekey.

## Stages

### 1. The transfer command

- **Steps:**
    1. The pure part of the transfer is written with its test set
    2. The command reads production and writes the files
    3. The production guide names the order of the transfer
- **Readiness sign:** `bash tools/tests/bus-people-transfer.test.sh` is green, and `node
tools/check-specs.mjs` names no divergence.
- **Verified by:** `bash tools/tests/run.sh` — the line «ALL SETS ARE GREEN».

## What this work does not do

- Does not run the transfer in production: that is the deploy of RT-2581.
- Does not move the service account of the cargo triage: that is RT-2582.
