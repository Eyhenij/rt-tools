---
name: task-flow-graph
kind: pattern
rule: task-flow
description: Pattern of rule task-flow. Load when the tree holds a code graph and a domain is explored or a shared symbol is about to be edited. Not for a claim about behaviour, a number or a rule text — those are read from the code and the documents.
---

# Working with the tree's code graph

Pattern of the rule `task-flow`. What must be true meanwhile — the law
`docs/constitution/work-conduct.md`.

The graph is a build artefact of the tool `graphify`: it lies next to the tree and is rebuilt from
the code. It answers relations, not behaviour. The tool is not part of the package, and the pattern
is laid out only to a tree that names the trait `graph`. A copy that names the trait and has no
artefact on disk — a fresh clone, a new working tree — builds it by `graphify update .` before the
first exploration of the turn, or the turn names that there is no graph, and none of the steps below
applies. Cold part: `pitfalls.md` — every section below whole, with its code and reasons.

## When to use

- The first exploration of a domain in a turn, before reading files one by one.

## Freshness

The build records the commit it was made from. It is compared with the head in every turn, before the first exploration: Equal — the graph describes the head. Behind — the graph is stale, and the difference is read before anything else: it names the files whose relations the graph no longer knows.

## The inventory

Nodes carry the file they came from. Listing them shows a domain whole: files, classes, procedures, functions.

## The relations

A node is named by a file name or a symbol, not by a path: `board.mjs` is found, `tools/board.mjs` is not. `explain` answers with `imports`, `imports_from`, `calls`, `contains` and `re_exports`; `affected` is the reverse traversal an edit of a shared symbol needs.

## What the graph never answers

A constant, a limit, a number: values are not nodes. The body of an `async function*`: the extraction may leave it out, and a function absent from the graph is not absent from the code. A template, a style sheet, a generated file: often outside the extraction.

## Common misses

- **A free-text query looks like the entry point and is not.**
- **A barrel file distorts a path.**
- **A rebuild after deleted code keeps the old graph.**
