# Plan

**Task:** RT-3191 · **Branch:** RT-3191-code-graphs
**Behaviour:** unchanged — graphs and harness of the tree, no code of an application or a package;
the owner's word «Коммитить graph.json», «Оба варианта».

## Points

- **A:** the repository has no code graph, and the tree does not name the trait `graph`.
- **This task reaches:** a session here opens the graph of the repository or of a project before
  reading files, and the pattern `task-flow-graph` tells it how.
- **Sign:** `npm run graph:build` writes `graph.json` at the root and in all 26 project directories;
  `.claude/skills/task-flow-graph/SKILL.md` exists after the layout.
- **Milestone G of the epic:** B in `docs/plans/agent-kit-revision.md`.

## Task footprint

| What  | Where                                                                                                                         |
| ----- | ----------------------------------------------------------------------------------------------------------------------------- |
| Specs | none — the tree's own harness                                                                                                 |
| Laws  | `docs/constitution/work-conduct.md`                                                                                           |
| Rules | `.claude/skills/task-flow/`, `.claude/skills/agent-kit/`                                                                      |
| Code  | `tools/graphs-build.mjs`, `package.json`, `nx.json`, `.gitignore`, `.gitattributes`, `.prettierignore`, `.claude/rt-kit.json` |
| Docs  | `CLAUDE.md`                                                                                                                   |

## What counts as done

- One command builds the graph of the repository and of every project under `projects/`, `apps/`
  and `libs/`.
- Only `graph.json` of each graph is in history; the rest of `graphify-out/` is ignored.
- A merge of two branches with different `graph.json` goes through the graphify merge driver.
- A rebuilt graph marks no nx project affected and is not formatted by prettier.
- The tree names the trait `graph`, and the layout puts `task-flow-graph` here.

## Stages

### 1. The build command

- **Steps:**
    1. The command builds the root graph and the graph of every project
    2. All graphs are built and committed
- **Readiness sign:** 27 `graph.json` files in history, each with `built_at_commit`.
- **Verified by:** `git ls-files '*graphify-out/graph.json' | wc -l` — 27.

### 2. The graph in history

- **Steps:**
    1. Ignore rules for the rest of `graphify-out/`
    2. The merge driver in `.gitattributes` and in the install step
    3. The graph files left out of nx inputs and of prettier
- **Readiness sign:** a trial merge of two branches with different graphs ends without a conflict
  marker in `graph.json`.
- **Verified by:** `pnpm exec nx show projects --affected --base=HEAD~1 | wc -l` after a commit that
  touches only graphs — 0.

### 3. The trait and the closing

- **Steps:**
    1. The trait `graph` in `.claude/rt-kit.json` and the layout
    2. The command in `CLAUDE.md`
    3. The push gate set
    4. The task folder taken apart into the archive
    5. PR into the epic branch
- **Readiness sign:** the pattern is laid out, the set is green, the PR is open.
- **Verified by:** `pnpm run agent-kit:check` — the layout matches the package.

## What this work does not do

- The graph of concepts and rules of the package — RT-3192.
- No hook that rebuilds graphs on every commit: the freshness is checked by the pattern
  `task-flow-graph` at the start of a turn.
