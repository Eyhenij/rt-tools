# The cost of context is counted by a command

**Status:** in force · **Revision:** 25 August 2026 · **Scenario prefix:** `SC-AK`
**Depends on:** none
**Laws:** `verifiability`, `project-documentation`
**Procedures:** none

## Why

A session pays for the rules layer with its window, and the tree counts that payment by nothing. The
length check judges the lines of one file, the observations digest judges loads and refusals. How
much what the session gets whole weighs — the descriptions of all the rules, the glossary, the flow
map — no command counts.

Hence the trouble: the claim "it got lighter" is backed by nothing. The former epic about the cost
of the entry measured by eye and closed with a line saying the layer got heavier; that was seen only
at the end.

## Terminology

- **The cost of the entry** — the weight of what a session gets before its first edit: the
  descriptions of the rules, the glossary, the flow map, the index of the laws.
- **The weight of a rule** — the weight of one rule together with its companion, exactly in the
  shape the session gets it in when it loads.
- **The weight of the layer** — all the laws, rules and patterns at once. No session loads it; the
  number is needed to see the growth.

### What it is called in the interface

Not applicable: the command has no screen, it answers with the output of the launch line.

## Rules

- **The cost is measured by what is counted on the spot: characters and bytes.** An exact count
  lives at the model and costs money; the work does not demand it, and a number one has to pay for
  will not be taken before every edit — that is, it will not be used at all.
- **What it is counted by stands next to the numbers.** What is taken otherwise is not comparable
  with this, and a substituted count would look like a gain.
- **The command names three numbers: the cost of the entry, the weight of the named rule and the
  weight of the layer.** One number out of three answers no question at all: the entry speaks of the
  start, the weight of a rule of the work, the weight of the layer of the growth.
- **The number is taken from what the session gets, not from the file on the disk.** The
  descriptions are taken by the same field the agent sees them by; the glossary and the flow map by
  the output of the hooks themselves. The session never gets a file whole, and its weight would name
  the wrong cost.
- **Characters and bytes are both printed.** In characters the writing systems are equal, in bytes
  they are not: a letter outside Latin has twice as many bytes. One number out of the two hides half
  the picture.
- **The command writes nothing and goes to no network.** It answers a question, it does not edit the
  tree, and it will work for whoever has no network at all.
- **The output is machine-readable on demand.** By this the numbers are put into an epic plan and
  into the review of closed work without being retyped by hand.

## What is out of scope

- **The command cuts nothing.** It counts; the text is edited by the work that goes after it.
- **The command judges nothing and refuses nothing.** It becomes neither a guard nor a gate check:
  it has no threshold, and the target number is assigned by the owner.
- **Domain specs are not counted.** They are not loaded into a session whole, and their weight says
  nothing.
- **This command answers no question about writing systems.** In characters the alphabets are equal,
  and its output gives no way to say whether the same thought is cheaper in another language. The
  question is closed in the epic plan separately, not postponed.

## Contract

A command of the rules package: `agent-kit cost`. The arguments:

- `--rule <name>` — which rule to weigh; without the argument the heaviest one is taken.
- `--json` — machine-readable output instead of a table.
- `--root <path>` — the root of the tree; the current directory by default.

The tree calls it by a script of its own on a par with the layout and its audit.

### Refusal codes

Not applicable: the command has no named codes — it answers with the exit code of the process and
with lines.

| What happened                               | Code | What it says                             |
| ------------------------------------------- | ---- | ---------------------------------------- |
| Counted                                     | 0    | three weights and what they are taken by |
| The named rule is not in the tree           | 1    | names that name and counts nothing       |
| The rules layer is not laid out in the tree | 1    | says there is no layout                  |

## Data

The command keeps no data of its own. It reads the laws, rules and patterns laid out in the tree,
the description field of the rules and the output of the session-start hooks. It writes nothing.

## Screens and states

There are no screens. There are three states of the output: counted; the named rule is absent; the
layer is not laid out. The last two differ by their text and both give a non-zero code.

## Cross-cutting requirements

### Locales

Not applicable: the output of the command goes in the language of the tree and is not shown to a
person in an interface.

### SEO

Not applicable: nothing is given outward.

### Mobile layout

Not applicable: there is no screen.

### Several objects

Not applicable: the command counts one tree — the one from whose root it was called.

## Decisions

- **The command lives in the rules package, not in the tree.** By the boundary sign: the consumer
  has what it judges — the laid-out layer — and there is somebody there to call it. Rejected: keeping
  it as a script of the tree — then every tree that installed the package would write it anew.
- **Characters and bytes are counted, not tokens.** The owner's decision: an exact count is asked
  money for, and they will not pay for it. Rejected twice. The count at the model is exact but paid,
  and a command demanding money at every call is never called. A third-party offline token counter is
  free but understates the number for this model, and understates it the further the text is from
  Latin: it would look exact and would lie exactly where it matters most.
- **Three numbers instead of one.** Rejected: one summary number — by it there is no seeing what
  exactly grew, and work to bring it down goes at random.
- **The numbers are taken from what the session gets.** Rejected: counting whole files — it is
  simpler, but the session gets a rule description as a field, not as a file, and the difference
  between these numbers is larger than the very saving the epic looks for.
- **The command has no threshold.** Rejected: making it a gate check — before the first measurement
  there is nothing to assign a threshold from, and one assigned at random turns the whole tree red.

## Open questions

- **Q-2. What counts as "the heaviest" without the argument `--rule`.** Today it is the rule with
  the largest file. The second option: the one loaded more often than the rest by the observations
  digest. It is settled when the digest has accumulated enough days.

## History of changes

- 2026-08-25 — the agreement was created. Task RT-1126, epic RT-1125.
- 2026-08-25 — the token count was replaced by a count of characters and bytes: the owner's decision
  about money. The question about writing systems was taken out of this agreement and closed in the
  epic plan.
