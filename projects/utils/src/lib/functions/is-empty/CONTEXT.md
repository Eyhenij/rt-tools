# isEmpty

```ts
isEmpty(value: unknown): boolean
```

The general "is there anything here?" check. Accepts any value and never throws.

## Use it when

- The value's shape is unknown or varies, and you want one predicate covering nullish, strings,
  arrays and objects.

## What counts as empty

| input                           | result                         |
| ------------------------------- | ------------------------------ |
| `null`, `undefined`             | `true`                         |
| `''`                            | `true`                         |
| `[]`                            | `true`                         |
| `{}`                            | `true`                         |
| `0`, `false`, `NaN`             | `false`                        |
| a `Date`                        | `false` — always, valid or not |
| a non-empty string/array/object | `false`                        |

## Edge cases

- **A `Date` is never empty**, by design: it is special-cased before the object branch so an
  instance with no own enumerable keys is not mistaken for `{}`. The same reasoning does **not**
  cover other class instances — a `new Map()` or a class instance with no own fields reports as
  empty.
- Whitespace-only strings are **not** empty; trim first if they should be.
- Symbol-keyed and inherited properties do not count — see
  [`isEmptyObject`](../is-empty-object/CONTEXT.md).

## Reach for something else when

- You only want to separate absence from presence — use [`isNil`](../is-nil/CONTEXT.md).
- The type is known and fixed — the narrower
  [`isEmptyArray`](../is-empty-array/CONTEXT.md) / [`isEmptyString`](../is-empty-string/CONTEXT.md) /
  [`isEmptyObject`](../is-empty-object/CONTEXT.md) state the intent more precisely.
