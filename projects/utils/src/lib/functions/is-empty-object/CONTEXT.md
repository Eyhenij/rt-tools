# isEmptyObject

```ts
isEmptyObject(value: Nullable<Record<string, unknown>>): boolean
```

Reports whether an object has no own enumerable string keys. Nullish counts as empty.

## Use it when

- Deciding whether a payload, filter set or patch carries anything worth sending.

## Edge cases

- `null` and `undefined` are **empty**, matching how [`isEmpty`](../is-empty/CONTEXT.md) treats
  absence.
- Built on `Object.keys`, which means:
    - **Inherited properties do not count.** An object created from a prototype carrying keys is
      still reported empty.
    - **Symbol keys do not count.** `{ [Symbol('k')]: 1 }` is reported empty.
    - Non-enumerable properties do not count.
- An empty array passes as empty — `Object.keys([])` is `[]`.

## Reach for something else when

- Inherited or symbol keys matter — use
  [`hasPropertyInChain`](../has-property-in-chain/CONTEXT.md) for a targeted check.
- The value's shape is unknown — use [`isEmpty`](../is-empty/CONTEXT.md).
