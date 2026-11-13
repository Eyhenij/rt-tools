# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 2 of 3 — The queue audit says what the rules say
- **Done:** the guard reads the owner's consent, 51 scenarios green; the task RT-3268 is created;
  the audit counts a lag in a summary line and names a PR without a reviewer, its scenarios green
- **Next step:** take the branch `RT-3268-epic-stop-consent-queue-audit` from this commit once the
  request #3225 stops conflicting on the host; then the review rounds and the closing
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

## Sessions

### 13.11.2026

- The folder is assembled in a local branch without a number: the end-of-epic guard refused the
  task creation until its own fix is laid out.
