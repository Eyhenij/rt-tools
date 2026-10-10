# Plan

**Task:** RT-2753 · **Branch:** RT-2753-no-tgz-in-package
**Behaviour:** unchanged — the owner asked to fix the publish scripts only; no application code is touched

## Task footprint

| What | Where                                    |
| ---- | ---------------------------------------- |
| Code | `package.json` — the `packagr:*` scripts |

## What counts as done

- No publish script runs `npm pack`, so a published package carries no `*.tgz`.

## Stages

### 1. Publish without the archive

- **Steps:**
    1. Remove `npm pack` from the six `packagr:*` scripts
    2. Check the packed file list of the built second kit
- **Readiness sign:** the scripts hold no `npm pack`, and the dry run of the publish lists no `.tgz`
- **Verified by:** `grep -c 'npm pack' package.json` — prints `0`

## What this work does not do

- Does not publish a new version: publishing is the owner's step.
