# Plan

**Task:** RT-1939 · **Branch:** RT-1939-watch-the-run
**Behaviour:** unchanged — the edit touches the rules layer and its guard; no application code of
the tree is touched, so there is no product agreement to write.

## Task footprint

| What  | Where                                                                    |
| ----- | ------------------------------------------------------------------------ |
| Guard | `projects/agent-kit/assets/hooks/waiting-turn-guard.sh`                  |
| Rule  | `projects/agent-kit/assets/rules/turn-conduct.md` and its cold part      |
| Tests | `projects/agent-kit/tests/waiting-turn-guard.test.sh`                    |
| Specs | `docs/specs/agent-kit/turn-exit/`                                        |
| Law   | the article goes to the owner as text: a law is not edited in the branch |

## What counts as done

- A turn that opened a request the pipeline wakes for does not end while the run of that request
  is left without a wait: the guard refuses it and names the wait in the refusal.
- A single read of the run state closes the demand only where the run has already ended; a run
  still going has to be waited for by a background command in the same turn.
- The rule says in words what the guard holds, and the account of the miss lies in the cold part.
- The suite of the guard is green, and every new case is red on the guard as it stands now.

## Stages

### 1. The case is pinned by a test before the guard is edited

- **Steps:**
    1. Write the case: a request is opened, the run is read as going, no wait — the turn is refused.
    2. Write the case: the same turn holds a background wait — the turn is let go.
- **Readiness sign:** both cases fail on the guard as it stands now.
- **Verified by:** `bash projects/agent-kit/tests/waiting-turn-guard.test.sh` — the new cases fail
  and the rest pass.

### 2. The guard holds the run of the request it opened

- **Steps:**
    1. Count a request opened in the turn as a start of a run, on a par with a rerun.
    2. Close the demand by a wait or by a run already ended, not by a bare read of the state.
- **Readiness sign:** the whole suite of the guard is green.
- **Verified by:** `bash projects/agent-kit/tests/waiting-turn-guard.test.sh` — 0 failures.

### 3. The rule says what the guard holds

- **Steps:**
    1. Write the article into the rule and move the account of the miss to its cold part.
    2. Write the scenario in the specs of the turn exit and bind the article in the companion.
- **Readiness sign:** the article, the binding and the scenario name one and the same thing.
- **Verified by:** `pnpm run check:specs` and `pnpm run agent-kit:check` — no divergences.

## What this work does not do

- The law article: a law is not edited in the branch, and its text goes to the owner.
- The run of a foreign request: a request opened by another working copy is led by its executor.
- The trap of the task folder sample — the copied files carry the layout header, and after that
  they can be neither edited nor removed. It is named to the owner and filed as a task of its own.
