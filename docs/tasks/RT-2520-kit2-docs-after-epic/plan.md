# Plan

**Task:** RT-2520 · **Branch:** RT-2520-kit2-docs-after-epic
**Behaviour:** unchanged — the owner asked to fix two documentation leftovers of the epic RT-2472, the code is not touched

After it is written this file is not edited. A stage revision goes to `progress.md` as a decision
along the way.

## Task footprint

| What  | Where                                                      |
| ----- | ---------------------------------------------------------- |
| Specs | `docs/specs/ui-kit-v2/dynamic-selector-options/spec.md`    |
| Docs  | `projects/ui-kit-v2/docs/Theming.mdx`                      |
| Rules | `.claude/skills/doc-style/`, `.claude/skills/spec-driven/` |
| Code  | none                                                       |

## What counts as done

- The "Consumer handles" section of Theming has one table header and 70 handle rows;
  `node tools/check-tokens-graph.mjs` reports no divergences.
- The selector spec's "Decisions" names that there is no bar under the invitation, by the owner's
  word; `npm run check:specs` passes.

## Stages

### Stage 1 — the documents

- 1.1 One handles table in Theming
- 1.2 The selector decision in its spec
