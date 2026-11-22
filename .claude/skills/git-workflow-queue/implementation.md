# git-workflow-queue — what is its own here

The bindings of this tree for the part `git-workflow-queue` of the delivery rule, next to its `SKILL.md`.
The names of delivery and the rest of what is its own here are in the companion of
`git-workflow`.

## Where the articles are carried out

The first column is the article verbatim, as it is written in the section «How the law applies
here».

- **An open task standing in a closing column is a discrepancy.** — `tools/check-board.mjs:CLOSING_STATUSES` — «✅ Done» and «Deployed», by the keys `done` and `deployed` of `board.statusOptions`. A line per such task; it names the return move `npm run task:move -- <number> <column>`.
- **A task left in the first column opens no PR.** — `.claude/rt-kit/project.sh:RT_BOARD_BACKLOG` — «📋 Backlog»; it is read by `.claude/hooks/git-guard-delivery.sh:check_task` on opening a PR; on creating a branch the column is not asked.
- **One's own open PRs are reread in three places: before a push, on taking a task and after every known merge.** — `tools/board.mjs:behindMain` together with `tools/check-board.mjs` name the lagging and the conflicting requests; between audit runs this is held by the order of the pattern `git-workflow-stack`.
- **A conflicting PR of a neighbouring session is not one's own.** — `.claude/hooks/git-guard-delivery-conflict.sh:rt_delivery_led_branch` — the branch counts as one's own when this working copy led it. The record of switches belongs to the copy; the branch refs are shared by every copy of the tree.
- **The task key is set once, and all three name forms derive from it.** — `.claude/rt-kit/checks.json:taskKey` — from there it is taken by the task creation, by the delivery guard and by the queue audit.
- **An unset key refuses work with the queue on the spot.** — `tools/board.mjs:TASK_KEY` — an empty value ends the very first call with a refusal saying where the key is set.
- **A created task is confirmed by the work queue's answer, not by the creation command's output.** — `tools/task-new-queue.mjs:confirmInQueue` — as its fifth step the command asks the board by the number and prints the presence, the column and the assignee; a divergence ends it with a non-zero code.
- **The visibility of what was created is checked by the side it is meant for.** — `tools/task-new-queue.mjs:confirmInQueue` — the fifth step asks the board by a separate call rather than reading the creation's answer; for a request there is no such thing — its visibility is named to the owner by the number and checked by them. Whose eyes the answer was taken by is printed by the field `viewer` — `tools/board.mjs:viewerOf`: `machine` on reading a task with a token, `client` on reading a request.
- **A refusal is read before it is bypassed by a second way.** — Not checked by a machine: bypassing a refusal is indistinguishable from a call that went the second way from the start. The sign is asked of the host — `/opt/homebrew/bin/gh api rate_limit`: a limited account has zero there.
- **The branch number and the PR title number are checked on the spot, the task state — by the board.** — `.claude/hooks/git-guard-delivery.sh:check_task` reads the number from the branch name and matches it against the number in the PR title. The second tier is `npm run check:board`, which also shows the assignee and the column.
- **The epic card moves by the same command, on the epic number, at two moments.** — `tools/board.mjs:moveTask` — the call on the epic number right after the first task's branch is created. The second call — right after the PR of the epic opens. No guard reads the epic card's column.
- **The task column moves in the same motion as the work.** — `.claude/skills/git-workflow/scripts/board.sh:cmd_status` — the call right after the branch is created and right after the PR is opened.
- **The board holds tasks, not PRs about them.** — `tools/check-board.mjs:foreign` — a line per PR card. They are created by the board's built-in rule "Auto-add to project", it is switched off only in the interface, and what has accumulated is removed by `deleteProjectV2Item`.
- **Tasks fixed by one edit are merged before the merge.** — Not checked by anything: merging two tasks into one is indistinguishable to a machine from closing the second. Held by reading — the absorbed one is appended to the first and leaves the board before the PR merge.
- **One's own drafts are judged all at once, not only the checked-out branch's.** — `.claude/hooks/git-guard-draft-ready.sh:judge_abandoned` — the list of open drafts is asked for by the machine account name from `.claude/rt-kit/checks.json`; a foreign branch's folder is read by `origin/<branch>`, and its absence by `carries_folder`. Only a draft of a branch this copy had checked out is judged, read from its journal of HEAD. A draft under a branch another working copy holds is that copy's work and is not judged. Scenarios: `tools/tests/git-guard-draft-ready.test.sh`.
- **The board is edited by a GraphQL query by the board id, not by the owner's name.** — `.claude/skills/git-workflow/scripts/board.sh:resolve_project` — the identifier is taken from the board itself rather than assembled from the owner's name.
- **One's own conflicting PR is fixed by the turn's first action, and no new work is taken before that.** — `.claude/hooks/git-guard-delivery-conflict.sh:rt_delivery_conflict` — the delivery guard's helper refuses four work-taking commands while `tools/board.mjs:conflictingPulls` names at least one of one's own open requests as conflicting.
