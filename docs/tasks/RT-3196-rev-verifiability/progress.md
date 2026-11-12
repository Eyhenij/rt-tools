# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 1 of 3 — Findings
- **Done:** the role rules-reviewer read the family: 18 divergences, 9 gaps, 16 near repeats
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

## Decisions along the way

## Sessions

### 2026-11-12

- Folder, plan; branch from RT-3195 by the stack.
