---
name: ui-component-tests-spec
kind: pattern
rule: ui-component-tests
description: A pattern of the rule ui-component-tests. Take it when a spec next to a kit component is created or edited: the kit's spec harness, a host wrapper for an application input, hand-written service doubles. The story — ui-component-tests-visual.
---

# A component's spec — ready-made code

The pieces here are carried into the spec file next to the source. What lies where in the tree and
which runner is used — next to the rule `testing`, the file `implementation.md`. Cold part: `pitfalls.md` — every section below whole, with its code and reasons.

## When to use

- A `*.spec.ts` next to a kit component is created or edited.
- The component does not come up in an environment without a browser, and what stands in for it has
  to be known.
- An input from the application is checked by a host, and a service by a double.

## The shared harness

`provideRtKitTesting()` already gives what no component comes up without: the request client with a stub, the storage, `PlatformService`, the table settings storage. Your own is added by `providers` in the options, not on top of the harness.

## An input from the application is checked by a host

A component whose input overrides its own measurement is checked through a host wrapper — and the value in it is **reactive**: the host redraws on demand, and an edit of an ordinary field does not refresh the binding.

## A double of a service

## An environment without a browser

- **Jest does not digest `import localeRu from '@angular/common/locales/ru'`**

## Common misses

- **The width of the window measures nothing.**
- **The translation loader is obliged to return a stream.**
- **The text editor does not come up in an environment without a browser**
- **Content in an overlay does not draw by itself.**
- **An output is substituted by an object, not by a call of `output()`.**
