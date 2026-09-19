<!-- rt-kit v0.29.0 · laws/work-conduct.md · 818818732ba0 · правится надстройкой, не здесь -->
# Law on work conduct

The law sets how work is conducted from the moment a task is set until it is closed. Work outlasts
one session and keeps its whole context and state when it passes to the next.

## Articles

- **Work does not start before the executor has understood what is being asked.** A gap in
  understanding does not close by itself: it surfaces in the finished change and costs a rework
  where a question would have done.
- **A gap is closed by a question to the owner, not by a guess.** A guess cannot be told from
  knowledge: it enters the work silently and is found only at acceptance, where rework costs most.
- **Work that requires changes modelled on a sample starts with reading the sample itself.** A
  retelling is not the sample: the divergence surfaces at acceptance as a whole piece of work, not a
  line. The part the work repeats is read in full — another tree's structure is not judged by one
  file.
- **A sample named in the progress must be reachable by every session while the work goes on.** The
  link is written directly in the progress.
- **A question with an obvious answer does not stop the work.** The executor names the assumption,
  moves on and writes it where the work goes on. Only a gap where any guess makes the work dangerous
  or useless stops it.
- **A stop is named in the first line.** The stopping message begins with what is awaited and what
  happens if no answer comes. Measurements, findings and analysis are already in the progress by
  then and are surplus in the message.
- **The owner is not asked a question whose answer is already written down.** The written is read
  before the conversation, not instead of the answer: a question about what is decided devalues the
  others too.
- **A question to the owner is asked after the answer was searched for in the tree.** What the tree
  holds, the executor finds out alone: a name, a path, whether a file exists, how the repository is
  arranged — from a command, not from the owner.
- **A statement about the tree is worth exactly as much as the command that showed it.** A negation
  — "not here", "this was never set up", "no such file exists" — is spoken only as command output.
  An unverified negation is more dangerous than a question: the owner corrects a question but takes
  a fact on trust, because the executor is looking at the tree.
- **Empty output is never a statement.** It means "zero lines" or "the wrong thing was asked", and
  only a repeated call tells the two apart — without a pipe and without silencing the error stream.
  Until then nothing has been said about the tree, and "there is nothing" cancels work the owner
  ordered.
- **A negation obtained from one source does not count as a negation.** A "not found" reply, an
  access refusal and an empty list speak of the asker's rights, not of the subject. "It does not
  exist" is said only after a second source — otherwise the executor reports their own rights to the
  owner as the state of the world.
- **A decision once written down is in force until it is revoked, and is read before it is made
  anew.** A revoked decision leaves no trace — the result shows neither that it was made nor that it
  was dropped. Made anew, it diverges from the earlier one silently and costs the same work twice.
- **A decision that will outlive the task is written where it will outlive it.** The progress dies
  with the task folder, while a name, an address and a method the owner named mid-series are needed
  by the next tasks. A decision that did not move lives only in its session's conversation: the next
  session scouts honestly, finds nothing — and asks the owner what was already answered.
- **A tool named in the request is part of the request.** Replacing it with one's own departs from
  the request, even when the answer is the same: whether tools are equivalent is decided by the
  asker.
- **A substitution that did happen is named in the same reply.** What was used instead and why — in
  two words, next to the answer. Without it the owner learns of the substitution by repeating the
  instruction, and pays for the work twice.
- **Understanding is written down where the work goes on.** What stays in the conversation lives
  with one participant until the next day; the work is continued by someone without that
  conversation.
- **What the owner said is written in the owner's words and is not rewritten afterwards.** A
  retelling is quietly adjusted to what is already done, and nothing is left to check the result
  against.
- **The agreement on how the product behaves is written before the code that carries it out.**
  Written after, it is written from the code and repeats its mistakes: it has nothing to diverge
  from, so it checks nothing.
- **The description is brought in line with what was done before the work is closed.** The agreement
  describes the intent, and by the end of the work the application differs from it too. A divergence
  put off is never found: the next day it is unnoticeable, and the description is still read as
  correct.
- **The state of unfinished work is restored without the owner's involvement.** Otherwise every
  break costs the owner a retelling, and the work queue shows what was started without saying what
  inside is done.
- **An executor's session is finite, and its end does not coincide with the end of the work.** The
  room where the executor remembers the progress is limited; once full, it loses not the last part
  but everything at once. A session brought to a logical point in advance costs one entry; one cut
  off midway costs a whole session of recovery.
- **Interrupted work is handed to the next session as a ready text, not as the owner's retelling.**
  The owner knows the work is unfinished but not where it stands; the retelling comes from memory,
  not from the progress, and the next session starts from someone else's picture.
- **What the previous session handed over arrives in the new session by itself, not placed by
  hand.** A handover written and not read equals one not written: the next session starts from a
  blank — the very thing it was to prevent. What is entrusted to the machine is not forgotten
  overnight.
- **The order of conducting work arrives in the session together with the work; the session does not
  search for it.** A session that knows the task but not what comes next reads the whole rule first
  — and spends the room it was started anew to gain. A short extract arrives: the states, the
  mandatory action of each, how a turn ends. It does not replace the rule: it answers "what to do",
  not "why".
- **The plan and the progress are different records.** The plan is what acceptance checks the result
  against; edited along the way, it stops differing from the PR, and acceptance has nothing to
  check.
- **Done work is marked in one place.** Two records of the same thing drift apart silently, and then
  neither shows what remains.
- **A decision made along the way is written down together with its reason.** Without a reason it
  reads as accidental and is revoked by the next session, and brought back by the third.
- **The boundary of the work is named before it starts.** A boundary not named aloud does not exist:
  the change spreads to its neighbours and has to be removed by hand.
- **Actions the executor does not take alone are named as a list.** Everything that leaves the
  working tree or cannot be rolled back — a write to the shared repository, a publication, a PR, an
  edit to a shared document — is done on the owner's word. That word covers an action, not the work
  as a whole. A boundary not in the list is derived from general words: "do what the plan needs"
  reads as permission for everything the plan implied.
- **The sign that work is closed is named before it starts and is checkable.** "It works" is not a
  sign: every session understands its own thing by it, and the work closes when it grows tiresome.
- **Work started and abandoned is visible.** What is abandoned midway looks like what was never
  touched, and the second session starts it over.
- **Records of finished work do not lie among records of current work.** What is closed and lies
  next to what is in force reads as in force — the more convincingly, the older it is.
- **Finished work cleans up after itself before it enters the shared tree.** Afterwards nobody
  watches what was left: the work has moved on, and the change that would have cleaned it up no
  longer exists.
- **Whether understanding is sufficient is judged by the one who asked.** A machine sees that a
  record exists, not that every gap in it is closed. A sign of sufficiency derived from size or
  question count becomes a goal in itself — the executor fills it without coming closer to
  understanding.
- **An unasked question is noticed only by the one who knows what they wanted.** It leaves no trace:
  the work looks understood up to acceptance, and there is nothing to derive the missing question
  from.
- **An incident is defined by a sign, not by a judgement after the fact.** An incident is a session
  where the executor did the wrong thing and the rules layer did not refuse it. A code defect is not
  an incident: the product agreement explains it. The sign is written once, not derived anew by
  every session — otherwise it is set by whoever it gets in the way of.
- **An incident ends with a record, and the record is made in the same session.** A day later the
  mechanism of the miss is retold smoothed over: conclusions remain, and no rule can be derived from
  conclusions. The record names the mechanism step by step, what was available before it, what
  caught it, and what went into the rules layer.
- **A record without an edit to the rules layer does not count as closed.** An analysis that
  produced neither a proposal nor an edit to a law, a rule or a pattern is a complaint: it explains
  what happened and changes nothing, so it will repeat.
- **Closed work leaves what it learned about the rules where the machine will pick it up.**
  Understanding gained by one piece of work is worth most to its neighbour — and dies with the
  session if it stayed in the conversation. A free retelling is carried over by hand, that is, until
  the first busy week.
- **A proposed rules edit has a named address: the rules layer itself, the names of this tree, or
  its override.** Without an address the edit lands where the author can see it — their own tree —
  and what is shared settles in one place, unknown to the rest.
- **A proposal the owner spoke about aloud goes out in the same turn.** Written and not sent, it
  looks in the tree like one that was sent: it has no record in the rules layer, and the owner reads
  the work as done until asking directly. The owner's word — "send it", "file it", "write it" — is
  an order, not a topic; showing what would have gone out is not sending and leaves no trace
  outside.
- **The inconvenience of sending is a reason to say so, not a reason not to send.** The executor's
  argument against a decision the owner made remains an argument: it is spoken aloud, and the work
  goes on meanwhile. Only the owner can postpone a decision; one postponed by the executor's
  argument looks done to the owner, who learns its cost last.
- **Work in which a series of tasks is visible is declared an epic before the first of them.** It is
  declared twice: as a card in the work queue and as a plan next to it. An undeclared series exists
  only in the head of whoever conceived it: the next session sees scattered tasks, finds no order
  and takes the closest.
- **The epic plan names the capability being built, the set of tasks and their order.** A set
  without an order is not an order: two tasks whose order lived in understanding went in the other
  way round, and the second was reworked to fit the first. A capability named in one word is read by
  everyone their own way a week later.
- **The order of an epic's tasks is assigned at planning and holds until the epic ends.** A revision
  along the way is the owner's decision, written where the work goes on. An order assigned anew
  before every task is set by whoever finds it closer, and the epic ends where it grew tiresome.
- **Every task of a declared epic gets its card in the work queue at once, not on the day it is
  taken up.** The epic plan holds the order for the executor; the work queue holds it for whoever
  looks at it. An epic with one card out of ten looks there like one step of work. The card number
  goes into the plan by the same edit: otherwise the plan answers "take the next one" with a title,
  and the card is created again under a new number.
- **Taking the first task of an epic takes the epic itself into work, and the epic card says so.**
  The owner follows the epic by one card, not by its tasks; a card that stays where the epic was
  declared reads as an epic nobody started, however many of its tasks are already done. The card
  moves by the same motion as the first task's, not by a separate step remembered later.
- **An executor's session does not end together with the task.** The end of a task is not a sign to
  stop: only the window fill limit allows stopping. A session closed on a finished task leaves the
  owner a blank and costs a whole session to return to what was at hand.
- **The window fill limit stops a session only where the tool does not compact the context itself.**
  Where compaction is declared and comes before the limit, the window is not the end of the session
  but its continuation: the context is compacted, the written state returns into it, and the work
  goes on. A stop there costs the same as any other: the owner puts the executor back to work by
  hand.
- **The threshold at which a session is stopped stands later than the threshold at which it is
  continued.** Two thresholds on one number are not agreement but a race, won by the one closer to
  the action: the stop comes on a call, compaction between turns. The distance between them is
  declared, not derived: compaction is not instant, and a threshold a hair away satisfies "earlier"
  without saving the work.
- **A transition from state to state does not stop the executor.** The mandatory action is done —
  the next one begins in the same move, without a report to the owner and without the owner's word.
  The boundary between states looks like a finished piece, and a report takes the place of the next
  action: the owner reads it as done work while the work stands still.
- **The text that leads a work state names what is done right after it.** Read to the last
  technique, it ends in nothing: no next move is in it, and the executor derives one from emptiness
  — that is, stops. The named move stands where the techniques stand, in its own words: a line
  identical for all states stops being noticed before it is needed.
- **Work handed over for review frees the executor rather than stopping them.** Work under review
  waits for the owner, not for the machine: the next task of the epic is taken in the same move that
  sent the previous one to review.
- **Work is not spent waiting for the machine.** A check on the other side does not go faster for
  being watched. While it runs, the next task is taken, and the check is returned to in the turn
  that reads its end. A session spent waiting costs as much as one with a task done, and yields
  nothing.
- **A wait that does stop the work is named to the owner separately and directly.** Sometimes there
  is no way forward: the next task stands on one not yet reviewed, or the change waits for a
  decision only the owner has. Then the executor says three things — what stands still, what it
  waits for, and what the owner can do. Mixed into a report, it is not read: the stop is named
  separately.
- **The analysis of closed work is done in a turn of its own and does not hold up the work.** It
  sees what only the session that did the work can see, so it cannot be skipped; nor is the next
  task held for it. Findings are written where they will be found after the merge and shown to the
  owner in full: the owner decides what becomes an edit.
- **Having handed work over for review, the executor names what they wait for and what they will do
  next.** The owner sees not the executor's head but the work page: a green check and an available
  action read as "all done". A wait named aloud is all that tells "waiting for the checks, then I
  clean up" from "done, take it". Unnamed, it does not exist, and the owner acts on what they see.
- **Work does not count as ready until the executor has said so directly.** Readiness is declared by
  whoever did the work — as a separate request, about this work. Green checks are not readiness:
  they say nothing is broken and are silent on whether anything is left. The owner reads silence as
  readiness, and between the two readings everything that stood after the review is lost.
- **Cleaning up after the work happens before readiness is declared.** The cleanup is done before
  the request to include the work in the shared tree, not after consent. After inclusion nobody is
  left to clean up: the work has moved on.
- **A standing instruction of the execution environment is weaker than a rule of the tree.** The
  environment describes its own default and knows nothing of the tree; the tree overrides it
  silently — by saying otherwise. A discrepancy is resolved in favour of the tree, not of the text
  worded more strictly or standing closer to the matter. It is recognised by reading both: a machine
  cannot compare the instruction with the rule.

- **Until the epic has ended, the next piece of work is not chosen but taken.** A choice offered to
  the owner while an order stands is a request to assign it again: offering it a second time cancels
  one's own planning.
- **The list of work permitted outside the epic repeats the owner's word; it does not replace it.**
  A number gets there after the owner has named that work, only so that the guard lets it through.
  An executor who wrote the number in alone permitted the work to themselves, and the record cannot
  tell this from the owner's permission.
- **The assignment of an epic belongs to the working tree, not to a branch, and is declared in the
  main branch before the first task under a new epic is created.** The record lies in a file, and
  the file belongs to the branch where it was edited: written into the first task's branch, it is in
  force only there. At the first branch switch the executor works by the new order while the guard
  reads the old one, and the refusal comes at the end of the turn, with the work done and handed in.
- **The next task is taken from the epic plan, not from the work queue list.** The list is sorted by
  number, fresh tasks on top; it does not hold the epic's order and cannot — tasks of all epics lie
  there at once. The epic plan is opened before a task is taken and answers in one call: which task
  is next, and whether it moved to a neighbouring epic.
- **An ended epic is named to the owner in the same turn in which work outside it is taken.** While
  the epic goes on, the next piece of work is taken silently; once it has ended, the next step is no
  longer obvious to both. Taking work outside an ended epic in silence leaves the owner sure the
  epic continues.
- **An epic is not closed while even one sign of its end is confirmed only by reading.** A sign
  checked by eye closes the work only after a command or a measurement checks it, with their output.
  The note "confirmed by a live measurement" is a promise to check, not a check. Closed on two signs
  out of three, the epic carries the third into the archive, where nobody looks for it.
- **What is noticed along the way and does not belong to the epic becomes a task in the work queue,
  not work now.** A distraction looks cheap until a change to a neighbouring domain turns out to
  have gone out with it: the epic stands still meanwhile, and both pieces of work are rolled back.
- **An epic ends when its tasks have run out, not when it became unclear what comes next.** It
  becomes unclear because the plan was not opened: it lies there and holds decisions not visible in
  the code.
- **The position of an epic is shown to the owner as a table — in the handover and at a stop for the
  owner's decision.** At these two moments the owner looks at the work from outside, to take it into
  a new session or decide where to lead it. The plan is not opened then, and neither the handover
  nor the question shows what is done or what remains.
- **The table shows all tasks of the epic at once — closed, current and assigned.** One row per
  task: place in the order, the task, its state; the current one looks different. Closed tasks stand
  in their actual order, future ones in the assigned one, and the divergence between them is a
  statement too. A list of only the remaining tasks does not show what the work cost; of only the
  closed ones, how much is still ahead.

## The human's point of view

A decision, and a question about it, is judged from the side that will use it, not from the side
where it is convenient to write. The executor sees the mechanism, the human sees the path to the
goal — and the two views drift apart silently.

- **Every option offered to the owner is named with its cost to the human.** How many steps, where
  the human ends up, what they need for it. An option without this looks equal to the rest and is
  chosen on the wrong grounds.
- **The recommended option is the one better for the human, not the one cheaper to edit.**
  Cheapness is named separately and does not replace the argument.
- **A description of how things work now is not an assessment.** A retelling of the current order
  is offered as an answer to "what is there" and read as an answer to "how it should be": what is
  said without an assessment reads as approved.
