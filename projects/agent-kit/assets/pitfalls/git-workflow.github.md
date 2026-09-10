# Delivery — cold part

Pitfalls: traps already stepped on in a tree on GitHub. Loaded not with the rule but on demand —
an ordinary decision does not need it.

The rule is `git-workflow`; the articles that hold the law stand there.

## Pitfalls

- **Uncomputed mergeability is never a conflict.** The hosting recomputes it after every edit of
  the main branch and answers with uncertainty until the count is done. Read as a conflict, it
  refuses work on every fresh tip — that is, exactly where there is nothing to refuse. So both the
  guard and the audit judge only an explicit "conflicting" and let a silent poll through.
- **A force push of a branch that stands under another in a stack closes its PR as merged.** The
  hosting counts a PR merged once the tip of its branch is reachable from the base; the state
  lies — the main branch has no such edit, and the task stays open. The requirement this follows
  from is the rule's article that the lower branch of a chain does not rewrite history.
- **A branch caught up in the working tree and not pushed does not count as work.** A person sees
  the previous state and reads it as "nothing done", while what was done lies where nobody sees
  it. The rule's article says this about an unpushed resolved conflict, but a caught-up branch
  without a single dispute does not fall under it at all.
- **`UNKNOWN` in the mergeability field means "not computed yet", not "no conflicts".** The
  hosting recomputes it after every merge by someone else, and a PR read in that second looks
  healthy.
- **One piece of work — one task, however many files it touches.** There is no number past which
  an edit becomes a second task: what is split is what would have to be rolled back separately.
  A blanket edit of the tree's texts was filed as three tasks "by volume" — two had to be
  deleted, two PRs closed, and commits moved one by one with two conflicts. One of the three
  yielded no commit at all: editing the bodies of already filed tasks is never a branch, nor a
  task for a branch.
- **A task is created by the command, not by four calls in a row.** The board is not bound to the
  repository, and a task lands on it only by explicit addition: two tasks stood outside the work
  queue exactly because the step was retyped by hand. The creation command does all four — the
  issue on the hosting, the number in its title, the addition to the board, the starting column —
  and prints the ready-made branch creation line. A defect noticed along the way goes the same
  route.
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
  owner. The difference between a reading and a writing call is invisible in the command text
  itself: identity arrives from the environment. So a writing call names the token explicitly,
  and the opened PR is checked by the hosting's answer about its author — the printed link says
  the PR was created and is silent about by whom. This is fixed only by reopening: a PR's author
  cannot be changed.
- **An invalid pipeline file shows as a zero-length run right after the push.** GitHub creates
  such a run even on a branch no trigger is subscribed to: in the list it stands as a failure,
  and inside it has neither a step nor output — only the duration is readable. So the branch's
  run list is looked at with the same motion as the push — `gh run list --branch <branch>`. One
  such failure stood in the list until the merge and nobody looked at it: the rollout after the
  merge failed with exactly the same thing.
- **A run that did not start on a push is brought back by repeating the event, not by
  investigating the branch.** Measurement checked both lawful roads: opening a PR and pushing
  into an already open PR both start a run — a text-only commit and the account that pushes have
  nothing to do with it. The lost events fell on the hour when the hosting answered `429` on
  downloading an action and `503` on the API, and the run list cannot tell "did not start" from
  "was not created". So a tip without a run is named by the work queue audit, and the event is
  brought back by a new commit or by closing and reopening the PR.
- **Red on the setup step is a hosting failure, not a branch defect.** The runner could not
  download the checkout action and got `429 Too Many Requests`; the run never reached the code at
  all. It is cured by restarting the run, and it differs from a substantive red by the step it
  stopped on: three runs in one day failed exactly this way.
- **The `runner` context in a pipeline step's `env` refuses the whole pipeline file.** Only
  `github`, `needs`, `strategy`, `matrix`, `vars`, `secrets` and `inputs` are available there;
  `runner` appears at the level of a single command inside the step, where the same value arrives
  as an environment variable. Such a file is not accepted at all: the run ends in zero seconds
  without starting a single step. YAML parsing does not catch this — the syntax is valid, and
  context availability is not syntax.
- **`online` on a self-hosted runner means a running process, not a working pipeline.** Two sides
  match separately: `runs-on` of the pipeline steps and the labels of the runner itself. Until
  they intersect, the runner stands `online` and takes nothing, while the steps go to the cloud —
  by its state this looks configured. The owner is told the executed step with its number, not
  the state line.
- **A self-hosted runner makes the run a shared resource, and the runs have one stand.** The port,
  the database name and the build directory are hard-wired in the tree as one value for all: two
  runs at once raise two stands on one port, and the second falls over whole. The costliest part
  is not the fall but its look — in the summary it appears as a dozen red screen tests, that is,
  as a defect of the edit that does not exist; three runs in a row fell this way on three
  branches that touched no code. It is cured from both sides at once: the pipeline declares a
  queue group for the whole tree, and the stand names are read from the environment with today's
  values as the default — otherwise the run and the push gate, which calls the same command,
  collide even with the queue. One queue is not enough, names alone are not either: runs also
  share the disk, the builder cache and the image daemon.
- **Registry login from a runner started as a service fails silently.** The service runs without
  a user session, and the registry client goes to the system keychain helper and gets an
  interaction refusal — the step fails before the build. Its own settings directory with an empty
  helper does not save it: the client writes the empty value back itself. Ready-made commands —
  pattern `git-workflow-docker`.
- **A new working tree gets only what lies in the index.** `git worktree add` unpacks a commit,
  and settings, keys, local permissions and dependencies are not part of a commit: the fresh tree
  looks ready and hits the shortage not at once but on the first guard that needs a key. What
  exactly is carried over by hand is named as a list in the rule's companion, and the list grows
  with the same motion that creates a new file outside the index.
- **A run pushed out of the queue and a failed one are indistinguishable in the list.** Both
  answer red, and the word for cancellation is the same for both. The branch behind the pushed-out
  one was not checked by a single line: it has zero steps because it never started. Restarting
  such a run is refused by the guard until the step's output has been read in the same turn —
  which is why the audit line names reading the run first.
- **The same merge of the main branch done a third time in one session stops the work.**
  Branches that append a line to the same list drop each other into a conflict at every merge,
  and merging main round after round is a fix of the symptom. On the third round the cause is
  named and the owner is asked, instead of a fourth round.
- **An empty file sent as the PR body wipes the description of the work whole.** That is how an
  edit of the body assembled by a chain went: a change into the temporary files directory took
  the call out of the tree, the body download failed, and the next link sent the file left empty.
  A description assembled over three sessions became an empty line; it was restored from the
  hosting's edit history — and only while that exists.
- **`gh project` with `--owner` answers `unknown owner type`.** That happens when the owner of the
  board is not the account the call runs under. The identifier is taken from the board itself,
  not assembled from the owner's name.
- **"The account is active anyway, nothing to substitute" is an argument turned against an
  article already read.** The machine account's token was placed into the hosting client by a
  login call, and the client itself announced the switch of the active account; from inside the
  tree everything matched — calls answered, PRs opened from the right account. From that minute a
  neighbouring session in another tree went to the hosting from an account with rights to one
  repository: the delivery guard read its task as nonexistent and did not let it create a branch.
  The owner noticed, from the neighbour's complaint, several turns later. The client's active
  account stays with the owner; it is asked by the client's state output, not from memory.

## What stood in the articles

Here moved the cases, numbers and rejected remedies that used to stand next to the rule's
articles. No edit decision rests on them: they are for whoever investigates a miss or argues with
a guard.

- **A refusal at the merge remains the second line.** A person merges as soon as they see green,
  and the second line is simply never reached.

- **A list where everything is grey reads as "work not done".** A draft and unfinished work look
  the same; such PRs are found by the audit — at night, in someone else's session, after the
  conversation is closed.
- **Nobody checks the login next to the service number.** A miss in the email is invisible from
  inside: the commit looks one's own and is signed by a stranger.

- **A task key that diverged from the branch form in the profile.** They do not refuse; they stop
  recognising the number: the check that looked for work without a task lets everything through.
- **The union merge on the index file is declared not for the dispute but for silence.** Without
  the declaration a person is called at every merge — over a line that is needed whole from both
  sides.

- **The gate is a promise that the push will not arrive red.** A set without the build and the
  snapshots promises what it does not check.
- **The board shows what is done and what remains.** A PR answers a different question and links
  itself to the card — it needs no separate card.

- **Mergeability used to be inferred from a local merge.** Between it and the owner's look main
  moves ahead, and "it merged for me" says nothing about the button. A tree whose queue helper
  says nothing about the `mergeable` field works as before: no field — no requirement.
- **The identity of the call that opens the PR.** A tree that named no machine account gets no
  token substitution requirement: there is nothing to check the hosting's answer against.

- **Branches created from main one after another drop each other.** A measurement over one
  hundred and six accumulated branches of one base: merging one makes up to twenty-three diverge,
  seven and a half on average; twelve diverge with nobody. It was counted with `git merge-tree` in
  memory — the measurement touches no working tree and moves no branch.

    ```bash
    # a merge probe without a single edit in the tree: the merge commit is created in the object database
    tree="$(git merge-tree --write-tree origin/main <branch> | head -1)"
    probe="$(git commit-tree "$tree" -p origin/main -p <branch> -m probe)"
    git merge-tree --write-tree "$probe" <other branch> >/dev/null; echo $?   # 1 — they will diverge
    ```

    A tree as the argument is no good here: it has no history, no common base is counted, and
    every probe answers "will merge".

- **What diverges is not the edit but the line both sides appended to.** In the same measurement
  the resource's source merged cleanly while its laid-out copy diverged on the first line — the
  one holding the resource's checksum. Two pieces of work edited different sections of different
  files and still demanded resolution. Hence the rule to branch in a chain: what would have to be
  removed is not the divergence but the very way of keeping a copy next to the source.

- **The build is part of the gate set.** Four merges in a row went into the main branch breaking
  the rollout: a type error in uncovered code survived lint and unit tests and surfaced on the
  image build.
- **A set rewritten as lines looks complete.** In one tree six checks lay next to the ones being
  run and were run by neither the gate nor the pipeline: eight lines out of fourteen read as the
  whole set, and the difference showed only by comparison with the package default.
- **The gate set is never narrower than the pipeline set.** Twice in a row an edit that passed the
  gate whole was refused by the pipeline — and both times a green gate was read as "everything is
  green locally". Hence the requirement to refuse the push on a step missing from the set, rather
  than print a warning next to it.
- **Draft is not lifted from a branch that does not merge.** In one session three drafts were
  lifted in a row, and the owner saw all three PRs conflicting. The mergeability article stood in
  the rule before that — the miss repeated the same day, so the requirement is held by a guard,
  not by memory.
- **Union of the sides on the shared index file.** Before the declaration the same line was
  resolved six times in six branches in one session. One cannot promise "no more conflicts" by
  the declaration: there will be no manual work, but merging main into open branches after every
  merge will still be needed.
- **What was created is visible only to its creator.** Sixteen tasks were created twice this way,
  and a PR was named to the owner by a number that did not exist for him: the restricted account
  saw its own, and the hosting answered "not found" to everyone else.
- **A bypassed refusal carried away the sign of the restriction.** The request limit of the
  restricted account stood at zero — not exhausted, simply not granted at all. The refusal was
  bypassed by a call of another kind, the bypass worked, and the discrepancy surfaced twenty
  minutes and four traces later, which had to be rewritten.
- **The identity of the call that opens the PR.** Before, both sides — the token substitution and
  the hosting's answer about the author — were held by an article and an incident analysis, and
  the miss repeated on the third day.
- **An unset task key.** A title `[-317]` assembled from an empty value matches nothing, and the
  audit marks every task as misnamed: the real discrepancy drowns among these lines.
- **A branch that touched no line of the display runs the showcase snapshots** from the moment a
  merge of main brought in someone else's styling edit. That is exactly the case for which the
  check set is revised after a merge.
- **Returning a PR to draft — `gh pr ready --undo` — gets no review requirement:** it does what
  the guard is after.
- **One's own drafts are judged all at once.** Leaving for a neighbouring branch switched the
  guard off entirely: in one session four PRs in a row diverged from main this way, and the owner
  noticed, not a check. The analysis is the record "2026-08-25-run-left-unwatched" in the intake.
- **The machine account's signature on every commit of the contribution.** Five commits of one
  stack went signed by the owner, who made no edit: the guard judges only a commit that called
  itself the machine account and looks for a mismatch in the number of the service address.
- **The PR state is reread from the hosting.** The client answers from the account whose token it
  was given, and a review request to the author the hosting accepts silently and does not create.
- **Reviewers are asked through a REST call.** Under the machine account's token the client's
  query fails whole, without the token it passes green — there is no way to tell "matched" from
  "there was nothing to ask with".

- **The completeness of the gate set is judged by the names of the pipeline steps.** A check that
  is not in the pipeline either is not there too: a set rewritten as lines instead of calling the
  package default loses exactly the checks the package will add in its next edition. One's own
  line instead of the default is lawful where it covers the same thing more strictly or calls the
  named script.
- **A draft whose branch carries the task folder means work in progress, not abandoned work.**
  Both signs are needed together: a green run on the tip without the folder taken apart says the
  work is not handed over yet. A tree that named no machine account does not get this audit at
  all.
- **The mergeability mark is not cleared even by a declared union of both sides.** The hosting
  counts the union as its own device and reads no merge settings: until the branch has absorbed
  main and that has reached the hosting, the PR stands conflicting with the divergence resolved
  locally.
- **The layout audit is not in the pipeline, so neither is the step it would close.** An edit past
  the source breaks nothing on the day it is made.
- **The working tree is not emptied for a tool run.** The question "was this debt there before my
  edits or from them" is settled by a second copy of the tree, not by stashing the work: what is
  stashed is seen by neither status nor audit, and a command that ran between the stash and the
  pop writes to the same files — and the pop comes up as a conflict. Eight uncommitted files went
  into the stash this way with a live ban on that command: the ban was read at the start of the
  session, and the command was typed forty turns later.
- **The output of a command that needs the repository is collected in the repository directory.**
  Redirection creates the file before the command manages to fail: the hosting client called from
  the temporary files directory falls with a line saying this is not a repository, and by that
  minute the empty file is already written. Travelling further — into the PR body, into the plan,
  into the rule — it wipes what was written, and that is recovered only from the edit history on
  the hosting's side. So the output file is placed in the tree, and what was written is checked
  before it is sent anywhere.

- **A pipeline queue declared for the whole tree cancels the waiting run with someone else's
  push.** A concurrency group that cancels the run in progress saves the machine exactly until the
  first neighbour: their push cancels another branch's run, and that branch is left with a tip
  without a single run — the PR then looks unchecked, and nobody is there to rerun it. So the
  group is declared per branch, and stays shared only for the steps that need the stand: those
  really cannot be run two at a time on one machine.

- **The tree's commands are called from its root, not from the package directory.** In a
  subdirectory with its own manifest the launcher takes that one, not the root one, and answers
  "no such command" — even though the tree has it and it is written correctly. This reads as a
  broken command and is cured by the directory: the path to it is named from the root, and it is
  called from there.

## The active account of the host client

A client login as the machine account hijacks every neighbouring session on the machine: a
neighbour with rights to one repository reads its task as nonexistent, and from inside the tree
the miss is invisible — the answer is an ordinary "not found". That is why the account is
substituted per call and never made active, even when the active one is already right.

- **Why a neighbouring runner rewrites a ready-made step's default.** On a machine with several
  runners any path from the home directory is shared, so the version a neighbouring run installs
  lands under the same path and is picked up by the next run of any project.
- **What the second tier of the delivery guard cannot ask without a network.** Task, column,
  assignee and review live at the hosting: with no network and no token that tier is skipped, and
  the skip is silent.
