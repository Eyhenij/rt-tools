# Plan

**Task:** RT-3044 · **Branch:** RT-3044-push-guard-git-subcommand
**Spec:** `docs/specs/agent-kit/delivery-gate/spec.md`
**Behaviour:** unchanged — the edit lies in the rules package, outside application code. Подтверждено владельцем: «заводи эпик и задачи под каждую находку и бери в работу».

## Task footprint

| What  | Where                                                                                                              |
| ----- | ------------------------------------------------------------------------------------------------------------------ |
| Specs | `docs/specs/agent-kit/delivery-gate/spec.md`, `docs/specs/agent-kit/delivery-gate/scenarios.md`                    |
| Laws  | `docs/constitution/delivery.md` — read, not edited                                                                 |
| Rules | `.claude/skills/git-workflow/` — read, not edited                                                                  |
| Code  | `projects/agent-kit/assets/hooks/git-guard-push-tests.sh`, `projects/agent-kit/tests/git-guard-push-tests.test.sh` |

## What counts as done

- A command where `push` is not the subcommand of a `git` call runs no gate set.
- `git push --all`, `git push --mirror`, `git push origin a b` and a loop over several lines are
  refused as several pushes; a push of one branch passes as before.
- A push typed into the session terminal tab is judged like a shell call.
- The spec names all three, and each has a scenario with a test.

## Stages

### 1. The spec and the scenarios

- **Steps:**
    1. Write the three articles into the spec of the delivery guards
    2. Write the scenarios SC-AK-1234…SC-AK-1236 next to it
- **Readiness sign:** the check of specs names the new scenarios as uncovered, and nothing else.
- **Verified by:** `npm run check:specs` — the three new numbers are listed as uncovered

### 2. The guard and its tests

- **Steps:**
    1. Write the tests of the three scenarios and see them red
    2. Recognise the push by the subcommand of the same `git` call
    3. Count several recipients and a loop over the whole command text
    4. Put the terminal tab tool into the header and into the tool list
- **Readiness sign:** the suite is green with the new tests.
- **Verified by:** `bash projects/agent-kit/tests/git-guard-push-tests.test.sh` — the line ends with
  «0 провалов»

### 3. Layout and the set

- **Steps:**
    1. Build the package and lay it out into the tree
    2. Run the push set of the tree
- **Readiness sign:** the laid-out guard matches the source, the set is green.
- **Verified by:** `pnpm run agent-kit:check` — no divergence

## What this work does not do

- The git hook `pre-push` that runs the set outside the session — task RT-3046.
- The rule article about the path of the push — task RT-3045.
