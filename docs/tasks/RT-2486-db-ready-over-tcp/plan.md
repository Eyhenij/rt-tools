# Plan

**Task:** RT-2486 · **Branch:** RT-2486-db-ready-over-tcp
**Behaviour:** unchanged — the CI step and the dump probe wait for the base; the owner named work outside epics: «Задачи вне эпиков».

## Task footprint

| What     | Where                      |
| -------- | -------------------------- |
| Pipeline | `.github/workflows/ci.yml` |
| Deploy   | `deploy/dump.sh`           |

## What counts as done

- Both waits ask `pg_isready` over TCP inside the container.
- A local start of the same image passes the TCP wait only after the real server listens.

## Stages

### 1. The wait goes over TCP

- **Steps:**
    1. `ci.yml`: `pg_isready -h 127.0.0.1` in the migrations step, with a comment naming the reason.
    2. `deploy/dump.sh`: the same in the probe wait.
- **Readiness sign:** the shell parses and both waits name the TCP host.
- **Verified by:** `bash -n deploy/dump.sh` — no output.

## What this work does not do

- The waits of the end-to-end stand: they connect from the host by the client and retry.
