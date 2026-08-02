# formatDate

```ts
formatDate(date: Date, formatStr: string): string
```

Renders a `Date` into a string using a token-based format. The package's replacement for a date
library.

## Tokens

| token                       | meaning      | example                        |
| --------------------------- | ------------ | ------------------------------ |
| `yyyy` / `yy`               | year         | `2024` / `24`                  |
| `MMMM` / `MMM` / `MM` / `M` | month        | `January` / `Jan` / `01` / `1` |
| `EEEE` / `EEE`              | weekday      | `Monday` / `Mon`               |
| `dd` / `d`                  | day          | `05` / `5`                     |
| `HH` / `H`                  | hour, 24h    | `09` / `9`                     |
| `hh` / `h`                  | hour, 12h    | `02` / `2`                     |
| `a`                         | meridiem     | `AM` / `PM`                    |
| `mm` / `m`                  | minutes      | `05` / `5`                     |
| `ss` / `s`                  | seconds      | `05` / `5`                     |
| `SSS`                       | milliseconds | `007`                          |

## Use it when

- Producing a display string, or a string that
  [`parseDate`](../parse-date/CONTEXT.md) will read back with the same format.

## Edge cases

- **Every letter in the format is a token.** There is no escape syntax, so literal text is unsafe:
  `'Month: MM'` renders the `M` in `Month` too. Keep separators to punctuation and digits, and
  concatenate literal words outside the call.
- An invalid `Date` — or anything that is not a `Date` — yields `''`, never a throw.
- Month and weekday names are **English only**; the package ships one hard-coded locale rather than
  depending on `Intl`.
- All parts are read in the **local** time zone.
- Substitution goes through placeholders, longest token first, so an already-substituted value can
  never be re-matched by a shorter token.

## Related

[`parseDate`](../parse-date/CONTEXT.md), [`isDate`](../is-date/CONTEXT.md).
