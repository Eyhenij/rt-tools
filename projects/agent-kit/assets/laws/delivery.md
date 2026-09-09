# Law on delivery

How a change reaches the running application. The law covers both the history of changes and what
the user sees at that moment: a failed rollout differs from a successful one only in that the
application stops responding, and the reason is found from the history.

## Articles
- **A change starts with a task visible in the work queue.** A created task is not enough: one that
  did not reach the queue is seen by no one, and no work was planned behind it.
- **A change reaches the main branch only through a separate branch.** A direct write to main takes
  away both the discussion and the chance to roll the change back in one move.
- **A change belongs to an epic, and the epic is the unit of delivery.** One task changes the
  application no less than a series of them, and merged on its own it reaches the main branch as
  half of a thought: the rest of the series arrives later, or never, and the main branch holds a
  state nobody planned. An epic names what the whole is, so that the main branch takes it whole or
  does not take it. Work outside an epic exists only by the owner's word about that work.
- **An epic has a branch of its own, and it is taken from the main branch.** Without it the epic
  lives as a plan alone, and a plan is not merged: its tasks stand on the main branch apart from one
  another, half a finished epic is already rolled out while the rest is being written, and a
  rollback goes task by task.
- **The branch of a task is taken from the branch of its epic, and the PR of the task goes there.**
  Taken from the main branch, a task branch carries into the main branch what the epic has not
  finished; opened into the main branch, its PR makes the epic branch a copy nobody merges.
- **The PR of an epic into the main branch opens after the folders of all its tasks are taken
  apart.** What lies in them explains the decisions of one piece of work and dies with it: what is
  worth keeping leaves for the description of the past by that same moment. An epic branch that
  reaches the main branch with those folders in it carries into the whole tree what one branch
  needed.
- **The main branch is merged into the branch of the epic, and the branch of the epic into the
  branches of its tasks.** An epic outlives one task, and by its end its branch has fallen behind
  everything the neighbours merged; a task branch that took the epic branch before that never sees
  the lag. Both merges go while the work runs, not before the hand-over.
- **The work queue holds tasks, not PRs about them.** A task and its PR share one number and one
  fate, so a second card about the same work adds nothing — it doubles the queue and lies about its
  length. The queue is read to see what is done and what remains; a PR answers a different question
  and opens from the task card, where the link to it already stands. A PR card lives a life of its
  own: it hangs in the queue forever after the merge, because there is no column for it.
- **A check does not run what the change cannot break.** A set that is the same for every change
  looks strict and works the other way round: a run that takes ten times longer than needed teaches
  people to bypass it, not to wait for it. The set is derived from the content of the change — from
  what it touched, not from what it is named; a change that touched no line of code builds no images
  and takes no snapshots. What is skipped is then called skipped: a step dropped silently reads as
  passed.
- **A task has one branch, and a branch has one task.** A rollback removes everything that came in
  on that branch at once. Two tasks in it roll back only together, and a task that came in on two
  branches stays half done after one is rolled back — and the work queue does not show it. Work that
  does not fit one branch is split into tasks before the branch is created. The sign of a split is a
  separate rollback, not volume: there is no number of files, lines or commits past which work
  becomes two tasks. A change of one kind stays one task no matter how many files it touches; the
  size of a session says which task to create among those that split lawfully, and does not split
  what cannot be split.
- **Work that goes one piece after another branches one from another.** The branch of the next is
  taken from the previous, not from main: then the change of the previous lies in the common
  ancestor, and two different edits of one file no longer need reconciling. Branches created from
  main one after another know nothing of each other, and the first merge makes the rest diverge —
  the more surely, the closer the work is by subject. It is not the changes that diverge but the
  lines both wrote to. The cost does not vanish but moves: the one who branches pays it once,
  instead of the one who merges paying it as many times as there are open PRs. The first work of a
  series branches from the branch of its epic, and so does any work not connected to the previous
  one.
- **A series of branches is handed over bottom up, and the order is named to the owner.** The PR of
  each stands on the previous one, not on main, so one merged out of order drags along everything
  beneath it. The order is known to the one who branched and invisible to the one who merges:
  unsaid, it reads as absent.
- **A branch that stands under another does not rewrite history.** A force push of the lower one
  makes the tip of the upper reachable from its base, and the hosting closes the upper PR as merged
  — while the main branch holds none of its changes. The divergence is fixed by merging, not by
  moving history.
- **A change to the delivery itself is checked by running it, not by reasoning.** There is nothing
  else to check it with: it executes only where it rolls out, and in an environment the workplace
  does not have — with someone else's permissions, someone else's secret store and someone else's
  network. "I will check after the merge" is never the executor's decision: behind those words
  stands a rollout that will not happen if the change turns out wrong. Only the owner may postpone
  the check, and says so in words.
- **Two tasks fixed by one change are one task.** The second is erased together with its number, and
  whatever the first lacked is added to it before that. Two lines about one piece of work are worse
  than a gap in the numbering: afterwards they do not tell what is done and what is not. They can be
  merged while the change has not entered the main branch; after that, both stay as they are.
- **A task, its branch and the PR about what was done carry the same number in their names.**
  Otherwise one piece of work has to be recognised by the text of its name, and in a list of fifty
  lines that is done from memory and with errors.
- **The number is written the same way everywhere: task key, hyphen, number.** The title of a task
  and of a PR starts with this pair in square brackets; the branch name starts with the same pair.
  One form, not three similar ones, because the number is read not only by eye: a guard takes it
  from the branch name, the queue audit takes it from the title. Forms derived separately drift
  apart silently and do not fail — they stop recognising the number: the check that was to find work
  without a task lets everything through.
- **The tree names its task key itself, but must name it.** In the form of the name this is the only
  thing each tree has of its own — and the only thing that is configured. An unnamed key gives
  neither leniency nor a default: work with the queue fails and says where the key is set. An empty
  key is worse than a missing check — what remains of the name is a stub that nothing answers to,
  and not a single task looks correctly named.
- **What is created in the work queue is visible to the side it was created for.** An account whose
  objects the hosting shows not to everyone leaves behind work that does not exist for the rest.
  From outside this is indistinguishable from done: the task is created, the PR is open, and the
  owner sees an empty queue. Visibility is checked with someone else's eyes — by reading the queue
  as those it is addressed to — not by a successful reply of the create command.
- **A task has an executor from the moment it is created.** A task without an executor looks like
  nobody's: the work queue does not show who took it, and a change created along the way is lost
  among other people's.
- **The state of a task in the work queue matches what is happening to it.** One taken into work is
  shown as taken, one waiting for review as waiting. Otherwise untouched, in progress and done look
  the same: the work is taken a second time, and the PR stands unreviewed. The state is moved at the
  moment the work goes to the next step: the queue is read between those moments, not after them.
- **A change entering the main branch means a rollout.** Everything the change depends on outside
  the code — environment variables, secrets, name records — is put in place before that moment, not
  after.
- **The sign of the execution mode is declared in the deployment artifact itself, not only in its
  launch composition.** The artifact is also brought up outside that composition — by hand, during
  an analysis, on someone else's machine — and without the declaration it considers itself a debug
  build at that moment, saying nothing about it.
- **A deployment artifact carries everything that configures what it launches.** The build checks
  that the artifact was built, not that its own launch steps can run. A missing configuration file
  is seen by neither the linter, nor the build, nor the image build step in the pipeline: it fails
  on the first start, that is, already where it was rolled out. A file lying next to it in the
  repository does not get inside the artifact by itself.
- **The image rolled out is the image of the commit being rolled out.** The default "latest" lags
  behind the main branch, and the application silently returns to the previous version while
  continuing to respond.
- **The same commit always installs the same dependencies.** If a version is given as a range, an
  install today and an install a week later give different code: the build breaks by itself, and
  there is nothing to roll back. A dependency upgrade is an ordinary change: it has an author, a
  description and a rollback.
- **The order of storage changes is checked from an empty state.** On a storage that already works,
  a wrong order is invisible: it shows only on a deployment from scratch.
- **The check before the push looks at the content of the repository, not at the state of the
  machine where it runs.** The machine lawfully holds unfinished work, personal settings and files
  outside the history. A check that reads them rejects the change because of what is not in the
  repository, and stays silent about what is. The check before the push and the rollout pipeline
  judge by the same thing — otherwise "passed" means different things in those two places.
- **A document travels with the change it describes.** Neither the build nor the checks read texts,
  so the drift accumulates silently and later looks like a current reference.
- **Work that changes code ends with an open PR.** The PR is the only place where a person sees the
  change whole, answers it and merges it; a commit and a pushed branch do not replace it. Until the
  PR is open, the work does not count as done: there is no review of it, and the person does not
  know about it. The PR is opened in the same turn in which the executor says the work is handed
  over — not in the next session and not on a reminder.
- **A PR not ready to merge is marked as a draft.** An open PR reads as an invitation to merge, and
  a person presses merge without asking whether the work is finished. The draft separates two states
  that otherwise look the same: the change is put up for viewing — and the change is ready to go to
  the main branch. Everything that waits for a run, for rework or for an answer to a question is
  marked with it; the question is asked in the PR itself, not kept in the executor's head.
- **Lifting the draft is a separate turn, and with it the executor answers for readiness.** The
  draft is lifted when the checks have passed, no rework remains and the work matches what the task
  was created for. While it stands, the executor's silence means "not ready yet", and the person has
  to ask nothing; after it is lifted, silence means "can be merged", and the price of a mistake here
  is a change in the main branch.
- **A PR about what was done stays true until the merge itself.** It describes the tree on the day
  it was written, and waits for review for days. In that time the main branch is merged into the
  branch, and the PR's statement about neighbouring files becomes false silently — no check reads PR
  bodies. Everything merged into the branch after the PR is published is a reason to reread it.
- **A PR into the main branch is merged by a person.** The merge is the last moment when review is
  still possible: after it the change stands in the main branch, the work has moved to the next
  task, and there is nobody left to return to it. The executor of the work merges their own PR only
  on the person's direct word and only about the named PR; silence is never permission, and a word
  said about one PR does not carry over to the next. Otherwise the review is passed by the one being
  reviewed, and the PR queue looks reviewed without being so.
- **A requirement that stands before an irreversible step stands where that step is taken.** A guard
  on the executor's machine judges their commands and stays silent about the same action done with a
  button at the hosting. The bypass comes out not deliberate but unnoticed: the one who pressed does
  not know anything was missing. The requirement is either moved to where the button is pressed, or
  announced to the one who presses it, before the press. Otherwise it holds not by itself but by the
  fact that the irreversible step is taken by the same person every time.
- **A merge into the main branch does not yet mean the change has arrived.** A failed rollout
  touches neither the task nor the work queue, so a divergence between the main branch and what runs
  must be visible where the queue is read. Otherwise the next pieces of work merge on top of a
  breakage they did not bring, and each looks as if it arrived.
- **A breakage that has happened is analysed in a record that outlives the task.** The fix leaves on
  a branch, the task is closed — and the reason the application stopped remains the knowledge of one
  executor. The record names what broke, how it became visible and why the fix fixes the cause and
  not the symptom; it lives in the archive, among the records of what has happened, not where things
  die with the task.
