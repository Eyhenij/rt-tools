# Progress

## Where we stand

Rewritten by every session, not appended to.

- **State:** `этап-идёт`
- **Stage:** 3 of 3 — The trait and the closing
- **Done:** stages 1 and 2; the trait `graph` laid out with this tree's section; `CLAUDE.md`
- **Next step:** the push gate set
- **Uncommitted:** nothing of the steps
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 The command builds the root graph and the graph of every project
- [x] 1.2 All graphs are built and committed
- [x] 2.1 Ignore rules for the rest of `graphify-out/`
- [x] 2.2 The merge driver in `.gitattributes` and in the install step
- [x] 2.3 The graph files left out of nx inputs and of prettier
- [x] 3.1 The trait `graph` in `.claude/rt-kit.json` and the layout
- [x] 3.2 The command in `CLAUDE.md`
- [>] 3.3 The push gate set
- [ ] 3.4 The task folder taken apart into the archive
- [ ] 3.5 PR into the epic branch

## Decisions along the way

- **The ignore rules go in before the graphs.** The pre-commit hook runs prettier over every staged
  file, so a staged 40 MB `graph.json` would be rewritten by it. Steps 2.1 and the prettier half of
  2.3 land in the commit of step 1.2.
- **nx leaves the graphs out by `.nxignore`, not by `namedInputs`.** A directory under `libs/` holds
  several nx projects, and the root graph lies outside any project root; one ignore line covers
  both. Measured: the full build 132 s, 27 graphs, 67 MB, the root graph 41 MB (2.1 MB gzip).
- **The merge driver drops `built_at_commit`.** A trial merge by `git merge-tree` of two branches,
  each adding a node to one graph: no conflict marker, both nodes in the result, the field gone. A
  merged graph was built from no head, so the pattern reads it as stale — that is the true answer.
- **nx sign measured by the files, not by `HEAD~1`.** The commit of step 1.2 also carries the task
  folder, and that marks the root project `@rt/workspace`. `nx show projects --affected --files=`
  over the 27 graphs alone — `[]`.
- **A graph whose topology did not change gets the head stamped.** graphify leaves such a graph
  untouched with an older `built_at_commit`; the command moves the field to the head.

## Sessions

### 11.11.2026

- Measured: the root graph 62 s, 45 860 nodes, 40 MB (2.1 MB gzip); `projects/utils` 2 s, 728
  nodes, 500 KB.

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/eyhenij/WebstormProjects/rt-role-exit
**Branch:** RT-3191-code-graphs

### Where we stand at the minute of the compaction

- **State:** `этап-идёт`
- **Stage:** 2 of 3 — The graph in history
- **Next step:** the build command
- **PR:** not open yet

The progress in full — `docs/tasks/RT-3191-code-graphs/progress.md`; the plan lies next to it.

### Uncommitted

```
 M package.json
?? apps/auth-example-admin/graphify-out/
?? apps/auth-example-api/graphify-out/
?? apps/auth-example-e2e/graphify-out/
?? apps/chat-talks-embed/graphify-out/
?? apps/chat-talks-page/graphify-out/
?? apps/chat-widget/graphify-out/
?? apps/message-bus-admin-e2e/graphify-out/
?? apps/message-bus-admin/graphify-out/
?? apps/message-bus/graphify-out/
?? graphify-out/
?? libs/message-bus-admin/graphify-out/
?? libs/message-bus-api/graphify-out/
?? libs/message-bus-common/graphify-out/
?? projects/agent-kit/graphify-out/
?? projects/auth-angular/graphify-out/
?? projects/auth-contract/graphify-out/
?? projects/auth-import/graphify-out/
?? projects/auth-keycloak-theme/graphify-out/
?? projects/auth-server/graphify-out/
```

### Commits over the main branch

```
a7904517b docs(rt:agent-kit): папка задачи RT-3191
af21a0114 docs(rt:agent-kit): план эпика RT-3190 — ревизия пакета правил и графы
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
