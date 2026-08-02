# dateStringToDate

```ts
dateStringToDate(date: string | Date): Date
```

Reads a `dd.MM.yyyy` string that may still be **half-typed**, and always returns a usable `Date`.

## Use it when

- Backing a masked date field, where the value passes through incomplete states while the user types
  and the UI still needs a date on every keystroke.

## What it repairs

- A single-digit day or month is zero-padded (`'5.9.2024'`).
- A `00` day or month is lifted to `01`.
- Missing leading segments are filled in (`'..2024'`, `'.01.2024'`).
- An over-long segment is trimmed.

## Edge cases

- **Failure is silent: it returns _now_.** An empty, nullish or unparseable input, and any year past
  3000, all produce the current date. There is no way to tell a real parse from the fallback — do
  not use it where "invalid" must be distinguishable.
- A `Date` argument is returned **by reference**, not copied.
- The input layout is fixed to day-first with `.` separators.

## Reach for something else when

- You need to know whether parsing succeeded — use [`parseDate`](../parse-date/CONTEXT.md), which
  returns an Invalid Date on failure.
