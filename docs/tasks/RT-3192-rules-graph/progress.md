# Progress

## Where we stand

Rewritten by every session, not appended to.

- **State:** `этап-идёт`
- **Stage:** 3 of 3 — The closing
- **Done:** stages 1 and 2, the command in `CLAUDE.md`; the role findings fixed
- **Next step:** the push gate set
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
- [x] 3.1 The command in `CLAUDE.md`
- [>] 3.2 The push gate set
- [ ] 3.3 The task folder taken apart into the archive
- [ ] 3.4 PR into the epic branch

## Decisions along the way

- **The specs of the package are texts of the graph.** A hook is wired by its own header, so no
  rule names most of them; the spec is where a hook is described. Without the specs 49 resources
  read as unlinked, with them 14. A spec is an entry point and is not listed as unlinked itself.
- **Statements are compared between package texts only.** The bindings of a spec quote the articles
  of a rule word for word on purpose; with them the report held 145 pairs, without them 25.
- **The roles proved the first report false, and it was rebuilt before the revisions read it.**
  13 of 14 unlinked resources were named by a path to `.md`, a `# Requires:` line of a hook or an
  import; 9 of 11 unexecuted rules are executed by a linter rule or a test. The builder now reads
  all three, counts a binding to any code as an executor and names a rule not laid out here apart.
- **The glossary words left the links.** They were 78% of the graph, and `graphify explain` showed a
  rule's words instead of its law and patterns. The report counts their use. Affected stage: 1.
- **A fifth list: articles nothing carries out.** Proposed by `product-strategist`; the companion
  marks them «Not checked» or «Not carried out». Affected stage: 2.
- **The glossary is read up to the section of words not written here.** That section lists bans,
  and its words read as unused meanings.

## Sessions

### 11.11.2026

- The task taken after RT-3191 merged by #3211; the branch from the epic branch at `ae20be18d`.
