# isRecord

```ts
isRecord(value: unknown): value is Record<string, unknown>
```

Type guard for plain object literals — the `{ … }` kind, not arrays, dates or class instances.

## Use it when

- You have to tell a configuration/DTO-shaped object apart from an array or a class instance.

## Edge cases

- The check is `value?.constructor === Object`, so:
    - `null` and `undefined` return `false` (the optional chain short-circuits).
    - `Object.create(null)` returns `false` — it has no `constructor` at all. If you consume
      prototype-less bags, this guard rejects them.
    - An object from another JS realm (an iframe, a `vm` context) returns `false`: its `Object` is a
      different function.

## Reach for something else when

- You only need "not a primitive" — `typeof value === 'object' && value !== null`.
