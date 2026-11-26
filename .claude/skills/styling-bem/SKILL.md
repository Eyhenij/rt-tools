---
name: styling-bem
kind: rule
law: frontend-application
description: Rule under the frontend-application law. Load when editing any *.scss and a component template. Names the BEM directives, the styling tokens, the shared layout layer of the application and the check for a class without a rule. Ready-made code in patterns styling-bem-layout and -component.
---
<!-- rt-kit v0.41.0 · rules/styling-bem.md · 5699a69aa4b9 · правится надстройкой, не здесь -->

# Styling — how it works here

Rule under the law `docs/constitution/frontend-application.md`. Cold part: `pitfalls.md` — traps
already stepped on; `pitfalls-2.md` — the whole text, every article with its reasons.

## How the law applies here

- **Styling is taken as a `--rt-*` token, not written as a value in place.**
- **Every element class has its own style rule.**
- **A class is set by a directive, not by a string in an attribute.**
- **The layout is declared in the application's shared layer, not in the screen's styles.**
- **One thing is called by one name in every place it occurs.**
- **The sheet and the window are opened by the kit service, not by a layer number.**
- **The layer number is taken from the scale, not written as a number in the component file.**
- **A width limit is declared together with the fate of what did not fit.**
- **Truncation goes in a pair with a tooltip.**
- **The size of a control is chosen by the pointer sign, not by the screen width.**
- **A styles file is no longer than 500 lines.**
- **A stylelint warning fails the run the same as an error.**

## Names and techniques

- Composite values (`box-shadow`, `text-shadow`) take a ready token whole.
- Own tokens are `--<prefix>-*` in the app's `styles.scss`, built on `--rt-*`.
- No `!important`: it is a warning, and warnings fail the run.
- Control sizes take kit steps, not pixels.
