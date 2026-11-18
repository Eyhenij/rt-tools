---
name: ui-component-tests
kind: rule
law: verifiability
description: The order of checking a kit component. Take it on a *.spec.ts next to a component, a failed showcase snapshot and when deciding what confirms a layout edit. Its part: ui-component-tests-screens. The "why" — testing and browser-verification.
---

# Checking a kit component — the showcase

Cold part: `pitfalls.md`, `pitfalls-2.md`.

## What answers which question

- **A spec is silent about how it looks.**
- **A snapshot is silent about why it diverged.**
- **A measurement answers only the question asked.**

## How the law applies here

- **A wave of showings is closed by a sweep over all the stories, not by the colour of a run.**
- **The sweep opens the overview pages too, and by the same call.** `pnpm run test:stories:v2`.
- **The showing root is chosen by the mode, not by the first node a chain of selectors finds.**
- **A check written for the wave judges the wrap, not the sighting.**
- **A state invisible in the frame is not checked by a snapshot.** A story of its own.
- **A state's sign is checked by the same thing a person sees it by: a frame or a measurement of the raster, not by the value of a written style.**
- **A `play` step that asserts a node exists proves nothing about what is seen.**
- **If there is a pair of states, both must be in the frame.**
- **A styling edit that passed the snapshots without divergences is half checked.** A size: by `browser-verification-measure`.
- **A settled frame is waited for by an event, not by a countdown, and the technique is repeated in every harness.**
- **A wait that swallows its own refusal takes the frame too early.**
- **A wait waits for what is awaited, not for its consequence.**
- **An arrived resource and the component that noticed it are not the same, and both are waited for.**
- **A settled layout is not yet a drawn page, and the frame is taken after two in a row match.**
- **A settled page and a drawn page are different, and the frame waits for the second.**
- **A value that comes from the machine is caught by two raisings of the showcase, not by one run.**
- **A size the kit did not declare is taken from the browser's default, and that default is not a constant.**
- **A divergence that falls out rarely leaves evidence, otherwise there is nothing to sort out.** Sorted out by its share.
- **A shot beyond the window touches the page under the shutter, and that is cured not by a cycle but by the window.** Widened before the frame.
- **A frame of a node beyond the window is cured the same way.** To the node.
- **The trace of such a shot is left at the story after the tall one.**
- **A frame is assembled from what lies in the tree, and the harness cuts the shot off from a foreign network.**
- **A settled showing and a state that came about are not the same, and a story is waited for by the second.**
- **An overlay opened by a story lives to the frame only where that is declared.** Its node is a shot parameter.
