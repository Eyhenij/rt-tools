# isDateValid

```ts
isDateValid(date?: Date): boolean
```

Checks that a `Date` is present and holds a non-zero instant.

## Use it when

- Validating an optional date field where "not set" and "unparseable" should be handled the same
  way.

## Edge cases

- **`new Date(0)` returns `false`.** The body is `Boolean(date.getTime())`, and the epoch's time
  value is `0`. If midnight 1 Jan 1970 is a legitimate value in your domain, use
  [`isDate`](../is-date/CONTEXT.md) instead.
- `undefined` returns `false`; the parameter is optional, so calling with nothing is allowed.
- Anything that is not a `Date` returns `false` — including a date-shaped string.

## Reach for something else when

- The epoch must count as valid — use [`isDate`](../is-date/CONTEXT.md).
