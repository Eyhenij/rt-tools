# Plan

**Task:** RT-3022 · **Branch:** RT-3022-interface-review-skill
**Behaviour:** unchanged — работа не трогает код приложений: «добавь себе в скилы и так же добавь в agent kit», новый навык пакета правил

After it is written this file is not edited. A stage revision goes to `progress.md` as a decision
along the way.

## Task footprint

| What   | Where                                                               |
| ------ | ------------------------------------------------------------------- |
| Specs  | `docs/specs/agent-kit/`                                             |
| Laws   | none — a skill stands under no law                                  |
| Rules  | `.claude/skills/write-a-skill/`, `.claude/skills/agent-kit-source/` |
| Code   | `projects/agent-kit/assets/skills/`                                 |
| Layout | `.claude/skills/interface-review*/`                                 |

## What counts as done

- The package carries seven skills of the interface review, each within the text limit.
- The layout of this tree holds them, and `pnpm run agent-kit:check` is green.
- The owner's personal skills hold the same seven.
- A PR with the work is open.

## Stages

### 1. The package skills

- **Steps:**
    1. Write the core skill `interface-review` with the run order and the report form.
    2. Write the skill `interface-review-principles` with the five domains.
    3. Write the skill `interface-review-annotate` with the cards on a Figma frame.
    4. Write the reference skills of surfaces, motion, icons and performance.
- **Readiness sign:** seven files under `projects/agent-kit/assets/skills/`, none longer than 330
  lines and 24,000 characters.
- **Verified by:** `wc -lc projects/agent-kit/assets/skills/interface-review*.md` — every line at
  or under both limits.

### 2. The layout

- **Steps:**
    1. Build the package and lay it out.
    2. Check the layout against the package.
- **Readiness sign:** seven directories `.claude/skills/interface-review*` with a layout header.
- **Verified by:** `pnpm run agent-kit:check` — exit code zero.

### 3. The personal copy

- **Steps:**
    1. Put the seven skills into the owner's personal skills.
- **Readiness sign:** seven directories under the personal skills, each with `SKILL.md`.
- **Verified by:** `ls -d ~/.claude/skills/interface-review*` — seven lines.

### 4. Delivery

- **Steps:**
    1. Take the task folder apart into the archive.
    2. Commit and push the branch.
    3. Open the PR.
- **Readiness sign:** the PR is open, the branch carries no task folder.
- **Verified by:** `gh pr view RT-3022-interface-review-skill --json state` — `OPEN`.

## What this work does not do

- The release of the package: the owner's separate decision.
- The rule conflict about the footer button order: it lies in the proposals file of the earlier work.
