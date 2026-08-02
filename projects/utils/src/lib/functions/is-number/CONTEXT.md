# isNumber

```ts
isNumber<T>(value: T | number | unknown | undefined): value is number
```

Type guard for number primitives.

## Use it when

- Narrowing an `unknown` before arithmetic.

## Edge cases

- **`NaN` returns `true`.** It is a number by `typeof`, so this guard does not protect arithmetic
  from producing `NaN`. Follow up with `Number.isFinite` when the value must be usable.
- `Infinity` likewise returns `true`.
- A `bigint` returns `false` — `typeof 1n` is `'bigint'`.
- A numeric string (`'1'`) returns `false`; nothing is coerced.

## Reach for something else when

- You need "a usable, finite number" — `Number.isFinite(value)` answers that directly.
