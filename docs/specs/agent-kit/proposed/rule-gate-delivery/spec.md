# The rules gate delivers the rule

**Status:** proposed · **Revision:** 18 November 2026 · **Scenario prefix:** `SC-AK`
**Depends on:** `rule-gate` (picking the rule, the record of loaded rules, the re-arming),
`rule-article` (the matching articles of a refusal), `decision-table` (the refusal text and its
decision), `observations` (the refusal and load counts)
**Laws:** `verifiability`, `work-conduct`
**Procedures:** none

The agreement of RT-3326. It merges into the subdomain `rule-gate` and changes one thing there: what
the gate does when an edit needs a rule the session has not loaded.

## Why

Before the first edit of a new area the gate refuses: "load rule X and repeat". Over 07.11–13.11
the transcripts hold about 560 such refusals, more than all the conversation checks together. Over
14.10–14.11 the observations hold 1144 gate refusals and 1143 rule loads: almost every refusal ends
with loading the rule and repeating the edit. The refusal catches nothing; it costs a round of
refusal, load and repeat each time.

The requirement "the rule is read before the edit" stays. The way changes: the gate puts the rule
into the session itself and lets the edit through.

## Terminology

- **A delivery** — the gate letting a call through and putting the text of the rule it needs into
  the session by the same answer.
- **The delivered text** — what one delivery puts into the session: a line about the delivery, the
  rule, and its companion when it fits.
- **The host limit** — the largest text the host puts into the session whole from the answer of a
  hook before the call. A longer one the host saves to a file and shows only its beginning.
- **An undelivered rule** — a rule the edit needs that the gate could not deliver whole: longer than
  the host limit, or not readable.

### What it is called in the interface

There is no interface: the session sees the delivered text in its context, and a refusal in its own
turn, as today.

## Rules

### The delivery

- **An edit that needs a rule not loaded in the session passes, and the text of the rule arrives in
  the session by the same call.** There is no refusal, no load by the tool and no repeat.
- **The delivery covers every call kind the gate judges: a file edit, a writing shell command, the
  browser and the mockups tool.** The readiness sign of the request is "almost no gate refusals", and
  the gate refuses on all four kinds today.
- **The delivered rule is the rule file of the tree whole, the same text the tool `Skill` loads.**
  Not a retelling and not the matching articles alone: the session works by the same text it would
  have loaded itself.
- **The delivered text opens with one line naming the rule, the law it applies and that the call
  passed.** Without it the session sees a rule in its context and does not know why it arrived or
  whether the edit went through.
- **The companion of the rule arrives in the same text when the rule and the companion fit the host
  limit together.** Today the refusal sends the session to read the companion as a file, which is a
  round of its own.
- **A companion that does not fit is named in the delivered text by its path, to be read as a
  file.** The rule still arrives; only the companion stays a separate read, as today.
- **A delivered rule is recorded as loaded, the same as after a call of the tool `Skill`.** The next
  edit of the area passes silently, and compaction and clearing forget it like any other loaded rule.

### What is not delivered

- **A rule longer than the host limit is not delivered and not cut.** A cut rule reads as read while
  half of its articles are missing. Such a rule the gate demands by a refusal, as today.
- **A rule the gate could not read is refused, not let through.** The delivery and the refusal for
  "not delivered" are one change: a broken delivery has no right to pass an edit without its rule.
- **An edit passes only when every rule it needs is in the session.** A layer on top of the domain
  rule is needed the same way; a pass with one of the two missing lifts the requirement silently.
- **A remaining refusal names why the rule was not delivered: longer than the host limit, or not
  read.** The week report after the release counts the refusals by this reason; without it the
  remaining refusals cannot be told from the old ones.

### The counts and the neighbours

- **A delivery is not counted as a gate refusal.** The readiness sign is counted by gate refusals in
  the observations, and a delivery counted as one would hide whether the work did anything.
- **The re-arming line says that the rules come back by themselves at the next edit of their
  area.** Today it asks to load in one turn every rule the stage touches; after this work that load
  is the very round being removed. Rules longer than the host limit are still demanded, and the line
  says so.
- **A guard that names a move the gate judges names the move itself when the gate would deliver the
  rule of that move.** Today such a guard names "load the rule first" instead, because the gate
  would refuse the move; after this work that sends the session into the removed round.

## What is out of scope

- The law: the requirement "the rule is read before the edit" stays as written.
- Which rule an edit needs: the gate map, the layers and what counts as a write stay as the subdomain
  `rule-gate` describes them.
- Delivering patterns, the cold part `pitfalls.md` and laws: the tool `Skill` loads none of them
  with a rule, and neither does the delivery.
- Shortening the rules that are longer than the host limit: the refusals they keep are counted by
  the plan from the measured limit.
- A load by the tool `Skill`: it stays and is recorded as before.

## Contract

The surface is the events of the agent: a file edit, a shell command, the browser and the mockups
tool. The answer of the gate is a pass, a pass with the delivered text, or a refusal.

### Refusal codes

Not applicable: the gate answers a call before it is carried out, and such an answer has no command
exit code.

| What happened                                          | How it ends               | What it says                                                    |
| ------------------------------------------------------ | ------------------------- | --------------------------------------------------------------- |
| a call needs a rule that fits the host limit           | a pass with the text      | the delivery line, the rule, the companion or its path          |
| a call needs a rule longer than the host limit         | the call refused          | the rule, its law, how to load it, and that it is too long      |
| a call needs a rule the gate could not read            | the call refused          | the rule, its law, how to load it, and that it was not read     |
| every rule the call needs is already loaded            | a pass                    | nothing                                                         |

## Data

The record of loaded rules of the session, the same one the tool `Skill` writes into: a delivered
rule adds its name there. The rule and the companion are read from the tree at the moment of the
call. There is no storage of its own.

## Screens and states

Not applicable: there are no screens.

## Cross-cutting requirements

### Locales

Not applicable: the delivery line and the refusal texts are single-language, in English, like the
rest of the gate.

### SEO

Not applicable.

### Mobile layout

Not applicable.

### Several objects

The gate is one for all the trees; the rules and the companions it delivers come from the tree it
runs in. A tree that laid out no map gets no gate, as today.

## Decisions

- **Behaviour changes only in the package hooks.** The applications are not touched; the agreement
  is a draft of the subdomain `rule-gate`.
- **One task.** The delivery and the refusal for "not delivered" are rolled back together.
- **The host limit is 10 000 characters per field of the hook answer.** The reference of the host
  hooks: a longer text is saved to a file, and the session gets its path and the first 2 000
  characters without being asked to read it. 67 of the 104 rules of this tree fit. The first step
  of the plan confirms the number on a real rule. Closes `Q-26`.
- **Two rules that fit apart and not together: the first is delivered, the second is refused.** The
  delivered one is recorded as loaded, so the repeated call delivers the second. Refusing both
  would leave the round the request removes. Closes `Q-27`.
- **The delivered text does not repeat the article headings.** The rule arrives whole, and the
  headings above it would pay for the same text twice. The subdomain `rule-article` keeps them in
  the refusals that stay. Closes `Q-28`.
- **"The rule is not found" of the request is the rule the gate cannot put into the session:**
  longer than the host limit or not read from the disk. Closes `Q-29`.

## Open questions

None.

## History of changes

- 18 November 2026 — written as the agreement of RT-3326.
