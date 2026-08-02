# emptyToDash

```ts
emptyToDash<T>(value: T | null | undefined): T | string
```

Substitutes the shared `DASH` constant for a missing value, so a table cell or detail row shows a
dash instead of a blank.

## Use it when

- Rendering a value that may be absent and the UI wants a visible placeholder.

## Edge cases

- Only `null`, `undefined` and `''` are replaced. **`0` and `false` pass through**, which is
  usually right for display — a zero is data, not absence.
- An empty array or empty object is **not** replaced; you get the value back and it will render as
  `[object Object]` unless you format it yourself.
- The return type widens to `T | string`. Feeding it back into something that expects `T` needs a
  narrowing check.

## Reach for something else when

- You want the "is anything here" answer rather than a substituted value — use
  [`isEmpty`](../is-empty/CONTEXT.md) or [`isNil`](../is-nil/CONTEXT.md).
