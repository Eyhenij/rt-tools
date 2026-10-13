# Plan

**Task:** RT-2805 · **Branch:** RT-2805-spec-types-servers
**Behaviour:** unchanged — only the specs and the test helpers change; the servers behave as before.

After it is written this file is not edited. A stage revision goes to `progress.md` as a decision
along the way.

## Task footprint

| What  | Where                                                                                          |
| ----- | ---------------------------------------------------------------------------------------------- |
| Rules | `.claude/skills/testing/`                                                                      |
| Code  | `projects/auth-server/src/lib/`, `projects/cms-server/src/lib/`, `projects/agent-kit/src/lib/` |

## What counts as done

- `pnpm exec tsc -p <package>/tsconfig.spec.json --noEmit` ends with no error for the auth
  server, the CMS server and the rules package.
- The specs of the three packages still pass, and the coverage threshold of the two servers holds.

## Stages

### 1. Spec types

- **Steps:**
    1. Take the helper `refusalOf` as it is called, with a value or a promise
    2. Fix the media double spread and the auth server spec errors
    3. Fix the rules package spec error
    4. Run the specs of the three packages and the tree set

- **Readiness sign:** the type check of the three spec projects is empty and the specs pass.
- **Verified by:** `pnpm exec tsc -p projects/cms-server/tsconfig.spec.json --noEmit` — no output.

## What this work does not do

- A target that runs the spec type check in the push gate — a decision of its own.
