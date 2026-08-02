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
  [`areObjectsEqual`](../are-objects-equal/CONTEXT.md).
- Everything else is compared with `!==`, so **`NaN` is never equal to `NaN`**, and `0` equals
  `-0`.
- Cyclic structures recurse until the stack overflows.

## Reach for something else when

- Order should not matter — use
  [`areArraysEqualUnordered`](../are-arrays-equal-unordered/CONTEXT.md).
