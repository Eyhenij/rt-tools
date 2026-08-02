---
name: rt-tools-public-api
description: Keep the published surface of the four packages correct — the public-api.ts + index.ts barrel pair, the ui-kit root entry, tsconfig paths, package peer ranges and what counts as a breaking change. Use when editing any public-api.ts or index.ts, adding/removing/renaming an export, creating a new feature folder, or changing a package's dependencies.
---

# Public API discipline

Four published packages, each with its own version and entry point:

| package            | entry                               | consumed as        |
| ------------------ | ----------------------------------- | ------------------ |
| `@rt-tools/core`   | `projects/core/src/index.ts`        | `@rt-tools/core`   |
| `@rt-tools/store`  | `projects/store/src/index.ts`       | `@rt-tools/store`  |
| `@rt-tools/utils`  | `projects/utils/src/index.ts`       | `@rt-tools/utils`  |
| `@rt-tools/ui-kit` | `projects/ui-kit/src/public-api.ts` | `@rt-tools/ui-kit` |

These four paths are mirrored in `tsconfig.base.json` `paths` and, for ui-kit, in
`projects/ui-kit/ng-package.json` (`lib.entryFile`). They must stay in sync.

## Golden rule

**A file that no barrel re-exports does not ship.** Every feature folder carries a
`public-api.ts` listing its exports explicitly, plus a one-line `index.ts`:

```typescript
// projects/ui-kit/src/lib/ui-kit/buttons/public-api.ts
export * from './unified-button/rtui-button.component';
export * from './multi-button/rtui-multi-button.component';
```

```typescript
// projects/ui-kit/src/lib/ui-kit/buttons/index.ts
export * from './public-api';
```

The root entry re-exports the folder (which resolves via `index.ts`), grouped by
comment:

```typescript
// projects/ui-kit/src/public-api.ts
// ui-kit
export * from './lib/ui-kit/buttons';
export * from './lib/ui-kit/icon';
```

`core` / `store` / `utils` use the same shape one level up — `src/index.ts` groups
by category (`// functions`, `// services`, `// tokens`, `// types`, `// bem`, …)
and each category folder owns its `public-api.ts` + `index.ts` pair.

## Adding a component or symbol

1. Create it under `projects/<pkg>/src/lib/...`.
2. Add an explicit line to the nearest `public-api.ts` (never `export * from './some-folder'`
   pointing at a bare directory of files — list the modules).
3. New folder → also create `index.ts` with `export * from './public-api';`.
4. New top-level feature → register it in `projects/ui-kit/src/public-api.ts`
   (or the package's `src/index.ts`).
5. Build the package and confirm the symbol is in the `.d.ts`:
   `pnpm run build:ui-kit` → `dist/ui-kit/`.

**Do not export story scaffolding.** `Test*Component` wrappers under `stories/`
are demo-only and stay out of every barrel.

## Dependencies between packages

- ui-kit depends on the other three: `implicitDependencies` in
  `projects/ui-kit/project.json`, `allowedNonPeerDependencies` in
  `ng-package.json`, and both `dependencies` **and** `peerDependencies` entries in
  `projects/ui-kit/package.json`. Bumping `@rt-tools/core` means updating both
  ranges there.
- Angular/CDK/Material/rxjs/TypeScript are `peerDependencies` (`^22.0.0`, `^7.8.2`,
  `^6.0.0`) — never promote one to a real dependency.
- Every package is `"sideEffects": false`; keep barrels free of side-effectful
  module-level code or tree-shaking silently breaks for consumers.
- Import across packages by path alias (`@rt-tools/core`), never
  `../../../core/src/...`. `@nx/enforce-module-boundaries` is `error`.

## Breaking changes

Removing or renaming an export, narrowing a type, or dropping a `--rt-*` public
theming var is **breaking** for the published package. When it happens:

- bump the version in `projects/<pkg>/package.json` and any dependent range;
- record it in the `## [Unreleased]` block of `projects/<pkg>/CHANGELOG.md`
  (released sections are conventional-commit generated — never rewrite them);
- flag it in the PR body.

See the **rt-tools-ship-pr** skill for the CHANGELOG/PR mechanics. Publishing is a
`workflow_dispatch` GitHub Action per package (`.github/workflows/publish.yml`,
`publish-core.yml`, `publish-store.yml`, `publish-utils.yml`) — not a local
`npm publish`.

## Verify

```bash
pnpm run build:all      # every package must build from its entry
pnpm run check:affected # lint + test + build for touched packages
```
