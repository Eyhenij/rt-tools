# isString

```ts
isString<T>(value: T | null | undefined | unknown): value is string
```

Type guard for string primitives.

## Use it when

- Narrowing an `unknown` before calling string methods on it.

## Edge cases

- A boxed `new String('x')` returns `false` — the check is `typeof`, and boxed strings are objects.
  This is almost always what you want; boxed strings are a curiosity, not a use case.
- `''` returns `true`. Emptiness is a separate question — see
  [`isEmptyString`](../is-empty-string/CONTEXT.md).

## Reach for something else when

- You want to coerce rather than test — use
  [`transformStringInput`](../transform-string-input/CONTEXT.md), which turns anything non-string
  into `''`.
