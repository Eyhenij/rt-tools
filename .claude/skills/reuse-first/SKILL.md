---
name: reuse-first
kind: rule
law: reuse-first
description: Rule under the reuse-first law. Load before creating any screen, component, field, store, service, mapper or procedure: what to build on, and the signs of a bypassed ready-made. Pattern reuse-first-extend.
---
<!-- rt-kit v0.41.0 · rules/reuse-first.md · ee1893ce19dd · правится надстройкой, не здесь -->

# Uniformity — how it works here

Rule under the law `docs/constitution/reuse-first.md`. Cold part: `pitfalls.md`.

## How the law applies here

- **The source of look is chosen by application, not by habit.**
- **Work starts with reading the ready-made.**
- **A sample is taken whole; each departure is written, with its reason, before the code.** Measure
  node by node.
- **An invented restriction is searched over the tree first.**
- **An integration value follows its own kind; a neighbour is a sample only without one.**
- **Own primitives and bases need the owner's explicit approval.**
- **The record edit panel inherits the shared base.**
- **Success and failure go by the shared bus, a kit message on screen included.** Inline only where
  the panel stays open after a failure.
- **The departure marker `native-ok` names the kit component read and what it lacks.**
- **A check is not taken off the gate to push.**
- **A component is `.ts`, `.html`, `.scss`.** No `template:`, `styles:`, `style=` or `[ngStyle]`
  sizing; a screen outside the kit has empty styles.
- **The ready-made is extended, not cloned.**
- **Old findings are counted by the full check; the list only shrinks.**
- **Signs are declared by the tree in `checks.json`, not in the check.**
- **A foreign service logo is taken, not drawn.**
