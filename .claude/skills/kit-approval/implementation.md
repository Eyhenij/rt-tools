# kit-approval — where it is carried out

The names and bindings of this tree next to the rule `SKILL.md`.

## Where it lives

- **the check** — `tools/check-kit-approval.mjs` — the branch against origin/main, or `--publish <kit>`
- **the push** — `.claude/rt-kit/project.sh:rt_push_checks` — the check stands in the push set
- **the PR and the release** — `.claude/hooks/kit-approval-guard.sh` — opening a PR and starting either kit release
- **the scenarios** — `tools/tests/check-kit-approval.test.sh`
- **where the owner's words are looked for** — the session transcripts of this machine
- **an epic branch** — `tools/check-kit-approval.mjs:answerersOf` — a branch without its own record is judged by its merges. A kit edit from a task PR merge, `[RT-<number>]` in the subject, is judged by that task's archive record. Main merged in is not judged. A commit made in the branch itself still needs the branch record.

## Where the articles are carried out

- **A visible kit edit starts in Figma, not in code.** — **Not checked by anything.** The order of the work leaves no trace a machine reads; the mockup line of the record with its Figma link is the only sign.
- **The owner is asked whether they approve, and only their answer is written down.** — `tools/check-kit-approval.mjs:ownerSaid` — the quote is looked for among the owner's own messages; the executor's words and tool results do not count.
- **The code is written after the mockup approval, and every state is shown in the showcase.** — **Not checked by anything.** The state contract of the showcase is held by the rule `rt-tools-storybook`.
- **The showcase matches the mockup at 100%, and that is measured, not looked at.** — `tools/check-kit-approval.mjs:faultsOf` — the match line is demanded at N of N, and N above zero.
- **The 100% is a match of numbers, and the overlay is the picture beside it.** — `tools/kit-match.mjs:compareNumbers` for the numbers, `tools/kit-match.mjs:overlay` for the frame of the divergence.
- **The whole block of components is compared at once, not one component by one.** — **Not checked by anything.** The overlay is made by the executor; the check sees only the approval it ends with.
- **A redrawn page is built in the showcase whole and compared by overlay with its mockup.** — **Not checked by anything.** The page story is held by the rule `rt-tools-storybook`, the overlay by the executor.
- **The showcase is shown to the owner and approved by a second answer.** — `tools/check-kit-approval.mjs:faultsOf` — the showcase line is demanded apart from the mockup line.
- **A kit file edited without a change of look goes by the owner's word that nothing visible changed.** — `tools/check-kit-approval.mjs:faultsOf` — the no-look line, said by the owner, stands in for the mockup, the match and the showcase lines.
- **The push, the PR and the release go only after the approvals the record demands.** — `tools/check-kit-approval.mjs:isVisibleKitFile` — what counts as a visible edit; the calls are held by `.claude/rt-kit/project.sh:rt_push_checks` and `.claude/hooks/kit-approval-guard.sh`.
