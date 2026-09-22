<!-- rt-kit v0.29.0 · pitfalls/turn-conduct.md · 24737b50a8cb · правится надстройкой, не здесь -->
# Session turn — cold part

Pitfalls: cases and numbers that used to stand next to the rule's articles. Loaded not with the
rule but on demand — an ordinary decision does not need it.

The rule is `turn-conduct`; the articles that hold the law stand there.

## Pitfalls

- **A summary about someone else's step instead of work.** In one session this was broken four
  times, and finished work stood in an unmerged PR for almost three hours.
- **A command named but not run.** Twice in one day a turn ended with exactly such a line, and
  both times the owner brought the work back himself.
- **A removed task folder.** Before, the guard exited silently here — and a turn one step short
  of handover closed empty.
- **Work without a branch and a folder.** Before, the guard let it go silently, and it was the
  least protected: the owner's request "lay out", "update", "look" goes without a task and
  without a branch, and it was exactly that which most often ended with a declaration of intent.
- **A statement about the state of the tree.** Eight analyses in a row fell on this miss, and each
  time one more article was added to the rule — now the machine holds it.
- **The statement guard that read the record before the text.** It is honestly silent and from
  outside indistinguishable from a guard that looked and let through: in one such turn three
  slipped past at once. The refusal belongs to one guard: had all three printed their decision,
  the output would have stopped being parsed whole.
- **Handed-over work with the draft not lifted.** Two finished PRs stood like that until the owner
  brought the executor back himself.
- **The repeated tail of a refused command.** A branch switch left in the discarded beginning
  carried six task files into the branch of the previous work together with the commit.
- **The judgement "this is safe" instead of the list.** In one session the same command was first
  too dangerous to call, and two turns later safe enough to call without asking.
- **Why the wait guard reads the turn, not the hosting.** Asking the hosting would be more
  precise, but a network call at the end of a turn falls together with the connection and would
  refuse the work instead of the miss, and the command's output about the run already lies in
  the turn's record.
- **A step removed from the irreversible list by the analysis of a past miss is not brought back
  by an argument.** The argument that brings it back has already been taken apart and rejected:
  twice in a row finished work stalled before the removed step, and from outside it looked like
  caution.
- **The guard's sign of work knows the first word of the command.** A reading subcommand matched
  it on a par with a commit, and a turn of one exploration read as full both to the session and
  to the owner.
- **An unpushed branch, an unmarked cargo record and an unclosed column are never someone else's
  steps.** "Where does the branch I created myself go" is not a question the owner answers.
- **The epic's position is not shown by a retelling from memory.** A task is closed by the merge
  the owner makes, and yesterday's state of the queue lies about what is already merged: the
  table is assembled anew in the turn that shows it.

- **A measurement split into per-step notifications eats turns idly.** Each of its steps assigns
  itself a turn, and there is nothing to fill the turn with: the tree under a running series must
  not be touched, and what remains is retelling what the next line will bring. One wait ending
  together with the measurement costs one turn.
- **A guard's refusal is investigated by reading its code, not by trying call forms.** A second
  refusal in a row on one requirement means the wrong axis is being tried: the address was
  changed while the form of the command decided — the call there was judged by the first word of
  the line, and all eight attempts began with entering a directory. Next, the guard itself and
  the profile it refers to are opened whole, including the branch the trials never reached.
  Guards always let reading through, including after the stop threshold.

- **A mechanism is called broken only after it has been read whole.** An analysis by half of the
  code sounds the more convincing the more detail it has, and the owner takes it for verified.
  There is one sign of the unread: a function name named in the analysis but never opened.

- **Work is not handed to the owner with the words "do it yourself" until the mechanism refusing
  it has been read.** A ready-made command with the explanation "it will not work for me" looks
  like help and does not work as help: it transfers the unfinished reading to the owner. A long
  chain of refusals is no argument here — it says how many times one motion was repeated, not
  that the mechanism is faulty.

- **The executor's inconvenience does not revise the owner's decision.** A decision taken about
  sending — open the PR, hand the work over, show what was done — is not cancelled because the
  road to it turned out longer than expected. The argument "it will take longer this way" speaks
  of price, and it is not paid by the one who took the decision: the price is named to the owner
  together with the step done, not instead of it. Telling this case from a lawful question is
  simple — a lawful question is about what the executor does not know, and this one is about
  what they do not feel like.

- **The exit guard judges a change to the tree, not the remaining action.** It asks whether
  anything at all was done in the turn — and a turn in which half of a stage is closed and the
  other half dropped on a refused command is indistinguishable to it from full work: there are
  commits, the tree changed. It catches only a turn that ended in nothing. Whether the state
  still holds an action not depending on what the turn waits for is checked by the attention of
  whoever leads the turn.
- **A refused permission is never someone else's step, and it does not stop the work.** The
  article about someone else's step is written about what runs by itself and ends without the
  executor: a run, a review, a merge. A permission refused by the environment does not end by
  itself — it waits for the owner's word — and work that ran into it stalls whole where several
  more turns of business went past it. Everything not depending on the permission is done, and
  what was not done is named in the PR body, in the section about the remaining step: that is
  exactly what it is written for.
- **An answer to a line from the owner that came in the middle of a turn does not end the turn.**
  The exit "a question to the owner" is about a question FROM the executor; the reverse case does
  not fit under it at all, and read so, it turns every line from the owner into the end of the
  session. In one session this cost three stops in a row: the owner asked, the executor answered
  and stalled.
- **Work is not gated on a confirmation the owner never promised.** "Say the word and I will do
  it" moves the turn to the owner without their consent: they did not ask to be asked, and nobody
  expected an answer from them. It looks like politeness, not a stop, and so it is read as a stop
  neither by the executor nor by them.
- **"Waiting for your word" under an uncancelled instruction to work is the executor's stop, not
  the owner's.** The article "a session does not start work by itself" speaks of a session with
  no line from the owner at all; read alone, without the neighbouring "an instruction holds until
  cancelled", it forbids continuing. In a consumer tree three turns in a row ended with this
  phrase: the guard's general refusal returned the turn, the executor made one step and ended
  the turn with the same phrase. Now the guard names it by name; the lawful exit when a decision
  is needed is a question through the tool.
- **"Turn exits": the price of a question that holds independent work.** A session stood a night
  and a morning naming the owner one and the same step while three independent tasks lay untaken.
- **"A guard's refusal ends the turn": why a bypass costs more than a refusal.** A guard refuses one
  file; a bypassed guard lifts the requirement from the whole tree and says nothing. Not memory
  alone holds this — the guards also judge the shell command that writes the file.
- **"The owner's answer is sought in their own messages": what the conversation guard does not
  see.** It counts loading a rule and searching it as reading, and a message leaves no trace. A
  question that answers itself in the owner's words devalues those asked next to it.
- **"A taken task is not yet begun work": what the guard's tier covers.** A branch without a task
  number is not under it; an assembled folder template lifts it.
- **"Exploration does not end a turn": why it passes for work.** It looks like work better than
  anything else: commands, exact numbers, checkable answers.
- **"A reply to the owner is not an action": why the report takes the place of the work.** The
  reverse order — work, report, end — stands behind every analysed stop: a report is a form of
  completeness, and an appended summary reads as the turn's end the more convincingly the more was
  done.
- **"A statement about the tree's state is watched by the statement guard": why a word has its own
  kind of command.** A general sign "there was a command" would confirm one thing by another.
- **A next step named and not begun.** Four stops of one shape: a stage closed and committed, a
  full report, the next stage named in the progress and untouched. The last, on 17 September, came
  after an epic with seven tasks, an agreement and a whole first stage — the more was done, the more
  the report read as the end. The guard now reads the order of actions after the last edit of the
  progress, and a turn that opened the PR passes that sign by itself.
- **A launch in the background as the last action.** A grill of five menus ended with the review
  roles sent to the background and the line "the roles are working"; the owner read it as a stop.
  The guard counted the launch as work — there were edits in the turn, and the last action was not
  a wait. Now the last tool of the turn is judged: the agent tool or a command sent to the
  background standing last gives the turn back, and work after the launch releases it.

## A single read of the run state taken for watching it

22 September 2026. An epic was handed over whole: nine tasks merged, the request of the epic opened
into the main branch as a draft. The pipeline woke by itself, and the turn held no starting command.

The executor read the state once — the run was going — and ended the turn with the words "I am not
waiting for the run". The run finished in 12 minutes 35 seconds, green. The draft stayed, the merge
button stayed locked, and the owner learned the work was ready forty minutes later, by asking what
the executor was busy with.

What confirmed the wrong decision: the waiting guard let the turn go. It demands that the state of
the handed-over work be asked, and the state was asked — while the run was still going. The guard
judged the fact of the question, not the end of the run, and its tier about a run started in the
turn knew only the commands that start one by hand.

What it cost: a ready request stood forty minutes under a green run; the owner checked the work
instead of the executor; two turns went on the conversation about why the work stood still.
