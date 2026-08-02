# isObject

```ts
isObject(value: unknown): value is Record<string, unknown>
```

**Internal — not exported from `@rt-tools/utils`.** It backs
[`isEmpty`](../is-empty/CONTEXT.md) and nothing else.

## Why it is not published

The implementation is a bare `typeof value === 'object'`, so:

- **`isObject(null)` returns `true`**, while the signature claims a `Record`. A caller who trusts
  the guard and reads a property gets a `TypeError`.
- Arrays, `Date`s, `Map`s and every other object return `true` as well.

`isEmpty` only calls it behind an `isNil` check and immediately special-cases arrays and dates, so
inside that one caller the trap cannot fire. Published on its own it would be a footgun.

## Reach for something else when

- You want a plain object literal — use [`isRecord`](../is-record/CONTEXT.md), which excludes
  `null`, arrays and class instances.
