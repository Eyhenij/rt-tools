# git-workflow — how it is arranged here

The names of this tree, next to the rule `SKILL.md`. A separate file because the rule speaks by
technique and travels between repositories whole, while everything below is true only here and
goes stale at every renaming.

The main difference from the general case: merging into the main branch rolls nothing out here.
The tree publishes packages, and publishing is a separate manual run of a workflow rather than a
consequence of a merge.

## What it is called here

- **In the rule** — Here
- **the main branch** — `main`
- **the work queue** — the project board on GitHub; a task is an issue on it
- **the task column** — the `Status` field: «In progress» when the branch is started, «In review» when the PR is opened
- **the first column** — «📋 Backlog» — the creating command puts a new task there, and from there it is taken into work
- **the label of an epic card** — `.claude/rt-kit/project.sh:RT_BOARD_EPIC_LABEL` — «epic». By it `.claude/hooks/git-guard-delivery-epic.sh:rt_epic_own_pull` tells the branch of an epic from the branch of a task. The same word stands as `board.epicLabel` in the checks settings.
- **the column move command** — `npm run task:move <number> <short column name>`: `npm run task:move 899 in-progress`
- **a short column name** — a key in `board.statusOptions` of the file `.claude/rt-kit/checks.json`; the full name lies there too, next to it
- **the task key** — `RT` — named in `.claude/rt-kit/checks.json`, by the key `board.taskKey`
- **the task title** — `[RT-<task number>] <What is wrong>`: `[RT-88] Add select button component`
- **the branch name** — `RT-<task number>-<short name>`: `RT-88-add-select-button`
- **the kind of edit** — `feat`, `fix`, `refactor`, `docs`, `chore`, `style`, `perf`, `test`, `build`, `ci`
- **the line linking to the task** — `Closes #<number>` in the PR body
- **the machine work account** — `rt-tools-dev` — a commit is signed by it, a task is created and a PR is opened by it; it is never a reviewer
- **the token substitution into a call** — `.claude/rt-kit/project.sh:RT_PULL_TOKEN_VAR` — `GH_TOKEN`; the ready-made line for the guard's refusal is there too, `RT_PULL_TOKEN_HINT`
- **the request body section about the remaining step** — `.claude/rt-kit/project.sh:RT_PULL_BODY_SECTION` — the heading «Оставшийся шаг»: the delivery guard demands it in the body of every request

## Where it lives

- **the machine account token** — `~/.config/rt-tools-bot-token` — outside the tree, it never gets into the history
- **the active account of the hosting client** — the owner's account; it is asked by `gh auth status` — the line "Active account: true" stands next to one account. The machine account is substituted into a call by the `GH_TOKEN` variable and is not made active: signing in under it takes every neighbouring session on the machine along
- **working with the board** — `.claude/skills/git-workflow/scripts/board.sh`
- **gathering the branch state before a PR** — `.claude/skills/git-workflow/scripts/gather-context.sh`
- **the forms of the PR description and of the changelog** — `.claude/skills/git-workflow/REFERENCE.md`
- **the main branch, delivery and push guards** — `.claude/hooks/git-guard-main.sh`, `git-guard-delivery.sh`, `git-guard-push-tests.sh`
- **the guard of the pair "an edit and its document"** — `.claude/hooks/docs-guard.sh`
- **the tree profile for the guards** — `.claude/rt-kit/project.sh`
- **the commit subject check** — `commitlint.config.cjs`, called by a git hook from `.husky/commit-msg`

## What is carried over into a new working tree

`git worktree add --detach <path> origin/main` unfolds the index and nothing more. Copied by hand:

- **`.env`** — the keys the tree's scripts live by
- **`.claude/settings.local.json`** — the local permissions; without them the session asks for confirmation on every command
- **`.claude/rt-kit/browser-device-id`** — the pinned browser device identifier — a new one is neither started nor asked for

Then `pnpm install` in the new tree: working trees do not share `node_modules`.

## Where the articles are carried out

The first column is the article verbatim, as it is written in the section "How the law applies
here" (the bold part of the item). An article without a line and a line without an article are a
divergence: the rule promises what the tree does not have, or the tree holds what the rule is
silent about.

- **A commit into the main branch is refused by the guard.** — `.claude/hooks/git-guard-main.sh:default` — the main branch name is taken from the remote ref and matched against the current one; registered in `.claude/settings.json` on a shell call.
- **A branch without a task number opens no PR.** — `.claude/rt-kit/project.sh:rt_task_branch_ok` — the form `RT-<number>-<name>`; it is called by `.claude/hooks/git-guard-delivery.sh`.
- **Work begins with the epic, and the branch of a task is taken from the epic branch.** — `.claude/hooks/git-guard-delivery-epic.sh:rt_epic_base`. The base named by the command is judged against the branch of the epic. The epic comes from the state of the task, and the branch of the epic is looked for among the remote refs by its number. The branch line with that base is printed by `tools/task-new.mjs:epicBranchOf`, which reads it from the header of the epic plan.
- **The PR of a task has the epic branch as its base — `gh pr create --base <ветка эпика>`.** — `.claude/hooks/git-guard-delivery-epic.sh:rt_epic_pull_base`. The base is read from the command. Not named at all, it means the default branch of the repository — the same case. A request already open is judged by `tools/board-epics.mjs:checkEpicPullBase`.
- **The PR of an epic into the main branch opens after all its tasks are merged and their folders are taken apart.** — `.claude/hooks/git-guard-delivery-epic.sh:rt_epic_own_pull`. The folders lying in the branch are read from its content. That the tasks of the epic are over is read by `tools/board-epics.mjs:checkEpicState` — by the queue and by the open requests.
- **The epic branch carries the plan of the epic and the merges of its tasks, and no edits of its own.** — **Not checked by anything.** An edit in the epic branch is an ordinary commit, and there is nothing to tell it from a merge of a task apart from its parents. Held by this article.
- **The next work's branch is taken from the previous one while the chain is unbroken.** — **Not checked by anything.** The delivery guard judges the shape of the branch name and the freshness of the base, and the kinship of neighbouring branches is invisible to it. A branch off the previous one and a branch off main are the same to it. Held by the order of the pattern `git-workflow-stack`.
- **A PR in a chain has the previous branch as its base, not main.** — **Not checked by anything.** The base of a request is read from the host, and which of the two is right is known only by whoever branched. For work unrelated to the previous one the base is main, and that is lawful.
- **A chain is merged bottom-up, and the order stands in every PR body.** — **Not checked by anything.** The queue audit reads the request body as text; it has nothing to tell a named order from its absence.
- **`--hard` is not taken to drop a commit — that is `--soft`, and the working tree stays as it is.** — `.claude/hooks/git-guard-discard.sh:hits` — the discarding verb is read from the command text. The tree is read by `git status --porcelain` in the directory of the call. The bypass is the comment `# discard: <reason>` in the same command.
- **The lower branch of a chain does not rewrite history — neither `rebase` nor a force push.** — `.claude/hooks/git-guard-delivery.sh:cmd` — a force push is refused by parsing the command line; a `rebase` in a branch with another one under it is judged by nothing.
- **A divergence inside a chain is resolved by the one who branches.** — **Not checked by anything.** Who resolved a divergence is not written down in the history: a merge looks the same by whichever hand it was made.
- **On a machine with several runners, any path from the home directory is shared.** — **Not checked by anything.** Neither a guard nor an audit knows how many runners stand on the machine: the host has one list of pipeline steps, and the machine is shared by them only in fact. Held by the article and by per-project names in the pipeline settings
- **The working tree is not emptied for a tool run.** — **Not checked by anything.** Stashing is indistinguishable by the shape of the command from a lawful branch switch: both take the edits off the working copy, and which of them is for a run and which for the work is invisible to a machine
- **The main branch is merged into the epic branch, and the epic branch into the branches of its tasks — while the work runs, not before the hand-over.** — `.claude/hooks/git-guard-delivery.sh:remote_main` — the tip of the main branch is asked of the remote ref and matched against the current branch's ancestors; the divergence is named by a number of commits.
- **Unmet delivery conditions are named in one refusal.** — `.claude/hooks/git-guard-delivery.sh:deny_faults` — the accumulator `fault` gathers them along the parsing and prints them as one refusal only before the exit.
- **A condition known at the start of work is asked at the start.** — `.claude/hooks/git-guard-delivery.sh:branch_arg` — on `git checkout -b` and `git switch -c` the tip of the main branch at the host is asked of the base, and `git config user.email` is asked against `RT_COMMIT_EMAIL`. Flags between the verb and `-b` the sample accepts.
- **The base judged is the one named by the command, not the tip of the working copy.** — `.claude/hooks/git-guard-delivery.sh:base_ref` — by the second argument of the branch-creating command; with no named base the tip of the working copy is judged, with one unknown to the tree nothing is judged.
- **A branch without a task number gets no delivery conditions.** — `.claude/hooks/git-guard-delivery.sh:branch_arg` — a name without the form `RT-<number>` takes the guard out with zero, asking neither about the base nor about the signature.
- **A task left in the first column opens no PR.** — `.claude/rt-kit/project.sh:RT_BOARD_BACKLOG` — «📋 Backlog»; it is read by `.claude/hooks/git-guard-delivery.sh:check_task` on opening a PR; on creating a branch the column is not asked.
- **The draft is not lifted from a branch that does not merge.** — `.claude/hooks/git-guard-delivery-draft.sh:conflicting` — mergeability arrives in the same answer as the reviewer and the review; with no field there is no requirement.
- **One's own open PRs are reread in three places: before a push, on taking a task and after every known merge.** — `tools/board.mjs:behindMain` together with `tools/check-board.mjs` name the lagging and the conflicting requests; between audit runs this is held by the order of the pattern `git-workflow-stack`.
- **One's own conflicting PR is fixed by the turn's first action, and no new work is taken before that.** — `.claude/hooks/git-guard-delivery-conflict.sh:rt_delivery_conflict` — the delivery guard's helper refuses four work-taking commands while `tools/board.mjs:conflictingPulls` names at least one of one's own open requests as conflicting.
- **A second working copy is for reading, and the call goes from the copy the session stands in.** — `.claude/hooks/git-guard-push-tests.sh:moved_root` — the move at the start of the call names the other copy; the roots differ, and the gate refuses.
- **The form of a branch name is judged by the tree the command runs in.** — `.claude/hooks/git-guard-delivery-tree.sh:rt_delivery_branch_form_ok` — the tree is taken from the move at the start of the call; without a move the session's own profile answers.
- **A conflicting PR of a neighbouring session is not one's own.** — `.claude/hooks/git-guard-delivery-conflict.sh:rt_delivery_led_branch` — the branch counts as one's own when this working copy led it. The record of switches belongs to the copy; the branch refs are shared by every copy of the tree.
- **A conflicting open PR is a work queue audit discrepancy.** — `tools/check-board.mjs:checkConflicting` — only an outright "conflicts" is judged; mergeability not yet counted gives no line.
- **An index that branches only append lines to is declared a union of both sides.** — Not checked: the merge setting is read by no audit of the tree, and the host does not read it at all. The declaration lies in `.gitattributes` — the table of the records of the past and the table of the agreement domains.
- **An edit brought to a commit is brought to the host in the same turn.** — Not carried out: the executor's working tree is seen by no check. Held by this article.
- **The working tree is emptied before the PR opens, not after.** — Not carried out: the executor's working tree is seen by no check. The delivery guard judges the opening call, not what is left uncommitted next to it. Held by this article.
- **A push into a branch that has an open PR is followed by rereading its body.** — Not carried out: no check reads a PR body at all. The queue audit judges the fact of a run on the tip, not what the body says about it. Held by this article.
- **The draft is not lifted while the PR has no review.** — `.claude/hooks/git-guard-delivery-draft.sh:rt_pull_state` — the PR state arrives from `tools/board.mjs`, and a requested reviewer or a review left by someone other than the author counts as a review.
- **The task key is set once, and all three name forms derive from it.** — `.claude/rt-kit/checks.json:taskKey` — from there it is taken by the task creation, by the delivery guard and by the queue audit.
- **An unset key refuses work with the queue on the spot.** — `tools/board.mjs:TASK_KEY` — an empty value ends the very first call with a refusal saying where the key is set.
- **A created task is confirmed by the work queue's answer, not by the creation command's output.** — `tools/task-new.mjs:describeTaskState` — as its fifth step the command asks the board by the number and prints the presence, the column and the assignee; a divergence ends it with a non-zero code.
- **The visibility of what was created is checked by the side it is meant for.** — `tools/task-new.mjs:describeTaskState` — the fifth step asks the board by a separate call rather than reading the creation's answer; for a request there is no such thing — its visibility is named to the owner by the number and checked by them. Whose eyes the answer was taken by is printed by the field `viewer` — `tools/board.mjs:viewerOf`: `machine` on reading a task with a token, `client` on reading a request.
- **A refusal is read before it is bypassed by a second way.** — Not checked by a machine: bypassing a refusal is indistinguishable from a call that went the second way from the start. The sign is asked of the host — `/opt/homebrew/bin/gh api rate_limit`: a limited account has zero there.
- **The branch number and the PR title number are checked on the spot, the task state — by the board.** — `.claude/hooks/git-guard-delivery.sh:check_task` reads the number from the branch name and matches it against the number in the PR title. The second tier is `npm run check:board`, which also shows the assignee and the column.
- **The task column moves in the same motion as the work.** — `.claude/skills/git-workflow/scripts/board.sh:cmd_status` — the call right after the branch is created and right after the PR is opened.
- **The board holds tasks, not PRs about them.** — `tools/check-board.mjs:foreign` — a line per PR card. They are created by the board's built-in rule "Auto-add to project", it is switched off only in the interface, and what has accumulated is removed by `deleteProjectV2Item`.
- **A lagging column is found by the queue audit, not by eye.** — `tools/check-board.mjs:IN_REVIEW` — the column is judged by the open PRs both ways: a PR whose task is not in review and a review without an open PR.
- **A branch with an open PR lags behind its base silently.** — `tools/board.mjs:behindMain` — a comparison of the main branch with the head of every open request; the line is printed by `tools/check-board.mjs`.
- **The link between a task and an epic is read by the audit both ways.** — `tools/board-epics.mjs:checkEpicLinks` — the contents of an epic are read in the plan named by its card's body, and the body of every task at the host; a divergence is named both ways, and without an epic label the check stays silent.
- **Tasks fixed by one edit are merged before the merge.** — Not checked by anything: merging two tasks into one is indistinguishable to a machine from closing the second. Held by reading — the absorbed one is appended to the first and leaves the board before the PR merge.
- **Work that one session cannot close is marked in two places, and they are audited.** — `projects/agent-kit/assets/checks/board-long-work.github.mjs:checkLongWork` — both sides: a card label without a line in the work line and a line without a label. The label name and the directory of the lines are named by the key `longWork` in `.claude/rt-kit/checks.json`; with either of the two unnamed the link is not judged at all. Scenario SC-AK-823
- **The tip of an open PR without a run is seen by the work queue audit, unless the pipeline does not wake for its base.** — `tools/check-board.mjs:checkHeadRun` — the runs on the tip are asked for while the file of the pipeline named by the settings lies in the tree, and a fresh tip is given ten minutes; a request whose base is not the main branch is passed over by `tools/board-pull-state.mjs:baseRefName`.
- **What checks a PR whose base is not the main branch is asked before the first PR of an epic opens.** — `.github/workflows/ci.yml:branches` — the trigger here is narrowed to the main branch: a request into an epic branch gets no run at all, and the only check behind such work is the push gate.
- **A run pushed out of the pipeline queue gets a separate audit line.** — `tools/board-pull-state.mjs:checkEvicted` — the sign is taken from the number of the run's jobs: `tools/board-runs.mjs:evictedOnHead` asks for it only on cancelled ones, and a green run on that same tip removes the line.
- **A draft with a green run on its tip is an audit discrepancy.** — `tools/board-pull-state.mjs:checkReadyDraft` — the colour of the run is asked for only on a draft: green on it means the work is ready, while the merge button is blocked for the owner.
- **One's own drafts are judged all at once, not only the checked-out branch's.** — `.claude/hooks/git-guard-draft-ready.sh:judge_abandoned` — the list of open drafts is asked for by the machine account name from `.claude/rt-kit/checks.json`; a foreign branch's folder is read by `origin/<branch>`, and its absence by `carries_folder`.
- **Opening a PR is refused while the branch carries its task folder.** — `.claude/hooks/git-guard-delivery-folder.sh:rt_delivery_open_folder` — the tier on `gh pr create`; the second line on `gh pr merge` is `rt_delivery_merge_folder`. The task directory is `docs/tasks`, the archive directory `docs/archive`, the main branch `main`.
- **A document goes in the same commit as the edit.** — `.claude/rt-kit/project.sh:rt_docs_pair_for` — the pairs of this tree: a second-kit component's description next to it and the token set description on an edit of the tokens themselves; they are watched by `.claude/hooks/docs-guard.sh`.
- **The commit subject is checked against the format on the spot.** — `commitlint.config.cjs:rules` — the bundle `@commitlint/config-angular` plus the rule `subject-russian`: the description is written in Russian. It is called by a git hook from `.husky/commit-msg`, that is, it judges the hand; a pipeline commit goes past the hook, and the language there is held by the release templates themselves. The cases are `projects/agent-kit/tests/tree-commit-language.test.sh`.
- **Before a push all linters are run, not one.** — `.claude/rt-kit/project.sh:rt_push_checks` — lint, types and specs over the affected, then the styles linter separately: the code linter does not read styles files at all. The set is called by `.claude/hooks/git-guard-push-tests.sh`.
- **The build is in the set on a par with lint and unit tests.** — `.claude/rt-kit/project.sh:rt_push_checks` — the build stands in the same set: a type error in uncovered code turns red nowhere before it.
- **The gate set calls the package default instead of listing it line by line.** — `.claude/rt-kit/project.sh:rt_push_checks` — the profile's own function calls `rt_push_checks_default` and appends the tree's checks to it; what is sifted out is named by name in it too.
- **The final set before a push is read from the state review, not assembled in the head.** — `projects/agent-kit/src/lib/push-gate.ts:pushGateLines` — the section is printed by `pnpm exec agent-kit doctor`. In this tree, under the heading about what the default printed and the set lacks, there stand three lines — those are replacements of the same checks by variants of one's own, not a removal of the guard.
- **The push gate set is never narrower than the pipeline set.** — `tools/check-push-gate.mjs:pipelineSteps` against `pushGate` in `.claude/rt-kit/checks.json`; the check itself stands as a line in `rt_push_checks`. How many pipeline steps are closed by what it prints on every run — the numbers here are not rewritten.
- **An exclusion reason naming a task is judged on whether that task is alive.** — `tools/check-push-gate.mjs:taskNumbers` — the number is taken out by the task key from `.claude/rt-kit/checks.json`, and the liveness is asked of `tools/board.mjs:taskState`; with no network or no access the poll ends silently.
- **The layout audit stands in the push gate set on a par with lint and the build.** — `.claude/rt-kit/project.sh:rt_push_checks` — the first line of the set is `pnpm run agent-kit:check`: the rules package lies in this same tree, so the audit first rebuilds it and only then reads the built output. The package default prints its own form — `projects/agent-kit/assets/defaults/project.sh:rt_push_checks_default`.
- **After merging the base in, the check set is revised by what the branch now carries.** — Not checked by anything: the guard sees the set but does not know what exactly the merge brought. Held by the checklist before publishing the PR.
- **The main branch is taken by the remote ref — in words and in actions.** — `.claude/hooks/git-guard-push-tests.sh:main_branch` — the base is taken from the remote ref rather than from the local tip. The statement to the owner is not guarded by this: a network call inside the parsing of a command would fall together with the connection. The session-closing steps — pulling main in, counting what is merged and what is not — take that same ref, and nothing guards them: the command is read by the session, not by a check
- **A code edit is handed to a person by an open PR, not by a pushed branch.** — Not checked by anything: the delivery guard judges the opening of a PR but not its absence — work that ended with a push and never reached a PR it does not see at all. Held by this article and by the memory record about delivery.
- **What is not ready to merge opens as a draft — `gh pr create --draft`.** — Not checked by anything: the guard sees the call `gh pr create` and its keys, but does not know whether the plan's stages are closed. Held by the article and by the pattern `git-workflow-commit`.
- **A PR the pipeline does not wake for opens ready, without `--draft`.** — `.github/workflows/ci.yml:branches` — the trigger here is `pull_request` narrowed to `main`, so a PR into an epic branch gets no run and opens ready. The guards do not read the pipeline file: which bases wake a run is read from it by hand before the opening.
- **The PR body is written in the turn the PR opens, and next to the sample.** — **Not checked by anything.** The body lives in a file that disappears after the call, and no audit reads it. The queue audit finds only the consequence — a request without a line linking to the task.
- **The draft is lifted by a separate call — `gh pr ready <номер>`.** — The call itself is not demanded by a guard: the completeness of the work is invisible to a machine, and the sign here is the second message to the owner from the pattern `task-flow-close`. It is judged the other way round — `.claude/hooks/git-guard-delivery-draft.sh:pull_ref` refuses lifting the draft from a PR without a review.
- **The PR merge is pressed by a person, not by the work's executor.** — `.claude/hooks/git-guard-delivery-folder.sh:rt_folder_in_branch` — on the call `gh pr merge` the guard judges the task folder; the ban itself is closed by no check and will not be: the owner merges by a button in the browser, where there are no hooks at all.
- **The identity of the call opening a PR is guarded by the delivery guard, not by the executor's memory.** — `.claude/hooks/git-guard-delivery.sh:pull_token_var` — the substitution of `GH_TOKEN` is looked for in the text of the request-opening command; the request author is asked of `tools/board.mjs:pullState` on lifting the draft and matched against `RT_TASK_BOT`. Both strings are declared by the tree profile.
- **The PR author cannot be its reviewer.** — `tools/board.mjs:pullState` — the PR's author is struck out of its reviewers, and a review request on oneself does not count as a review. This is asked on lifting the draft; at the other points it is held by the article and by the section about the machine account below.
- **The host client call goes from the tree, and a command chain does not check the outcome.** — **Not checked by anything.** The directory the client was called from is invisible to the guards: they read the text of the command, not the working directory of the call. Held by reading the request body back in the same turn
- **PR labels, assignee and reviewer are set by `gh api` calls, not by `gh pr edit`:** — Not checked by anything: the guard judges the PR-opening call, not what its fields are edited by afterwards. Held by the article — on a repository with the old board `gh pr edit` never reaches the edit at all.
- **The board is edited by a GraphQL query by the board id, not by the owner's name.** — `.claude/skills/git-workflow/scripts/board.sh:resolve_project` — the identifier is taken from the board itself rather than assembled from the owner's name.
- **The machine commit's email is copied from the companion, not typed from memory.** — `.claude/rt-kit/project.sh:RT_COMMIT_EMAIL` — the same string as in the section about the signature below; `.claude/hooks/git-guard-delivery.sh` refuses a push if a commit of the branch's contribution named itself the machine account with a different address.
- **The identity of the machine account is confirmed by the host's answer:** — Not checked by anything: the guard matches a string against a string and does not ask the host at all — a network call would fall together with the connection. Held by the command from the section about the signature below, when the account is created and when its address changes.
- **Guard scenarios set the git settings themselves, not take them from the machine.** — `projects/agent-kit/tests/git-guards.test.sh:gpgsign` — the author, the mail and the signing are passed by `-c` flags straight into the command rather than inherited from the machine's shared config.
- **Every commit of the branch's contribution is signed by the machine account, and the push set checks it.** — `.claude/rt-kit/project.sh:RT_HUMAN_EMAILS` — the mails of this tree's people; a commit under an account outside the list is refused by `.claude/hooks/git-guard-delivery-signature.sh:rt_delivery_signature`
- **Every commit of the branch's contribution is signed by the machine account, and the push set checks it.** — **Not checked here.** The tree's push gate judges the signature of every commit of the contribution; the package delivery guard looks only at a commit that named itself the machine account
- **The PR state is reread from the host right after publishing.** — **Not checked by anything.** The return code of a silently skipped request is the same as of one that was made; held by the request pattern
- **The author of an open PR and whether it has a reviewer are audited by the work queue.** — **Not checked here.** `tools/check-board.mjs` asks the host for the column, the run and the mergeability of open requests, and does not yet judge the author and the reviewer — that is named as separate work
- **The host client's active account is chosen per machine, not per tree; the machine account is substituted per call, never made active.** — **Not checked by anything.** Signing into the client changes the state of the machine, while the guards judge the tree's calls. Held by the article; the active account is asked by `gh auth status`.
- **Reviewers are asked by a REST call, not by the client's selection.** — **Not checked by anything.** The client's selection is assembled by a GraphQL query and falls whole under the machine account token; the choice of way is held by this article
- **A wave of branches off one epic branch is checked by a trial merge, not one by one:** — **Not checked by anything.** A check judges one branch, while a collision lives between branches, and before a merge nothing sees it. Held by the pattern `git-workflow-stack`.

## What else is worth knowing when reading the code

- A PR is merged only by an ordinary merge: squash merges are switched off in the repository.
- **`lint-staged` reformats files right inside the commit.** A pattern replacement written for a
  one-line binding misses after the first commit: the formatter has already laid it out over
  several lines, and the next identical edit fires not everywhere. A mass edit of templates
  either goes whole before the first commit or is repeated by the fact — rather than counted as
  done by the number of matches.
- Files are added to a commit by explicit paths. Foreign tools add to the index themselves, so
  before every commit what is actually in the index is read.
- A bare call of `git` or `gh` on this machine may go into an account-picking shell; the reliable
  call is with the `command` prefix.
- **`gh` is signed in under the owner's account and by itself does not work from the machine
  one.** Everything that must go from it — creating a task, opening a PR, moving the column — is
  called with the token in the call's environment:

    ```bash
    GH_TOKEN=$(cat ~/.config/rt-tools-bot-token) command gh pr create …
    ```

    `gh auth login` under the machine account is not done: it would wipe the owner's sign-in in
    `hosts.yml`. The token is read into the call's environment and is not printed.

- **The former machine account was limited by the host, and the work moved to a new one.**
  `rt-tools-agent` answered "not found" to everyone but itself from 14 August 2026: the tasks and
  PRs created by its token did not exist for the owner or for the audits, and tasks had to be
  created under the owner's account. Since 18 August the work goes from `rt-tools-dev` — its
  profile is visible to all, it stands as the assignee of tasks, and the workaround with a
  foreign assignee is gone. Checked by the same call: `gh api users/rt-tools-dev` answers with a
  profile rather than "not found".

- **A PR is opened by the machine account, not by the owner's.** The executor opens their own PR
  themselves: a request opened by the owner never has a reviewer at all — an author cannot be a
  reviewer, and a review is demanded by the draft-lifting guard. The request is opened by the
  machine account's token:

    ```bash
    GH_TOKEN=$(cat ~/.config/rt-tools-bot-token) command gh pr create --draft --base main \
        --head <branch> --title '<title>' --body-file <file>
    ```

    The assignee is set to it as well, the reviewer to the owner; both `gh api` calls go with that
    same token. A request opened by the wrong account is fixed only by reopening: its author
    cannot be changed.

- **A PR being invisible to the machine account was a property of the former account, not of
  machine work in general.** `rt-tools-agent` opened a request successfully, while the host
  answered the owner "not found" both about it and about the account's own profile — that is how
  one PR was opened, never seen and closed by hand. With the move to `rt-tools-dev` on 18 August
  2026 the limitation is gone: request #1008, opened by it, is visible to the owner both in the
  list and by number. A statement about visibility is not remembered but asked — by calls from the
  owner, without a token:

    ```bash
    /opt/homebrew/bin/gh pr list --json number,author     # the machine account's request stands in the list
    /opt/homebrew/bin/gh pr view <number> --json author   # answers with an author, not with a refusal
    ```

    `gh pr create --draft` works under both accounts: a draft is a property of the request, not of
    the account.

- **The work queue is not edited by this account at all, and the tree no longer names a token for
  it.** The machine account's query-language quota is not exhausted but equal to zero — while the
  board lives only there. The host answers with a text about an exhausted limit, and it reads as
  temporary, though it does not count as passing:

    ```bash
    GH_TOKEN=$(cat ~/.config/rt-tools-bot-token) command gh api rate_limit --jq '.resources.graphql'
    ```

    So the key `board.tokenPath` in `.claude/rt-kit/checks.json` is gone: the queue audit, the
    column move and the task creation go under the account `gh` is signed in as, that is, the
    owner's. Should the account come back, the key is named again, and the harness takes it
    without edits. This does not concern the commit signature: it is read on the machine, from
    `RT_COMMIT_EMAIL`, and asks the network for nothing.

- **The send to the host goes with that same token, not with the one the keychain gives out.** The
  `osxkeychain` helper answers with an account from a foreign tree, and the send falls on `403`
  with a name that should not be here. The remote repository address is not rewritten with the
  token — it would lie in `.git/config` in plain text:

    ```bash
    git -c credential.helper= \
        -c credential.helper='!f() { echo username=x-access-token; echo "password=$(cat ~/.config/rt-tools-bot-token)"; }; f' \
        push -u origin <branch>
    ```

- **The commit signature is set by the command's own variables**, not by `git config user.*`: the
  config is shared and would rewrite the owner's signature. There is no signing in the tree —
  `commit.gpgsign` is on while the key lies behind the password manager, so a machine commit goes
  with `-c commit.gpgsign=false`:

    ```bash
    GIT_AUTHOR_NAME="rt-tools-dev" GIT_AUTHOR_EMAIL="317887029+rt-tools-dev@users.noreply.github.com" \
    GIT_COMMITTER_NAME="rt-tools-dev" GIT_COMMITTER_EMAIL="317887029+rt-tools-dev@users.noreply.github.com" \
        git -c commit.gpgsign=false commit -F -
    ```

    **The mail is copied from here, not typed from memory.** The host matches a service address by
    the number in it, nobody checks the login next to it, and a commit with a foreign number
    leaves signed by an outside person — from the inside the miss is invisible at all. That is how
    eleven commits went into the main branch, and it was fixed by rewriting the history. The tree
    profile holds that same string by the key `RT_COMMIT_EMAIL`, and the delivery guard refuses a
    send on a divergence.

    **The identity of the account is confirmed by the host's answer, not by a string looking
    familiar** — the miss looked familiar. It is asked with the account's own token, and the login
    and the number arrive in one answer:

    ```bash
    GH_TOKEN=$(cat ~/.config/rt-tools-bot-token) gh api user --jq '.login, .id'   # rt-tools-dev, 317887029
    ```

    An answer about oneself is always good, and a search by number only for an unblocked account:
    for the former one `gh api user/314674161` answered "not found" under any token, including its
    own. So the number is checked by the answer about oneself, not by a search by number.

- On a release the changelog is assembled from commit subjects: released sections are not
  rewritten, only the unreleased one is appended to. It travels as a separate commit after the
  branch has left for the host.
- **PR cards are created by the board's built-in rule "Auto-add to project", and it is switched
  off only in the interface.** Through the API the project rules are not edited at all — neither
  `gh project` nor GraphQL changes them — so what has accumulated is removed by a call, while a
  person closes the source. What stands on the board right now:

    ```bash
    /opt/homebrew/bin/gh api graphql -f query='{ node(id: "<board identifier>") {
        ... on ProjectV2 { workflows(first: 20) { nodes { name enabled } } } } }'
    ```

    The accumulated cards are removed one by one, and the item identifier is taken from the board
    itself:

    ```bash
    /opt/homebrew/bin/gh api graphql -f query='mutation { deleteProjectV2Item(input:
        {projectId: "<board>", itemId: "<item>"}) { deletedItemId } }'
    ```

    Ten such cards hung there since April; after the removal `npm run check:board` is silent on
    that line.

- The work plans live in the repository — `docs/plans/<topic>.md` next to `docs/adr/`, and they
  travel in the same commit as the work they describe.

## What this is checked by

- The guards themselves: `git-guard-main.sh` on a commit, `git-guard-delivery.sh` on creating a
  branch and opening a PR, `git-guard-push-tests.sh` on a send to the host.
- Whom the call will go from — before the call, not by the author of an already open PR:

    ```bash
    GH_TOKEN=$(cat ~/.config/rt-tools-bot-token) command gh api user -q '.login'   # rt-tools-dev
    ```

- `pnpm run check:affected` — the same as the send guard runs, only by hand.
- `scripts/board.sh list` — the audit of the columns against the open PRs.
