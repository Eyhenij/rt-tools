# typescript-conventions — how it is arranged here

The names of this tree, next to the rule `SKILL.md` beside it. A file of its own because the rule
speaks by technique and travels between repositories whole, while everything below is true only
here and goes stale at every rename.

The rule is taken for any `.ts` that has none of its own: a component file has
`component-structure`, a framework class has `angular-patterns`, a barrel has `lib-layers`, a spec
has `testing`.

## What it is called here

- **In the rule** — Here
- **the kind of a declaration in the name** — `I` on an interface, `T` on a type alias, `E` on an enum
- **a private field** — a field with a hash (`#config`), not an access keyword
- **a watched source** — a field with the suffix `Source`
- **a group of public types of a feature** — `export namespace IRtuiButton { … }` next to the class
- **a cross-package import** — the alias `@rt-tools/core`, `@rt-tools/store`, `@rt-tools/utils`

## Where it lives

- **the code rule set** — `eslint.config.mjs` at the root, the shared part `eslint/base.config.mjs`
- **the tree own rules** — `tools/eslint-rules/rules/`, called `@nx/workspace-<rule name>`
- **the package aliases** — `tsconfig.base.json`, the `paths` section
- **the formatting** — `.prettierrc.json` — 140 columns, a four-space indent, single quotes

## Where the articles are carried out

The first column is the article verbatim, as it is written in the section «How the law applies
here» (the bold part of the item). An article without a line and a line without an article are a
divergence: the rule promises what the tree does not have, or the tree holds what the rule is
silent about.

- **The kind of a declaration shows in the name prefix, and three linter rules hold that.** — `tools/eslint-rules/rules/require-interface-prefix.ts:RULE_NAME` — together with it `require-type-prefix` and `require-enum-prefix`, a refusal on all `.ts`. What had accumulated by the day of enabling was found by them: the prefix is missing on 341 type aliases, 17 enums and 10 interfaces.
- **A watched source is named by a suffix.** — `tools/eslint-rules/rules/require-source-suffix-for-subjects.ts:REQUIRED_SUFFIX` — a linter refusal; there are no violations in the tree.
- **The file name suffix finds the promised declaration inside.** — **Not checked.** Neither the linter nor the build reconciles a file name with the declaration inside it: a `*.service.ts` file without a service is lawful for both.
- **A file is no longer than 500 lines, and all lines count — blank ones and comments too.** — For `.ts` it is `max-lines` in `eslint.config.mjs`, and all lines count; the rule of the same name from the sonarjs set is switched off — it counts only code. Texts and styles are held by `tools/check-file-size.mjs:LIMIT` with the same number.
- **A type is taken from the package where it is declared.** — `tsconfig.base.json:paths` — the package aliases; an import past them is refused by `@nx/enforce-module-boundaries`, and a relative path through `projects/*` does not pass.
- **A value declared by one side of an exchange is not recomputed by the other side but taken from the first.** — `tools/cargo-mark.mjs:treeSlug` — the tree sign is taken from the package by the same call the send computes it with; an own copy of the computation had already diverged from the package one silently.
- **A value from a closed set arrives as an enum `E<Name>`, not as a string or a number at the place of use.** — **Not checked.** The linter judges the name of an enum but not that the set is declared as an enum rather than as strings in place
- **A deprecation mark is set together with a walk over the consumers.** — **Not checked.** The mark is a comment, and the walk over the consumers is invisible to a machine. The sample is the removed set `.c-button`: the migration map to `.rtui-btn` stayed in `projects/ui-kit/src/styles/TOKENS.md`.
- **The two-step cast `as unknown as` is forbidden by a linter rule.** — `eslint.config.mjs:no-restricted-syntax` — a selection by the parse node; the specs are taken out from under the ban by the same block.

## What else is worth knowing when reading the code

- Nothing is inferred implicitly: `@typescript-eslint/typedef` demands a type on a parameter, a
  field, a variable declaration and an array destructuring, `explicit-function-return-type` on the
  returned value, `explicit-member-accessibility` on class members. Yes, local variables in specs
  are annotated too.
- The member order is held by `@typescript-eslint/member-ordering`: private fields, protected,
  public, the constructor, public methods, protected, private.
- Dependencies are taken through `inject()`, not through the constructor.
- Namespaces are allowed on purpose: `@typescript-eslint/no-namespace` is switched off, and this is
  the accepted way here to group the public types of a feature.
- Comments and documentation blocks are written here — a short explanation of a non-obvious public
  symbol and of the reason for a bypass is the manner of this house, not noise.
- `no-console`, `no-debugger`, `no-var`, `no-bitwise`, `no-eval` — refusals.

## What this is checked by

- `pnpm exec nx lint @rt-tools/<package>` or `pnpm run lint` — the whole set.
- `pnpm run check:affected` — lint, types, specs and build over the affected packages.
- On a commit `lint-staged` through husky runs a fixing pass of the linter and the formatting.
