# isEmptyString

```ts
isEmptyString(value: string): boolean
```

Reports whether a string has no characters.

## Use it when

- You already know the value is a string and want the intent spelled out at the call site.

## Edge cases

- **It does not trim.** `'   '` is not empty. Trim first when whitespace should not count.
- **It does not check the type.** A nullish argument throws a `TypeError`.

## Reach for something else when

- The value may be nullish or of an unknown shape — use [`isEmpty`](../is-empty/CONTEXT.md).
