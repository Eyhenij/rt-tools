# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 1 of 3 — Cleanup after the image build
- **Done:** the task folder and the plan
- **Next step:** write the builder cleanup script
- **Uncommitted:** no
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- `[x]` done · `[>]` going on right now · `[ ]` not begun

- [>] 1.1 Write the builder cleanup script with the age and the size limits
- [ ] 1.2 Call the script from the cleanup step of the check workflow
- [ ] 1.3 Call the script from the image build job of the rollout workflow
- [ ] 2.1 Write the waiting term into the install settings
- [ ] 2.2 Leave the commit hook with the staged-files runner alone and narrow its formatter paths
- [ ] 2.3 Write the check of the dependencies rule and its test
- [ ] 2.4 Add the check to the push set
- [ ] 3.1 Rewrite the three bindings in the companions of both rules
- [ ] 3.2 Rebuild the rules graph and its report
- [ ] 3.3 Run the two review rounds and fix what they name
- [ ] 3.4 Run the push gate
- [ ] 3.5 Take the task folder apart into the archive

## Decisions along the way

- **The rule `dependencies` gets a check of its own.** The rules graph counts a rule as executed
  only by a file of code named in its companion, and a setting in the manifest is no such file.
  Affected stage of the plan: 2.
