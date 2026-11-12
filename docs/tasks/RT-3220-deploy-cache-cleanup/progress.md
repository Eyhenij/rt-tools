# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 3 of 3 — Companions and closing
- **Done:** stages 1 and 2; the companions are rewritten and the rules graph is rebuilt
- **Next step:** the first review round
- **Uncommitted:** no
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- `[x]` done · `[>]` going on right now · `[ ]` not begun

- [x] 1.1 Write the builder cleanup script with the age and the size limits
- [x] 1.2 Call the script from the cleanup step of the check workflow
- [x] 1.3 Call the script from the image build job of the rollout workflow
- [x] 2.1 Write the waiting term into the install settings
- [x] 2.2 Leave the commit hook with the staged-files runner alone and narrow its formatter paths
- [x] 2.3 Write the check of the dependencies rule and its test
- [x] 2.4 Add the check to the push set
- [x] 3.1 Rewrite the three bindings in the companions of both rules
- [x] 3.2 Rebuild the rules graph and its report
- [>] 3.3 Run the two review rounds and fix what they name
- [ ] 3.4 Run the push gate
- [ ] 3.5 Take the task folder apart into the archive

## Decisions along the way

- **The rule `dependencies` gets a check of its own.** The rules graph counts a rule as executed
  only by a file of code named in its companion, and a setting in the manifest is no such file.
  Affected stage of the plan: 2.
- **The check also stands as a step of the check workflow.** A check that lives in the push set alone
  is not run for a PR opened past the session. Affected stage of the plan: 2.
- **The formatter of staged files takes linted extensions in the whole tree, not under `src` alone.**
  The hook line it replaces formatted every staged file, and the code linter reads `tools/` too.
  Affected stage of the plan: 2.
- **The image selection by sha stays on the node alone.** The rollout build pushes its images straight
  to the registry, so the build machine holds none to select from. Affected stage of the plan: 1.
