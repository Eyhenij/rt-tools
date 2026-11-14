# Plan

**Task:** RT-3310 · **Branch:** RT-3310-knip-findings, taken from `RT-3232-remove-ui-kit-v1`; its PR goes into that branch
**Behaviour:** unchanged — the owner's word of 14.11.2026 «заведи задачу в эпике 3232 и добавь knip»: the task removes code and packages nothing uses, declares to knip what it cannot see and gives knip a place where it runs; no screen and no procedure changes.

After it is written this file is not edited. A stage revision goes to `progress.md` as a decision
along the way.

## Points

- **A:** `pnpm run check:unused` exits with code 1 and 117 findings, and nothing runs it: it stands
  neither in `check:all`, nor in the push set, nor in CI. The root `package.json` holds `express`
  and 15 dev packages nothing uses: `@angular-eslint/builder`, `@angular-eslint/schematics`,
  `@commitlint/config-conventional`, `@eslint/eslintrc`, `@faker-js/faker`,
  `@fontsource-variable/montserrat`, `@nestjs/schematics`, `@nx/node`, `@nx/workspace`,
  `autoprefixer`, `eslint-plugin-html`, `eslint-plugin-simple-import-sort`, `jsonc-eslint-parser`,
  `postcss-url`, `stylelint-config-standard`. 51 exports and 14 types are used only in their own
  file. Three `.storybook` files type `Page` as `any`: they import it from `playwright`, which is
  not installed.
- **This task reaches:** `pnpm run check:unused` exits with code 0 and runs as the last step of
  `pnpm run check:all`, so a new unused file, package or export turns `check:all` red.
- **Sign:** `pnpm run check:unused; echo $?` prints `0`, and `pnpm run check:all` is green and
  names the knip step in its output.
- **Milestone G of the epic:** the task does not move it. It goes in the epic by the owner's word
  «Верни в эпик»; the epic's signs do not name knip. Its push costs the full set: `package.json`
  changes, about 47 steps, run ahead in the background.
- **Metric:** нет.

## Task footprint

| What         | Where                                                                                                                                                                                                                                                 |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Settings     | `knip.json`, the `check:all` command in `package.json`                                                                                                                                                                                                |
| Dependencies | `package.json`, `pnpm-lock.yaml`                                                                                                                                                                                                                      |
| Code         | `projects/ui-kit-v2/.storybook/`, `projects/ui-kit-v2/src/`, `projects/agent-kit/src/lib/`, `projects/core/src/`, `projects/auth-angular/src/testing/`, `projects/auth-keycloak-theme/src/`, `libs/message-bus-admin/`, `libs/message-bus-api/`, `apps/chat-talks-page/src/app/` |
| Kit files under approval | `rt-pdf-viewer.output.ts`, `rt-tabs.keys.ts`, `rt-tabs.motion.ts` — five exports and one type; the record goes to `approvals.md` of the task folder                                                                                     |
| Tests        | one test in `apps/message-bus-admin-e2e/src/` and one in `apps/auth-example-e2e/src/`, with their scenarios                                                                                                                                           |
| Rules        | `.claude/skills/dependencies/implementation.md`, `.claude/skills/browser-verification/implementation.md`, `.claude/skills/ui-component-tests-visual/SKILL.md` — they name faker, which the tree does not have                                         |
| Texts        | `CLAUDE.md` and `README.md` — the line about `check:unused`                                                                                                                                                                                           |
| Specs        | the anchors of `tools/spec-anchors.mjs` find the word, not the export: a dropped `export` keeps them                                                                                                                                                  |

## What counts as done

- `pnpm run check:unused` exits with code 0; `pnpm run check:all` runs it and is green.
- `express` and the 15 dev packages are gone from `package.json` and the lockfile;
  `pnpm install --frozen-lockfile` and `pnpm exec nx list` answer, and the push set is green.
- `git grep -n -i -w faker -- .claude docs/specs` prints nothing.
- `node tools/check-kit-approval.mjs` is green: the mockup and the showcase of the three kit files
  carry the owner's words.

## Stages

### 1. What knip cannot see

- **Steps:**
    1. Name the secondary entries of the kit in `knip.json` by `src/lib/components/*/index.ts`
    2. Name the 13 lib barrels by exact paths in `ignore`, the storage client types, the six used packages, `graphify` and the editor duplicate in `knip.json`
    3. Move the `.storybook` type imports from `playwright` to `@playwright/test`
- **Readiness sign:** knip names no file, package, binary or duplicate that the tree uses.
- **Verified by:** `pnpm run check:unused` — its files section names only
  `projects/ui-kit-v2/src/lib/components/index.ts`, its dependency sections only `express` and the
  15 packages; `pnpm exec tsc -p projects/ui-kit-v2/.storybook/tsconfig.json --noEmit` is clean.

### 2. Packages nothing uses

- **Steps:**
    1. Remove `express` and the 15 dev packages from `package.json` and the lockfile
    2. Rewrite the three rule texts that name faker
- **Readiness sign:** the dependency sections of knip are empty, and the tree installs, lints and
  builds.
- **Verified by:** `pnpm install --frozen-lockfile && pnpm run check:unused && pnpm exec nx list` —
  no dependency section in the knip output; `pnpm run check:all` green;
  `git grep -n -i -w faker -- .claude docs/specs` prints nothing.

### 3. Exports nothing imports

- **Steps:**
    1. Delete `projects/ui-kit-v2/src/lib/components/index.ts`, `hooksSectionByMatcher` and `TTreeCommandKind`
    2. Drop `export` from the in-file exports and types outside the three kit files under approval
    3. Write a test in each end-to-end suite the PR check demands for the changed code
- **Readiness sign:** knip names only the five exports and one type of the three kit files under
  approval, and the PR check finds a test in each suite it demands.
- **Verified by:** `pnpm run check:unused` — its export sections name only
  `rt-pdf-viewer.output.ts`, `rt-tabs.keys.ts` and `rt-tabs.motion.ts`; the two new tests green in
  their suites.

### 4. The kit files under approval

- **Steps:**
    1. Show the owner the Figma frames of the PDF viewer and the tabs and write the approval into `approvals.md`
    2. Drop `export` from the five exports and one type of `rt-pdf-viewer.output.ts`, `rt-tabs.keys.ts` and `rt-tabs.motion.ts`
    3. Measure the showcase of both components against the frames and write the owner's approval of the showcase into `approvals.md`
- **Readiness sign:** knip has no findings, and the approval check finds both lines with the
  owner's words.
- **Verified by:** `pnpm run check:unused; echo $?` — prints `0`; `node tools/check-kit-approval.mjs`
  — green.

### 5. The place of knip

- **Steps:**
    1. Add `check:unused` as the last step of `check:all` and rewrite its line in `CLAUDE.md` and `README.md`
- **Readiness sign:** `check:all` runs knip, and the texts say so.
- **Verified by:** `pnpm run check:all` — green, with the knip step in its output.

## What this work does not do

- knip enters neither the push set nor CI: the owner's goal is a shorter push. `check:all` is run
  by hand, so between two runs of it a new finding is seen by nobody.
- The packages `projects/auth-angular/connect/` and `projects/cms-angular/{admin,site}/` lie outside
  the `src/**` glob of knip, and `tools/**/*.ts` lies outside the root workspace: widening either
  may bring new findings and is not dragged in here.
