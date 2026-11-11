# Progress

## Where we stand

Rewritten by every session, not appended to.

- **State:** `этап-идёт`
- **Stage:** 3 of 3 — The closing
- **Done:** the builder, the report, their scenarios; the graph and the report committed
- **Next step:** the command in `CLAUDE.md`
- **Uncommitted:** nothing of the steps
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 The builder reads the resources and their links
- [x] 1.2 Scenarios of the builder
- [x] 1.3 The graph built and committed
- [x] 2.1 The report from the graph
- [x] 2.2 Scenarios of the report
- [x] 2.3 The report built and committed
- [>] 3.1 The command in `CLAUDE.md`
- [ ] 3.2 The push gate set
- [ ] 3.3 The task folder taken apart into the archive
- [ ] 3.4 PR into the epic branch

## Decisions along the way

- **The specs of the package are texts of the graph.** A hook is wired by its own header, so no
  rule names most of them; the spec is where a hook is described. Without the specs 49 resources
  read as unlinked, with them 14. A spec is an entry point and is not listed as unlinked itself.
- **Statements are compared between package texts only.** The bindings of a spec quote the articles
  of a rule word for word on purpose; with them the report held 145 pairs, without them 25.
- **The glossary is read up to the section of words not written here.** That section lists bans,
  and its words read as unused meanings.

## Sessions

### 11.11.2026

- The task taken after RT-3191 merged by #3211; the branch from the epic branch at `ae20be18d`.
