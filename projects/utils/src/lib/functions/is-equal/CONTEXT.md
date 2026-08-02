# isEqual

```ts
isEqual<T>(f: T, s: T): boolean
```

Compares two values by serialising both and sorting the characters, which makes the result
independent of key order.

## Use it when

- A cheap "did this change?" check on plain, JSON-shaped data where key order may differ.

## Edge cases

- **Anagrams collide.** `{ ab: 1 }` and `{ ba: 1 }` are reported equal, as are `[12]` and `[21]`.
  The comparison is over a _multiset of characters_, not structure.
- A cyclic object **throws** — `JSON.stringify` does.
- Values `JSON.stringify` drops (`undefined`, functions, symbols) are invisible to the comparison,
  and `Date`s are compared by their serialised form.
- Cost is `O(n log n)` in the serialised length, on both sides, every call.

## Reach for something else when

- Correctness matters more than brevity — use
  [`areObjectsEqual`](../are-objects-equal/CONTEXT.md) (structural) or
  [`areArraysEqual`](../are-arrays-equal/CONTEXT.md) (ordered, deep).
