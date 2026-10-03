# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 3 of 3 — the showcase
- **Done:** the agreement; the typing tracker, the output, the input and the plate — 50 chat tests green, typecheck green
- **Next step:** a story with the typing line in the correspondence showcase
- **Uncommitted:** nothing after the stage commit
- **Waiting for the owner:** no
- **PR:** not open yet; the branch stands on RT-1971-probe-driver-loader

## Steps

- [x] 1.1 Write the spec, the bindings and the scenarios in `proposed/chat-typing/`.
- [x] 2.1 A typing tracker in a logic file of its own, with a spec on fake timers.
- [x] 2.2 The component wires it to the reply area of both modes and to sending, and declares the
      output and the input.
- [x] 2.3 The template and the styles of the line.
- [>] 3.1 A story with the typing line, and the output shown in the actions panel.

## Decisions along the way

- **The branch stands on RT-1971.** Both edit the assignment row. Affected stage of the plan: none.

- **The plan's agreement line says `Draft`, not `Agreement`.** The guard reads only that word; the
  path stayed the same. Affected stage of the plan: none.
- **A long typing line wraps instead of being cut.** Cutting would demand a tooltip next to it.
  Affected stage of the plan: 2.

## Sessions

### 2026-10-02

- The task, the branch and the folder are created.

### 2026-10-03

- Stages 1 and 2 done: `npm run check:specs` lists the agreement as ready to merge, `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=rt-chat` — 50 passed.
