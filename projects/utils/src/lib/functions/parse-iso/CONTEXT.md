# parseISO

```ts
parseISO(dateString: string): Date
```

Parses an ISO 8601 string into a `Date` without throwing.

## Use it when

- Reading a timestamp off an API response.

## Edge cases

- It delegates to the `Date` constructor, so it inherits its rules — notably that a **date-only**
  string (`'2024-01-15'`) is read as **UTC midnight**, while a date-time string without a zone is
  read as **local** time. That one-day-off surprise is the constructor's, not this function's.
- Empty, nullish and non-string inputs return an Invalid Date; so does anything the runtime cannot
  parse.
- Non-ISO formats the host engine happens to accept will also parse. Nothing validates the shape
  against the ISO grammar.
- Check the result with [`isDate`](../is-date/CONTEXT.md).

## Reach for something else when

- The input has a known non-ISO layout — use [`parseDate`](../parse-date/CONTEXT.md).
