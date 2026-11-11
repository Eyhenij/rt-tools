# Progress

## Where we stand

- **State:** `этапы-кончились`
- **Stage:** 3 из 3 — The layout and the checks; the closing is next

### 1. The trait and the pattern

- [x] 1. Add the trait `graph` to `projects/agent-kit/assets/traits.json`.
- [x] 2. Write `projects/agent-kit/assets/patterns/graphify-work.needs-graph.md` from the proposal text.
- [x] 3. Add the pattern to the binding line «A rule names its patterns in a section of its own» in `docs/specs/agent-kit/patterns/implementation.md`.

### 2. The article in the rule

- [x] 1. Add the article after «Building by a sample begins with reading the sample itself» in `projects/agent-kit/assets/rules/task-flow.md`.
- [x] 2. Name the pattern conditionally in the «Patterns» section of the same rule.
- [x] 3. Add the line of the article to `.claude/skills/task-flow/implementation.md`.

### 3. The layout and the checks

- [x] 1. Lay the package out by `pnpm run agent-kit:sync`.
- [x] 2. Run `pnpm run agent-kit:check` and the specs check.

## Decisions along the way

- **The companion line carries the verdict «Not applicable»** — this tree does not name the trait
  `graph`; `check:specs` accepts only the verdict words of its list.
- **Stage results.** Stage 1: spec coverage, descriptions and boundary green. Stage 2:
  `check-file-size` — «longer than the limit 0», the rule 304 lines, 22 511 characters. Stage 3:
  the layout put one file, `.claude/skills/task-flow/SKILL.md`; the pattern got no copy here;
  `agent-kit:check` — «разложенное сходится с пакетом v0.36.0»; `check:specs` — no divergences;
  the package unit tests — 566 of 566.
- **The article names the trait `graph`** — the `product-strategist` finding: the pattern is laid
  out only to a tree that names the trait, and nothing told a tree with a graph to name it. The
  article goes to every tree, so it carries that condition. After the edit: 305 lines, 22 615
  characters; layout, size and specs checks green.
- **The second task of the cascade, RT-3184, is closed as lapsed.** The refusal the third proposal
  describes is printed by the sending tree's own guard, which the package does not ship. The
  package turn-exit guard does not read a task branch outside an epic as one under an open epic:
  `epic-table --unfinished` finds no epic for a task without the epic line, and the guard releases
  the turn; the end of an epic releases it as well. The record
  `e7589175e04ccfa0441348fbb868c0e93a0617d6ee0884aaaced2d5693786341` stays `new` at the sender:
  `cargo:close` closes only into `fixed` and `released`, and nothing was fixed.

## Sessions

- 2026-11-11 — task created from three proposals of one send; plan written; stage 1 begun.
