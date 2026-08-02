# safeComparatorPipe

```ts
safeComparatorPipe(...comparators: Array<() => number>): number
```

Runs comparisons in priority order and returns the first decisive one — a multi-key sort without a
nested ternary.

## Use it when

- Ordering by last name, then first name, then age.

```ts
rows.sort((a, b) =>
    safeComparatorPipe(
        () => safeStrCompare(a.lastName, b.lastName),
        () => safeNumCompare(a.age, b.age)
    )
);
```

## Edge cases

- **Each argument is a thunk**, not a comparator: it closes over the pair being compared. Passing
  `safeStrCompare` directly does not work — it would be called with no arguments.
- Evaluation is lazy and left-to-right; later thunks are not called once one returns non-zero.
- An empty chain returns `0`, i.e. "equal".
- A thunk returning `NaN` is treated as decisive (`NaN !== 0`) and returned as-is, which `sort`
  then reads as "equal".

## Related

[`safeCompare`](../safe-compare/CONTEXT.md).
