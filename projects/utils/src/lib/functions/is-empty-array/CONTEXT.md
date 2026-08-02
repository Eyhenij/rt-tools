# isEmptyArray

```ts
isEmptyArray<T>(value: T[]): boolean
```

Reports whether an array has no elements.

## Use it when

- You already know the value is an array and want the intent spelled out at the call site.

## Edge cases

- **It does not check the type.** The body is `value.length === 0`, so a nullish argument throws a
  `TypeError` — the signature is the only guard. A string would pass silently and report on its
  character count.
- Sparse arrays report their `length`, not their populated-slot count: `isEmptyArray(new Array(3))`
  is `false`.

## Reach for something else when

- The value may be nullish or of an unknown shape — use [`isEmpty`](../is-empty/CONTEXT.md), which
  handles nullish, strings, arrays and objects.
