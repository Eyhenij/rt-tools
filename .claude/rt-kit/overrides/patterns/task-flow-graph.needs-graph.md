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
