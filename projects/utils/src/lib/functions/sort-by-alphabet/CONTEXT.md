# sortByAlphabet

```ts
sortByAlphabet<T extends object>(a: T, b: T, field: keyof T): number
```

Comparator ordering two objects by a string field, case-insensitively.

## Use it when

- Sorting a table column of names: `rows.sort((a, b) => sortByAlphabet(a, b, 'name'))`.

## Edge cases

- **Non-comparable pairs return `0`**, silently. If either side's field is missing, empty (`''` is
  falsy) or not a string, the pair is reported equal and the engine decides their relative order.
  Rows with a missing value therefore do not cluster — they stay put.
- Ordering is a plain `<`/`>` on the lower-cased values, i.e. by **code unit**. `'Ä'` sorts after
  `'Z'`. Use [`safeStrCompare`](../safe-str-compare/CONTEXT.md) when locale rules matter.
- The takes-three-arguments shape means it cannot be passed to `sort` directly; wrap it in an arrow.

## Related

[`sortByDate`](../sort-by-date/CONTEXT.md), [`safeStrCompare`](../safe-str-compare/CONTEXT.md).
