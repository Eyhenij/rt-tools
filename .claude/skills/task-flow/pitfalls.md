<!-- rt-kit v0.27.0 · pitfalls/task-flow.md · dffc1687bff9 · правится надстройкой, не здесь -->
# Work conduct — cold part

Pitfalls and behaviour from incident analyses. Loaded not with the rule but on demand: an ordinary
decision does not need it — it is for whoever investigates a miss or argues with a guard.

The rule is `task-flow`; the articles that hold the law stand there.

## Pitfalls

- **A task picked into an epic by its body can be closed before the work starts.** Weeks pass
  between creating a task and taking it, and all that time the tree is edited by neighbouring work:
  two tasks of one epic had three parts out of four already done — the body described the tree of a
  month ago. So selection starts with reading the code, and the grill names what of the task body is
  still true in the tree.

- **An owner's permission left in the repository is lost on every new branch.** It is written into a
  file of the branch, and the next branch is taken from main and does not carry it: the guard
  forbids the permitted work as many times as branches are created before the merge. The refusal
  names the file and is silent about the record belonging to the branch. While the permission lives
  in the repository, the number is appended in every new branch.
- **The name of another tree is not written into repository files, but the path to a sample is.**
  Both things live next to the session handover for exactly that reason: a full path is lawful
  there, and in the repository — only a reference without the name.
- **The line "Waiting for the owner" in the progress outlives the reason it was written for.** It
  lies on disk, enters the context in the next session and reads as the current state — so it is
  removed in the same turn in which the owner answered. Otherwise the wait confirms itself: three
  owner's instructions in a row did not outweigh one line on disk.

- **The folder is named after the branch, one to one.** The startup hook looks for it by `git branch
  --show-current`, and a folder named otherwise is found by nothing: the work goes on with an empty
  context, and the owner is asked to retell what is already written.
- **The grill is not rewritten after the fact.** The retelling gets quietly fitted to what has
  already been done, and there is nothing left to check the result against. A decision changed along
  the way is appended to the progress, not edited in the grill.
- **The product agreement is not placed in the task folder.** The folder dies with the merge, and
  the agreement has to outlive it: its scenarios get numbers in the domain's shared numbering, and
  test titles refer to them. The reverse holds too — the progress is not placed in `proposed/`: a
  spec in which steps appeared becomes a plan again and dies after the merge.
- **A menu has no line "wrong question".** A menu fits where the choice is closed; until the framing
  of the question is confirmed, the owner has nothing to reject it with — they choose among the
  options of a false premise. If the settings demand a menu, a free option is added to every
  question. Three questions went out as one menu, one of them with a false framing: whether a
  question fits is first checked against the owner's replies.
- **A subagent asks the owner no questions.** Neither a role nor the pipeline reaches them — they
  return text to the main agent. So the grill is led by the main agent, with the roles standing on
  both sides of it.
- **If a defect is fixed by editing one shared number, ask the owner whether you are fixing it the
  right way.** A measurement shows the defect is gone — not that the cause was cured. In one task
  two edits went this way in a row: first a shared number on a neighbouring node was raised, then
  the node was moved to another place in the markup. The owner rejected both and named the needed
  way himself. Ask before the edit, do not show the measurement after.
- **A path offered to a person is judged by the number of their steps and by what they must have to
  walk it.** From the code side an option looks cheap while for a person it costs a visit to the
  server. The price is named from the side of the one who will walk it; a retelling of the order
  without it the owner reads as approval.
- **The epic on the theme is read before the layout is decided.** The epic plan holds decisions that
  survived a dozen tasks, and code exploration does not find them: a withdrawn decision leaves no
  trace in the tree. A domain created by the generator and torn down half an hour later stood in the
  plan as an explicit ban — but the plan was opened only after it had been created a second time.
- **Work that takes apart someone else's task folder takes apart its own too — in one commit.** It
  creates its own folder like everyone else, and the circle used to justify the exception is closed
  by the order of the take-apart: the last commit removes both. Once such a take-apart left its own
  folder, and a third task had to be created for it. How to take two folders apart — pattern
  `task-flow-archive`.
- **The word for a new notion is taken from `docs/GLOSSARY.md` or added there.** The third file of
  the task folder is called `progress.md`, not `journal.md`, for exactly that reason: there is one
  journal in this tree, and it is a different one.
- **The task folder draft is named with the same short name as the future branch.** The creation
  command looks for the draft by it and, not finding it, silently assembles the folder from the
  template: the work goes on, while the grill stays lying in an abandoned directory, and the next
  session questions the owner anew. The draft got its name from the words of the request, the branch
  from the terminology of the agreement; the same words, yet not the same.

- **Waiting on one part of a stage is never a stop of the stage.** The parts that do not depend on
  what is awaited are done in the same turn: to say "acceptance is pending" and touch nothing else
  is a stop of the whole work for a reason that applies to a tenth of it. The rule speaks of the
  task, and "one part is pending" is read by it as "the work is pending" — of five parts of a stage,
  one was waiting.

- **A line with a path is never an assignment.** An address names a file, not an action; read as an
  instruction, it gives the session work the owner did not ask for. The same with any line without a
  verb: asking what to do with it is cheaper than writing fifty files past the request.

- **A stage's readiness sign is written about its own half of the output, not about the whole
  output.** The check counts the whole tree, and the stage edits a part of it: "output without a
  single debt line" fails not because the stage is not done but because three lines belong to an
  unmerged neighbouring branch. The sign names its own lines and its own number, and a statement
  about the whole output holds until the first neighbour.

- **A copy of the task folder template carries the layout header, and the very first edit is refused
  by the guard.** The copy for the task looks like a laid-out file, and the refusal names the
  package source address — it leads to editing the template instead of the copy. The task creation
  command strips the header itself; copying by hand does not. Such a copy is fixed only by writing
  it anew.
- **The project name in a stage's readiness sign is asked from the builder, not written from
  memory.** To an unknown name the builder answers that nothing was run and exits zero: the sign's
  command ran not a single test and kept silent exactly like a green run. This shows only by the
  count of what was run, and nobody reads it.

- **A stage closed without a push runs the gate checks as its last motion.** A stage's sign calls
  its own commands and knows no shared ones, and the gate turns red only on the push: a branch
  without pushes accumulates red until the first one, and the miss travels two stages away from
  where it was made.

- **A closing sign is asked whether the executor can confirm it alone.** A sign that requires a
  person — a password, a button in someone else's panel, the owner's look — stops the work at the
  last step: everything is done, and there is nothing to say "closed" with. This is asked during the
  grill.

- **A closing sign checks the outcome at the side that stores it, not the answer of the call.** The
  call answers about itself: sent, accepted, exit code zero — and all of that is true while nothing
  is recorded. Eight tasks in a row counted the mark as working by the command's answer, and it
  moved nothing.

- **One's own temporary files go outside the code tree — otherwise their removal is judged as an
  edit of the application.** The write sign counts a deletion as a write on purpose, and it has
  nothing to tell one's own temporary directory from a domain directory. The directory is named by
  the tree's profile, and it lies outside the code tree.

- **A task body written ahead of the plan names the method, and the method goes stale before the
  defect.** A task of a series is created weeks before it is taken; by that day the proposed method
  can already be wrong: the package already does what the task called to write, the named place in
  the tree is gone. So work starts with reading the file the task refers to, not with executing its
  body. A discrepancy changes the method, but not the goal.

- **Work that ran into a permission is carried to the end without the part the permission opens.** A
  run and a review end on their own, while a refused permission never ends: a turn that declared a
  wait stops the work whole. Everything that does not depend on the permission is done; what was not
  passed is written into the PR body, where the reviewer reads it.

- **The owner's word about how something is arranged is a framing, not a decision.** What they named
  usually already lives in the tree under that very word — a name on screen, a spec section, a model
  field — and checking costs one search. Interpreted by the nearest code, the word looks like a
  fulfilled request right up to acceptance. Did the reading diverge — the owner is asked before the
  edit.

- **An instruction to work by the flow is an instruction to do its steps, including those that
  change history.** Marking a stage, pushing the branch and opening the PR are prescribed by the
  flow; no separate word for each is needed. The tree's general ban on acting without a request,
  read literally, yields an instruction carried out by half. There is one boundary: the owner's
  direct word about the step itself — "do not push the branch" holds however many times the flow
  prescribes it.


- **The work queue does not end with the epic.** An epic occupied by other executors or finished
  means the next task from the queue, not a stop: "no free tasks in the epic" is never an answer to
  "what to do", because it is the queue that answers that question, not the epic. It is asked by the
  command, not recalled from the handover: a statement in the handed-over text describes the tree
  and the day it was written in.
- **A closing step of the work does not count as taking the next task.** Moving the task being
  closed to the review column and removing its folder are mandatory closing steps, and both happen
  in the same turn that opens the PR. A turn with nothing else in it does not move the work, however
  many commands it holds.
- **A folder draft without a number is lost silently.** It lies outside history, and neither the
  board, nor the work queue audit, nor the next session sees it. The abandoned-grill threshold does
  not catch this loss: the work loses to neighbouring assignments within the hour, and the week
  passes afterwards.
- **A stack of branches costs more, and its price is named.** A PR into a neighbouring branch does
  not start the pipeline declared for the main base; merging the base closes the next PR as merged
  although its edits are not in main; a conflict is resolved anew in every branch of the stack.
  Tasks that follow one another in code lawfully live as branches from main, as long as the next
  edit does not rest on the code of the previous one.

- **A find in the middle of a stage feels like part of the current work when the subject is
  adjacent.** It has no sign of its own: before the first edit the find is not in the tree, and
  after it the files of neighbouring work do not differ from one's own. So the plan's list of exit
  conditions is checked, not the feeling — otherwise the two pieces of work lose their separate
  rollback.

## Executor behaviour — from incident analyses

Every rule below is derived from an incident analysis. The analyses live in the intake and do not
lie on the tree's disk: an analysis explains the mechanism, here is what follows from it. A rule
that came from an analysis is not lifted until the analysis is found wrong.

- **A question is asked of the owner after the answer has been looked for in the tree by a
  command.** The statement next to the question — "the tree does not have this" — is a command's
  output, not an impression. The question "where is the package edited" was asked about a
  directory lying in this very tree. The sign: the turn holds a search showing there is no answer.
  Analysis: «2026-08-13-question-before-recon».
- **The frame of a handed-over text does not carry over to the current tree.** The handover was
  written in another tree and sets the package against whoever installs it; here both are one
  tree. What is read in a handover is checked against the tree before a question or a conclusion
  is built on it.
  Analysis: «2026-08-13-question-before-recon».
- **Empty output of a command means "the wrong thing was asked" until the opposite is shown.**
  "There is nothing" is a statement of its own, and it demands a command that tells emptiness from
  a miss: a suppressed error stream and a pipeline whose exit code belongs to the last link make
  the two indistinguishable.
  Analysis: «2026-08-13-stale-local-main-read-as-fact».
- **"Checked" names the set whole, including what was not run.** A green push gate is not the
  completeness of the set: the set is taken from the tree's pipeline file, not from memory. A
  selection named without what did not enter it is read by the owner as completeness.
  Analysis: «2026-08-13-verified-narrower-than-ci».
- **The layout of a tree taken as a sample is read whole, not by a query to the intake.** An
  answer to a narrow question shows one folder, and generalised into a map of the tree it lies
  silently. Exploring a sample begins with walking its directories two levels deep; questions
  about techniques come after.
  Analysis: «2026-08-14-structure-invented-beside-the-sample».
- **What was inferred is called inferred.** A list where the checked and the guessed stand mixed
  and unmarked reads as checked throughout, and the error in it is found by the owner. A guessed
  line is marked right in the list — together with what would confirm it.
  Analysis: «2026-08-14-structure-invented-beside-the-sample».
- **A reply to the owner's order begins with the result, not with intent and not with its
  justification.** The owner who set the task asked for no opinion about it; a justification under
  someone else's decision reads as an appraisal and rewrites its authorship onto the executor. One
  exception: execution ran into an obstacle — then the obstacle is named, not the attitude to the
  task.
  Analysis: «2026-08-14-opinion-instead-of-execution».
- **No check reads the reply to the owner.** The misses in it are the same as in the tree's text:
  an invented fact served alongside a verified one, an appraisal instead of carrying out. The gate
  answers for a file, the author for a reply, and the price of an error in the reply is paid by
  the owner.
  Analyses: both from 14 August 2026.
- **An edit refused by a guard is not laid by another way.** The guards are subscribed to the
  file-editing tools, and the same edit can be laid by a shell command — a redirection, `sed -i`,
  an interpreter with a heredoc. That is what happened: the refusal was bypassed twice in an hour.
  Telling the owner about the bypass aloud is not the same as not bypassing: they learn of it
  after. The right move is to stop and ask what to do with the refusal.
  Analysis: «2026-08-15-guard-denied-shell-wrote-anyway».
- **A contradiction between a guard and a rule is resolved by the owner, not by the executor.**
  "The rule outweighs the refusal" is a conclusion drawn by whoever the refusal hinders. Both
  sides are edited by the owner: they choose whether to fix the guard or the rule. The executor
  names them the contradiction whole — what the guard refused, what the rule says and at what
  price each side is bypassed.
  Analysis: «2026-08-15-guard-denied-shell-wrote-anyway».

## What stood in the articles

Cases and numbers that used to stand next to the rule's articles. No edit decision rests on them:
they are for whoever investigates a miss or argues with a guard.
- **A task folder for any work.** Before, the rule judged by the number of sessions: work fitting in
  one commit went into the PR body and created no folder. In one session that exception twice became
  a reason to bypass a guard's refusal instead of creating the folder and moving on.
- **Taking the folder apart before opening the PR.** Before, the cleanup stood after approval. Three
  times in a row the folder went into the main branch untouched, and there was nobody left to take
  it apart: the work had moved to the next task, and the PR was closed.
- **The layout header in a copy of the template.** Left in the copy, it refuses the very first edit
  of the grill, and the refusal leads to editing the package template instead of the copy for the
  task.
- **A discrepancy not found by reading the template whole is found by the owner** — at acceptance of
  the whole work, not of a single edit.
- **A folder that went into the main branch.** Three times in a row the folder of a closed task went
  there not taken apart; the last time there were five of them.
- **A stage stalled because of one of its parts.** The stage had five parts, one waited for servers
  the owner had to raise — all five stalled. The other four did not depend on the awaited thing at
  all.

- **An epic plan written anew by each session loses the decisions of the previous ones.** The name,
  the address and the method named by the owner along the way live in the same place as the set and
  order of tasks.
- **Reading the skip from the command itself works without the network too.** The
  `Task-folder-skip:` line is read both from the PR body and from the call text: the second road
  remains when the hosting is unreachable.
- **A draft without a number is the only folder absent from history.** There is nothing to put there
  until there is a name.
- **On the board an epic of ten tasks looks like one.** Created one by one, they hide the volume:
  the owner sees a card, not ten.
- **The review of closed work is led by the closed-task review role.** A tree that has not laid it
  out leads the review itself.
- **The owner needs the list of states at the start of the work.** Without it, after six questions
  neither what comes next nor how much lies ahead is visible.
- **The tail of handed-over work is four steps:** open the PR, wait for the run, lift the draft, ask
  for a merge. They have no state on disk any more.
- **A one-line grill passes the guard the same as a hundred-line one.** The grill template lists the
  six mandatory questions as a table, and an empty table passes on a par with a filled one.
- **The conversation guard's refusal is carried out after the fact.** The owner sees the unasked
  question together with the refused turn: a prose question is not a tool call, and there is nothing
  to catch it earlier. The guard marks the miss but does not undo it.
- **The folder requirement skip is needed where the work merges in parts.** Then it is not taken
  apart until the end, and the reason stays in the PR.
- **The state line is more precise than any promise.** It is visible in the file, the guard reads
  it, behind it stands a list with a mandatory action — which is why, moved ahead, it gives itself
  away by nothing.
- **Progress living in the working tree is visible to nobody.** The owner sees a branch without a
  single trace of what is done in it, and the next session finds emptiness instead of "Where we
  stand". This is the second consequence of an uncommitted folder, and it is quieter than the first:
  no refusal comes at all.
- **The layout header left in a copy of the template refuses the very first edit of the grill.** The
  refusal then leads to editing the package template instead of the copy for the task.
- **Edits after review remarks go without a plan on disk.** The folder is taken apart by a commit of
  the branch before the PR opens, and from that minute the work has no state: the branch history
  judges it.
- **A state boundary looks like a finished piece better than any milestone.** A reply to the owner
  about a taken task is indistinguishable from a stop: the number, the branch and the column are
  named, and everything named is true.
- **A PR in the wrong language.** In a tree where PRs are written in another language, a foreign
  title went to the hosting twice, and both times it was caught by eye.
- **A question drowned in the reply.** The owner asked three times why the work was standing.
- **Someone else's epic in the queue list.** Twice in a row the first task of someone else's epic
  was taken next: in the list it looks like one's own.

- **An uncommitted task folder refuses where there is nothing left to fix.** The guard asks for it
  from disk, so every edit passes without refusal, and the sign of handed-over work is taken from
  the branch history. The refusal comes at opening the PR — when the folder has been taken apart by
  hand: the plan is gone, and it has to be assembled from memory. All that while the owner sees a
  branch without a trace of what is done in it.
- **A run placed as the first closing step eats the session window.** It costs more than all the
  other steps together: the one who spent it hit the fill threshold on four binding lines — on work
  that would have taken a minute had it come first.
- **Permission to work outside the assigned epic belongs to the working tree, not to the branch.**
  Written into a repository file, it leaves with the branch: from a neighbouring one it is
  invisible, and the epic guard refuses exactly the work the owner permitted. Its place is next to
  the session handover. The list is filled by the executor and permitted by the owner: a number
  written in by oneself is not a permission.
- **A task moved to another epic is removed from the previous one's set in the same turn.** The move
  is two motions, and done by half it leaves the task in two sets at once: the epic looks unclosed
  with all its work done. The total is written where the set is edited: postponed, it is written
  from memory of how many tasks there were, not how many remain.
- **A run of the readiness command while writing the plan costs a minute** and shows the cause of
  the line in the command's own output, where a guess shows nothing.
- **Without the sub-issue link the makeup of an epic is assembled by hand**, from the list of open
  cards, one card at a time.
- **The task order says nothing about how the branches stand**, and the numbers of the created
  tasks return to the order section by the same edit.
- **A finished epic is named to the owner by the same turn that takes work outside it.**
- **A retelling of a sample in the grill and in the epic plan is not the sample.**
- **The review of closed work ends with an edit of the rules layer or a proposal outward.**
