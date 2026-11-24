# The guards of the end of a turn

**Status:** in force · **Revision:** 2026-11-22 · **Scenario prefix:** `SC-AK`
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

The questions to the owner are judged by the agent hook of the question tool, and what was said in a
turn by the agent hook of the Stop event; both are rules at the end of this section. The guard of the
exits asks the engine of the task flow for a verdict: `docs/specs/agent-kit/turn-guards/flow-script/exit/`.

- **A squeeze summary is never a real remark of the owner.** It retells turns that have already
  ended: a request carried out yesterday reads in it as said now, and a turn refused by it pays for
  work nobody asked for. By its words it is indistinguishable from the speech of the owner and is
  richer than it — it retells the whole session at once — so it is recognised by a sign of the record,
  not by the text.
- **The tool that closes the conversation is refused always.** The session is ended by the owner and
  by nobody else; the guard has no lawful form of bypass and refuses even without a JSON parser.
- **A role switched off by the tree does not hold the guard at it.** The tree names the switched-off
  roles by a list in its setting, and the guard at such a role exits silently. What is switched off is
  the mandatory call, not the role itself: its file stays laid out, and it can be called at any
  minute.
- **A setting that cannot be read does not switch a role off.** There is no JSON parser, there is no
  setting itself, the setting is not parsed — the guard works as before. A broken reading would put
  the rules layer out silently, and there would be nothing to notice it by.
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
- **What counts as work is an edit of a file and a command of the work the description names.**
  Reading, searching and conversation do not count as it: they are what fills a turn that has
  stalled. The commands of the work are the list `words.write` of the description of the task flow,
  and a tree adds its own through the override, not through an edit of the engine.
- **A turn in which the executor admitted a miss does not close until there is a record about the
  incident.** The agent hook on the Stop event reads the admission in the reply and looks for the
  record in the directory of incident analyses the tree names. A record written in the turn is sent in
  the same turn; a send a permission prompt refused is named to the owner with the permission it needs.
- **A turn in which the owner said to create or send a proposal does not close until there was a
  sending.** What is written and not sent lies in the tree indistinguishably from what is sent, and it
  has no record of its own in the rules layer. Showing what would go away does not count as a sending.
- **The guard declares the locale of its run, it does not inherit it.** The samples are written in the
  words of the tree, and the folding of the case at a word outside Latin works only under UTF-8: a
  service launching the same work goes with an empty locale, and the guard does not find its word —
  that is, it lets the turn through, saying nothing about it. There is nothing to notice this by on
  one's own machine: the terminal of the developer goes under UTF-8.
- **A turn in which the executor asks the owner to sign in or type a password does not end.** The
  stand, the sign-in and the accounts for the check are prepared by the agent. An obstacle before the
  request — a field that does not accept input, a foreign extension in the browser, a profile that
  disconnected — is removed by the agent. The agent hook on the Stop event refuses such a request.

- **Whether a turn may end by what was said in it is judged by a model, not by word samples.** The
  package lays out the text of an agent hook for the Stop event; the hook reads the owner's latest
  words, the final reply and the calls of the turn. Open work is not its to judge: the exit guard
  measures it. The hook refuses a turn that leaves undone the work the owner's latest word ordered,
  asks what is already answered, states a fact with no output or admits a miss with no record.

- **The refusal of the model names itself by a fixed mark.** It starts with `BLOCKED by
  turn-judge:`, and refusals are counted by that mark in the transcripts.

- **Whether a question to the owner may leave is judged by a model.** The package lays out the text
  of an agent hook for the question tool; a refusal of another check is never a reason to hold the
  question, and a held one starts with `BLOCKED by ask-judge:`.

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
- 2026-09-18 — the waiting guard refuses a turn that started or reran a run and put no wait on its
  end: a rerun went through between other things, and the owner found the green run first.
- 2026-09-18 — the third sign of the guard of the conversation: two answers «recommended» in a row
  close the remaining questions by assumption, and the next menu is refused.
- 2026-10-09 — the guard of the conversation went into a subdomain of its own: the scenario file ran
  past the length limit again with two new scenarios of that guard.
- 2026-11-15 — the guard of the exits asks the engine of the task flow for a verdict. The rules of its
  tiers are removed with their scenarios: the second pass, the open epic, the written plan, the
  closed stage, the unpushed commits, the handed-in work and the keys under two names. The subdomain
  of a turn under an open epic is removed: the epic is measured by the description. The agent hook
  of the Stop event no longer reads the progress and the epic table: scenarios `SC-AK-1362` and
  `SC-AK-1364` are removed with the waiting line and the handed-in work it judged.
- 2026-11-22 — the agent hook of the Stop event no longer lets a turn end on a word to stop: the
  owner stops the work by Esc. It lets a turn end while a background task of the session still runs
  and the reply names the task and the step that goes on by its notice.
