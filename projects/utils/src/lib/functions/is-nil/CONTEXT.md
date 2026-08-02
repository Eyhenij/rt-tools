# isNil

```ts
isNil<T>(entity: T | null | undefined): entity is null | undefined
```

Tells absence apart from presence, and narrows the type while doing it.

## Use it when

- You need to distinguish "no value" from a value that merely looks falsy. `if (!value)` also fires
  on `0`, `''`, `false` and `NaN`; `isNil` does not.
- You want the compiler to narrow. In the `else` branch of `if (isNil(x))`, `x` is `T`.

## Edge cases

- `NaN` is **not** nil — it is a present number.
- An empty string, an empty array and `0` are all present.

## Reach for something else when

- You want "nothing meaningful in here", including empty strings, arrays and objects — use
  [`isEmpty`](../is-empty/CONTEXT.md).
- You want to render a placeholder for a missing value — use
  [`emptyToDash`](../empty-to-dash/CONTEXT.md).
