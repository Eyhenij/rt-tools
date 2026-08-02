# isDate

```ts
isDate(value: unknown): value is Date
```

Type guard for a `Date` that holds a real instant.

## Use it when

- Checking the result of a parse before reading its parts. `parseISO` and `parseDate` return an
  Invalid Date on failure rather than throwing, and this is the intended way to test that.

## Edge cases

- An Invalid Date (`new Date('nonsense')`) is an object of type `Date` but returns `false` here —
  the point of the function.
- The Unix epoch (`new Date(0)`) returns **`true`**. Contrast
  [`isDateValid`](../is-date-valid/CONTEXT.md), which returns `false` for it.
- A `Date` from another JS realm fails the `instanceof` check.

## Related

[`parseISO`](../parse-iso/CONTEXT.md), [`parseDate`](../parse-date/CONTEXT.md),
[`formatDate`](../format-date/CONTEXT.md).
