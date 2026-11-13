# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 2 of 3 — The queue audit says what the rules say
- **Done:** the guard reads the owner's consent, 59 scenarios green; the task RT-3268 is created;
  the audit counts a lag in a summary line and names a PR without a reviewer, its scenarios green;
  the first review round is answered by the commit `e588adbea`
- **Next step:** the second review round on `e588adbea` — the code review and the roles
  `project-manager`, `product-strategist`, `goal-critic`; the branch
  `RT-3268-epic-stop-consent-queue-audit` is taken once the request #3225 stops conflicting on
  the host
- **Uncommitted:** nothing
- **Waiting for the owner:** the push of the merge `847348e40` into the branch of the request
  #3225 — the permission classifier of the application stopped it
- **PR:** not open yet

## Steps

- [x] 1.1 Edit the consent reading in the guard source
- [x] 1.2 Add the scenarios and their texts in the spec
- [x] 1.3 Build the package and lay it out
- [>] 1.4 Create the task and take the branch by its number
- [x] 2.1 Print the lag as a summary line
- [x] 2.2 Print the line about a PR without a reviewer
- [x] 2.3 Bring the table of moves, the rule and the companion to the audit
- [x] 2.4 Edit the scenarios of the audit and their texts in the spec
- [x] 2.5 Build the package and lay it out
- [x] 3.1 Bring the epic plan to what was done
- [ ] 3.2 Run the checks of the tree
- [ ] 3.3 Take the folder apart into the archive

## Decisions along the way

- **The task is RT-3268, the branch `RT-3268-epic-stop-consent-queue-audit`.** — The plan was
  written before the number existed. Affected stage of the plan: 1.
- **The guard looks for the owner's words among what the owner side wrote, not in the last 400
  lines of the record.** — The consent fell out of the window while the guard was being fixed.
  Affected stage of the plan: 1.
- **The first commits lie in the local branch of RT-3220.** — Code is edited only in a branch by a
  task number, and the task could not be created before the fix. Affected stage of the plan: 1.
- **The branch waits for the request #3225.** — The delivery guard refuses a new branch while a
  request led by this copy conflicts with its base. Affected stage of the plan: 1.
- **The lag of a request is counted from its own base, not from the main branch.** — The suite
  `checks-board-epic-base.test.sh` holds it under SC-AK-1342. Affected stage of the plan: 2.
- **A plain «yes» counts only for a question about a task, and a refusal is read in every line.**
  — The first review round showed that an old «yes» to another question released the call and that
  «не переспрашивай» read as a refusal. Affected stage of the plan: 1.
- **Left out of this task, named by the first review round:** a menu answer is told from a forged
  command output only by its opening words; a menu closed by Esc without words cancels nothing;
  the lag line says the host merges the branch itself, which is false where the branch protection
  demands an up-to-date branch. Affected stage of the plan: none.

## Sessions

### 13.11.2026

- The folder is assembled in a local branch without a number: the end-of-epic guard refused the
  task creation until its own fix is laid out.
- Three commits lie in the local branch `RT-3220-deploy-cache-cleanup`: `0387b20c2`, `0dcad0bda`,
  `ad86cea45`. Green: the guard suite 51, the audit suites, the whole package suite,
  `agent-kit:check`, the checks of specs, paths, sizes, the glossary and the descriptions.
- The first review round is started on `ad86cea45`: the code review and the role
  `project-manager`.
- The first review round is answered: the guard suite is 59 green, the audit suites 91, 20 and 22,
  the layout matches the package. The audit no longer counts a bot as a reviewer.
- The fixed guard was run on the real record of the conversation, 25 real menu answers at three
  places each. Both real «yes» of 13.11 pass, the former guard refused them. Ten of the other 23
  answers pass too, the former guard passed three: reading consent by words lets a foreign answer
  through. The task does not fix it; the fix is a mark of the action carried by the menu.
- The merge `847348e40` of the epic branch into the branch of the request #3225 lies in the local
  branch `RT-3197-rev-autonomous-work`, its push set is green, and the push waits for the owner.
