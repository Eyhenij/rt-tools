# Plan

**Task:** RT-3273 · **Branch:** RT-3273-push-checks-leave-session
**Behaviour:** unchanged — «исправляй флоу проверок чтобы не гонять лишнее»: the work moves checks of the rules package and the pipeline, no application code is touched

## Points

- **A:** the push set runs 25–40 minutes inside the session, twice per push, and dies with the session.
- **This task reaches:** a push of a branch takes under two minutes; the heavy steps run in the
  pipeline, and the PR into the epic branch shows their result.
- **Sign:** the time of `git push` of a branch with a code change, and a pipeline run on a PR into
  the epic branch; the owner sees both on the PR page.
- **Milestone G of the epic:** an epic of several tasks reaches `main` with no repeated questions to
  the owner and no false refusals.
- **Metric:** minutes of a push inside the session — down, baseline 34 minutes on RT-3280.

## Task footprint

| What  | Where                                                                  |
| ----- | ---------------------------------------------------------------------- |
| Specs | `docs/specs/agent-kit/push-gate-ahead/`                                |
| Laws  | `docs/constitution/delivery.md`, `docs/constitution/verifiability.md`  |
| Rules | `.claude/skills/git-workflow/`, `.claude/skills/testing/`              |
| Code  | `projects/agent-kit/assets/hooks/`, `.github/workflows/ci.yml`         |

## What counts as done

- A `git push` of a branch runs the light checks alone and takes under two minutes.
- The session guard runs no check set on a push.
- The pipeline runs on a PR into the epic branch.

## Stages

### 1. The pipeline wakes for a PR into the epic branch

- **Steps:**
    1. Add the epic branch form to the pull request trigger of the pipeline
    2. Bring the delivery rule texts about a PR off the main branch up to date
- **Readiness sign:** the trigger names the task key form next to `main`
- **Verified by:** `grep -n -A4 'pull_request:' .github/workflows/ci.yml` — the branch list holds `RT-*`

### 2. The push runs the light checks alone

- **Steps:**
    1. Make the git hook skip every heavy step of the set
    2. Make the session push guard run no set
    3. Bring the push set spec and its scenarios up to date
- **Readiness sign:** the scenarios of the hook and of the guard are green
- **Verified by:** `bash projects/agent-kit/tests/run.sh` — the last line reads «ВСЕ НАБОРЫ ЗЕЛЁНЫЕ»

## What this work does not do

- The delivery rules on the host — task RT-3272.
- Removing the run ahead and the marks: they stay until the pipeline answers for every PR.
