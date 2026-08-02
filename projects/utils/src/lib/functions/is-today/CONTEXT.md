# isToday

```ts
isToday(date: Date): boolean
```

Reports whether a date falls on the current local calendar day.

## Use it when

- Highlighting "today" in a calendar, or labelling a timestamp as _Today_ instead of a date.

## Edge cases

- Comparison is day/month/year in the **local** zone, so clock time is irrelevant and a UTC
  timestamp near midnight can belong to a different local day than you expect.
- An Invalid Date returns `false` (its parts are `NaN`).
- **A non-`Date` argument throws** — there is no type check. Guard with
  [`isDate`](../is-date/CONTEXT.md) if the value is untrusted.

## Related

[`initToday`](../init-today/CONTEXT.md).
