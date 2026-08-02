# safeNumCompare

```ts
safeNumCompare(a: number, b: number): number
```

Ascending numeric ordering that tolerates missing values. Ready to hand to `Array.prototype.sort`
as-is.

## Use it when

- Sorting a numeric column that may have gaps.

## Edge cases

- **`NaN` poisons the sort.** The result is `a - b`, so any comparison involving `NaN` is `NaN`,
  which `sort` reads as "equal" — the surrounding order becomes unpredictable. Filter `NaN` out
  first.
- `0` is a present value, not a missing one.
- Very large magnitudes can lose precision in the subtraction; compare with `<`/`>` if that is a
  concern.
- Nullish values sort last ascending — see [`safeCompare`](../safe-compare/CONTEXT.md).
