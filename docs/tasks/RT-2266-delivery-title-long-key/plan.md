# Plan

**Task:** RT-2266 · **Branch:** RT-2266-delivery-title-long-key
**Behaviour:** unchanged — the edit touches the rules layer, not the application

## Task footprint

| What  | Where                                                   |
| ----- | ------------------------------------------------------- |
| Specs | `docs/specs/agent-kit/delivery-gate/`                   |
| Code  | `projects/agent-kit/assets/hooks/git-guard-delivery.sh` |
| Tests | `projects/agent-kit/tests/git-guards.test.sh`           |

## What counts as done

- A command that carries the long key of the title and a short one elsewhere is judged by the long
  key.
- A command that carries the short key alone is judged by it, as before.
- The suite of the delivery guards runs green, and the specs audit exits with zero.

## Stages

### 1. The long key of the title is read first

- **Steps:**
    1. Read the title parsing of `git-guard-delivery.sh`.
    2. Search the long key first, and the short one only where no long key stands in the command.
- **Readiness sign:** a command with a run line after the title is judged by the title.
- **Verified by:** `bash projects/agent-kit/tests/git-guards.test.sh` — the line of results ends
  with «0 провалов».

### 2. The case and the scenario

- **Steps:**
    1. Write the case into the suite: the title stands first, a run line comes after it.
    2. Add the scenario to the delivery gate scenarios and bind it.
- **Readiness sign:** the new scenario is bound to the case by its number.
- **Verified by:** `node tools/check-specs.mjs` — it exits with zero and names no divergence.

## What this work does not do

- The length of the guard file: the scenarios of the epic moved into a subdomain of their own by
  task RT-2295, and the file of the guard keeps three lines of room.
