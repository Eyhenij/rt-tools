---
name: interface-review-performance
description: Recipes for animation performance in an interface review — transition only the properties that change instead of transition all, and will-change only for compositor properties and only on a seen first-frame stutter — with CSS and Tailwind code. Load when a finding about transition properties or will-change is worded or implemented. The animations themselves are in interface-review-motion.
---
<!-- rt-kit v0.33.1 · skills/interface-review-performance.needs-app.md · 7a0a00d63900 · правится надстройкой, не здесь -->

# Performance

Transition specificity and GPU compositing hints.

## When to use

- A finding of `interface-review` is about `transition: all`, an unintended transition on a
  property nobody meant to animate, a first-frame stutter, or `will-change` on everything.

## Transition only what changes

Never use `transition: all` or Tailwind's `transition-all`. Always specify the exact properties that
change. (Tailwind's bare `transition` maps to a curated default list of colors, opacity, shadow and
transforms, not to `all`; still prefer naming exactly what changes.)

- `transition: all` forces the browser to watch every property for changes.
- It causes unexpected transitions on properties you didn't intend to animate (colors, padding,
  shadows).
- It prevents browser optimizations.

```css
/* Good: only transition what changes */
.button {
  transition-property: scale, background-color;
  transition-duration: 150ms;
  transition-timing-function: ease-out;
}

/* Bad: transition everything */
.button {
  transition: all 150ms ease-out;
}
```

```tsx
// Good: explicit properties
<button className="transition-[scale,background-color] duration-150 ease-out">

// Bad: transition all
<button className="transition-all duration-150 ease-out">
```

`transition-transform` in Tailwind maps to `transition-property: transform, translate, scale,
rotate`, so it covers all transform-related properties, not just `transform`. Use this when you're
only animating transforms. For multiple non-transform properties, use the bracket syntax:
`transition-[scale,opacity,filter]`.

## Use `will-change` sparingly

`will-change` hints the browser to pre-promote an element to its own GPU compositing layer. Without
it, the browser promotes the element only when the animation starts; that one-time layer promotion
can cause a micro-stutter on the first frame.

This particularly helps when an element is changing `scale`, `rotation`, or moving around with
`transform`. For other properties, it doesn't help much: the browser can't composite them on the GPU
anyway.

```css
/* Good: specific property that benefits from GPU compositing */
.animated-card {
  will-change: transform;
}

/* Good: multiple compositor-friendly properties */
.animated-card {
  will-change: transform, opacity;
}

/* Bad: never use will-change: all */
.animated-card {
  will-change: all;
}

/* Bad: properties that can't be GPU-composited anyway */
.animated-card {
  will-change: background-color, padding;
}
```

| Property | GPU-compositable | Worth using `will-change` |
| --- | --- | --- |
| `transform` | Yes | Yes |
| `opacity` | Yes | Yes |
| `filter` (blur, brightness) | Yes | Yes |
| `clip-path` | Newer Chromium only | Rarely; not reliable cross-browser |
| `top`, `left`, `width`, `height` | No | No |
| `background`, `border`, `color` | No | No |

Modern browsers are already good at optimizing on their own. Only add `will-change` when you notice
first-frame stutter; Safari in particular benefits from it. Don't add it preemptively to every
animated element; each extra compositing layer costs memory.
