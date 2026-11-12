# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 2 of 3 — Fixes
- **Done:** findings of the role and of the binding comparison written with decisions
- **Next step:** edit the package texts by D1–D18, G1–G7, P1–P9, then the two companions
- **Uncommitted:** no
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- `[x]` done · `[>]` going on right now · `[ ]` not begun

- [x] 1.1 Run the role rules-reviewer over the whole family
- [x] 1.2 Compare rule articles with the companion bindings and hook code
- [x] 1.3 Write the findings list into the progress with a decision for each
- [>] 2.1 Edit the package texts by the findings
- [ ] 2.2 Build the package and lay out the tree
- [ ] 2.3 File tasks for findings that need code or another law
- [ ] 3.1 Rebuild the rules graph and its report
- [ ] 3.2 Run the push gate
- [ ] 3.3 Take the task folder apart into the archive

## Findings

Role rules-reviewer, 12.11.2026 — decision: fix here, unless named.

- **D1** spec-driven:51 names Russian headings for a law and a rule.
- **D2** spec-driven-domain teaches spec headings and markers in Russian only; the check names the
  English ones first.
- **D3** spec-driven-rule lists the Russian binding verdicts; the audit prints the English ones.
- **D4** «Pitfalls» is both a hot section and the cold file; spec-driven carries a hot copy.
- **D5** a statement with no place in code: flow → open questions, pattern → «Pitfalls», prose →
  a verdict line.
- **D6** an open question: «no date» vs «carries its creation date»; one letter vs two.
- **D7** the agreement merges «after the rollout» vs «before the PR opens».
- **D8** the task folder «dies with the merge» vs «taken apart before the PR».
- **D9** archive expiry vs «untaken task checked against the archive» — task-flow names history.
- **D10** doc-style states a future cure (check moved to main's pipeline) as fact — removed.
- **D11** doc-style-trace selects merges into main; tasks merge into the epic branch.
- **D12** doc-style-write reads `origin/main`; a task reads its base.
- **D13** doc-style-sweep names one machine's host client path.
- **D14** «a rule and its mirror» in the pairs of docs-guard; no mirror exists.
- **D15** `docs/BACKLOG.md` stated as fact in the pitfalls.
- **D16** steps «live in the branch or the PR description» vs the plan.
- **D17** a document «outside docs/archive/» omits the task folders.
- **D18** «ten times» for seven of eight; a one-off measurement in the present tense.
- **G1–G7** law articles with no rule line: work only in the queue, drift fixed on the wrong side,
  dropping a word outside the tree, an unformulated requirement stays silent, the agreement merge
  step, where moved decisions went, completeness from the side of the work.
- **P1–P9** repeats inside the family and with git-workflow.
- **Outside the family:** git-workflow.github still says «merging main in» at two places — a
  leftover of RT-3194, fixed here.

Binding comparison, 12.11.2026:

- doc-style: «Texts for a person» has five articles and no binding (the audit reads one section);
  three symbols declared in other files; the edit-tool article is bound to a guard that judges shell
  writes on purpose; the size article names the code limit; a laid-out rule still demands its
  companion; the prune command makes no commit; `indexedDirs` is empty here, so the index
  articles run on nothing; a stale reason about screen strings; an incomplete pair list.
- spec-driven: seven symbols declared in other files; the verdict-substance article is bound to a
  form regex; liveness is judged for `.ts` only; «first column copied» is checked; servers and
  refusal codes exist; ten scenario prefixes, eight domains with subdomains; a reused number is
  refused only while alive; `packageDirs`, not `portableDirs`; a private field is a binding now.
- Code, not text — a task: a laid-out rule with the header still demands its companion in
  docs-guard; the anchor check matches a word anywhere in the file, imports and comments included.

## Decisions along the way

## Sessions

### 2026-11-12

- Folder, plan; branch from RT-3194 by the stack.
