# Scenarios — the push set against its base, from its marks and ahead

The spec is `spec.md` next to it. The scenarios check what base the set is counted against, when a
check is not run again and how the heavy steps leave the guard.

### SC-AK-1240 — a stacked branch is counted against the branch under it

Given a branch that stands on another branch whose remote copy lies in the history of the head
When the push guard picks the base
Then the base is the remote copy of that branch

Given a branch that stands on the main branch
When the push guard picks the base
Then the base is the remote main branch

Given the lower branch was removed from the remote, the working copy holds no ref of it, and no
other remote branch carries it
When the push guard picks the base
Then the base is the remote main branch

Covered: `projects/agent-kit/tests/git-guard-push-tests.test.sh`.

### SC-AK-1340 — the base is the remote branch the head has the fewest commits over

Given two remote branches lie in the history of the head, one nearer to it than the other
When the push guard picks the base
Then the base is the nearer one

Given the branch has a remote copy of its own behind the head
When the push guard picks the base
Then that copy is not the base

Given the lower branch was removed from the remote, and the working copy still holds its ref
When the push guard picks the base
Then the base is that ref

Given the lower branch was merged into the branch of the epic by the host and removed from the
remote, and the working copy holds no ref of it
When the push guard picks the base
Then the base is the branch of the epic, whether or not the branch took it in

Given a branch made from the checked-out head, and the call comes from a subdirectory
When the push guard picks the base
Then the base is the same as from the root of the tree

Given the main branch moved ahead on the remote, and the ref of a branch merged into it earlier
lies in the history of the head
When the push guard picks the base
Then the base is the remote main branch

Given the host merged a task into the branch of an epic
When the push guard picks the base for the branch of the epic
Then the merged task is not the base, and neither is a task that stands on the branch of the epic

Given the host merged a neighbouring task into the branch of an epic after a task was taken from it
When the push guard picks the base for that task
Then the base is the branch of the epic

Given a remote branch that stands on this one
When the push guard picks the base
Then that branch is not the base

Given a head that is no branch
When the push guard picks the base
Then the base is the remote main branch

Given a neighbouring task taken from the new tip of the branch of the epic, as near as that branch
When the push guard picks the base
Then the base is the branch of the epic, not the neighbour

Given a branch taken straight from the remote branch of the epic, so that it tracks it
When the push guard picks the base
Then the base is the branch of the epic

Given a remote branch at the same commit as the main branch
When the push guard picks the base
Then the base is the remote main branch

Given a task that took the main branch in by itself
When the push guard picks the base
Then the base is the branch of the epic: what the main branch brought is not counted

Given a branch pushed before its first commit
When the push guard picks the base
Then the base is the branch it lies on, not the main one

Given a branch moved past the head by a plain push, not by a merge of the host
When the push guard picks the base
Then that branch is not the base

Covered: `projects/agent-kit/tests/git-guard-push-tests.test.sh`.

### SC-AK-1241 — a check green on the same tree is not run again

Given a clean working copy and a check that passed on its tree against its base
When the same tree is pushed again
Then the check is not run, and the push passes

Given the working copy holds an edit outside the index
When the push call comes
Then the check runs again: a mark is not trusted on a dirty copy

Covered: `projects/agent-kit/tests/git-guard-push-tests.test.sh`.

### SC-AK-1242 — the heavy steps run ahead, not inside the guard

Given a tree that declared running its heavy steps ahead, and a heavy step with no mark
When the push call comes
Then the guard refuses at once, does not run the step and names the command that runs it ahead

Given the run ahead passed on a clean copy
When the push call comes
Then the push passes from the marks, and the heavy step ran once

Given the working copy holds an edit outside the index
When the run ahead starts
Then it does not run anything and exits with 3

Covered: `projects/agent-kit/tests/git-guard-push-tests.test.sh`.

### SC-AK-1345 — a head that adds nothing to its base is pushed with no check run

Given a branch whose every commit already lies in its base on the remote, and a set of one red check
When the push call comes
Then the guard lets it through and runs no check

Given the same branch
When the run ahead starts
Then it names that there is nothing to run and exits with 0

Covered: `projects/agent-kit/tests/git-guard-push-nothing-new.test.sh`.

### SC-AK-1346 — a head with a commit over its base is judged by the set

Given the same branch with one commit over its base
When the push call comes
Then the guard runs the set and refuses on the red check

Given a repository with no remote
When the push call comes
Then the guard runs the set: there is no base to compare the head with

Covered: `projects/agent-kit/tests/git-guard-push-nothing-new.test.sh`.

### SC-AK-1349 — the head tells nothing about a push of another branch

Given a head that adds nothing to its base, and a set of one red check
When the push names another branch, sends the head into a branch of another name or names no branch
Then the guard runs the set and refuses on the red check

Covered: `projects/agent-kit/tests/git-guard-push-nothing-new.test.sh`.

### SC-AK-1347 — a commit of unread paths keeps the mark of a check

Given a profile that names the paths a check does not read, and the key of that check
When a commit changes those paths alone — a file under the unread directory, a text at the root
Then the key of the check is the same, and the key of a check the profile does not name changes

Covered: `projects/agent-kit/tests/git-guard-push-marks-unread.test.sh`.

### SC-AK-1348 — a commit of what the check reads drops its mark

Given the same profile and the key of the check
When a commit changes a file of code, or a text that lies inside the code
Then the key of the check changes

Covered: `projects/agent-kit/tests/git-guard-push-marks-unread.test.sh`.

### SC-AK-1350 — a check that passed over its time limit is red

Given the profile gives a check a limit of 12 seconds and words for the refusal
When the check passes in 14 seconds
Then the set calls it red, and the refusal names 14, 12 and the words. At 13 seconds it is red
too, as there is no margin; at 12 seconds the check is green. A check the profile gives no limit
is green however long it took

Covered: `projects/agent-kit/tests/push-over-budget.test.sh`.

### SC-AK-1351 — a push whose whole set ran over its time limit is red

Given the profile gives a whole set a limit of 440 seconds and words for the refusal
When the set of one push runs for 441 seconds
Then the push is red, and the refusal names 441, 440 and the words and asks why before the next
push. At 440 seconds the set is green, the package default sets no limit, and both runners judge
the sum. The run over the limit drops the marks it put, and a run within the limit keeps them

Covered: `projects/agent-kit/tests/push-over-budget.test.sh`.

### SC-AK-1352 — a hook change runs only the scenario files that reach it

Given the package scenario files and hooks as they lie in the tree
When a change touches one hook, the defaults or one scenario file
Then the files that name the hook, or a hook that sources it, run, and a file that reaches neither
does not. A change of the defaults runs their scenarios and the files of hooks that load them. A
change of the harness, the runner, the selection or a check runs every file

Covered: `projects/agent-kit/tests/select-suites.test.sh`.

### SC-AK-1353 — a step runs only when the change reaches what it reads

Given a step whose record says it walks `docs/` and reads the `.md` files there
When a change edits a `.md` file there, adds or renames a file there, or edits the step itself
Then the step runs

Given the same step
When a change edits a `.ts` file in `docs/` or a file outside it
Then the step does not run, and the set says why for every step

Covered: `projects/agent-kit/tests/push-inputs.test.sh`.

### SC-AK-1354 — a step whose reads are not seen runs on every change

Given a step that reads the history of the tree, or a step the table does not hold
When any change is pushed
Then the step runs

Given there is no table, or the push names no base
When the set is chosen
Then every step runs

Covered: `projects/agent-kit/tests/push-inputs.test.sh`.

### SC-AK-1355 — the table of reads is checked against what the steps read now

Given a table recorded from the steps
When no step and not the table is touched
Then the table check does not run

When a step now reads a mark among the agent's observations, at the root or in a nested directory
Then the table check stays green

When a step now reads a path the table does not cover
Then the table check is red and names the step and the path

Covered: `projects/agent-kit/tests/push-inputs.test.sh`.

### SC-AK-1550 — a file the repository ignores is no read of a step

Given a table recorded on a copy without `.env`, which the repository ignores
When `.env` appears and a step reads it
Then the table check stays green

Covered: `projects/agent-kit/tests/push-inputs.test.sh`.

### SC-AK-1551 — a record keeps the kinds of processes the table already held

Given a table recorded on a copy where a step starts a process
When the table is recorded again on a copy where the step does not start it
Then the entry of the step still names the process
And the table check on the first copy stays green
And a table first recorded on the copy without the process is refused once on the first copy, and after one record there the check is green on both copies

Covered: `projects/agent-kit/tests/push-inputs.test.sh`.

### SC-AK-1594 — a new process kind of a step that runs always is no refusal

Given a table where a step is recorded with the process it starts
When on another copy the step also starts a process of another kind
Then the table check stays green

Covered: `projects/agent-kit/tests/push-inputs.test.sh`.

### SC-AK-1595 — the filter of ignored files survives an unusual path

Given a step that reads an ignored file with a non-ASCII name, `.env` and a path beyond a symbolic link
When the table is recorded
Then neither the non-ASCII file nor `.env` is a read of the step

Covered: `projects/agent-kit/tests/push-inputs.test.sh`.

### SC-AK-1596 — a global ignore file of the machine does not hide a read

Given a machine whose global ignore file hides a file a step reads, and `.env` ignored by the repository
When the table is recorded
Then the hidden file stays a read of the step and `.env` does not

Covered: `projects/agent-kit/tests/push-inputs.test.sh`.

### SC-AK-1597 — a draft outside the history is no read of a step

Given a table of a step that reads every file of a directory
When a draft file and an untracked directory appear in that directory without being ignored
Then the table check stays green
And once the draft is taken into the history, the check refuses until the table is recorded again

Covered: `projects/agent-kit/tests/push-inputs.test.sh`.

### SC-AK-1166 — the push gate names every red light check by one refusal

Given the gate set holds two red light checks, a green one between them and a heavy one after them
When the guard judges the push
Then the refusal names both red lines and the tail of each output. The green one is not named. The
heavy one is not started and is named as held

Covered: `projects/agent-kit/tests/git-guard-push-tests.test.sh`.

### SC-AK-1814 — a call that hides the exit code of the run ahead is refused

Given a call that runs the set ahead
When `;`, a newline or `||` follows the set and the next command prints no `$?`, or a pipe follows it
with no `PIPESTATUS` and no `set -o pipefail`, or the set stands under `&` or `!`, or a chain of `&&`
after it ends with `;` and no `$?`
Then the call is refused, and the refusal names what hid the code, the ready form with a log outside
the working copy and the read of the `push ahead:` line

Covered: `projects/agent-kit/tests/push-ahead-call-guard.test.sh`.

### SC-AK-1815 — a call whose code of the run ahead shows passes

Given a call that runs the set ahead
When the set stands alone, with its output redirected, chained by `&&` to the end of the call,
followed by `$?`, or piped with `PIPESTATUS` after it or `set -o pipefail` before it
Then the call passes

Covered: `projects/agent-kit/tests/push-ahead-call-guard.test.sh`.

### SC-AK-1816 — a text that only names the run ahead passes

Given a call that names the script without running it — a search, a read, a heredoc, `printf` into a
file, a quoted commit message, `bash -n`
When the guard judges the call
Then the call passes; a run inside `bash -c` is judged by its inner text

Covered: `projects/agent-kit/tests/push-ahead-call-guard.test.sh`.

### SC-AK-1821 — a red set in the ready form ends with a nonzero code

Given a tree whose set holds a red check
When the set runs ahead in the ready form, its output in a log
Then the call ends with a nonzero code, and the last `push ahead:` line of the log says red

Covered: `projects/agent-kit/tests/push-ahead-call-guard.test.sh`.
