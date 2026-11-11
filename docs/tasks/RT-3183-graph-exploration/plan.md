# Plan

**Task:** RT-3183 · **Branch:** RT-3183-graph-exploration
**Behaviour:** unchanged — an edit of the rules package texts; no application screen or procedure is touched. Question closed by assumption on the owner's order «заведи задачу на борде и бери в работу прямо сейчас».

After it is written this file is not edited. A stage revision goes to `progress.md` as a decision
along the way.

## Points

- **A:** a tree that holds a built code graph explores a domain by reading files one by one; no
  package text names the graph, and a stale graph reads as a fresh one.
- **This task reaches:** a session in a tree with a graph opens the graph first, checks the commit it
  was built from, and takes relations from it, not numbers or behaviour.
- **Sign:** the article stands in `rules/task-flow.md`; `patterns/graphify-work.needs-graph.md` is laid
  out by `agent-kit sync` only to a tree whose `has` names `graph` — this tree does not name it and
  gets no copy.
- **Milestone G of the epic:** none — work outside the epic on the owner's word.
- **Metric:** нет: the package reports do not count whether a turn opened the graph; the sending tree
  judges the effect by its own next report.

## Task footprint

| What  | Where                                                                                                                                                      |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Specs | `docs/specs/agent-kit/patterns/`, `docs/specs/agent-kit/texts/`, `docs/specs/agent-kit/package-boundary/`                                                  |
| Laws  | `docs/constitution/work-conduct.md` — read, not edited                                                                                                     |
| Rules | `.claude/skills/task-flow/` — laid out from the package; the companion `implementation.md` is this tree's                                                  |
| Code  | `projects/agent-kit/assets/traits.json`, `projects/agent-kit/assets/rules/task-flow.md`, `projects/agent-kit/assets/patterns/graphify-work.needs-graph.md` |

## What counts as done

- The package declares the trait `graph`, and the pattern `graphify-work` requires it by its file name.
- `rules/task-flow.md` carries the article «Exploration of a tree that holds a code graph begins with
  the graph» and names the pattern conditionally in its «Patterns» section.
- The companion of the rule in this tree has a line for the new article.
- The layout, the spec coverage, the descriptions, the boundary and the size checks are green.

## Stages

### 1. The trait and the pattern

- **Steps:**
    1. Add the trait `graph` to `projects/agent-kit/assets/traits.json`.
    2. Write `projects/agent-kit/assets/patterns/graphify-work.needs-graph.md` from the proposal text.
    3. Add the pattern to the binding line «A rule names its patterns in a section of its own» in `docs/specs/agent-kit/patterns/implementation.md`.
- **Readiness sign:** the new pattern is spoken of by a spec, its description fits the limit, and no
  new resource is called not for carrying.
- **Verified by:** `npm run -s check:spec-coverage && node tools/check-descriptions.mjs && npm run -s check:boundary` — the three lines «every resource the package carries is spoken of by a spec», «all within the limit of 300 characters», «there is no new resource that is not for carrying».

### 2. The article in the rule

- **Steps:**
    1. Add the article after «Building by a sample begins with reading the sample itself» in `projects/agent-kit/assets/rules/task-flow.md`.
    2. Name the pattern conditionally in the «Patterns» section of the same rule.
    3. Add the line of the article to `.claude/skills/task-flow/implementation.md`.
- **Readiness sign:** the rule stays within 330 lines and 24 000 characters, and the companion has a
  line for every article.
- **Verified by:** `node tools/check-file-size.mjs` — «longer than the limit 0».

### 3. The layout and the checks

- **Steps:**
    1. Lay the package out by `pnpm run agent-kit:sync`.
    2. Run `pnpm run agent-kit:check` and the specs check.
- **Readiness sign:** the laid-out rule carries the article, and this tree holds no copy of the pattern.
- **Verified by:** `pnpm run agent-kit:check` — «разложенное сходится с пакетом».

## What this work does not do

- The turn-exit guard and a turn begun by the owner's message — task RT-3184, the next in the chain.
- A graph in this tree, the graph tool itself, any law.
- The package edition: published by the owner's run after the merge.
