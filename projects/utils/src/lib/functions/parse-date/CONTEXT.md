# parseDate

```ts
parseDate(dateString: string, formatStr: string, referenceDate?: Date): Date
```

Reads a date out of a string using the same tokens
[`formatDate`](../format-date/CONTEXT.md) writes.

## Use it when

- Turning user input, or a string produced by `formatDate`, back into a `Date`.

## Edge cases

- **The pattern is anchored.** The whole string must match; trailing or leading text yields an
  Invalid Date rather than a partial parse.
- Matching is **case-insensitive**, so `'15 jan 2024'` parses with `'dd MMM yyyy'`.
- Parts the format omits come from `referenceDate` (year, month, day — defaulting to _now_, which
  makes such a call non-deterministic) or from zero (hours, minutes, seconds, milliseconds). Pass an
  explicit `referenceDate` in tests.
- **Two-digit years split at 70**: `69` → 2069, `70` → 1970.
- **Out-of-range parts roll over** instead of failing: `'32.01.2024'` with `'dd.MM.yyyy'` gives
  1 February. Validate the round trip through `formatDate` if you need strictness.
- The same token twice in one format (`'dd-dd'`) is not supported — only the first occurrence
  becomes a capture group.
- Month names are English only.
- Failure is always an Invalid Date; check with [`isDate`](../is-date/CONTEXT.md).

## Reach for something else when

- The input is ISO 8601 — use [`parseISO`](../parse-iso/CONTEXT.md).
- The input is a partially typed `dd.MM.yyyy` value from a masked field — use
  [`dateStringToDate`](../date-string-to-date/CONTEXT.md).
