# isDateValid

```ts
isDateValid(date?: Date): boolean
```

Checks that a value is a `Date` holding a real instant.

## Use it when

- Validating an optional date field where "not set" and "unparseable" are handled the same way. The
  narrower parameter type reads better than `isDate` at a site that already holds a `Date | undefined`.

## Relationship to `isDate`

It **delegates to** [`isDate`](../is-date/CONTEXT.md) and agrees with it on every input. `isDate` is
the more general of the two — it takes `unknown` and narrows the type — so new code can use either,
and `isDate` is the better default.

## Edge cases

- `new Date(0)` is **valid**: the Unix epoch is a real instant. (It used to report `false`, because
  the check was `Boolean(getTime())` and the epoch's time value is `0`.)
- `undefined` returns `false`; the parameter is optional, so calling with nothing is allowed.
- Anything that is not a `Date` returns `false` — including a date-shaped string.
