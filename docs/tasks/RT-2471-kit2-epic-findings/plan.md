# Plan

**Task:** RT-2471 · **Branch:** RT-2471-kit2-epic-findings
**Behaviour:** unchanged — only rule texts and one refusal text change; the owner ordered the six findings in: «Внести все шесть».

## Task footprint

| What     | Where                                                                                                                                                   |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Findings | `docs/plans/one-kit-part-2-findings.md`                                                                                                                 |
| Rules    | `.claude/skills/ui-component-tests/`, `.claude/skills/rt-tools-storybook/`                                                                              |
| Override | `.claude/rt-kit/overrides/rules/testing.md`                                                                                                             |
| Package  | `projects/agent-kit/assets/rules/turn-conduct.md`, `projects/agent-kit/assets/rules/task-flow.md`, `projects/agent-kit/assets/hooks/turn-exit-guard.sh` |

## What counts as done

- Each of the six findings stands at its address in the wording of the findings file.
- The laid-out copies match the package, the hook suites are green.
- The findings file records the owner's word.

## Stages

### 1. The four findings of this tree

- **Steps:**
    1. `ui-component-tests`: a `play` step asserts a size against a lower bound, not presence.
    2. `rt-tools-storybook`: `Playground` is a showing of one instance.
    3. `rt-tools-storybook`: a state class misses a node drawn after the resize.
    4. The override of `testing`: image suites do not run from a working tree under the temporary directory.
- **Readiness sign:** the four wordings are in place and no file exceeds its size limit.
- **Verified by:** `node tools/check-file-size.mjs` — «longer than the limit 0».

### 2. The two findings of the package

- **Steps:**
    1. `turn-conduct` and the refusal tail of the turn exit guard: where the owner's stop word is written.
    2. `task-flow`: a stop on a later step is written at once.
    3. Build and lay out the package.
- **Readiness sign:** the laid-out copies match the package and the hook suites are green.
- **Verified by:** `pnpm run agent-kit:check` — «разложенное сходится с пакетом»; `pnpm run agent-kit:hooks` — no failed suite.

### 3. The findings file

- **Steps:**
    1. Record the owner's word and where each finding went.
- **Readiness sign:** the section «The owner's word» names all six.
- **Verified by:** `node tools/check-doc-paths.mjs` — no divergences.

## What this work does not do

- The findings of RT-2424 and RT-2427: the owner decided on 30 September not to make them rule edits.
