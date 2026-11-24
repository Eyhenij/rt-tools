# The rules gate delivers the rule

**Status:** in force · **Revision:** 2026-11-18 · **Scenario prefix:** `SC-AK`
**Depends on:** `rule-gate` (picking the rule, the record of loaded rules, the re-arming),
`rule-article` (the matching articles of a refusal), `decision-table` (the refusal text, the fact
`rule_loaded` and the move `load_rule`), `observations` (the refusal and load counts)
**Laws:** `verifiability`, `work-conduct`
**Procedures:** none

A subdomain next to `rule-gate`. It says one thing: what the gate and its neighbours do when a call
needs a rule the session has not loaded.

## Why

Before the first edit of a new area the gate refuses: "load rule X and repeat". Over 07.11–13.11
the transcripts hold about 560 such refusals, more than all the conversation checks together. Over
14.10–14.11 the observations hold 1144 gate refusals and 1143 rule loads: almost every refusal ends
with loading the rule and repeating the edit. The refusal catches nothing; it costs a round of
refusal, load and repeat each time.

The requirement "the rule is read before the edit" stays. The way changes: the gate puts the rule
into the session itself and lets the edit through.

## Terminology

- **A delivery** — an answer of the gate that allows a call and puts the text of the rules it needs
  into the session by the same answer.
- **The delivered text** — the whole session context field of one delivery: the delivery line, the
  rules, their companions or the companion paths, and the separators between them.
- **The host limit** — the largest delivered text, in characters, that the gate puts into one
  answer. A longer text the host saves to a file and shows only its beginning.
- **A deliverable rule** — a rule of the call that exists in the tree, is readable, and fits the
  host limit together with the other rules of the same call.
- **A round** — a refusal that asks the session to load a rule and repeat the call.

### What it is called in the interface

There is no interface: the session sees the delivered text in its context, and a refusal in its own
turn, as today.

## Rules

### The delivery

- **An edit that needs a rule not loaded in the session passes, and the text of the rule arrives in
  the session by the same call.** There is no refusal, no load by the tool and no repeat. A document
  of design is the exception: its rules are read before the text is composed, and the subdomain
  `rule-gate` names them.
- **The delivery covers every call kind the gate judges: a file edit, a writing shell command, the
  browser and the mockups tool.** The readiness sign of the request is "almost no gate refusals", and
  the gate refuses on all four kinds today.
- **The answer of a delivery allows the call and carries the delivered text in the session context
  field of the hook answer.** This is what the probe reads; that the host puts the field into the
  session is measured once by the plan, not by the suite.
- **The answer of a delivery holds no permission decision of its own.** The call goes on to the
  host's own permission check: a decision `allow` would also skip the question a tree asked the
  host to put before such a call.
- **The delivered rule is the file `SKILL.md` of the tree byte for byte, its header included.** Not
  a retelling and not the matching articles alone: the session works by the text it would have read
  itself.
- **The delivered text opens with one line naming the rule, the law it applies and that the call
  passed.** Without it the session sees a rule in its context and does not know why it arrived or
  whether the edit went through.
- **The companion of the rule arrives in the same text when it fits the host limit.** Today the
  refusal sends the session to read the companion as a file, which is a round of its own.
- **A companion that does not fit is named in the delivered text by its path, to be read as a
  file.** The rule still arrives; only the companion stays a separate read, as today.

### The limit

- **The host limit is counted in characters over the whole delivered text, the delivery line and
  the separators included.** Counting the rules alone lets the field cross the limit by its own
  frame, and the host then cuts it.
- **The rules of one call are packed in the order the map names them, each before its companion.**
  The domain rule is named first, and it is the one that knows how the file is built.
- **A companion falls back to its path before a following rule is dropped.** A companion is a read
  away; a dropped rule is a refusal.
- **The host limit is read from `RT_GATE_CONTEXT_LIMIT`, and without it is 10 000 characters.** A
  host that raises its limit is followed by a setting, not by an edit of the package.

### What is not delivered

- **A rule longer than the host limit is not delivered and not cut.** A cut rule reads as read while
  half of its articles are missing.
- **The refusal for a rule longer than the host limit names reading its `SKILL.md` by the tool
  `Read`.** The registry of the tool `Skill` does not know a rule created after the session began,
  and a read from the disk loads any rule the tree has.
- **A read of the file `SKILL.md` of a rule by the tool `Read` is recorded as a load of that
  rule.** Otherwise the move the refusal names leaves the rule unloaded, and the refusal repeats.
- **A rule the gate could not read is refused, not let through.** The delivery and the refusal for
  "not delivered" are one change: a broken delivery has no right to pass an edit without its rule.
- **An edit passes only when every rule it needs is in the session.** A layer on top of the domain
  rule is needed the same way; a pass with one of the two missing lifts the requirement silently.
- **A call whose rules do not fit the host limit together is refused whole, and the refusal names
  every one of them.** Nothing of the call is delivered, so the session loads them in one turn
  instead of meeting them one refusal at a time.
- **A remaining refusal names why the rule was not delivered: longer than the host limit, not
  fitting together with the other rules of the call, not read, or read before the text is
  composed.** The week report counts the
  refusals by this reason; without it the remaining refusals cannot be told from the old ones.

### The record

- **A rule is recorded as loaded only by an answer that allows the call.** A refused call put no
  text into the session, and a rule recorded there would pass the next edit unread.
- **A delivered rule is recorded as loaded, the same as after a call of the tool `Skill`.** The next
  edit of the area passes silently, and compaction and clearing forget it like any other loaded rule.
- **The gate creates the directory of the record itself.** The first delivery of a session comes
  before any load by the tool, and the directory does not exist yet.
- **A delivery whose name cannot be written into the record still passes, and is observed as
  `gate-deliver unrecorded`.** The text is already in the session; an unwritten name costs one more
  delivery of the same rule, not the work.
- **A call without a session id is refused, not delivered.** Without the id there is no record to
  write the rule into, and every call of the session would deliver it anew.
- **A delivery inside a subagent is recorded by the id of the subagent when the input carries it,
  never for its parent.** The text arrives in the context of the subagent; recorded for the parent,
  it lets the parent's edits through unread.

### The counts and the neighbours

- **A delivery writes an observation of its own, `gate-deliver res=<rule> kind=<kind> sid=<sid>`,
  not a refusal and not a load by the tool.** The readiness sign counts the refusals; a delivery
  counted as one hides whether the work did anything, and counted as a load it reads as a read by
  the session.
- **The delivery line never holds the words «Refused by the rules gate».** The refusal count of the
  transcripts finds a gate refusal by these words.
- **The week sign counts as remaining rounds both the gate refusals and every refusal whose move is
  loading a rule.** A neighbouring guard that names the load is the same round, only under another
  hook name.
- **A neighbouring guard counts a rule as loaded when it is in the record or is a deliverable rule
  of the same call.** The hooks of one call run side by side, and the record of the delivery may not
  be written yet when the neighbour reads it.
- **A neighbouring guard neither refuses for nor names the load of a deliverable rule of the same
  call.** Naming it sends the session into the round the gate removed.
- **The re-arming line names, of the removed record, only the rules longer than the host limit and
  asks to load those.** Today it asks to load in one turn every rule the stage touches, and that is
  the round being removed.
- **The re-arming line says that every other rule comes back by itself at the next edit of its
  area.** Without such a line the summary says the rules are loaded, and the session cannot tell
  why they arrive again. The line names its own exception: the rules of the grill and of a plan are
  read before the document is written.
- **A re-arming line without a rule longer than the host limit asks to load nothing.**

## What is out of scope

- The law: the requirement "the rule is read before the edit" stays as written.
- Which rule an edit needs: the gate map, the layers and what counts as a write stay as the subdomain
  `rule-gate` describes them.
- Delivering patterns, the cold part `pitfalls.md` and laws: the tool `Skill` loads none of them
  with a rule, and neither does the delivery.
- Shortening the rules that are longer than the host limit: the refusals they keep are counted by
  the plan from the limit.
- A load by the tool `Skill`: it stays and is recorded as before.

## Contract

The surface is the events of the agent: a file edit, a shell command, the browser, the mockups tool
and a read of a rule file. The answer of the gate is a pass, a pass with the delivered text, or a
refusal.

### Refusal codes

Not applicable: the gate answers a call before it is carried out, and such an answer has no command
exit code.

| What happened                                           | How it ends          | What it says                                                  |
| ------------------------------------------------------- | -------------------- | ------------------------------------------------------------- |
| the rules of the call fit the host limit together       | a pass with the text | the delivery line, the rules, the companions or their paths   |
| a rule of the call is longer than the host limit        | the call refused     | the rule, its law, reading its `SKILL.md`, and that it is too long |
| the rules of the call do not fit the host limit together | the call refused    | every rule of the call, and that they do not fit together     |
| a rule of the call could not be read                    | the call refused     | the rule, its law, and that it was not read                   |
| a document of design is written without its rules       | the call refused     | every rule of the call, and that they are read beforehand     |
| the call carries no session id                          | the call refused     | the rule, and how to load it                                  |
| every rule the call needs is already loaded             | a pass               | nothing                                                       |

## Data

The record of loaded rules of the session, the same one the tool `Skill` writes into: a delivered
rule and a rule file read by the tool `Read` add their name there, under the id of the subagent when
the input carries one. The rule and the companion are read from the tree at the moment of the call.
There is no storage of its own.

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

- **Behaviour changes only in the package hooks.** The applications are not touched. The agreement
  was written as a draft of `rule-gate` and merged as a subdomain of its own: the rules of choice
  and the rules of delivery are read apart.
- **One task.** The delivery and the refusal for "not delivered" are rolled back together.
- **The host limit is 10 000 characters of the whole session context field.** The reference of the
  host hooks: a longer text is saved to a file, and the session gets its path and the first 2 000
  characters without being asked to read it. 67 of the 104 rules of this tree fit alone. The number
  is the default of `RT_GATE_CONTEXT_LIMIT`; the first step of the plan confirms it on a real rule,
  on the record of the session itself. Closes `Q-26`.
- **Rules that fit apart and not together are refused together, and nothing is recorded.** A rule
  recorded by a refused call would pass the next edit without its text; the refusal names all of
  them, so the session loads them in one turn. Closes `Q-27`.
- **The delivered text does not repeat the article headings.** The rule arrives whole, and the
  headings above it would pay for the same text twice. The subdomain `rule-article` keeps them in
  the refusals that stay. Closes `Q-28`.
- **"The rule is not found" of the request is the rule the gate cannot put into the session:**
  longer than the host limit, not fitting together with the rest of the call, or not read from the
  disk. Closes `Q-29`.

## Open questions

None.

## History of changes

- 18 November 2026 — written as the agreement of RT-3326.
- 18 November 2026 — merged as the subdomain `rule-gate-delivery`, with its bindings.
