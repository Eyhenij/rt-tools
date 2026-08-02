# isEmptyArray

```ts
isEmptyArray<T>(value: Nullable<T[]>): boolean
```

Reports whether an array holds no elements. Nullish counts as empty.

## Use it when

- You have an array-or-nothing and want the intent spelled out at the call site.

## Edge cases

- `null` and `undefined` are **empty**, matching how [`isEmpty`](../is-empty/CONTEXT.md) treats
  absence. Distinguish the two with [`isNil`](../is-nil/CONTEXT.md) when it matters.
- Sparse arrays report their `length`, not their populated-slot count:
  `isEmptyArray(new Array(3))` is `false`.
- A non-array, non-nullish value is not rejected at runtime — the parameter type is the only guard,
  and a string would be measured by its character count.

## Reach for something else when

- The value's shape is unknown — use [`isEmpty`](../is-empty/CONTEXT.md), which also covers strings
  and objects.
