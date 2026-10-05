# darkenHexColor

```ts
darkenHexColor(hex: string, percent: number): string
```

Darkens a hex colour: every channel is multiplied by `1 - percent / 100` and rounded down.

## Use it when

- A shade of a colour from data is needed — a border or a text one step darker than the fill.

## The one thing to know

**A value that is not a hex colour comes back as it came.** `darkenHexColor('transparent', 50)` is
`'transparent'`, so a caller passing a CSS keyword through gets it back untouched.

## Edge cases

- `#rgb`, `rgb`, `#rrggbb` and `rrggbb` are read; the answer is always lower-case `#rrggbb`.
- `0` keeps the colour, `100` gives `#000000`. The percent is not clamped: a value outside 0–100
  gives channels outside the range, as in the first kit.
