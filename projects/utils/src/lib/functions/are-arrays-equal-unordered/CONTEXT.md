# areArraysEqualUnordered

```ts
areArraysEqualUnordered<T>(f: T[], s: T[]): boolean
```

Deep comparison of two arrays **treating them as multisets** — order is irrelevant, but duplicates
are counted.

## Use it when

- Comparing selections, tag sets or id lists whose order carries no meaning.

## Edge cases

- Duplicates matter: `[1, 1]` and `[1, 2]` are not equal.
- Matching is greedy first-fit and each element of the second array is consumed at most once. For
  the primitives and plain objects this is meant for, the result is exact.
- Nested arrays are compared **unordered too** — the recursion goes through this function, not
  through [`areArraysEqual`](../are-arrays-equal/CONTEXT.md). `[[1, 2]]` equals `[[2, 1]]`.
- Nested objects go to [`areObjectsEqual`](../are-objects-equal/CONTEXT.md).
- Cost is `O(n²)`; for large arrays of scalars, compare sorted copies or use a counting map.
- A non-array argument yields `false` rather than throwing.

## Reach for something else when

- Position matters — use [`areArraysEqual`](../are-arrays-equal/CONTEXT.md).
