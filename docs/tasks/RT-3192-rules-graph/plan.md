# Plan

**Task:** RT-3192 · **Branch:** RT-3192-rules-graph
**Behaviour:** unchanged — a tool and a report of this tree over the texts of the package, no code of
an application or a package; the owner's word «Перед ревизией».

## Points

- **A:** links between the texts of the package are seen only by reading them; the checks match
  headers alone.
- **This task reaches:** a revision of a law family opens a list of the resources nothing links to
  and the rules nothing executes, instead of reading the family to find them.
- **Sign:** `npm run graph:rules` writes the graph and the report; `graphify explain "testing"
--graph <the rules graph>` names its law, its patterns and its executors.
- **Milestone C of the epic:** `docs/plans/agent-kit-revision.md`.

## Task footprint

| What  | Where                                                      |
| ----- | ---------------------------------------------------------- |
| Specs | none — the tree's own tool                                 |
| Laws  | `docs/constitution/project-documentation.md`               |
| Rules | `.claude/skills/spec-driven/`, `.claude/skills/agent-kit/` |
| Code  | `tools/rules-graph.mjs`, `tools/tests/`, `package.json`    |
| Docs  | `CLAUDE.md`, the report next to the graph                  |

## What counts as done

- One command builds the graph of concepts and rules: nodes for every resource of the package and
  every glossary word; links from the front matter, the `Requires` lines, the companion bindings,
  the names of resources in backticks and the glossary words in the texts.
- graphify reads the graph by `--graph`.
- The report lists the resources with no incoming link, the rules with no executor, the glossary
  words used nowhere and the pairs of texts that state the same thing.

## Stages

### 1. The graph

- **Steps:**
    1. The builder reads the resources and their links
    2. Scenarios of the builder
    3. The graph built and committed
- **Readiness sign:** the links `law:` and `rule:` in the graph match the front matter one to one.
- **Verified by:** `graphify explain "testing" --graph projects/agent-kit/rules-graph/graph.json`.

### 2. The report

- **Steps:**
    1. The report from the graph
    2. Scenarios of the report
    3. The report built and committed
- **Readiness sign:** the report names the four lists, each with its count.
- **Verified by:** `npm run graph:rules` exits zero and the report holds four sections.

### 3. The closing

- **Steps:**
    1. The command in `CLAUDE.md`
    2. The push gate set
    3. The task folder taken apart into the archive
    4. PR into the epic branch
- **Readiness sign:** the set is green, the PR is open.
- **Verified by:** the push gate output.

## What this work does not do

- No edit of a law, a rule or a pattern: the report is read by the revision tasks RT-3193–RT-3209.
- No check in the push gate built on the report: it lists debt, and debt is not a refusal.
