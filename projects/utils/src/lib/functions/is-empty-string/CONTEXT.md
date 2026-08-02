# isEmptyString

```ts
isEmptyString(value: INullable<string>): boolean
```

Reports whether a string holds no characters. Nullish counts as empty.

## Use it when

- You have a string-or-nothing and want the intent spelled out at the call site.

## Edge cases

- `null` and `undefined` are **empty**, matching how [`isEmpty`](../is-empty/CONTEXT.md) treats
  absence.
- **It does not trim.** `'   '` is not empty. Trim first when whitespace should not count.

## Reach for something else when

- The value's shape is unknown — use [`isEmpty`](../is-empty/CONTEXT.md).
