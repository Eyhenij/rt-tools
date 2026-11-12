# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 1 of 3 — Findings
- **Done:** the role rules-reviewer read the family; its findings D1, D2, D4–D18, G1–G9 and the
  repeats are edited in the package texts and laid out; the binding comparison runs
- **Next step:** compare the articles of testing and browser-verification with their companion
  bindings and the code they name
- **Uncommitted:** no
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- `[x]` done · `[>]` going on right now · `[ ]` not begun

- [x] 1.1 Run the role rules-reviewer over the whole family
- [>] 1.2 Compare rule articles with the companion bindings and hook code
- [ ] 1.3 Write the findings list into the progress with a decision for each
- [ ] 2.1 Edit the package texts by the findings
- [ ] 2.2 Build the package and lay out the tree
- [ ] 2.3 File tasks for findings that need code or another law
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

Decisions on the role findings:

- **D1, D2** fixed in the rule to the law: the known list only shrinks; a disputed red check is
  not a question to the owner — the executor fixes the check or the code.
- **D3** a law question to the owner: is an unconfigured guard a broken check (the law: work goes
  on) or a reason to stop (the rule)? The rule keeps its text until the answer.
- **D4, D5, D7, D9, D10, D11, D12, D14, D15, D17, D18** fixed here to the side the role named right.
- **D6** the rule names substitution as the fallback, as the pattern does.
- **D8** the measure pattern names the tree's layout thresholds as the source of the sweep.
- **D13** the dead `Q-FA-1` reference goes; the same id in two rules of other families is named
  for RT-3209.
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
