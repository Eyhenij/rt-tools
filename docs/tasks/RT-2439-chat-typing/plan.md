# Plan

**Task:** RT-2439 · **Branch:** RT-2439-chat-typing
**Draft:** `docs/specs/ui-kit-v2/proposed/chat-typing/`

## Task footprint

| What     | Where                                                                                                                                      |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Spec     | `docs/specs/ui-kit-v2/proposed/chat-typing/`, merged into the domain as a subdomain with the domain indexes                                |
| Code     | `projects/ui-kit-v2/src/rich-editor/lib/components/chat/` — the component, its template, styles, a typing logic file and its spec          |
| Showcase | the correspondence stories of the second kit                                                                                               |
| Docs     | `projects/ui-kit-v2/src/rich-editor/lib/components/chat/CONTEXT.md`, `projects/ui-kit-v2/src/rich-editor/lib/components/chat/Overview.mdx` |

## What counts as done

- A consumer gets one «started» and one «stopped» per stretch of typing, in both reply modes.
- A line passed by the consumer stands over the bottom of the thread; an empty one hides it.
- The showcase shows both sides.

## Stages

### 1. The agreement

- **Steps:**
    1. Write the spec, the bindings and the scenarios in `proposed/chat-typing/`.
- **Readiness sign:** the three files lie and name scenarios from `SC-UKV-540`.
- **Verified by:** `npm run check:specs` — no divergence.

### 2. The typing signal and the line

- **Steps:**
    1. A typing tracker in a logic file of its own, with a spec on fake timers.
    2. The component wires it to the reply area of both modes and to sending, and declares the
       output and the input.
    3. The template and the styles of the line.
- **Readiness sign:** the unit tests of the correspondence pass.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=rt-chat` — all green.

### 3. The showcase

- **Steps:**
    1. A story with the typing line, and the output shown in the actions panel.
- **Readiness sign:** the story opens in the browser and the line is visible.
- **Verified by:** the story read in the browser; the snapshot set of the second kit passes.

## What this work does not do

- The transport of the signal between the two sides: that is the application's.
