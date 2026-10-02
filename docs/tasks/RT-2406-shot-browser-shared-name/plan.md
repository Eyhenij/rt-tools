# Plan

**Task:** RT-2406 · **Branch:** RT-2406-shot-browser-shared-name
**Behaviour:** unchanged — a test tool outside the applications; the owner named work outside epics: «Задачи вне эпиков».

## Task footprint

| What | Where                    |
| ---- | ------------------------ |
| Code | `tools/shot-browser.mjs` |

## What counts as done

- Two working copies on one machine get different default shot container names and ports.
- `E2E_SHOT_CONTAINER` and `E2E_SHOT_PORT` still override the default.

## Stages

### 1. A default per working copy

- **Steps:**
    1. Derive the default container name and port from the working copy path in a pure function.
    2. `tools/shot-browser.mjs` takes its defaults from that function.
- **Readiness sign:** two paths give two names and two ports, one path gives the same pair twice.
- **Verified by:** `node tools/shot-browser-name.mjs` — «per-copy defaults ok».

## What this work does not do

- The pipeline: its names are set explicitly since RT-2457.
