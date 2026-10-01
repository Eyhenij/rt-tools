# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 4 of 4 — Closing
- **Done:** the task, the plan, the texts of this tree and of the package, the guard
- **Next step:** run the full suite
- **Uncommitted:** nothing
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 Edit the rule ui-component-tests: the order, the commands, three pitfalls and the cold part
- [x] 1.2 Edit the showcase rule and its companion: fonts in play, the themes pair
- [x] 1.3 Edit the styling rule and its companion: the token graph check
- [x] 1.4 Edit the re-take pattern, the testing companion and the spec-driven companion
- [x] 1.5 Append the address limit to the end-to-end override
- [x] 2.1 Edit the package rules spec-driven and doc-style
- [x] 2.2 Edit the package patterns task-flow-start, testing-e2e and git-workflow-commit
- [x] 2.3 Lay out the package
- [x] 3.1 Write the guard of the flag that skips the commit checks
- [x] 3.2 Write its scenarios
- [x] 3.3 Lay out the guard
- [>] 4.1 Run the full suite
- [ ] 4.2 Take the task folder apart into the archive

## Decisions along the way

- **The binding line for the token graph check is not added.** The review asked for a line for a nested item, and the companion binds only top-level articles; the line of the article itself now names both checks. Affected stage of the plan: 1.
- **The address limit in the override is worded by the code.** The review spoke of new conversations; the receiver counts requests of a client without a visitor sign by its address. Affected stage of the plan: 1.
- **The amend article names what the gate does not read.** The push gate does not read commit messages, so a message the hook never saw reaches the host unchecked. Affected stage of the plan: 2.
- **Five texts are shortened to fit the size limit.** The rules ui-component-tests and rt-tools-storybook and the pattern task-flow-start grew past the limit; arguments and incident history were cut, the statements stayed. Affected stage of the plan: 2.
- **The expired archive records are removed in this branch.** The owner's word: «Коммитом в RT-2446». Affected stage of the plan: 2.
- **The scenario number command reads numbers of any length.** It matched three digits and answered SC-AK-1000 while SC-AK-1169 was taken; the companion of spec-driven names it since stage 1, so it is fixed here. Affected stage of the plan: 3.
- **The guard gets a subdomain of its own in the package spec.** The spec lookup said no spec speaks of the new hook; the subdomain repeats the shape of the discard guard's one. Affected stage of the plan: 3.

## Sessions

### 2026-10-01

- The task RT-2446 is created outside an epic by the owner's word; the row of this copy is rewritten.
