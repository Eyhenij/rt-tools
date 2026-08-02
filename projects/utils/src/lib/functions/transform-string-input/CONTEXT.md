# transformStringInput

```ts
transformStringInput(value: unknown): string
```

Coerces anything into a string, so a component input is always safe to render.

## Use it when

- Normalising a signal input: `input('', { transform: transformStringInput })`.

## Edge cases

- **Nothing is stringified.** A non-string becomes `''` — `transformStringInput(42)` is `''`, not
  `'42'`. Convert numbers yourself when you want them rendered.
- `''` passes through as `''`.

## Reach for something else when

- You want `String(value)` semantics — call `String(value)`; this helper deliberately drops
  non-strings instead of coercing them.
