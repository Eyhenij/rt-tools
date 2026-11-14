# Grill

## The owner request

> заведи задачу в эпике 3232 и добавь knip

14.11.2026, when the knip findings that are not about the first kit were filed as this task and
taken out of the epic:

> Верни в эпик

## What the tree already has

Read on the epic branch `origin/RT-3232-remove-ui-kit-v1` (`4421b9389`), the knip run of
`pnpm run check:unused` after RT-3308: exit code 1, 117 findings.

- **Unused files (16).** Thirteen barrels `src/index.ts` of the receiver and admin libs: the lib
  layers rule demands every layer, and `tsconfig.base.json` names them. The types of
  `storage-client.check.mjs`, imported as `.mjs`. Two secondary entry points of the kit,
  `pdf-viewer` and `profile-menu`, declared by their own `ng-package.json`. One stale aggregator
  `projects/ui-kit-v2/src/lib/components/index.ts`, imported by nothing.
- **Dependencies (2) and dev dependencies (20).** `express` and 14 dev packages are named by no
  config, executor or import. `@prisma/client` (the generated client is outside history), the
  optional peers `@connectrpc/connect`, `pdfjs-dist`, `quill`, the preset
  `conventional-changelog-angular` loaded by name and `ts-node` (Jest reads the `jest.config.ts`
  files through it) are used where knip does not look.
- **Unlisted (3) and binaries (1).** Three `.storybook` files import types from `playwright`,
  which is not installed: the type becomes `any` silently; `@playwright/test` is listed. `graphify`
  is an external program.
- **Exports (57) and types (14).** Six constants are public API of the `pdf-viewer` entry. Fifty
  exports and thirteen types are used only in their own file; one function and one type are
  declared and never used.
- **Duplicate exports (1).** `TOOLBAR_BLOCKS` and `CONVERTIBLE_BLOCKS` are both public in the
  editor package, and the admin uses them in different meanings.
- **Kit source files the approval check guards.** `rt-pdf-viewer.output.ts`, `rt-tabs.keys.ts`
  and `rt-tabs.motion.ts` carry five of the in-file exports and one type. An edit there needs a
  mockup and the owner's approval, though dropping `export` changes nothing visible.

## What the rules already say

- Every layer of a lib is declared, and an empty layer is not a defect — the rule `lib-layers`.
  The barrels stay.
- A kit source file is edited after a mockup and the owner's approval — the rule `kit-approval`.
- A dependency is removed with the lockfile in the same change — the rule `dependencies`.
- A check of the tree goes into the push gate or the pipeline — the rule `testing`. knip does not:
  the owner's goal is a shorter push, and its place is decided by the plan of push time.

## Questions and answers

**Находки knip без связи с первым китом — вынести из эпика или вернуть?**
Верни в эпик.

**Как убрать 51 экспорт и 14 типов, которые используются только в своём файле?**
Снимать export руками.

**Где knip будет запускаться после задачи?**
В конце check:all.

**Удаление двух мёртвых символов — проверка PR потребует тест в наборах e2e админки и входа. Как быть?**
Написать тесты e2e.

## Decisions

- **What knip cannot see is declared in `knip.json` with the place that uses it** — the barrels,
  the generated client, the optional peers, the preset, the loader, the external program. Rejected:
  deleting them — the tree would break.
- **An export used only in its own file loses `export` by hand, the three kit files under the
  approval check included** — the owner's answer «Снимать export руками». Those three go through
  the mockup and the showcase approval. Rejected: `ignoreExportsUsedInFile` in `knip.json` — knip
  would stop naming such an export at all.
- **knip runs as the last step of `check:all`** — the owner's answer «В конце check:all»; the push
  set does not run `check:all`, so the push does not grow.
- **The suites the PR check demands get a test each** — the owner's answer «Написать тесты e2e».
- **The `.storybook` type imports move to `@playwright/test`** — the listed package; the untyped
  `Page` gets its type back. Rejected: telling knip to ignore `playwright`.

## What is left unclear

- Nothing blocks the work.
