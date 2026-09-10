# The guards and the checks the package ships

**Status:** in force · **Revision:** 2026-09-10 · **Scenario prefix:** `SC-AK`
**Depends on:** `docs/specs/agent-kit/rules/spec.md`
**Laws:** `project-documentation`
**Procedures:** none

## Why

The package ships fifteen guards and helpers and twenty checks that no spec speaks of. They are the
only part of the layer that acts: a law and a rule are read, a guard refuses and a check turns a run
red.

That makes a complaint about them the most expensive to take apart wrongly. A guard loosened by one
pattern stops refusing and says nothing about it; a check that answers zero on a broken tree reads
exactly like a green one. Whether a guard may refuse on doubt, what its refusal must name, what a
check answers when it has nothing to read — all of it lives as habit in the files themselves.

The subdomain says what a guard of this package is, what a check is, and what each of them owes
whoever it refuses.

## Terminology

- **A guard** — a file of `hooks/` declaring the agent event and the tools it stands on by the
  `rt-hook:` line in its header.
- **A helper** — a file of the same directory without that line: it hooks into no event, and the
  guards source it themselves.
- **A check** — a file of `checks/` called by a command: it answers with an exit code and a list of
  divergences.
- **A set of signs** — a data file next to the checks: what the check judges by, kept apart from the
  code that judges.
- **Failing in favour of the work** — the rule by which an error and an unrecognised path let the
  call through instead of refusing it.

### What it is called in the interface

There is no interface: a guard answers in the executor's own turn, a check in the output of the
command that called it.

## Rules

- **A guard declares the event it stands on in its header, and the tools where the event takes
  them.** The layout puts the call into the agent settings from that line; without it the guard is
  laid out and never called, and from the outside it is indistinguishable from a working one. The
  end-of-turn event takes no tool matcher, and a line naming only the event is whole there.
- **A helper next to a guard declares no event and says so in its own first lines.** Read as a
  guard, it is looked for in the settings and counted as a lost call.
- **A guard fails in favour of the work.** Any error and any unrecognised path let the call through:
  a guard that jams the work when something next to it broke is switched off on the first day, and
  with it goes everything it held.
- **A guard's refusal names the two lawful moves, and the lawful form of the bypass where there is
  one.** Told only "refused", the executor looks for a way round by trial and usually finds the
  wrong one.
- **A guard's refusal names what exactly is wrong, in the words of the tree it stands in.** A
  refusal that retells the rule is paid for twice: once in the refusal and once with the rule
  itself.
- **A guard reads its input from the agent, not from the environment of the process.** The working
  directory of a session guard is wherever the host stands: taken from the process, the tree would
  be a foreign one or none at all.
- **A check answers with an exit code, and the list of divergences goes with it.** An exit code
  without a list gives nothing to fix by; a list without a code passes the push gate.
- **A check that has nothing to read answers zero and says so.** Silence reads as "nothing found",
  and a check switched off by an empty setting stays green for as long as it lives.
- **What a check judges by is kept apart from the code that judges.** The signs are data: a tree
  adds its own by a file, and a matching key replaces the package one.
- **A guard and a check are described by one subdomain.** Both are executable, both are called from
  outside and both answer with an exit code: described apart, they would repeat the statements about
  the refusal twice.
- **Every guard and every check of the package has a suite of its own.** They are the only part of
  the layer no linter reads and no spec executes: a broken line in one of them reaches a foreign
  tree with a green run.

## What is out of scope

- What each particular guard refuses: that is the spec of the subdomain the guard belongs to.
- The layout of the calls into the agent settings: it is described by the subdomain about the
  layout.
- The wording of a refusal: that is the rule about texts.

## Contract

The surface is the exit code. A guard answers to the agent with a decision, a check answers to the
command line.

### Refusal codes

Not applicable: both answer with an exit code and a text.

| What happened                                 | Code | What it says                            |
| --------------------------------------------- | ---- | --------------------------------------- |
| the guard lets the call through               | `0`  | nothing                                 |
| the guard refuses                             | deny | what is wrong, the moves and the bypass |
| the guard broke or did not recognise the path | `0`  | nothing: the work is not jammed         |
| the check found divergences                   | `1`  | every divergence, a line each           |
| the check has nothing to read                 | `0`  | that there was nothing to read          |

## Data

There is no storage of its own. The signs the checks judge by lie next to them as data files.

## Screens and states

Not applicable: there are no screens.

## Cross-cutting requirements

### Locales

Not applicable: the refusals are single-language, and it is the language of the rules layer.

### SEO

Not applicable.

### Mobile layout

Not applicable.

### Several objects

Both are laid out into every consumer tree. What is its own in each of them — the directories, the
task key, the board — is read from the settings of the tree, not written into the file.

## Decisions

- **One subdomain for two kinds.** Rejected: a subdomain each — the statements about the exit code
  and the refusal would stand twice.
- **Failing in favour of the work is a statement, not a habit.** A guard refusing on doubt is
  switched off whole, and the price of a miss is one turn of the owner's attention.

## Open questions

- `Q-HK-1` — a guard whose pattern stopped matching refuses nothing and says nothing: only its own
  suite sees that, and only if the suite was written for that pattern.

## History of changes

- 2026-09-10 — the subdomain was created: what a guard and a check of this package are and what each
  of them owes whoever it refuses.
