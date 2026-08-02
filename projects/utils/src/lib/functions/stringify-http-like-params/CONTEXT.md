# stringifyHttpLikeParams

```ts
stringifyHttpLikeParams<T extends object>(params: T): { [param: string]: string | string[] }
```

Turns a params object into the string-valued map an HTTP client's query-parameter API expects.

## Use it when

- Building a query object out of typed filter state before handing it to a request.

## Edge cases

- **It applies `encodeURI`, not `encodeURIComponent`.** Reserved characters — `/ ? & = # +` — are
  left as they are, so a value that itself contains a query string or a `+` meant as a literal plus
  will not survive the round trip. Encode those yourself.
- Every value is stringified: `1` becomes `'1'`, `true` becomes `'true'`, an array becomes its
  comma-joined form (`[1, 2]` → `'1,2'`), and `null`/`undefined` become the strings `'null'` and
  `'undefined'` — filter empties out **before** calling this.
- Keys are taken from `Object.keys`, so inherited and symbol keys are dropped.
- The declared return type allows `string[]`, but the implementation only ever produces `string`.

## Reach for something else when

- You need per-value control over encoding, or repeated keys (`?id=1&id=2`) — build the query with
  the HTTP client's own params builder.
