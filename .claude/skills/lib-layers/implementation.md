# lib-layers — how it is arranged here

The names of this tree, next to the rule `SKILL.md`. A separate file because the rule speaks by
technique and travels between repositories whole, while everything below is true only here and
goes stale at every renaming.

The libs here are of two kinds, and the rule acts on them differently. The published packages in
`projects/` are a contract with the consumer: a barrel for them is not a build convenience but a
declaration of what leaves, and a file that got into no barrel does not leave at all. The
receiver's internal libs in `libs/` are ordinary layers: they have the ladder, tags and
boundaries, as in the general case.

## What it is called here

- **In the rule** — Here
- **a lib** — a published package `@rt-tools/*` in `projects/<name>/`; an internal one — `libs/<family>/<domain>/<layer>`
- **a lib family** — `libs/message-bus-api` — the server side of the receiver; `libs/message-bus-common` is outside the families
- **a layer** — `api`, `data-access`, `feature`, `util` — four of them, the server side has no `ui` and no `shell`
- **a tag** — `scope:` plus the path from `libs/` with hyphens: `scope:message-bus-api-trees-util`
- **a barrel** — the pair `public-api.ts` + `index.ts` in every feature folder
- **a package entry point** — `projects/<package>/src/index.ts`, on both kits — `src/public-api.ts`; on an internal lib — `src/index.ts`
- **an alias** — an entry in `paths` of the file `tsconfig.base.json`
- **the utility layer** — `@rt-tools/utils` — a package without a single dependency except the compiler's helper library
- **the family base** — `@rt-tools/core` — the shared directives, storages and tokens; all the rest call it
- **the boundaries config** — the domain file in `eslint/boundaries/domains`, the summary — `eslint/boundaries/index.mjs`

## Where it lives

- **the package aliases** — `tsconfig.base.json`
- **the build manifest of the first kit** — `projects/ui-kit/ng-package.json` — `lib.entryFile`
- **the dependencies and version ranges** — `projects/<package>/package.json`
- **the implicit dependencies for the build** — `projects/ui-kit/project.json` — `implicitDependencies`
- **the check of the utility package contents** — `tools/verify-utils-package.cjs`, target `verify`
- **the audit of the second kit's overview pages** — `tools/verify-ui-kit-v2-docs.cjs`, target `verify`

## Where the articles are carried out

The first column is the article verbatim, as it is written in the section "How the law applies
here" (the bold part of the item). An article without a line and a line without an article are a
divergence: the rule promises what the tree does not have, or the tree holds what the rule is
silent about.

- **A foreign symbol is not re-exported in either of the two forms.** — `tools/lib-reexports.mjs:checkReexports` — both forms are judged: `export … from` of a foreign module and the pair "import plus `export`". There is no linter rule on re-exports here, it is held by a check of the tree.
- **A line with a foreign lib alias in a barrel is the same re-export.** — `tools/lib-reexports.mjs:checkReexports` — that same check judges the barrel too; in `projects/ui-kit/src/public-api.ts` there are no lines with the alias `@rt-tools/*`, and what is foreign arrives as a package dependency.
- **A missing right is added as a line in the domain config with a comment.** — `eslint/boundaries/domains/message-bus-api.config.mjs:PERSISTENCE_UTIL` — every edge of the receiver family is written out as a line with a reason. On the published packages the marks are empty, and their rights are given by one allowing rule in `eslint/boundaries/domains/packages.config.mjs`: the direction between them is held by their own `package.json`.
- **`libs/common/util` has an empty dependency list, and Angular does not get in.** — `tools/lib-boundaries.mjs:checkNoDependencyLibs` — the tags from `noDependencyTags` of the file `.claude/rt-kit/checks.json` are judged; here there is one such tag, `scope:message-bus-common`, and its dependency list is declared empty in `eslint/boundaries/domains/message-bus-common.config.mjs`. Among the packages the same is answered by `projects/utils/package.json`, where there is not a single dependency on the framework — but the check reads the boundaries, not it.
- **The family base sees only `util`.** — `tools/lib-boundaries.mjs:checkBoundaries` — the base's rights are judged by tags; here the base is answered by `projects/core/package.json` with the single dependency `@rt-tools/utils`.
- **Behaviour the family base cannot see comes to it by a token.** — **Not applicable.** There are no lib families with a base here: the tree holds packages, not an application with families
- **A domain is started for a subject, not for mechanics.** — **Not checked by anything.** A subject is indistinguishable from mechanics to a machine: the directory name is lawful in both cases. The kit folders are named by a subject, and on the receiver all five domains are named by a subject; held by reading.
- **A domain with exactly one non-empty layer is listed as a line with a reason.** — `tools/lib-domains.mjs:checkDomainIsFilled` — a domain with one non-empty layer is named by a line. The trees domain holds three layers out of four non-empty: `api` is empty because it goes nowhere outward.

## What else is worth knowing when reading the code

- A file listed in no barrel does not leave for the consumer. A new feature folder is a
  `public-api.ts` with the list of modules and a one-line `index.ts` over it.
- The harness of the showcase and of the specs is not published: `src/testing/**` and
  `src/showcase/**` are excluded from the build, and the story wrappers are listed in no barrel.
- The framework, CDK, Material and the streams library are peer dependencies in every package;
  they may not be moved to ordinary ones.
- Every package has `"sideEffects": false`. A module-level side effect in a barrel silently
  breaks dead-code elimination at the consumer.
- The second kit does not replace the first and shares no code with it: different selectors, its
  own token sets, its own component lists — one application can hold both.
- The cargo shape known to both sides of the intake is declared in the package and taken from
  the source by the subpath `@rt-tools/agent-kit/cargo`. There is deliberately no re-export of it
  from the receiver lib: a symbol is imported where it is declared, and the permission for that
  subpath is written out as a line in the root linter config.
- Removing or renaming an export, narrowing a type and removing a public styling token are a
  breaking edit for a published package: the version is bumped, the unreleased section of the
  changelog is appended, and this is named in the PR description.

## What this is checked by

- `pnpm run build:all` — every package must build from its own entry point.
- `pnpm exec nx run-many -t verify --all` — the contents of the utility package and the audit of
  the overview pages.
- `pnpm run check:affected` — lint, types, specs and build over the affected packages; the
  boundaries rule lives in the lint.
