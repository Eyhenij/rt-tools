# The mission of the guards of the end of a turn

**Status:** in force · **Revision:** 2026-11-14 · **Scenario prefix:** `SC-AK`
**Depends on:** none
**Laws:** `work-conduct`, `verifiability`
**Procedures:** none

## Why

The agent stops halfway through ordered work without a reason. The intake holds 327 incident
analyses written from 13 August to 13 November 2026, and dozens of them describe this one miss in
different shapes. Every guard of the end of a turn exists to make the agent bring ordered work to
its end. The owner said so on 14 November 2026: «я хочу добиться того чтобы агент не останавливался
без причины на половине шага». In the same message: every guard and check of the end of a turn was
written only to make the agent finish the task, «это и есть цель и миссия агент-хуков».

The mission has a second side. On 13 November 2026 the guards themselves stopped the work: one of
them refused every move of the agent, and only the owner could take the work further. A guard that
leaves no lawful move fails the same mission as the stop it was written against.

This subdomain names no tool. It names what any guard of the end of a turn must achieve, how the
result is measured and how a tool is replaced. Today the guard is carried by a command hook and by
agent hooks of Claude Code; tomorrow it may be another mechanism. The tools of the day are bound in
the companion next to this file.

**Who changes what.** The mission and the list of lawful stops change only by the owner's word. The
tool is changed by the executor without asking, by the order in the section "Replacing the tool":
the new tool carries no fewer rules of this subdomain, passes the cases of stops and keeps the
measures no worse than the base.

### The kinds of stops

Taken from the intake. Each item names analyses by their name in the intake and the date.

- **A report instead of the next step.** The turn ends with an account of what was done while
  ordered steps remain. Analyses: report-instead-of-work (14.08, 16.08),
  turn-ended-with-report-instead-of-work (19.08), report-stood-in-place-of-the-next-stage (22.08),
  turn-ended-on-report-again (08.09).
- **An announced intent instead of the action.** «Беру», «следующим ходом», «сейчас запущу» stand
  where the command should stand. Analyses: turn-ended-on-announced-next-step (19.08),
  intent-announced-instead-of-run (22.08), hod-konchalsya-obeshchaniem-vzyat-sleduyushchuyu (10.09),
  turn-ended-on-promise-after-catch-up (27.10).
- **Waiting for someone else's step.** A run, a review, a merge or a background task is watched
  instead of worked past. Analyses: waited-in-the-turn-while-background-watch-ran (17.08),
  turns-spent-waiting-for-someone-elses-step (19.08), next-task-waited-for-the-green-run (20.08),
  turn-ended-on-waiting-for-a-run (08.09), turn-idle-after-green-run (15.09).
- **A stop at a milestone of the flow.** The turn ends after a taken task, a closed grill, a written
  plan, a committed stage or an opened request. Analyses: work-stopped-after-pr-opened (15.08),
  turn-ended-on-task-setup (19.08), turn-ended-at-the-closed-grill (21.08),
  turn-ended-at-the-written-plan (21.08), stage-committed-and-the-work-stopped (08.09),
  stopped-after-taking-the-task (10.09), fourth-stop-after-a-committed-stage (17.09).
- **An answer to the owner in the middle of the work.** The owner asks how it goes, which request
  is edited, or swears because the work stands. The answer takes the place of the next step.
  Analyses: answer-to-the-owner-ended-the-turn (22.08), request-words-read-as-end-of-work (25.08).
- **A question the rules already answer.** A menu or a question stands where the flow names the
  step. Analyses: questions-instead-of-work (14.08), menu-offered-instead-of-flow-step (19.08),
  turn-stopped-on-a-choice-that-did-not-block-it (25.08), stopped-to-ask-what-tree-already-said
  (04.09), question-after-a-refused-call-stopped-the-stage (17.09).
- **A stop at the window or by closing the session.** The session stops at a fill threshold with
  compaction on, or the executor ends it with work open. Analyses:
  turn-closed-below-the-compaction-threshold (22.08),
  stopped-at-window-threshold-with-autocompact-on (17.09),
  session-ended-by-the-executor-with-work-open (17.09), stopped-at-window-fill (05.10).
- **A stop against a standing order.** The owner gave the task or said to work without stopping,
  and the turn ended anyway. Analyses: hod-konchalsya-ozhidaniem-pri-deystvuyushchem-ukazanii
  (04.09), stopped-before-push-after-epic-word (24.09), stopped-after-owner-gave-the-task (06.10),
  stopped-on-assignment-table-after-direct-order (15.10).

The second side, a deadlock made by the guards: conflict-in-guard-locks-shell (31.08),
vyhod-iz-otkaza-strazha-nedostupen (02.09), guards-lock-each-other (13.11),
owner-asked-three-times-for-one-decision (13.11), mission-failed-work-blocked-by-own-checks (13.11).

The common sign is named by the analysis why-the-agent-stops (25.08): in every stop the last action
of the turn was text to the owner, not work.

## Terminology

- **Ordered work** — what the owner ordered and what is not finished: the steps of the task plan
  not done, the tasks of an open epic, a standing order not cancelled.
- **A stop** — the end of a turn while ordered work remains.
- **A lawful stop** — a stop for one of the reasons the rules below name.
- **A missed stop** — a stop the guard let through. In the record it shows as the owner pushing the
  agent on: «ну и что дальше?», «почему ты встал?», «продолжай».
- **A false refusal** — a refusal of a lawful stop.
- **A deadlock** — a state in which every move of the agent is refused, and only the owner can take
  the work further.
- **The tool of the day** — the mechanism that carries a guard now: a command hook, an agent hook,
  a setting of the host. The companion names it; this file does not.

### What it is called in the interface

The guards have no interface: only the agent sees them, as the text of a refusal in its own turn.

## Rules

- **A report, a summary or an announced intent does not end ordered work.** The words about the
  next step stand where the step should stand, and the owner sees the agent standing.
- **A milestone of the flow is not a stop.** A taken task, a written plan and handed-in work each go
  on to the next step in the same turn.
- **Waiting for someone else's step is never the end of a turn.** A run, a review or a merge goes on
  without the agent; the next independent step is taken meanwhile.
- **While steps of the task plan are not done, a turn ends only by a lawful stop.** The progress of
  the task says what is left, not the agent's memory.
- **Under an open epic a turn with work does not end on its own.** The epic is the unit of
  delivery, and its next task is the next step.
- **The owner's word to stop, quoted in the progress, ends the turn.** The quote is the owner's
  words in « », not a retelling: a retelling is written by the one the stop suits.
- **A question to the owner leaves unless the owner already answered it or a rule answers it
  plainly.** A refusal of another check is never a reason to hold a question.
- **A guard does not refuse the same turn twice for the same reason.** The second refusal for one
  reason is a deadlock in the making.
- **A refusal names the next move the agent can make in the same turn.** A refusal without a lawful
  move leaves a deadlock.

## What is out of scope

- How each tool is built and tested — the subdomains of the exits of a turn and the domain spec
  itself.
- The guards of an edit of a file and the rules gate — a neighbouring subdomain.
- The course of work itself — states, plans, epics — is the matter of the rules of work conduct.

## Contract

What any tool of the day takes and gives. Lists only: the audit reads a table here as procedures.

- **Input.** The event of the end of a turn, the record of the session, and the tree — the progress
  of the task, its plan and the table of the epic. The owner's words say what was ordered; the tree
  says what is left.
- **Output.** Silence lets the turn end. A refusal is a reason that starts with `BLOCKED by <guard>:`,
  names what is wrong and names one move the agent can make in this turn.
- **Failure.** A broken tool lets the turn through: a guard has no right to jam the work.
- **Time.** The median time of the guards at the end of a turn is not over 20 s. The timeout of the
  host is the hard limit, and a tool near it lets turns through in long sessions.

### Replacing the tool

1. Name which rules of this subdomain the new tool carries, and rebind them in the companion. A rule
   no tool carries goes to the open questions.
2. Replay recorded turns through the new tool: a turn of each kind of stop above must be kept going,
   and a turn of each lawful stop must end. The turns come from the session records.
3. Run it live in a new session, inside ordered work and outside it: a question, swearing, «стоп»,
   «не сейчас», a menu after a refusal, a promise without a run.
4. Measure a week of work by the measures in the data section and compare with the base.
5. Remove the old tool by the same change that binds the new one. Two tools judging one turn by
   different rules made the deadlock of 13 November.

### Refusal codes

Not applicable: a guard answers with a decision and the text of a reason, not with a code.

## Data

The guards keep no data of their own. The measures are read from the session records:

- refusals — by the mark `BLOCKED by <guard>:`, per hundred tool calls;
- missed stops — by the owner pushing the agent on after the end of a turn;
- deadlocks — by the owner taking a step that only a guard stood in the way of;
- time — by the gap between the last record of the agent and the record of the stop hooks.

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

None.

## Open questions

What the mission asks and the tools of 14 November 2026 do not carry.

- **Q-1 — an answer to the owner in the middle of the work ends the turn.** The agent hook lets a
  turn end after answering a question or swearing, whatever work is ordered. A command keeps such a
  turn going only inside a task with a plan; outside a task folder nothing does.
- **Q-2 — in doubt the agent hook lets the turn end.** While ordered work remains, the mission asks
  the opposite.
- **Q-3 — the agent hook reads the owner's last message, not the state of the work.** The progress,
  the plan and the epic tell what is left; the hook does not read them.
- **Q-4 — a failure or a timeout of the agent hook lets the turn through and leaves no trace.** The
  live measures of 14 November 2026 on a record of 15 MB: about 57 s for a refusal and 30 s for a
  pass, against a timeout of 60 s.
- **Q-5 — no command of the tree counts missed stops, false refusals and deadlocks.** The base of
  14 November was counted by a one-off script, and it counts refusals only: a broken guard that
  lets every turn through scores best on it.
- **Q-6 — handed-in work under an open epic ends the turn without the next task.** The state of
  handed-in work leaves the command hook before any tier, and the agent hook lets a turn end on
  work done and waiting for a review.
- **Q-7 — a waiting line with any quote releases every tier of the command hook.** The quote is not
  checked against the owner's messages, and it holds until someone rewrites the line.
- **Q-8 — the package does not connect the agent hooks in the settings of a tree that installs it.**
  A release removes the old checks there and leaves the requirement only as the text of a rule.

## History of changes

- 2026-11-14 — the subdomain was created: the owner named the mission of the guards and asked for a
  description that outlives the tool of the day.
