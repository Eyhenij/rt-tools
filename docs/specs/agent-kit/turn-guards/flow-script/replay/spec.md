# The recorded turns

**Status:** in force · **Revision:** 2026-11-24 · **Scenario prefix:** `SC-AK`
**Depends on:** none
**Laws:** `work-conduct`, `verifiability`
**Procedures:** none

## Why

Every nudge of the owner since 13 October stands behind a turn that ended for nothing: a report, an
announced intention, a wait for someone else's step, a stop on a milestone, an answer in the middle
of the work, a question the rules already answer, a stop at the window, a stop against a standing
order, a new session offered for the agent's own step, the deadlock of RT-3304. The six live turns
of RT-3276 and the lawful ends of a turn stand next to them. These turns are kept as fixtures and run
through the hook on Stop on a tree in the state the turn stood in, so a change of the engine or of
the hook shows at once which stop it lets through again and which lawful end it starts holding.

## Terminology

- **A recorded turn** — a fixture of `projects/agent-kit/tests/fixtures/turn-replay/`: the entries of
  one turn with their role, time, the name of a call, its answer code and the owner's word.
- **A class label** — the owner's word written as its class: `<nudge>`, `<question>`, `<abuse>`,
  `<order:RT-N>`, `<refusal>`, `<menu-answer:N>`.
- **A lawful end** — a turn the owner ended by a stop word or by Esc, or the end of the epic measured by its history.
- **The state of a fixture tree** — the state of the scenario a fixture tree is built in: the request
  not opened, the task taken, a stage going on, the folder taken apart, the work handed in, the end
  of the epic.

### What it is called in the interface

There is no interface: the suite prints a line per case, and the hook answers with a refusal or stays
silent.

## Rules

- **A turn that wrote to the tree and stops while the scenario is open is held, whatever its last words are.**
- **The refusal of a held turn names the measured state and one move: the current step with its command, or the action of the state.**
- **A word of the owner that asks to stop or to wait, typed or chosen in a menu, releases the turn while the scenario is open.**
- **A session that wrote nothing releases the turn on a question or on swearing of the owner.**
- **The end of the epic releases the turn: every task lies in the epic branch, and the PR of the epic into the main branch exists.**
- **A menu of a refusal held twice in a row releases the turn; held once, it does not.**
- **The menu hook lets the menu of the exit check through and holds an option that removes or weakens a check.**
- **The model hook on Stop does not judge open work and holds a question whose answer is already given.**
- **A recorded turn carries no text the owner typed: the word is a class label or a phrase of at most four words that asks to stop or to wait.**

## What is out of scope

The engine, its measurers and the release cases are the subdomain one level up; the cases of the end
of a turn one by one are in the domain of the exit check. The verdicts of the model hooks on the same
fixtures are compared by the replay of the subdomain `step-mark/`: a judge with no tools gets the hook
text and the turns of a fixture; the suite reads the text of those hooks, not a model.

## Contract

The suite `projects/agent-kit/tests/turn-replay.test.sh` builds the fixture trees, writes the record
of each fixture as the record of a conversation and calls the hook on Stop with it. A held turn is a
`block` answer of the hook; a released one is no answer, and the engine command `verdict` names the
release case. `RT_REPLAY_LAID=1` runs the same turns on the laid-out hooks and engine of the tree.

### Refusal codes

Not applicable: a refusal comes as text naming the state and the next move.

## Data

A fixture is one JSON object: `case`, `kind`, `record`, `task`, `turns` and the owner's next word
`next`. A turn entry has `role` (`owner`, `agent`, `hook`, `harness`), `at` and one of `owner`,
`say`, `call` with `code` and an optional output `out`, `menu` with `answer`, `stop`, `compact`. A
call that ended with code 0 and names no `out` answers `done`. What the suite expects stands in
the suite next to the case line, not in the fixture.

## Screens and states

There are no screens.

## Cross-cutting requirements

### Locales

The case lines are written in the language of the tree.

### SEO

Not applicable.

### Mobile layout

Not applicable.

### Several objects

Not applicable: one turn is run at a time.

## Decisions

- **The expected outcome lives in the suite, not in the fixture.** The judge of a fixture gets its
  turns by the text of a model hook; an outcome written in them would tell the verdict.
- **The hosting is a double in the fixture tree.** The board module is read from `tools/` of the tree
  root, and the fixture tree holds a module that answers from a file next to it: the suite never
  reads the real hosting.

## Open questions

None. Q-1, the menu of a step another check refuses twice, is closed: the engine names it, and
the case of the deadlock of RT-3304 checks it. Its number is not given again.

## History of changes

- 2026-11-15 — the subdomain was started with the stop kinds, the six live turns of RT-3276 and the
  lawful ends of a turn.
- 2026-11-22 — the recorded words «не сейчас», «стоп», «Стой», «жди конца набора», «жди соседа»,
  «Остановись на логической точке» and «Не сейчас», and the menu answer «стоп», now hold the turn:
  no typed word stops the work, and the owner stops it by Esc. The menu of a refusal offers
  «отложить RT-N» and «подскажу путь».
- 2026-11-24 — the same seven recorded words and the menu answer «стоп» release the turn again: the
  stop word is a release case next to Esc. Scenario 1913 counts the seven messages by one line each.
