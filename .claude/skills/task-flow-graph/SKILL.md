---
name: task-flow-graph
kind: pattern
rule: task-flow
description: Pattern of rule task-flow. Load when the tree holds a code graph and a domain is explored or a shared symbol is about to be edited. Not for a claim about behaviour, a number or a rule text — those are read from the code and the documents.
---
<!-- rt-kit v0.37.0 · patterns/task-flow-graph.needs-graph.md · ebfa77b63797 · правится надстройкой, не здесь -->

# Working with the tree's code graph

Pattern of the rule `task-flow`. What must be true meanwhile — the law
`docs/constitution/work-conduct.md`.

The graph is a build artefact of the tool `graphify`: it lies next to the tree and is rebuilt from
the code. It answers relations, not behaviour. The tool is not part of the package, and the pattern
is laid out only to a tree that names the trait `graph`. A copy that names the trait and has no
artefact on disk — a fresh clone, a new working tree — builds it by `graphify update .` before the
first exploration of the turn, or the turn names that there is no graph, and none of the steps below
applies.

## When to use

- The first exploration of a domain in a turn, before reading files one by one.
- Before an edit of a shared symbol: who calls, imports or re-exports it.
- A question of the shape of the tree: which files belong to a domain, where the procedures of a
  service lie.

## Freshness

The build records the commit it was made from. It is compared with the head in every turn, before
the first exploration:

```bash
python3 -c "import json;print(json.load(open('graphify-out/graph.json'))['built_at_commit'])"
git rev-parse HEAD
```

Equal — the graph describes the head. Behind — the graph is stale, and the difference is read before
anything else: it names the files whose relations the graph no longer knows.

```bash
git log --oneline --stat <built_at_commit>..HEAD
```

A tree that keeps the graph in history is always one commit behind: the graph comes in the commit
after the one it was built from. A difference that holds only graph files is that commit, and the
graph describes the head; the graph is stale when the difference holds a code file.

A rebuild re-extracts code files and calls no model:

```bash
graphify update .
```

A stale graph not rebuilt is not a source: the turn names why it was not rebuilt, and no answer
cites it. A turn where the graph exists and was not used names one of two reasons: the answer is
about behaviour, numbers or texts, or the graph is stale and was not rebuilt.

## The inventory

Nodes carry the file they came from. Listing them shows a domain whole: files, classes, procedures,
functions.

```bash
python3 -c "import json,collections;g=json.load(open('graphify-out/graph.json'));c=collections.Counter(n.get('source_file','') for n in g['nodes'] if '<domain>' in n.get('source_file',''));print('\n'.join(f'{v:5d} {k}' for k,v in c.most_common()))"
```

## The relations

```bash
graphify explain "<node>"                # a node and its neighbours
graphify affected "<symbol>" --depth 2   # who depends on it, reverse traversal
graphify path "<caller>" "<callee>"      # the chain between two nodes
```

A node is named by a file name or a symbol, not by a path: `board.mjs` is found, `tools/board.mjs`
is not. `explain` answers with `imports`, `imports_from`, `calls`, `contains` and `re_exports`;
`affected` is the reverse traversal an edit of a shared symbol needs.

## What the graph never answers

- A constant, a limit, a number: values are not nodes.
- The body of an `async function*`: the extraction may leave it out, and a function absent from the
  graph is not absent from the code.
- A template, a style sheet, a generated file: often outside the extraction.
- The meaning of a document: document nodes are headings, not the text under them.
- A permission or an enum value: names are nodes, strings are not.

## Common misses

- **A free-text query looks like the entry point and is not.** `graphify query` walks breadth-first
  over the words of the question and starts from whatever token it matched: it answers with
  neighbours of a word, not with the domain. `explain` is asked by a file name or a symbol.
- **A barrel file distorts a path.** `index.ts` nodes stand between a caller and a callee, and
  `graphify path` returns a chain through re-exports that no reader would walk. `affected` on the
  symbol is used instead, and the relations are read.
- **A rebuild after deleted code keeps the old graph.** `graphify update` does not overwrite
  `graph.json` when the rebuild has fewer nodes, and `built_at_commit` stays old: after an edit that
  removes code it is run with `--force`, and the commit is compared again.

## The graphs of this tree

The tree holds 27 graphs, not one: the graph of the whole repository at the root and the graph of
every directory under `projects/`, `apps/` and `libs/`, each in its own `graphify-out/`. A question
about one package is asked of its graph — it is smaller and has no neighbours' nodes; a question
across packages is asked of the root one.

```bash
graphify explain "<node>" --graph projects/ui-kit-v2/graphify-out/graph.json
```

In a project graph `source_file` is counted from the project directory, not from the root:
`src/lib/const/dash.const.ts` in the graph of `projects/utils`.

All graphs are built by one command, not by `graphify update .`: it walks every directory, cuts the
path of the copy out of the node ids and stamps the head on every graph. A graph built by bare
`graphify update` keeps that path and merges with the graph on disk into duplicates. Named
directories are built alone.

```bash
npm run graph:build
npm run graph:build -- projects/utils apps/message-bus
```

Only `graph.json` lies in history, and `built_at_commit` names the parent of the commit that carries
it. A graph after a merge of two branches has no `built_at_commit` at all — the merge driver joins both sides, and the result
was built from no head.
