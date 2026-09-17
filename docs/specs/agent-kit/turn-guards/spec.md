# The guards of the end of a turn

**Status:** in force · **Revision:** 2026-09-06 · **Scenario prefix:** `SC-AK`
**Depends on:** none
**Laws:** `verifiability`, `work-conduct`
**Procedures:** none

## Why

Part of the rules layer stands not at an edit of a file but at the end of a turn: there is caught
what is not visible in the tree at all — a turn that ended with a report, a question to the owner
without the rules read, an admitted miss without a record about an incident, a filled window of the
session. The subdomain names what must be true at that and where the knowledge of a guard about a
turn ends.

The guards judging an edit of a file are a neighbouring subdomain: the subject there is different,
and they grow apart.

## Terminology

- **A turn** — everything written after the last real remark of the owner. The answer of a tool
  arrives under the same role and does not count as a remark; a squeeze summary does not either.
- **A squeeze summary** — a retelling of the past turns the tool puts into the record before the
  window closes. It arrives under the role of the owner and is not the answer of a tool.
- **An exit of a turn** — what a turn lawfully ends with: a question without an answer in the rules,
  a refusal of a guard, a filled window, work handed in with the next one begun.
- **A state of the work** — the unit the work is led by; it is declared by a line in the progress of
  the work.
- **The handover of a session** — a draft written by a hook before the squeeze: the working tree, the
  branch, what was done, the next step and the traits of the session. It is a neighbouring subdomain
  itself; here only one thing matters — a handover that is written ends a turn.

### What it is called in the interface

The guards have no interface: only the executor sees them — as the text of a refusal in their own
turn.

## Rules

- **A turn in which a question is asked of the owner does not end until the laws and the rules were
  read during the same turn.** The requirement stands at the end of a turn, not at the tool of the
  question: questions are asked in prose more often than by a menu, and intercepting the menu does
  not close the hole.
- **A squeeze summary is never a real remark of the owner.** It retells turns that have already
  ended: a request carried out yesterday reads in it as said now, and a turn refused by it pays for
  work nobody asked for. By its words it is indistinguishable from the speech of the owner and is
  richer than it — it retells the whole session at once — so it is recognised by a sign of the record,
  not by the text.
- **A second pass over the same turn is not judged.** The guard says its word once and lets go;
  otherwise the turn will never end. The one exception is the guard of the exits under an open epic,
  and its subdomain says so.
- **The tool that closes the conversation is refused always.** The session is ended by the owner and
  by nobody else; the guard has no lawful form of bypass and refuses even without a JSON parser.
- **Under an open epic the guard of the exits judges a turn that ended with work and a second
  pass.** The tiers of that lie in a file of their own next to the guard; the epic is read once per
  turn, on the way to a refusal, by the shared reading of the end of an epic.
- **A role switched off by the tree does not hold the guard at it.** The tree names the switched-off
  roles by a list in its setting, and the guard at such a role exits silently. What is switched off is
  the mandatory call, not the role itself: its file stays laid out, and it can be called at any
  minute.
- **A setting that cannot be read does not switch a role off.** There is no JSON parser, there is no
  setting itself, the setting is not parsed — the guard works as before. A broken reading would put
  the rules layer out silently, and there would be nothing to notice it by.
- **To a question whose answer a remark of the owner has already given, the guard of the conversation
  answers with a refusal.** The first sign judges whether the rules were read, and at allowed work it
  stays silent; the miss is of another kind — the owner gave an instruction by a direct remark, the
  executor found a fact against its price and, instead of a line about the price, asked a menu where
  two options of three cancelled the owner's decision. What is judged is the overlap of the
  significant words of the topic of the question and of the last remark of the owner — and only where
  a call of a menu was already in the record of the turn: the analysis of a request goes by six
  questions about different subjects, and they do not reach the threshold.
- **A refusal by the second sign orders to go on with the work, not to ask again differently.** The
  miss here is not in the shape of the question but in the stopping of work that is already allowed: a
  refusal named by the shape is fixed by a second question of the same stopping.
- **The guard of the conversation lets the work through at any breakage.** There is no record of the
  turn, there is no parser of the record, the reading broke — the turn is allowed. A broken guard has
  no right to jam the conversation.
- **The guard of the window reminds before it refuses.** Between the thresholds lies exactly what the
  session is closed by: writing the progress of the work to the end, writing the handover, committing
  what was checked.
- **The reminder repeats by steps, not at every action.** Otherwise it takes the very place it saves.
- **After the threshold of the stop the record of the progress of the work, the handover and the
  commands of the delivery pass.** Refusing them would mean taking away from the session the only way
  to close.
- **The size of the window is taken from the setting of the tree, not from the record of the
  session.** In the record the model is named without a mark about a widened window: a session on a
  wide window is indistinguishable from a session on a narrow one.
- **The threshold of the squeeze is set by the tree by the same numbers as the thresholds of the
  guard.** Where the handover is written by a hook before the squeeze, the threshold of the squeeze is
  the threshold of closing the session. Left to the tool, it comes almost at the limit of the window,
  and a session stopped by the guard earlier does not live to the handover.
- **The pair of the guard is checked against the pair of the squeeze, and what diverged is named by
  the numbers of both sides.** Separately both look configured, and the divergence is visible only to
  whoever puts them side by side.
- **A tree that declared no threshold of the squeeze gets no refusal.** Leaving the threshold to the
  tool is a lawful choice; then it is said once, not by two lines about the difference.
- **After the threshold of the squeeze the guard stays an insurance.** Where the squeeze is declared
  below the threshold of the stop, the first threshold calls to go on working, not to choose a point
  of stopping: the session will pass the threshold itself. The refusal is not lifted at that — the
  client may not come at all, and a session without the guard will live to the limit of the window and
  drop the work. Having fired, the refusal names the squeeze that did not fire by a number.
- **The guard of the window lets the work through at any breakage.** There is no size of the window,
  there is no record of the session, there is no parser — the work goes on.
- **One file of a guard has the right to declare several events.** The reminder and the refusal are
  different events of the agent, and the guard is one: taking them apart into two files would mean
  keeping two parses of one record.
- **A removed task folder lifts the requirement of a state and does not end the turn.** The folder is
  taken apart before the request is opened, and from that minute there is nothing to declare a state
  by. Letting the turn go by this sign is not allowed: a removed folder means the middle of handing
  in, not its end — between the tidying and the request the work is seen by nobody. Further the turn
  is judged by the second sign; a turn in which the request was opened or read the second sign lets
  through itself.
- **A turn that declared a written plan does not end at all.** The mandatory action of this state is
  to do the first stage, and whoever began it moves the state by the same edit: a turn that stayed in
  the former state did not begin the first stage by definition. The second sign does not fit here — it
  counts the creating of a task, a branch, a column and a folder as work. The refusal names the
  heading of the first stage of the plan, not general words about unfinished work.
- **A turn that opened a request does not end until the state of the handed-in work is asked by a
  command.** A draft is read by the owner as "the work is not finished", and the next task taken
  instead of finishing leaves what is ready invisible. This is asked by a command of the same turn —
  by lifting the draft, by reading the run or by the check of the work queue; the guard does not touch
  the network.
- **A step of closing the work does not count as taking the next task.** Moving the task being closed
  into the column of the review and removing its folder are mandatory steps of the closing, and both
  stand in the same turn the request was opened by. The sign of taking lists what taking happens to
  be, not what counts as an action: the list of the steps of closing is open and grows, and the list
  of the actions on the next task is closed.
- **A stage declared closed is confirmed by the output of a command.** The mark "done" is a statement
  about the tree, and a session later what was marked from memory is indistinguishable from what was
  checked. The former number of the stage the guard reads from the history of the branch, the command
  from the line of the plan "What it is checked by".
- **A technique written in prose the guard does not read.** There is nothing to confirm it by an
  output with — that is its known boundary, not a promise.
- **A turn in which nothing was done about the work does not end.** A report about what was done is
  not an exit of a turn: it looks like work better than any other — it is full, it names numbers and
  states, and the emptiness behind it is visible neither to the owner nor to the session itself.
- **What counts as work is an edit of a file and a command that changes the tree.** Reading, searching
  and conversation do not count as it: they are what fills a turn that has stalled.
- **A word about a stop is judged by the remark of the owner, not by the words of the executor.**
  Otherwise the stop is declared by whoever finds it convenient at that minute.
- **A turn that ended with words about waiting for the word of the owner is not let go without their
  word or a question to them by a tool.** The phrase "waiting for your word" without them is a stop
  declared by the executor; the general signs refused it without a name, and after one step the turn
  ended with the same phrase again. The refusal names the phrase by name and orders to go on: the
  instruction of the owner holds until they cancel it. The set of the samples of the phrase is named
  and closed.
- **Work handed in and merged the guard does not judge.** It has already waited for someone else's
  step, and a turn closed at it drops nothing.
- **A turn in which the executor admitted a miss does not close until there is a record about the
  incident.** By the same technique a turn with a question demands the reading of the rules.
- **A turn in which the owner said to create or send a proposal does not close until there was a
  sending.** What is written and not sent lies in the tree indistinguishably from what is sent, and it
  has no record of its own in the rules layer. Showing what would go away does not count as a sending.
- **What counts as reading is any of the three ways, not only the loading of a rule.** Demanding
  exactly the loading would mean driving to it where a search was enough: the guard would get in the
  way of the work instead of putting it right.
- **A request for a proposal is caught by a verb next to a word about the rules layer, not by the word
  itself.** Work on proposals that already arrived does not end with a sending, and the word
  "proposal" without a neighbour about the layer walks in every second turn about something else.
- **A turn with a question to the owner is checked at the tool of the question, not at the end of the
  turn.** The requirement "read the rules before asking" is executable only before the sending. The
  check at the end stays for a question asked in prose.
- **The guard declares the locale of its run, it does not inherit it.** The samples are written in the
  words of the tree, and the folding of the case at a word outside Latin works only under UTF-8: a
  service launching the same work goes with an empty locale, and the guard does not find its word —
  that is, it lets the turn through, saying nothing about it. There is nothing to notice this by on
  one's own machine: the terminal of the developer goes under UTF-8.
- **A turn in which the executor asks the owner to sign in or type a password does not end.** The
  stand, the sign-in and the accounts for the check are prepared by the agent. An obstacle before the
  request — a field that does not accept input, a foreign extension in the browser, a profile that
  disconnected — is removed by the agent. The requirement was held by the memory of the executor and
  did not fire: over one session the request sounded four times.
- **A request to switch the mode of work is allowed.** The owner is asked for the ordinary mode
  instead of the automatic one; the input into a form is done by the agent. A guard that does not tell
  these two requests apart would forbid the only allowed one.
- **The boundary of the set of samples is named.** A request in other words or through a menu of
  options the guard does not recognise.

- **The keys of the progress of the work and of the plan are read under two names, English and
  Russian.** The samples of a task folder in the package are English, those of a folder of the tree
  before the translation of the layer are Russian. The guard judges both the same: the state, the
  stage and the next step it takes by either of the two names.

## What is out of scope

- The guards of an edit of a file and the rules gate — a neighbouring subdomain.
- The handover of a session and the entry into a new one — a neighbouring subdomain: nothing is
  refused there, there a file is written and a text is put.
- The checks run by a command, not by a hook: their subject is the tree, not a turn.
- The boundary of a state in the texts of the work — a neighbouring subdomain: there the prose of the
  rule and the patterns is judged, not a turn.

## Contract

The surface is the files of the hooks the tree calls at the event of the end of a turn. The refusal
comes as the decision `block` with the text of the reason; silence means the turn is allowed.

### Refusal codes

Not applicable: the guard answers with a decision and the text of a reason, not with a code.

## Data

The guards have no data of their own: they read the record of the turn, the progress of the work and
the plan in the task folder.

## Screens and states

There are no screens.

## Cross-cutting requirements

### Locales

The texts of the refusals are in the language of the tree.

### SEO

Not applicable: the guards give nothing outward.

### Mobile layout

Not applicable.

### Several objects

Not applicable: a guard judges one turn of one session.

## Decisions

- **Refusing in favour of the work.** At any breakage the guard lets the turn through: a broken guard
  has no right to jam the conversation.
- **The signs are taken from the record of the turn, not from the network.** A network call at the end
  of a turn falls together with the connection and would refuse the work instead of a miss.

## Open questions

None.

## History of changes

- 2026-08-19 — the subdomain was split out of the spec of the guards: the scenario file had outgrown
  the length limit, and the subject in it was double.
- 2026-08-20 — the guard of the statements was created: what is said to the owner about the state of
  the tree is confirmed by a command of the same turn.
- 2026-08-21 — the handover of a session and the entry into a new one were split into a subdomain of
  their own: the scenario file ran into the length limit again, and the subject in it was double —
  what refuses a turn and what carries the work between the sessions.
- 2026-08-22 — the boundary of a state went into a subdomain of its own: the agreement about it was
  merged in here and by the same change took the scenario file past the length limit, and the subject
  in it was double — the guard refusing a turn and the check reading prose.
- 2026-08-22 — the guard of the window learned to read the threshold of the squeeze: where it is
  declared, the reminder calls to go on working, and the refusal became an insurance.
- 2026-09-06 — the guard of the exits refuses by name a turn that ended with waiting for the word of
  the owner: at a consumer tree three turns in a row ended with the phrase "waiting for your word"
  with the instruction to work without stopping not cancelled.
