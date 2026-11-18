# Progress

## Where we stand

Rewritten by every session, not appended to.

- **State:** `этап-идёт`
- **Stage:** 2 of 5 — Only the engine marks a step done
- **Done:** stage 1 — the judge of recorded turns runs with no tools (SC-AK-1711…1714)
- **Next step:** 2.1 — the plan and its checks from the commit that added the plan
- **Uncommitted:** nothing
- **PR:** not open yet

## Steps

- [x] 1.1 The replay command builds the prompt from the hook text and the turns only, runs the judge with no tools outside the tree and compares after the answer
- [x] 2.1 The plan and its checks are read from the commit that added the plan, never from the working copy
- [x] 2.2 step N.M on a match marks the step done and the next one current, and leaves the progress as it was on a mismatch
- [x] 2.3 The guard refuses an edit that newly marks a step done in a plan with checks, whatever mark lies on disk
- [x] 2.4 The texts that tell to mark a step in the progress by hand say that step N.M marks it
- [>] 3.1 Opening a PR runs step --done over all done steps and refuses on any mismatch, naming the step, expected and got
- [ ] 4.1 plan-red writes the place of the answer and the plan commit, from the record directories of this repository's copies only
- [ ] 4.2 The guard of the description confirms the answer at its place and the plan commit, and refuses writes into the session records, not into the memory
- [ ] 4.3 Exit 5 confirms the approval at its place as the guard does
- [ ] 5.1 The agreement is merged into the flow-script spec, SC-AK-1411 and SC-AK-1414 rewritten with their tests
- [ ] 5.2 Every live scenario of the agreement stands in a test
- [ ] 5.3 The package is built and laid out
- [ ] 5.4 The live probe: a forged mark with a hand done mark is refused, a write into the memory passes, and the measurement of the state stays under 75 seconds

## Decisions along the way

- **The plan was added again by a rebuilt commit, and the checks of 5.1 and 5.3 were tightened before the approval mark.** The folder commit had carried the empty template of the plan, and the engine took it for the plan commit; the branch was not on the server, so it was rebuilt with `reset --soft`. plan-red refused 5.1 and 5.3 as green before the work; their checks now also demand the merged agreement and the probe. Affected stage of the plan: 5.
- **The plan was added again once more, after the owner's approval: two formal fixes, no new work.** The footprint row of the engine files got the mark «(правится)» the description guard reads — the approved plan named the same files in its code row without it, and stages 2–4 could not be edited. The counting checks got `tr -d ' '`: `wc -l` on this machine pads the number, and the form `number` did not match step 1.1. The owner is told in the next reply. Affected stages: 1–5.
