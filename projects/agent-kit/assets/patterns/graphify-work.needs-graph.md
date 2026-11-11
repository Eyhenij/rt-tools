---
name: graphify-work
kind: pattern
rule: task-flow
description: Pattern of rule task-flow. Load when a tree holds a code graph and a domain is to be explored or a shared symbol edited — the freshness check, the domain inventory, explain and affected, and what the graph never answers.
---

# Working with the tree's code graph

Pattern of the rule `task-flow`. What must be true meanwhile — the law
`docs/constitution/work-conduct.md`.

The graph is a build artefact: it lies next to the tree, outside version control, and is rebuilt
from the code. It answers relations, not behaviour. The tool is not part of the package, and the
pattern is laid out only to a tree that names the trait `graph`.

## When to use

- The first exploration of a domain in a turn, before reading files one by one.
- Before an edit of a shared symbol: who calls, imports or re-exports it.
- A question of the shape of the tree: which files belong to a domain, where the procedures of a
  service lie.

Not for a claim about behaviour, a number, a limit or the text of a rule: those are read from the
code and the documents.

## Freshness

The build records the commit it was made from. It is compared with the head before the first answer
taken from the graph:

```bash
python3 -c "import json;print(json.load(open('graphify-out/graph.json'))['built_at_commit'])"
git rev-parse HEAD
```

Equal — the graph describes the head. Behind — the graph is stale, and a rebuild re-extracts code
files and calls no model:

```bash
graphify update .
```

A stale graph is not a source: the turn names that it was not rebuilt, and no answer cites it.

## The inventory

Nodes carry the file they came from. Listing them shows a domain whole: files, classes, procedures,
functions.

```bash
python3 -c "import json,collections;g=json.load(open('graphify-out/graph.json'));c=collections.Counter(n.get('source_file','') for n in g['nodes'] if '<domain>' in n.get('source_file',''));print('\n'.join(f'{v:5d} {k}' for k,v in c.most_common()))"
```

## The relations

```bash
graphify explain "<file>"                # a file or a symbol and its neighbours
graphify affected "<symbol>" --depth 2   # who depends on it, reverse traversal
graphify path "<caller>" "<callee>"      # the chain between two nodes
```

`explain` answers with `imports`, `imports_from`, `calls`, `contains` and `re-exports`; `affected`
is the reverse traversal an edit of a shared symbol needs.

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
  neighbours of a word, not with the domain. `explain` is asked by a file or a symbol.
- **A barrel file distorts a path.** `index.ts` nodes stand between a caller and a callee, and
  `graphify path` returns a chain through re-exports that no reader would walk. `affected` on the
  symbol is used instead, and the relations are read.
- **A graph that was never checked reads as fresh.** The build names its commit; without comparing
  it with the head, an old graph answers about old code and nothing turns red.
- **The graph points where to read, and the claim is read there.** A statement about behaviour, a
  number or a text is taken from the code or the document, never from the graph.
