# areObjectsEqual

```ts
areObjectsEqual<T>(f: T, s: T): boolean
```

Deep structural comparison. The default choice for "are these two payloads the same?".

## Use it when

- Comparing DTOs, form values or state slices where key order is irrelevant and nesting is real.

## Edge cases

- **Two distinct primitives are always unequal**: `areObjectsEqual(1, 2)` is `false`, but so is
  `areObjectsEqual('a', 'b')` — only the identity short-circuit (`f === s`) makes equal primitives
  return `true`. This function answers a question about objects.
- **An array and an index-keyed object compare equal.** `[1]` and `{ 0: 1 }` both take the object
  branch, because only a _pair_ of arrays is routed to the array comparison. Guard with
  `Array.isArray` when the distinction matters.
- Key **count** comes from `Object.keys` (own, enumerable, string) while the per-key walk uses
  `for…in` (which also visits inherited enumerable keys) — an inherited key on one side can affect
  the result.
- `NaN` never equals `NaN`; `undefined`-valued keys still count towards the key total.
- Cyclic structures recurse until the stack overflows.

## Reach for something else when

- Order-sensitive list comparison — use [`areArraysEqual`](../are-arrays-equal/CONTEXT.md).
- A quick, order-insensitive smell test on JSON data — use [`isEqual`](../is-equal/CONTEXT.md), with
  its anagram caveat.
