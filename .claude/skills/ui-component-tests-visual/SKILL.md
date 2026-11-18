---
name: ui-component-tests-visual
kind: pattern
rule: ui-component-tests-screens
description: A pattern of the rule ui-component-tests-screens. Take it when a story is created for the sake of a snapshot, when a fallen showcase snapshot is sorted out and when all the stories are swept. The hover parameters, what is undetermined in the frame, re-taking the references.
---

# The visual snapshot — ready-made code

The snapshot of every story is matched against the reference in
`projects/ui-kit-v2/.storybook/__snapshots__/`. The harness is
`projects/ui-kit-v2/.storybook/test-runner.ts`. The shape of the story itself — the rule
`rt-tools-storybook`. Cold part: `pitfalls.md` — every section below whole, with its code and reasons.

## When to use

- A state that is not in the frame gets a story of its own.

## A state that is not in the frame

A story of its own is created for a state the snapshot does not reach by itself: a tooltip, a button under the pointer, content in an overlay, the branch after a file is chosen. **Hover** — by a story parameter, with a real pointer.

## What is undetermined does not get into the frame

## The sweep over all the stories — before the references are taken

- **The area.**
- **The console matters more than the area.**
- **The showcase's noise is sifted out by name.**

## Sorting out a fallen run

- **The share of the divergence and the area**
- **One's own divergence or a foreign one.**
- **Re-taking — one reference at a time.**
- **"Couldn't find story … after HMR"**
- **`ECONNRESET` to `ws://localhost:<port>/shot`**

## A measurement instead of a look

When the snapshot said "it became different", what exactly drifted is answered by a measurement of computed values: the font size, the height, the padding, the rounding, the colour.

## Traps

- **`storybook-addon-pseudo-states` does not load in Node.**
- **The flag `-t` breaks the run's environment exactly the same way.**
- **The path sample is a Jest regex, and the harness quotes it for the shell itself.**
- **A missing reference is not taken up silently.**
