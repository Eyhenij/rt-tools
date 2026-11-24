# The measures of the executable scenario

**Status:** in force · **Revision:** 2026-11-24 · **Scenario prefix:** `SC-AK`
**Depends on:** none
**Laws:** `work-conduct`, `verifiability`
**Procedures:** none

## Why

The executable scenario has one metric and counter-conditions. The metric is how often the owner
pushes the agent on. The counter-conditions are the refusals of the guards and the deadlocks they
make. The base of 14 November was counted by a one-off script. A command of the tree now counts
them from the session records, by a window of days the caller names, so a week before the layout
and a week after it are counted by one rule.

## Terminology

- **A copy of the tree** — the main checkout or one of its worktrees; each has a directory of
  session records of its own.
- **A typed message** — an entry of a session record the owner typed: not a meta entry, not a
  summary of a compaction, not a tool result or a menu answer, not a wrapper of the harness.
- **A nudge** — a typed message the pattern `words.nudge` of the task flow description matches.
- **A call** — a tool use of the agent in a session record.
- **A refusal** — a mark `BLOCKED by <guard>:` in the feedback of a stop hook or in the hook error a
  tool call got back.
- **A deadlock** — a series of 10 and more stop refusals in a row in one session with one guard and
  one first line of the reason.
- **A missed stop** — a turn that ended on a branch carrying the engine while no release case of the
  description released it, replayed from the record.

### What it is called in the interface

There is no interface: the counter prints one line per measure.

## Rules

- **Nudges are counted per hundred calls by the pattern of the task flow description, read from the description itself.**
- **A typed message is an entry the owner typed; a meta entry, a compaction summary, a tool result, a menu answer, a wrapper of the harness and a record of a subagent are none.**
- **The records are read from the directories of every copy of the tree, and an entry repeated in a resumed session is counted once.**
- **Refusals are counted per hundred calls in four groups: all, the exit check, the checks of the base and the new checks.**
- **A deadlock is a series of 10 and more stop refusals in one session with one guard and one first line of the reason; a stop that passed or another reason ends the series.**
- **The window is whole days of UTC ending with the day the caller names, and the counter never reads the clock inside a decision.**
- **A turn ends at a stop summary with no refusal in it and no stop feedback right after it.**
- **Missed stops are counted in the last calls after the layout, only on branches that carry the engine.**

## What is out of scope

Writing the base of the metric into the description of the scenario and the journal of the engine
are the later steps of the same task. The engine and its states are the subdomain one level up.

## Contract

`node owner-nudges.mjs` takes a measure flag (none, `--typed`, `--refusals` or `--deadlocks`), a
window (`--days N` or `--since <date>`, with `--until <date>`), and optional `--root`, `--tree` and
`--flow`. It prints one line and exits 0; a wrong argument exits 2 with the usage.

- nudges: `owner nudges per 100 calls: N.NN (N nudges, N calls)`
- `--typed`: `owner typed messages: N in N copies`
- `--refusals`: `refusals per 100 calls: all N.NN, exit N.NN, base N.NN, new N.NN`
- `--deadlocks`: `deadlocks: N series of 10+ stop refusals at one state and step, N refusals`
- `--missed --last N`: `missed stops with open work: N of N stops in the last N calls`

The flag `--missed` takes `--last N` instead of a window, and `--layout <moment>` in place of the
moment of the first commit that added the engine to the tree.

### Refusal codes

Not applicable: the counter judges nothing, it prints a count.

## Data

The session records of Claude Code: the jsonl files of a copy directory under `--root`, by default
`~/.claude/projects`. The copy directories are named after the main checkout, by default the one
that holds the common directory of git, and after its worktrees in the directory of worktrees of
Claude Code inside it. The
records of subagents in the directory of a session are not read. A file last written before the
window is skipped. The counter writes nothing.

The groups of refusals:

- the exit check — `turn-exit-guard`;
- the new checks — `turn-exit-guard` and `flow-step-guard`;
- the base — the seven checks of the base that judged the conversation (`grill-gate` with
  `grill-gate-ask`, `claim-guard`, `waiting-turn-guard`, `postmortem-guard`, `work-start-guard`,
  `proposal-guard`, `stand-login-guard`) and the agent hooks `turn-judge` and `ask-judge` that carry
  their requirements since they were removed.

## Screens and states

There are no screens.

## Cross-cutting requirements

### Locales

The output is in English: it is read by checks and plan steps, not by the owner.

### SEO

Not applicable.

### Mobile layout

Not applicable.

### Several objects

Not applicable: every copy of the tree is read in one run.

## Decisions

- **A menu answer is not a typed message.** The pattern of a nudge is written for words the owner
  typed; a label of an option is the agent's text chosen by the owner.
- **Before the layout a deadlock is keyed by the first line of the reason.** The record has no
  measured state; the first line of a refusal of the exit check names the state, and the refusal of
  the engine names the state and the step in the same line.
- **Calls and owner messages do not end a series of stop refusals.** In the deadlock of 14 November
  the agent kept calling tools and the owner kept writing while every stop was refused.
- **A stop summary followed by a refusal of an agent hook is no passed stop.** An agent hook refuses
  after the command hooks have written their summary.

## Open questions

None.

## History of changes

- 2026-11-15 — the subdomain was started with the counter of nudges, typed messages, refusals and
  deadlocks.
- 2026-11-15 — the count of missed stops after the layout: a branch without the engine is not
  judged by it.
- 2026-11-22 — a turn the owner ended by Esc is no missed stop, since Esc releases the turn; a typed
  word to stop releases none.
- 2026-11-24 — a turn the owner ended by a stop word is no missed stop either.
