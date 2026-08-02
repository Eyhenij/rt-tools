# isEmptyObject

```ts
isEmptyObject(value: Record<string, unknown>): boolean
```

Reports whether an object has no own enumerable string keys.

## Use it when

- Deciding whether a payload, filter set or patch carries anything worth sending.

## Edge cases

- Built on `Object.keys`, which means:
    - **Inherited properties do not count.** An object created from a prototype carrying keys is
      still reported empty.
    - **Symbol keys do not count.** `{ [Symbol('k')]: 1 }` is reported empty.
    - Non-enumerable properties do not count.
- An empty array passes as empty — `Object.keys([])` is `[]`.
- A nullish argument throws a `TypeError`.

## Reach for something else when

- Inherited or symbol keys matter — use
  [`hasPropertyInChain`](../has-property-in-chain/CONTEXT.md) for a targeted check.
- The value may be nullish or of an unknown shape — use [`isEmpty`](../is-empty/CONTEXT.md).
