# getColorBasedOnBackground

```ts
getColorBasedOnBackground(backgroundColor: string): string
```

Picks a readable text colour for a background: `#fff` on a dark one, the background darkened by
half on a light one.

## Use it when

- A badge, a chip or a label takes its background from data, and its text has to stay readable.

## The one thing to know

**A background is light when its relative luminance is above 0.179**, and then the text is the
background darkened by 50% through [`darkenHexColor`](../darken-hex-color/CONTEXT.md). On a six-digit
colour with `#` the function answers exactly as the first kit's function of the same name, so a
badge moved from the first kit keeps its colours.

## Edge cases

- `#rgb`, `rgb`, `#rrggbb` and `rrggbb` are all read; the first kit read only `#rrggbb` and gave a
  wrong answer for the rest.
- A value that is not a hex colour — `red`, `''`, `#12345` — gets `#fff`.
- The answer for a light background is lower-case `#rrggbb`, whatever the case of the input.
