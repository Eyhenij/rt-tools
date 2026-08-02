# isObject

```ts
isObject(value: unknown): value is Record<string, unknown>
```

**Internal — not exported from `@rt-tools/utils`.** It backs
[`isEmpty`](../is-empty/CONTEXT.md) and nothing else.

## Why it is not published

The guard is `typeof value === 'object' && value !== null`, so it is honest about `null` — but every
object still passes: arrays, `Date`s, `Map`s, class instances. That is exactly what its one caller
needs (`isEmpty` special-cases arrays and dates immediately afterwards) and misleading for anyone
who reads the `Record` in the signature as "a plain object".

## Reach for something else when

- You want a plain object literal — use [`isRecord`](../is-record/CONTEXT.md), which excludes
  arrays, dates and class instances too.
