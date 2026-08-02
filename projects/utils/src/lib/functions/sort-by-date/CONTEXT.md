# sortByDate

```ts
sortByDate(a: Record<string, any>, b: Record<string, any>, field: string): number
```

Comparator ordering two objects chronologically by a date field, oldest first.

## Use it when

- Sorting a table column of timestamps: `rows.sort((a, b) => sortByDate(a, b, 'createdAt'))`.

## Edge cases

- **An unparseable value poisons the sort.** Each side goes through `new Date(...)`, so a bad value
  yields `NaN`, every comparison with it is `NaN`, and `sort` reads that as "equal" — the resulting
  order is unpredictable. Filter or normalise first.
- Date strings, timestamps and `Date` instances are all accepted, because the `Date` constructor
  accepts them — including its date-only-means-UTC rule, see
  [`parseISO`](../parse-iso/CONTEXT.md).
- Two `Date` objects are constructed per comparison; for a long list, precompute the numeric values.
- The takes-three-arguments shape means it cannot be passed to `sort` directly; wrap it in an arrow.

## Related

[`sortByAlphabet`](../sort-by-alphabet/CONTEXT.md),
[`safeNumCompare`](../safe-num-compare/CONTEXT.md).
