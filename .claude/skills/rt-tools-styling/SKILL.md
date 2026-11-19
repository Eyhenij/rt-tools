---
name: rt-tools-styling
kind: rule
law: frontend-application
description: This tree's rule about kit styling: the narrow screen, tokens and theme handles, the dark theme, the cascade layer. Take it on any edit of a kit's *.scss together with styling-bem, which gives the law's technique.
---

# Kit styling — what is this tree's own

This tree's rule under the law `docs/constitution/frontend-application.md`. Cold part: `pitfalls.md`.

## How the law applies here

- **The narrow screen has one threshold.** Size and layout go in a media query, not a template
  condition; a wide-only rule is a query upwards. Measure both sides; name the threshold kind
  (window, container, service) before a snapshot.
- **Styling is taken as a token.** A new `var(--rt-…)` passes `check:tokens-graph`; an allowlist
  entry is file and value, no line, and the list only shrinks.
- **A component reads a step through its own property, not at the place of use.** It sits in the block root as
  `--rt-<block>-<what>`, its default the replaced step, never a literal; only for rounding, shadow, border
  width and duration. A modifier reassigns it;
  a part drawn outside the block declares it on itself.
- **A component stylesheet stays under the 9 kB budget.** After adding properties, run an app's
  production build.
- **A size query asks a box whose size is not from its content.** Room around the inner part is its
  own offset.
- **State outweighs styling.** The state block stands below every variant; specificity is not
  raised instead, and disabled adds no fill.
- **`rtElem` needs a `BlockDirective`; a host class is not one.** Wrap the markup in
  `<ng-container rtBlock="…">`.
- **A kit rule lives in a cascade layer.** The file is wrapped whole in `rt-kit.components`; only
  `@use`, `@forward`, `@import` outside; a rule outside says `rt-layer-outside`; root declarations
  stay out; foreign CSS goes into `layer(rt-kit.vendor)`; no `!important`.
- **A styling preset is a second layer of assignments, not a scale or a theme.**
- **The preset flag sits on the page root or a container; the kit does not switch it.** An overlay
  puts the class read above its origin on its pane.
- **The dark theme declares `color-scheme: dark`, a light island `light`.** Edit it in the
  generator.
- **A node-scoped theme or preset declares the whole set, not the difference.**
- **The dark theme beats a preset by file order, not specificity.**
- **A preset name from a foreign theme keeps that theme's reference under dark too.**
- **A preset's silence about a colour has a reason, or is derived.**
- **A transition takes names of its own.**
- **Readability is counted in every look the kit can take, not in two themes.**

## Patterns

- `rt-tools-styling-tokens` — tokens, theme handles, the dark theme, building the layer.
