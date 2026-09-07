# Delivery — cold part

Pitfalls: traps already stepped on in a tree on Azure DevOps. Loaded not with the rule but on
demand — an ordinary decision does not need it.

The rule is `git-workflow`; the articles that hold the law stand there.

## Pitfalls

- **One piece of work — one task, however many files it touches.** There is no number past which
  an edit becomes a second work item: what is split is what would have to be rolled back
  separately. A blanket edit of the tree's texts was filed as three tasks "by volume" — two work
  items had to be deleted, two PRs closed, and commits moved one by one with two conflicts. One
  of the three yielded no commit at all: editing the bodies of already filed tasks is never a
  branch, nor a task for a branch.
- **A work item is created by the command, not by calls in a row.** The board shows the items of
  its own area and iteration, and one created past them is not visible in the work queue: from
  outside it looks the same as one not created. The creation command sets all the fields at
  once — type, state, assignee, area and iteration — and prints the ready-made branch creation
  line. A defect noticed along the way goes the same route.
- **The branch is created by a second call, not the same one.** The main-branch guard rejects the
  compound "create a branch and commit at once" whole: at the moment of parsing the branch does
  not exist yet.
- **A side of a conflict can be a deletion, and "keep both sides" creates a second declaration.**
  The main branch removes the declaration because the symbol moved — in the conflict this looks
  like a side that added nothing. It is sorted out by reading the main branch's version whole,
  not by hunk, and verified by the duplicates check: each copy alone is sound, build and lint
  green.
- **The account for the push and the author of the PR are chosen separately.** If the push had to
  go from another account, that does not carry over to the next call: the PR is opened with the
  machine account's token, and which account opens it decides who can be assigned as reviewer.
  Once a switch of account for the push leaked into publication — the PR came out from the
  owner.
- **An invalid pipeline file shows as a zero-length run right after the push.** The run is created
  and ends on parsing the file, without starting a single step: in the list it stands as a
  failure, and inside it has neither a step nor output — only the duration is readable. So the
  branch's run list is looked at with the same motion as the push: `az pipelines runs list` for
  one's own branch.
- **`online` on a self-hosted agent means a running process, not a working pipeline.** Two sides
  match separately: the demands of the pipeline steps and the capabilities of the agent itself in
  its pool. Until they intersect, the agent stands `online` and takes nothing, while the steps
  wait for a hosted pool — by its state this looks configured. The owner is told the executed
  step with its number, not the state line.
- **Registry login from an agent started as a service fails silently.** The service runs without
  a user session, and the registry client goes to the system keychain helper and gets an
  interaction refusal — the step fails before the build. Its own settings directory with an empty
  helper does not save it: the client writes the empty value back itself. Ready-made commands —
  pattern `git-workflow-docker`.
- **A new working tree gets only what lies in the index.** `git worktree add` unpacks a commit,
  and settings, keys, local permissions and dependencies are not part of a commit: the fresh tree
  looks ready and hits the shortage not at once but on the first guard that needs a key. What
  exactly is carried over by hand is named as a list in the rule's companion, and the list grows
  with the same motion that creates a new file outside the index.
