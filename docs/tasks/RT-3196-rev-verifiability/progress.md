# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 1 of 3 — Findings
- **Done:** the role findings and the binding comparison are edited in the package texts, both
  companions and the override of `testing`, and laid out; all text checks are green
- **Next step:** decide what needs a task; the law text for D3 goes to the owner in the PR
- **Metric now:** held by memory 26 → 24 (testing 12 of 42, browser-verification 12 of 23)
- **Uncommitted:** no
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- `[x]` done · `[>]` going on right now · `[ ]` not begun

- [x] 1.1 Run the role rules-reviewer over the whole family
- [x] 1.2 Compare rule articles with the companion bindings and hook code
- [x] 1.3 Write the findings list into the progress with a decision for each
- [x] 2.1 Edit the package texts by the findings
- [x] 2.2 Build the package and lay out the tree
- [>] 2.3 File tasks for findings that need code or another law
- [ ] 3.1 Rebuild the rules graph and its report
- [ ] 3.2 Run the push gate
- [ ] 3.3 Take the task folder apart into the archive

## Findings

The role read the family on the tip of RT-3195 (`ed2bb634b`). Room against the prose limit: testing
281 lines / 21 320 characters, browser-verification 261 lines / 19 795 characters.

- **D1–D3** the law and a rule disagree: the known list of a check (D1), a disputed red check sent
  to the owner (D2), an unconfigured guard as a stop (D3).
- **D4–D18** texts of the family disagree among themselves, name one tree's files, say «main» for a
  task branch or name only Russian coverage marks.
- **G1–G9** law articles with no rule line: test before code, a change with nothing to show red,
  restoring shared state, empty input, a check removed from the set, layout thresholds, analysing a
  broken check, the pipeline set before push, a spoken list of checks.
- **P1–P16** near repeats, most between browser-verification and its patterns.

Binding comparison, 12.11.2026: testing — 42 articles, 27 lines right; browser-verification — 23
articles, 19 lines right. Wrong: stale verdicts where the spec audit already refuses (scenario
without a test, partial coverage, a foreign id, direct calls), false bindings (`openSection`,
`STAND_PASSWORD`, `prose-style-guard`, `serve-admin` as the real proxy, the known-list parser),
symbols in other files, stale facts (two applications, `UI-KIT-V2-ISSUES.md` as the coverage
list, no reverse proxy, the pipeline set, `e2eRoots` without the entry example's suite, the
snapshot references outside history, the story sweep past the guard). All fixed in the companions;
`e2eRoots` gets the second suite.

Decisions on the role findings:

- **D1, D2** fixed in the rule to the law: the known list only shrinks; a disputed red check is
  not a question to the owner — the executor fixes the check or the code.
- **D3** asked of the owner. Their answer: «Не открывать браузер (Recommended)» — the rule is
  right. The law article about a broken check needs the exception; its text goes to the owner in
  the PR, the law is not edited in the branch.
- `UI-KIT-V2-ISSUES.md`: the owner answered «[No preference]»; the file stays, the divergence
  stays named in the doc-style companion.
- **D4, D5, D7, D9, D10, D11, D12, D14, D15, D17, D18** fixed here to the side the role named right.
- **D6** the rule names substitution as the fallback, as the pattern does.
- **D8** the measure pattern names the tree's layout thresholds as the source of the sweep.
- **D13** the dead `Q-FA-1` reference goes; the same id in `angular-patterns` and
  `component-structure` is written into the card of RT-3198, the frontend-application family.
- **D16** tree names in portable texts are replaced by placeholders where the text says it holds
  none.
- **G1–G7** a rule line where something in the tree holds it, otherwise a line in "What of the law
  is not here".
- **G8** carried by `git-workflow` in all three hosting variants: «The push gate set is never
  narrower than the pipeline set». `testing` refers to it in one line.
- **G9** no rule of the package carries «A spoken list of checks is not a check» (search over
  `rules/`): a line in "What of the law is not here" of `testing` — nothing tells a list read from
  output from a list written from memory.
- **P1–P16** the repeat stays where the decision is made, the other side refers to it.
- The tree's override of `testing` replaces "What of the law is not here" whole: the line about
  the articles the author alone holds goes into the override too.
- The delivery guard counts the lag from main (`git-guard-delivery.sh:415`), not from the base:
  the binding of the article about keeping the base merged says so.

## Decisions along the way

## Sessions

### 2026-11-12

- Folder, plan; branch from RT-3195 by the stack.
