# Plan

**Task:** RT-2447 · **Branch:** RT-2447-receiver-libs-typecheck
**Behaviour:** unchanged — only specs, their settings and the build tooling change; the owner's word: «Взять обе по очереди»

After it is written this file is not edited. A stage revision goes to `progress.md` as a decision
along the way.

## Task footprint

| What    | Where                                                    |
| ------- | -------------------------------------------------------- |
| Tooling | `nx.json`, `tools/nx-plugins/`                           |
| Specs   | `libs/**/src/**/*.spec.ts`, `libs/**/tsconfig.spec.json` |
| Rules   | `.claude/skills/testing/implementation.md`               |

## What counts as done

- Every Vitest project with a spec settings file has a `typecheck` target that checks its specs.
- `pnpm exec nx run-many -t typecheck --all` passes with no error.
- The testing companion no longer says the libs have no such target.

## Stages

### 1. The target

- **Steps:**
    1. Write the plugin that infers the target
    2. Register the plugin in the workspace settings
- **Readiness sign:** the libs list the target
- **Verified by:** `pnpm exec nx show projects --with-target typecheck` — the receiver libs are listed

### 2. The specs

- **Steps:**
    1. Fix the type errors in the admin specs
    2. Fix the type errors in the receiver and shared specs
- **Readiness sign:** the target passes in every project
- **Verified by:** `pnpm exec nx run-many -t typecheck --all` — no failed task

### 3. Closing

- **Steps:**
    1. Bring the testing companion up to date
    2. Run the full suite
    3. Take the task folder apart into the archive
- **Readiness sign:** the suite is green and the folder is gone from the branch
- **Verified by:** `pnpm run check:all` — every project passes

## What this work does not do

- The two applications without a spec settings file: they have a `typecheck` target of their own.
