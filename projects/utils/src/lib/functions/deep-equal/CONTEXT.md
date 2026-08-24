# deepEqual — areArraysEqual and areObjectsEqual

Both functions live in one module on purpose: they call each other, and split across two modules
that recursion is a cycle of imports. Their public names and behaviour are unchanged; only the
address of the file they live in is one.

# areArraysEqual

```ts
areArraysEqual<T>(f: T[], s: T[]): boolean
```

Deep, **order-sensitive** comparison of two arrays.

## Use it when

- Comparing lists where position carries meaning — a sort result, a route segment list, a tuple.

## Edge cases

- A non-array argument yields `false` instead of throwing, so unvalidated input is safe to pass.
- Nested arrays recurse here; nested objects go to
  [`areObjectsEqual`](./CONTEXT.md).
- Everything else is compared with `!==`, so **`NaN` is never equal to `NaN`**, and `0` equals
  `-0`.
- Cyclic structures recurse until the stack overflows.

## Reach for something else when

- Order should not matter — use
  [`areArraysEqualUnordered`](../are-arrays-equal-unordered/CONTEXT.md).

---

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
- **An array is never equal to a non-array.** `[1]` and `{ 0: 1 }` are `false` even though their
  keys and values line up; a pair of arrays goes to the ordered array comparison instead.
- Key **count** comes from `Object.keys` (own, enumerable, string) while the per-key walk uses
  `for…in` (which also visits inherited enumerable keys) — an inherited key on one side can affect
  the result.
- `NaN` never equals `NaN`; `undefined`-valued keys still count towards the key total.
- Cyclic structures recurse until the stack overflows.

## Reach for something else when

- Order-sensitive list comparison — use [`areArraysEqual`](./CONTEXT.md).
- A quick, order-insensitive smell test on JSON data — use [`isEqual`](../is-equal/CONTEXT.md), with
  its anagram caveat.
