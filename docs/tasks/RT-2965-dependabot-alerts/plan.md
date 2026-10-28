# Plan

**Task:** RT-2965 · **Branch:** RT-2965-dependabot-alerts
**Behaviour:** unchanged — patch and minor versions of transitive build and server packages; no
application code is edited. Владелец: «изучи https://github.com/Eyhenij/rt-tools/security и
исправь все проблемы».

## Task footprint

| What  | Where                                   |
| ----- | --------------------------------------- |
| Specs | none — no package surface changes       |
| Laws  | `docs/constitution/delivery.md`         |
| Rules | `.claude/skills/dependencies/`          |
| Code  | `pnpm-workspace.yaml`, `pnpm-lock.yaml` |

## What counts as done

- The lockfile holds no version from the vulnerable ranges of undici, vite, launch-editor,
  follow-redirects, fast-uri, multer, body-parser, qs and serialize-javascript.
- The build, the linters and the tests are green on the new lockfile.

## Stages

### 1. The overrides are raised

- **Steps:**
    1. Raise the `overrides` lines in `pnpm-workspace.yaml` to the fixed versions
    2. Run `pnpm install` and then `pnpm install --frozen-lockfile`
- **Readiness sign:** the command prints no line.
- **Verified by:** `grep -oE "^  (undici@(7\.(29|30\.0)|8\.(11|12\.[01]))|vite@8\.3\.[0-2]|launch-editor@2\.14\.[01]|follow-redirects@1\.16\.0|fast-uri@3\.1\.[0-8]|multer@2\.[0-4]\.|body-parser@2\.[0-3]\.|qs@6\.(7|8|9|1[0-6])\.0|serialize-javascript@[0-7]\.(0|1\.[0-2]))[^:]*" pnpm-lock.yaml` — empty output.

### 2. The tree is checked on the new lockfile

- **Steps:**
    1. Run `pnpm run check:all`
- **Readiness sign:** every project passes lint, types, tests, build and verify.
- **Verified by:** `pnpm run check:all` — exit code 0.

## What this work does not do

- quill 2.0.3 and deepmerge 4.3.1 — no fixed version exists; their alerts are left to the owner.
- Raising @angular/build to 22.2.5 — the release is younger than the waiting term.
