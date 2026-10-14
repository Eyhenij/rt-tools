# Grill

## The owner request

> обнови все пакеты до самых последних

The task came out of that order: the work on RT-2805 found that the specs of the utils package
carry type errors nothing reports.

## What the tree already had

- The spec type check of the package found 10 errors in two specs; the package had no `typecheck`
  target, and its tests run on Jest, which does not check types.
- The spec of `isNumber` wrote a BigInt literal while the spec settings target ES2016.
- The spec of `safeCompare` built one comparator typed for numbers and called the function with
  `null` and `undefined`. The function itself is typed for any `T` and handles both.

## Decisions

- **The specs are fixed to the types, not the types to the specs.**
- **The BigInt literal became a `BigInt(1)` call:** the same value, and the target of the spec
  settings is not raised for one line. Rejected: raising the target — it changes how every spec of
  the package is compiled.
- **The comparator is typed for numbers, null and undefined,** so each call names what it passes.
  Rejected: casting every argument.
- **The package got a `typecheck` target,** as the servers did in RT-2805.
