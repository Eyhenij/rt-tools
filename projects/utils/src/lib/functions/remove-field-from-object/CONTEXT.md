# removeFieldFromObject

```ts
removeFieldFromObject<T extends object, K extends string>(obj: T, key: K): Omit<T, K>
```

Returns a copy of an object without one key, leaving the original untouched.

## Use it when

- Stripping a field before sending a payload, or dropping a key from immutable state.

## Edge cases

- **The copy is shallow.** Nested objects and arrays are shared with the source; mutating them
  mutates both.
- Removing a key that is not there is not an error — you get an equal copy (a different reference).
- Only own enumerable properties are copied, by spread. Getters are evaluated, symbol keys are
  carried over, and prototype members are not.

## Reach for something else when

- You need to drop several keys — destructuring rest (`const { a, b, ...rest } = obj`) is clearer.
- You need a deep copy — this does not give you one.
