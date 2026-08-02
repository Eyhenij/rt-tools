# safeStrCompare

```ts
safeStrCompare(a: string, b: string): number
```

Locale-aware string ordering that tolerates missing values. Ready to hand to
`Array.prototype.sort` as-is.

## Use it when

- Sorting names, labels or any user-visible text.

## Edge cases

- Ordering comes from `String.prototype.localeCompare`, so it follows the **host** locale: accents
  and case are handled per locale rules, and results can differ between environments. Pin the locale
  yourself if reproducibility across machines matters.
- Nullish values sort last ascending — see [`safeCompare`](../safe-compare/CONTEXT.md).
- A non-string present value will throw, since `localeCompare` is called on it.

## Reach for something else when

- You want plain code-unit ordering — `a < b ? -1 : a > b ? 1 : 0`, or
  [`sortByAlphabet`](../sort-by-alphabet/CONTEXT.md) for the field-based variant.
