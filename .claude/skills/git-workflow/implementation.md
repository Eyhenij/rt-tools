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
- **the closing columns** — «✅ Done» by the board rule «Item closed» when the task closes; «Deployed» by the last step of the rollout, `tools/board-deployed.mjs`, for every closed task in Done whose epic is not open
- **closing a task of an epic** — `.github/workflows/close-epic-tasks.yml` — a PR merged into any branch but main closes the tasks from its `Closes #…` lines; into main the host closes them itself
- **the board token in the pipeline** — the repository secret `RT_BOARD_TOKEN`, the machine account's token: the run's own token does not read a user board
- **the label of an epic card** — `.claude/rt-kit/project.sh:RT_BOARD_EPIC_LABEL` — «epic». By it `.claude/hooks/git-guard-delivery-epic.sh:rt_epic_own_pull` tells the branch of an epic from the branch of a task. The same word stands as `board.epicLabel` in the checks settings.
- **the column move command** — `npm run task:move <number> <short column name>`: `npm run task:move 899 in-progress`
- **a short column name** — a key in `board.statusOptions` of the file `.claude/rt-kit/checks.json`; the full name lies there too, next to it
- **adding a column of the board** — from the board interface, by the owner's hand. Never by the mutation `updateProjectV2Field` with the full list of options. The mutation recreates every option under a new identifier. The keys in `board.statusOptions` stop matching, the status of every card is erased, and the board rule auto-archive hides the closed ones. On 14 September 2026 that took 835 cards at once
- **the task key** — `RT` — named in `.claude/rt-kit/checks.json`, by the key `board.taskKey`
- **the task title** — `[RT-<task number>] <What is wrong>`: `[RT-88] Add select button component`
- **the branch name** — `RT-<task number>-<short name>`: `RT-88-add-select-button`
- **the kind of edit** — `feat`, `fix`, `refactor`, `docs`, `chore`, `style`, `perf`, `test`, `build`, `ci`
- **the edit area (scope)** — the list `scope-enum` in `commitlint.config.cjs`: `rt:core`, `rt:store`, `rt:utils`, `rt:ai-chat-protocol`, `rt:ui-kit-v2`, `rt:agent-kit`, `rt:message-bus`, `rt:auth`, `rt:cms`
- **the line linking to the task** — `Closes #<number>` in the PR body
- **the machine work account** — `rt-tools-dev` — a commit is signed by it, a task is created and a PR is opened by it; it is never a reviewer
- **the token substitution into a call** — `.claude/rt-kit/project.sh:RT_PULL_TOKEN_VAR` — `GH_TOKEN`; the ready-made line for the guard's refusal is there too, `RT_PULL_TOKEN_HINT`
- **the request body section about the remaining step** — `.claude/rt-kit/project.sh:RT_PULL_BODY_SECTION` — the heading «Оставшийся шаг»: the delivery guard demands it in the body of every request
- **the request body section with the table of points** — `.claude/rt-kit/project.sh:RT_PULL_POINTS_SECTION` — the heading «Точки»: the delivery guard demands it when a request opens
- **the request body section with the table of the critic** — `.claude/rt-kit/project.sh:RT_PULL_GOAL_SECTION` — the heading «Цель»: the delivery guard demands it when a request opens
- **the line that closes the task** — `.claude/rt-kit/project.sh:RT_PULL_CLOSES_LINE` — `Closes #<номер>` with the branch's number: the delivery guard demands it in the body of every request, whatever the base

## Where it lives

- **the machine account token** — `~/.config/rt-tools-bot-token` — outside the tree, it never gets into the history
- **the active account of the hosting client** — the owner's account; it is asked by `gh auth status` — the line "Active account: true" stands next to one account. The machine account is substituted into a call by the `GH_TOKEN` variable and is not made active: signing in under it takes every neighbouring session on the machine along
- **working with the board** — `.claude/skills/git-workflow/scripts/board.sh`
- **gathering the branch state before a PR** — `.claude/skills/git-workflow/scripts/gather-context.sh`
- **the forms of the PR description and of the changelog** — `.claude/skills/git-workflow/REFERENCE.md`
- **the main branch, delivery and push guards** — `.claude/hooks/git-guard-main.sh`, `git-guard-delivery.sh`, `git-guard-push-tests.sh`
- **the heavy steps of the push set run ahead** — `.claude/rt-kit/project.sh:RT_PUSH_HEAVY_AHEAD` — 1. The snapshots, the end-to-end suites, the affected build and the auth stand run by `bash .claude/hooks/git-guard-push-ahead.sh` in the background. The push guard only reads their green marks: inside it they outgrew the 30-minute hook limit (task RT-3092)
- **the guard of the pair "an edit and its document"** — `.claude/hooks/docs-guard.sh`
- **the tree profile for the guards** — `.claude/rt-kit/project.sh`
- **the commit subject check** — `commitlint.config.cjs`, called by a git hook from `.husky/commit-msg`

## A new working tree

- **A new working tree is created only by the owner's word, asked before it.** It is not created
  for every task: the next task goes in the same tree, on a new branch from a fresh `main`.
- **The tree is born on its own branch from a fresh `main`, not detached and not on a foreign
  branch.** `git fetch origin`, then `git worktree add -b <ветка задачи> <path> origin/main`; the
  next task in it — `git checkout -b <ветка задачи> origin/main` after a fetch.
- **The task and its folder are created inside the tree, not in the main copy.** The main copy
  stands on someone else's branch, and a folder created there stays in its index as litter.
- **An approved tree carries the whole work of the session and nothing else.** No old branch, no
  foreign branch, no leftovers of a previous task: only the branch of the current one.
- **A temporary tree is removed once its work is over and every task of it has reached
  production.** The main copy is permanent and is never removed. Other sessions work in it or in
  trees of their own, so a finished temporary tree is needed by nobody: it is removed as litter,
  together with its branches and the containers of its stands.

The five statements are checked by nothing; they are held by this section. The owner's words of
13.11.2026: «заведение нового дерева нужно спрашивать у человека», «если человек одобрил и ты создал
дерево - ты работаешь там в полный рост, никаких старых веток или прочего мусора».

## What is carried over into a new working tree

`git worktree add -b <ветка задачи> <path> origin/main` unfolds the index and nothing more. Copied
by hand:

- **`.env`** — the keys the tree's scripts live by
- **`.claude/settings.local.json`** — the local permissions; without them the session asks for confirmation on every command
- **`.claude/rt-kit/browser-device-id`** — the pinned browser device identifier — a new one is neither started nor asked for

Then `pnpm install` in the new tree: working trees do not share `node_modules`.

## Where the articles are carried out

The first column is the article verbatim, as it is written in the section "How the law applies
here" (the bold part of the item). An article without a line and a line without an article are a
divergence: the rule promises what the tree does not have, or the tree holds what the rule is
silent about.

- **A commit into the main branch is refused by the guard.** — `.claude/hooks/git-guard-main.sh:default` — the main branch name is taken from `RT_MAIN_BRANCH` of the tree profile, and from the remote ref only when the profile names none; it is matched against the current one. The guard declares its event by the line `# rt-hook: PreToolUse` and is called by the dispatcher.
- **A branch without a task number opens no PR.** — `.claude/rt-kit/project.sh:rt_task_branch_ok` — the form `RT-<number>-<name>`; it is called by `.claude/hooks/git-guard-delivery.sh`.
- **Work begins with the epic, and the branch of a task is taken from the epic branch.** — `.claude/hooks/git-guard-delivery-epic.sh:rt_epic_base`. The base named by the command is judged against the branch of the epic. The epic comes from the state of the task, and the branch of the epic is looked for among the remote refs by its number. The branch line with that base is printed by `tools/task-new.mjs:epicBranchOf`, which reads it from the header of the epic plan. With no epic in the state of the task the same guard returns at once, and the branch grows from the main one.
- **The PR of an epic into the main branch opens after all its tasks are merged and their folders are taken apart.** — `.claude/hooks/git-guard-delivery-epic.sh:rt_epic_own_pull`. The folders lying in the branch are read from its content. That the tasks of the epic are over is read by `tools/board-epics.mjs:checkEpicState` — by the queue and by the open requests.
- **The epic branch carries the plan of the epic and the merges of its tasks, and no edits of its own.** — **Not checked by anything.** An edit in the epic branch is an ordinary commit, and there is nothing to tell it from a merge of a task apart from its parents. Held by this article.
- **The next work's branch is taken from the previous one while the chain is unbroken.** — **Not checked by anything.** The delivery guard judges the shape of the branch name and the freshness of the base, and the kinship of neighbouring branches is invisible to it. A branch off the previous one and a branch off main are the same to it. Held by the order of the pattern `git-workflow-stack`.
- **A chain is merged bottom-up, and the order stands in every PR body.** — **Not checked by anything.** The queue audit reads the request body as text; it has nothing to tell a named order from its absence.
- **`--hard` is not taken to drop a commit — that is `--soft`.** — `.claude/hooks/git-guard-discard.sh:hits` — the discarding verb is read from the command text. The tree is read by `git status --porcelain` in the directory of the call. The bypass is the comment `# discard: <reason>` in the same command.
- **The lower branch of a chain does not rewrite history — neither `rebase` nor a force push.** — **Not checked by anything.** No guard refuses a force push or a `rebase`: the delivery guard names a force push only in a comment. Held by this article and by the pattern `git-workflow-stack`.
- **A divergence inside a chain is resolved by the one who branches.** — **Not checked by anything.** Who resolved a divergence is not written down in the history: a merge looks the same by whichever hand it was made.
- **The working tree is not emptied for a tool run.** — **Not checked by anything.** Stashing is indistinguishable by the shape of the command from a lawful branch switch: both take the edits off the working copy, and which of them is for a run and which for the work is invisible to a machine
- **The main branch is merged into the epic branch, and the epic branch into the branches of its tasks — while the work runs, not before the hand-over.** — `.claude/hooks/git-guard-delivery.sh:remote_main` — the tip of the main branch is asked of the remote ref and matched against the current branch's ancestors. The freshness of a branch of an epic is judged by `.claude/hooks/git-guard-delivery-epic.sh:rt_epic_base`. It asks the tip of the base too, so a merge not sent yet answers by the base.
- **Unmet delivery conditions are named in one refusal.** — `.claude/hooks/git-guard-delivery.sh:refuse` — the unmet conditions are gathered as facts along the parsing and handed to the decider in one call before the exit.
- **A condition known at the start of work is asked at the start.** — `.claude/hooks/git-guard-delivery.sh:branch_arg` — on `git checkout -b` and `git switch -c` the tip of the main branch at the host is asked of the base, and `git config user.email` is asked against `RT_COMMIT_EMAIL`. Flags between the verb and `-b` the sample accepts.
- **The base judged is the one named by the command, not the tip of the working copy.** — `.claude/hooks/git-guard-delivery.sh:base_ref` — by the second argument of the branch-creating command; with no named base the tip of the working copy is judged, with one unknown to the tree nothing is judged.
- **A branch without a task number gets no delivery conditions.** — `.claude/hooks/git-guard-delivery.sh:branch_arg` — a name without the form `RT-<number>` takes the guard out with zero, asking neither about the base nor about the signature.
- **A second working copy is for reading, and the call goes from the copy the session stands in.** — `.claude/hooks/git-guard-push-tests.sh:moved_root` — the move at the start of the call names the other copy; the roots differ, and the gate refuses.
- **The form of a branch name is judged by the tree the command runs in.** — `.claude/hooks/git-guard-delivery-tree.sh:rt_delivery_branch_form_ok` — the tree is taken from the move at the start of the call; without a move the session's own profile answers.
- **An edit brought to a commit is brought to the host in the same turn.** — **Not checked.** The exit guard judges the measured state of the branch and does not count the commits ahead of the remote ref.
- **The main branch is taken by the remote ref — in words and in actions.** — `.claude/hooks/push-set.sh:rt_push_set_base` — the base is taken from the remote ref rather than from the local tip. The statement to the owner is not guarded by this: a network call inside the parsing of a command would fall together with the connection. The session-closing steps — pulling main in, counting what is merged — take that same ref, unguarded. Every `git fetch` is followed by a fast-forward of the local main: `git fetch origin main:main`, or `git merge --ff-only origin/main` standing on it
- **A commit lands with its final content, and a later commit of the same branch does not correct it.** — **Not checked.** The guard sees a commit, not whether its content was checked before it: a fixing commit three steps later looks the same as any other.
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
    test -s ~/.config/rt-tools-bot-token && GH_TOKEN=$(cat ~/.config/rt-tools-bot-token) command gh pr create …
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
    test -s ~/.config/rt-tools-bot-token && GH_TOKEN=$(cat ~/.config/rt-tools-bot-token) command gh pr create --draft --base main \
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
    test -s ~/.config/rt-tools-bot-token && GH_TOKEN=$(cat ~/.config/rt-tools-bot-token) command gh api rate_limit --jq '.resources.graphql'
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
    test -s ~/.config/rt-tools-bot-token && GH_TOKEN=$(cat ~/.config/rt-tools-bot-token) gh api user --jq '.login, .id'   # rt-tools-dev, 317887029
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
    test -s ~/.config/rt-tools-bot-token && GH_TOKEN=$(cat ~/.config/rt-tools-bot-token) command gh api user -q '.login'   # rt-tools-dev
    ```

- `pnpm run check:affected` — the same as the send guard runs, only by hand.
- `scripts/board.sh list` — the audit of the columns against the open PRs.
- `bash tools/tests/board-deployed.test.sh` — the selection of the cards that move to Deployed.
- `node tools/board-deployed.mjs --dry-run` — what would move today; the host is edited by nothing.
