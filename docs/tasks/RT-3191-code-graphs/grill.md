# Grill

## The owner request

> заведи новый эпик на актуализацию обвязки agent kit и разбей на задачи. нужно сделать ревизию всей
> документации, правил и скилов в agent kit. так же нужно начать с построения графа graphify для
> каждого из проектов в этом репозитории

The whole request and the epic answers lie in `docs/plans/agent-kit-revision.md`.

## What the tree already has

- `graphify` 0.8.16; `graphify update <path>` builds a code graph without a language model into
  `<path>/graphify-out/`.
- Measured on 11.11.2026: `projects/utils` — 2 s, 728 nodes, `graph.json` 500 KB. The whole
  repository — 62 s, 45 860 nodes, `graph.json` 40 MB, 2.1 MB after gzip. The root build also writes
  `cache/` (23 MB), `manifest.json` and `GRAPH_REPORT.md`; a small project also writes `graph.html`.
- `nx.json` takes every file under a project root as its input, so a rebuilt graph inside a project
  marks it affected.
- `.gitattributes` already declares merge settings for indexes that branches only append to.
- The package carries the trait `graph` and the pattern `task-flow-graph`; this tree names
  `packages`, `app`, `admin` and `mockups` in `has`.

## Questions and answers

**How the graphify graph is built for the projects of the repository?** Options: one graph for the
repository (recommended) · one graph per project · both.
«Оба варианта».

**Is the graph put into the history of the repository?** Options: into `.gitignore` (recommended) ·
commit `graph.json`.
«Коммитить graph.json».

## Decisions

- **Only `graph.json` goes into history.** The cache, the report, the HTML view and the manifest are
  rebuilt by the same command and are ignored. The owner's word names `graph.json`.
- **A project is a directory under `projects/`, `apps/` and `libs/`.** Under `libs/` the directory
  holds several nx projects; it gets one graph, as the owner counted three libraries.
- **The graph files are no input of nx projects.** Otherwise every rebuild marks all 26 projects
  affected, and the push gate runs everything.
- **The merge driver is set up by the install step.** `.gitattributes` names the driver, and its
  command lives in the git config of each copy: it is written by the `prepare` script.
- **The cost is named to the owner.** About 2 MB of compressed history for the root graph on every
  rebuild that reaches a commit, plus the project graphs.
