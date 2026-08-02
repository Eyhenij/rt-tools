# safeCompare / ComparatorType

```ts
type ComparatorType<T> = (aa: T, bb: T) => number;
safeCompare<T>(a: T, b: T, comparator: ComparatorType<T>): number
```

Wraps a comparator so it never sees a nullish operand: missing values are ordered first, present
values are handed to the comparator.

## Use it when

- Sorting a column whose values may be absent, and you want a comparator that stays simple.

## Ordering contract

| a       | b       | result                                 |
| ------- | ------- | -------------------------------------- |
| nullish | nullish | `0`                                    |
| nullish | present | `1` — nullish sorts **last** ascending |
| present | nullish | `-1`                                   |
| present | present | whatever the comparator returns        |

## Edge cases

- Only `null` and `undefined` are treated as missing (`== null`). `''`, `0` and `NaN` are present
  and reach the comparator.
- Reversing the sort reverses the nullish placement too — they will lead. Handle that explicitly if
  missing values must always trail.
- The comparator's own arguments are ignored by the string/number wrappers, which close over the
  values instead; that is why they can be passed straight to `Array.prototype.sort`.

## Related

[`safeStrCompare`](../safe-str-compare/CONTEXT.md),
[`safeNumCompare`](../safe-num-compare/CONTEXT.md),
[`safeComparatorPipe`](../safe-comparator-pipe/CONTEXT.md).
