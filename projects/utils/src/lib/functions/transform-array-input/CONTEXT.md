# transformArrayInput

```ts
transformArrayInput<T>(array: unknown): T[]
```

Coerces anything into an array, so a component input is always safe to iterate.

## Use it when

- Normalising a signal input: `input([], { transform: (value) => transformArrayInput(value) })`.
  A caller passing `null`, `undefined` or a scalar then yields `[]` instead of breaking the template.

## Edge cases

- **The element type is asserted, not checked.** `T[]` is a cast; a non-empty array of the wrong
  shape passes through untouched.
- An empty array in yields a **new** empty array out, not the same reference.
- A non-array value is discarded rather than wrapped: `transformArrayInput('a')` is `[]`, not
  `['a']`.

## Reach for something else when

- You need to validate element shape — do that after the coercion, this helper only guarantees
  "is an array".
