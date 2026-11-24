# The guard of the exits of a turn

**Status:** in force · **Revision:** 2026-11-24 · **Scenario prefix:** `SC-AK`
**Depends on:** none
**Laws:** `work-conduct`
**Procedures:** none

## Why

A turn used to be judged by its last action and by a row of tiers, one per kind of stop seen in an
incident. Each new kind needed a new tier, and the work still stopped where no tier stood. The guard
now asks the engine of the task flow: a turn does not end before the scenario does, unless a release
case of the description says it may.

## Terminology

- **The verdict** — the answer of the engine at the end of a turn: released with the case that
  released it, or held with the one move that comes next.
- **A release case** — an entry of the section `release` of the description: a condition over the
  measurers and its order.
- **The journal** — the file in the common directory of git where a release nobody decided is
  written: a failed engine and the eighth refusal in a row. A release on a wait is written there
  too.
- **A service message** — a record entry under the role of the owner that the owner did not write:
  the load of a rule, the summary of a compaction, the feedback of a guard of the stop.
- **The interrupt** — the mark `[Request interrupted by user…]` the host writes into the record
  under the role of the owner when the owner presses Esc.
- **A hung task** — a background task of the session that runs past the bound of a wait with no
  notice of its end.

### What it is called in the interface

The subdomain does not come outward: the guard has no screens. Its refusal is read by the executor,
not by a person.

## Rules

- **A turn ends with the scenario: the engine measures the branch, and a turn whose scenario is not over is held.**
- **A turn is released by the first release case of the description that is met, in the order of the cases.**
- **A held turn names one move: the action of the measured state, and in a running stage the current step with the command that measures it.**
- **A held turn in a running stage with no current step names by its number the first step of the plan not done or without a matched mark.**
  On a taken-apart folder the progress comes from the history, and the refusal adds the move
  `git revert` of the commit that took it apart; a folder a live step run put back is read from the history too.
  The history is asked only in the state of a running stage. A step the plan names and the progress
  lacks counts as not done. A step done with no matched mark gets the measuring command, and the
  revert move only for a fix inside the folder.
- **The owner's stop word releases the turn: their last word begins with a stop word of the description, and nothing after it asks to go on.**
  An option chosen in a menu is the owner's word too. «хватит останавливаться, продолжай» and «Стой,
  не туда — делай RT-N» hold the turn: the first asks to go on, the second orders work.
- **The owner's interrupt releases the turn: their last word is the mark of Esc.**
  A turn a background notice wakes after Esc or after a stop word is released until the owner writes
  again. A message typed mid-turn counts as writing: the host keeps it as a queued command, not as a
  user entry. Esc stops an order sent a second before it too: the host does not send a queued message
  after the mark.
- **A session that wrote nothing to the tree releases the turn unless the owner's last word pushes the work on, and a branch outside the scenario releases it always.**
- **A role session with no edit tool ends with its report.**
- **The silent hosting releases the turn only when the measurement itself stopped on the silence.**
- **A menu of a refusal that did not reach the owner a second time in a row releases the turn.**
- **The session source names the background tasks of a record: the start of a command or an agent sent to the background, and its end by a notice with a final status or by a call that stops it.**
- **A turn that waits for a background task of its own session is released while the task has a start, no end, and is younger than ninety minutes.**
- **A background command older than ninety minutes with no notice is hung: the hold names it with its minutes and its output, and offers no owner's menu unless another check refused the step twice.**
  An agent past the bound counts as no task: one that handed its report back while its own work ran
  ends with no notice the record reads.
- **A server started in the background is no wait and is never hung; a watch of a CI run and any other command are waits.**
  A command is a server when its last part starts a server. A package script whose body starts its
  containers detached ends by itself and is a wait. A command of nothing but pauses and prints is
  no wait either: it waits for nothing.
- **The model hook on Stop lets a turn end while a background task of the session still runs and the reply names the task and the step that goes on by its notice.**
- **One background task releases one stop: a second stop with no call of a tool between the two is held.**
- **A turn has ended when the record holds something after the agent closed it, other than the feedback of a stop hook.**
- **A wait releases nothing once the work is handed over: the state whose action sends work to the background goes on by itself.**
- **A stop made while a background task of the session runs names no owner's menu.**
- **A background task the session has not read is the first move, and no owner's menu is offered over it: the refusal names the task and its output file.**
- **Two running tasks release two stops, and the end of a task gives its stop back.**
- **A release on a wait is written to the journal with the session.**
- **The session source and the source of the records read a record by pieces and never hold it as one string.**
- **The forecast judges a background task by the time of the stop it replays and names the longest run of held stops in a row; a released stop and a word of the owner break a run.**
- **When another check refused the same step twice for the same reason, or the executor stopped again with no call after a refusal of the engine itself, the one move is the owner's menu.**
- **A refusal of a stop names the hook after «BLOCKED by» in its first line; after the opening of the model check only a name right after it counts, else the model check; otherwise none.**
- **A stop again with no call, after refusals of a stop by other hooks only, is no idle one: the refusal names those hooks and the move of the state, with no owner's menu.**
- **The menu of a refusal carries exactly the options of the description: «отложить RT-N» with the task number and «подскажу путь», and the question says the way goes into its free field.**
- **While the boundary of an autonomous session lies ahead, the refusal names the default of the rule `autonomous-work` with the morning list instead of the owner's menu; once the boundary has passed, the menu is back.**
- **The command `/night` continues only a list whose boundary lies ahead, and the owner's new words rewrite its head; any other night gets a new list with its own boundary and words, and a boundary that is no moment ahead starts none.**
- **The owner's choice is carried out: a deferral marks the task «отложено» and the next unblocked task is taken; a way the owner wrote is taken in the same step.**
- **The menu hook lets exactly this menu through, and one question with a free field after a bare «подскажу путь».**
- **An engine that fails, runs past its limit or cannot be called releases the turn and writes «движок упал» to the journal.**
- **The eighth refusal in a row is written to the journal.**
- **A service message is no word of the owner.**
- **The engine measures the copy the session works in, and a worktree copy whose branch does not carry the engine is not judged.**

## What is out of scope

The CI hold, read before the release cases, is the subdomain
`docs/specs/agent-kit/turn-guards/flow-script/exit-ci/`.

The description, its measurers and the measured state are the subdomain one level up,
`docs/specs/agent-kit/turn-guards/flow-script/`. The guard of the conversation, the guard of the
window of the session and the guard of waiting are in the domain `docs/specs/agent-kit/turn-guards/`.
The line about a failure at the start of the next turn is written by the dispatcher, and its rule is
in `docs/specs/agent-kit/dispatch/`; its scenario stands here, because it is the second half of a
release by a failed engine.

## Contract

The guard is called by the event of a stop, hands its input to `task-flow-script.mjs verdict` and
answers with the verdict: silence for a released turn, `{"decision":"block","reason":…}` for a held
one. The engine has 75 seconds; the hook declares its own limit of 90 in its header.

### Refusal codes

Not applicable: the refusal comes as text naming the measured state and the next move.

## Data

The guard reads nothing itself but the role header of a role session. It writes the journal and the
count of the refusals in a row into `rt-kit/` under the common directory of git.

## Screens and states

There are no screens.

## Cross-cutting requirements

### Locales

The refusal is written in the language of the tree.

### SEO

Not applicable.

### Mobile layout

Not applicable.

### Several objects

Not applicable: the guard judges one turn of one session.

## Decisions

- **Refusing in favour of the work, but never in silence.** A broken engine releases the turn, and
  the release is written; the next turn begins with it.
- **The measured state instead of a row of tiers.** Nine incident analyses over a day described nine
  kinds of stopping; a tier for every kind was a race without end. The tiers of the former guard are
  removed together with their scenarios.
- **The silent hosting is read from the measurement.** A read that failed for a state the
  measurement passed over says nothing about a later local exit that is unmet.

- **A wait is read from the record, not from the words of the turn.** A turn that says «the suite
  runs in the background» with no background task in the record is held as before. Over 14–19.11
  169 of 251 refusals of the engine at turn ends fell on a turn whose own background task ran.
- **A released wait is woken only by the notice of the task.** In the replay of 14–18.11 every
  released wait had a task that got its notice later, half of them within four minutes. The bound
  is ninety minutes: in the records of 14–22.11 the longest command ran 58 minutes, and 3 of 810
  tasks, all agents, ran longer than 90. A task past the bound is hung, and the hold names it in
  place of the owner's menu. A server — a showcase, a stand — never ends by itself and sends no
  notice, so it is no wait at all. The bound is read only at a stop and wakes nothing. Each release
  on a wait is written to the journal with the session.
- **A watch of a CI run is a wait like any other task.** The owner named CI as the first long
  process the agent waits for. The CI hold still asks for the watch, and its notice wakes the
  session when the run ends.
- **A stop word stops the work, next to Esc.** On 22 November 2026 the owner chose «Ожидание и
  убрать «стоп»», and Esc alone was left. Without a stop word the guard held the turn after «стоп»
  and asked for the owner's menu. On 24 November the owner decided «Одобряю план RT-3592», which
  brings the word back. A word that does not open the message, or is followed by an order, releases
  nothing: the turn is judged by the scenario.
- **The stuck menu asks for a way, not for a stop.** The second option «подскажу путь» takes the owner's way in the free field of the same menu. A bare answer gets one
  more question with a free field; otherwise the next idle stop gives the same menu again.
- **At night the default takes the place of the menu.** In the night of 23 November 2026 the menu
  opened in the middle of unattended work, and the session stood until the owner's answer. The
  boundary is read from the line «Автономно до:» of the newest morning list, not from the age of
  the file: a list of the past night lies next to the day's work.
- **The forecast leans to the better side.** In the records a refused stop spends no task, so the
  replay releases every recorded stop of a wait, and the live engine releases one per task.

- **The owner source still reads the record as one string.** Its file is outside the plan of the
  task that brought the reader by pieces, so a record past the string limit of the runtime, about
  536 MB, still fails the engine there; a failed engine releases the turn and writes the journal.
- **The handover directory of the tree profile is not read by the engine.** It takes
  `RT_HANDOFF_DIR` from the environment, otherwise `.claude/handoff`, the same way it takes the
  tasks directory; a tree that keeps the list elsewhere gets the menu at night too.
- **A night with no next work is not released.** The default says to complete the list; the turn
  is held until the scenario is over or the harness ends it.
- **A monitor is no background task.** A persistent monitor never ends, and a turn would be
  released on it for as long as it runs.

## Open questions

None.

## History of changes

- 2026-08-25 — the subdomain was split off from the domain "The guards of the end of a turn":
  forty-two scenarios of sixty-three were about one guard.
- 2026-09-17 — the open epic: a turn with work and a second pass are judged while the epic has an
  unfinished task; a service message starts no turn; a refusal is an exit only as the last action;
  a question without work in a running stage and a handover by hand are refused; the owner's word
  quoted in the waiting line of the progress releases the turn.
- 2026-09-18 — the epic branch: a branch named by the header of an epic plan is not judged by the
  tier of the taken task. The end of an epic read from the table releases the whole turn; an
  unreadable epic keeps the former judgement.
- 2026-09-18 — the next step: a progress rewritten by the turn names what the turn owes, and the
  turn does not end on the commit of it alone.
- 2026-09-18 — a launch in the background as the last action: a role or a command sent behind the
  turn is an announcement of intent, and the turn does not end on it.
- 2026-11-04 — a turn woken by a notification about an own background task ends while another own
  task runs. The rules of a turn under an open epic left for the subdomain `exit-epic`: the
  scenario file outgrew the length limit.
- 2026-11-15 — the guard asks the engine of the task flow for a verdict. The tiers and the
  subdomain of the open epic are removed; the release cases of the description replace them.
- 2026-11-15 — the subdomain moved under the task flow as an executable scenario: its verdict is
  the engine's. The scenario of the line about a failure at the start of the next turn came here
  from the dispatcher with its number.
- 2026-11-15 — a stop with no call after a refusal names the owner's menu: an idle series ends
  instead of holding the turn without a move.
- 2026-11-15 — the engine measures the copy of the session, not the main checkout: sessions of other
  worktrees were held by the steps of a foreign plan. A write is recognised past the variables and
  the options of git, and a stop word followed by an order of work holds the turn.
- 2026-11-20 — a turn that waits for a background task of its own session is released, once per
  task and for twenty minutes; such a stop names no owner's menu. The record is read by pieces.
  The forecast over 14–18.11 holds 142 stops where it held 383. A series of ten refusals in a row
  with no background task running is not lifted by this rule: the series of 19.11 at a step that
  could not be measured on a taken-apart folder stays for the task about that step.
- 2026-11-21 — a background task whose notice came after the last call is the first move of a held
  stop: the menu «отложить / стоп» is no longer offered over a result that has not reached the
  session. The first call or menu after the notice reads it. A stricter sign — a call naming the
  task or its files — named tasks hundreds of calls old on real records and doubled the held stops
  of the forecast; it was dropped. A task the session stopped itself, one the harness killed, or one
  with no start in the record holds nothing.
- 2026-11-21 — the CI hold: a CI run of a PR the session answers for, running with no watch, red
  with no read, or not there yet within two minutes of the push, holds the stop before every release
  case. The refusal names the run and its ready command. The stop word passes a fresh head only.
  The read of a red run shows the last 200
  lines of its failed log: the error of a failed step stands at its end, past the cut of a tool.
- 2026-11-22 — a stop with no call after a refusal of another stop hook is no idle one: the engine
  names that hook in one line and the move of the state. On 20–21.11 the draft check refused a stop
  over a draft another session was leading, and the idle measure called the owner's menu three
  times. The measure judges every refusal of a stop after the last call: in a stop the model check
  answers after the engine, and the last refusal alone would drop the menu of the engine's series.
  The model check's refusal with no name is its own, not the engine's. The rules of the CI hold
  moved to the subdomain `exit-ci`: the scenario file outgrew the length limit.
- 2026-11-22 — no typed word of the owner releases a turn: the owner stops the work by Esc, and the
  release case of the interrupt replaces the case of the stop word. Scenarios 1429, 1430, 1431,
  1463, 1505 and 1556 are removed with their tests. Scenario 1445 is removed too: scenario 1842
  carries its menu, now «отложить RT-N» and «подскажу путь». The bound of a wait is ninety minutes,
  and a task past it is hung and named by the hold. A server is no wait; a watch of a CI run is one.
- 2026-11-22 — after the first review round: a message typed mid-turn is the owner's word; a mark
  of Esc within five seconds after a typed message delivers it; an agent past the bound is not hung;
  a step another check refused twice comes before a hung task; Esc lifts the CI hold.
- 2026-11-24 — before the boundary of an autonomous session the default takes the place of the
  owner's menu; scenario 1930.
- 2026-11-24 — the stop word releases a turn again, as a release case before the interrupt: scenario
  1912 holds its cases. The stop word lifts the CI hold of a fresh head.
