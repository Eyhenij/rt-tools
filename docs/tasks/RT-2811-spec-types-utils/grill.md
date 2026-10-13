# Grill

## The owner request

> обнови все пакеты до самых последних

The task came out of that order: the work on RT-2805 found that the specs of the utils package
carry type errors nothing reports.

## What the tree already has

- `pnpm exec tsc -p projects/utils/tsconfig.spec.json --noEmit --rootDir .` finds 10 errors in two
  specs; the package has no `typecheck` target, and its tests run on Jest, which does not check
  types.
- The spec of `isNumber` writes a BigInt literal, and the spec settings target ES2016.
- The spec of `safeCompare` builds one comparator typed for numbers and calls the function with
  `null` and `undefined`, which a numbers-only type does not allow. The function itself is typed
  for any `T` and handles both.

## Decisions

- **The specs are fixed to the types, not the types to the specs.**
- **The BigInt literal becomes a `BigInt(1)` call:** it is the same value, and the target of the
  spec settings is not raised for one line. Rejected: raising the target — it changes how every
  spec of the package is compiled.
- **The comparator is typed for numbers, null and undefined,** so each call in the spec names what
  it passes. Rejected: casting every argument.
- **The package gets a `typecheck` target,** as the servers did in RT-2805.
