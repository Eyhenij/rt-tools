# hasPropertyInChain / HAS_OWN_SCOPE_ENUM

```ts
enum HAS_OWN_SCOPE_ENUM { ANY = 'any', OWN = 'own', INHERITED = 'inherited' }
type IHasScopeType = HAS_OWN_SCOPE_ENUM.ANY | HAS_OWN_SCOPE_ENUM.OWN | HAS_OWN_SCOPE_ENUM.INHERITED;

hasPropertyInChain(obj: unknown, key: PropertyKey, scope?: IHasScopeType): boolean
```

Property-existence check with an explicit answer to "own, inherited, or either?".

## Scopes

| scope               | true when the key is…                             |
| ------------------- | ------------------------------------------------- |
| `OWN` (**default**) | an own property                                   |
| `INHERITED`         | reachable via the prototype chain but **not** own |
| `ANY`               | reachable at all                                  |

## Use it when

- Distinguishing "this object defines the field" from "something up the chain does" — checking a
  DTO for an own field, or asking whether a value is a class-provided default.

## Edge cases

- **The default scope is `OWN`**, not `ANY`. Calling with two arguments will not see inherited keys.
- Nullish input short-circuits to `false` instead of throwing.
- Primitives are boxed, so `hasPropertyInChain('abc', 'length')` is `true` under `OWN` and
  `hasPropertyInChain('abc', 'toUpperCase', ANY)` is `true`.
- Getters are **not invoked** — existence is tested with `in` and an own-check, so no side effects.
- Uses `Object.hasOwn` when the runtime has it, falling back to
  `Object.prototype.hasOwnProperty.call` — which also makes it safe on prototype-less objects.
- Symbol and numeric keys are accepted (`PropertyKey`).

## Reach for something else when

- You just want "does this object have any keys?" — use
  [`isEmptyObject`](../is-empty-object/CONTEXT.md).
