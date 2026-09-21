# The roles, the skills, the blanks and the declarations the package ships

**Status:** in force · **Revision:** 2026-09-10 · **Scenario prefix:** `SC-AK`
**Depends on:** `docs/specs/agent-kit/rules/spec.md`
**Laws:** `project-documentation`
**Procedures:** none

## Why

Twenty-seven files of the package are described by no spec, and they are what is left after the
laws, the rules, the patterns, the guards and the checks: nine roles, three skills that stand under
no law, one session command, twelve blanks and two declarations of the tree.

They have nothing in common with the ladder above them, and that is exactly why they were left
last: a role is not a text about the product, a blank is not a statement about anything at all, a
declaration is data. Yet each of them is loaded by name, and a name that answers to nothing fails in
silence.

The subdomain closes the last gap of the epic: after it the entry into the specs answers zero for
every file the package ships.

## Terminology

- **A role** — a file of `agents/` declaring its name, what it is for and the tools it is allowed.
- **A skill without a law** — a text about how work is done here rather than about what must be true
  in the product: it stands next to the ladder, not in it.
- **A command** — a file of `commands/` called by the executor by its name with a slash.
- **A blank** — a file of `templates/` or `samples/`: it is filled in by whoever uses it, and its
  places for filling stand in angle brackets.
- **A declaration of the tree** — data the layout reads: the editions of a resource, the traits, the
  map of the turn.

### What it is called in the interface

There is no interface: a role is called by the agent tool, a skill and a command by name, a blank is
copied, a declaration is read by the layout.

## Rules

- **A role declares its name, what it is for and the tools it is allowed.** Called with the tools of
  the caller, a role reading texts would edit them, and nothing would say it happened.
- **A role's description says when it is called, not only what it does.** A description without that
  is read as an offer, and the role is called at a guess or never.
- **A role writes no files where its description says so.** The word is the whole guarantee: the
  agent gives a role exactly the tools its declaration names.
- **A skill that stands under no law is legitimate and declares no law.** A law invented for it to
  fit the ladder holds one rule and not a single statement about the product, and drifts from the
  rest at the first edit.
- **A skill without a law declares neither the kind of a rule nor the kind of a pattern.** Those two
  words are what the audit tells the ladder by; a skill wearing one is looked for a law and refused.
- **A command declares what it does and what it takes.** It is called by a person from the line, and
  the hint about the argument is the only place the shape of the call is written.
- **A blank carries its places for filling in angle brackets.** That is what tells a blank from a
  filled text for a machine: the checks of the kinds skip a blank rather than judge it as a
  half-written document.
- **A blank of a task folder is copied without the header of the layout.** The copy is not laid out
  by the package, and the header left on it turns the edit-location guard against the folder of a
  live task.
- **A declaration of the tree is data, not code.** The editions, the traits and the map of the turn
  are read by the layout and by the guards: written as code, they could not be read by both.
- **Every one of the four kinds is loaded by its name, and a name that answers to nothing fails in
  silence.** Neither the layout nor a run says a word about a role that was called and does not
  exist.
- **All four kinds are described by one subdomain.** None of them stands in the ladder of the law,
  the rule and the pattern; described apart, four subdomains would repeat one statement — that a
  name is the whole of the tie.

## What is out of scope

- What a particular role does: that is its own text, and the rule that calls it.
- The mandatory call of a role by a guard: it is described by the subdomain of that guard.
- The layout mechanism: it is described by the subdomain about the layout.

## Contract

There is no surface of its own. All four kinds are files read by the agent, by a person or by the
layout.

### Refusal codes

Not applicable: the checks answer with an exit code and a list of divergences.

| What happened                                  | Code | What it says                                |
| ---------------------------------------------- | ---- | ------------------------------------------- |
| a role declares no tools                       | `1`  | the role                                    |
| a skill without a law wears the kind of a rule | `1`  | the skill and the kind it declared          |
| a blank carries no places for filling          | `1`  | the blank                                   |
| the entry into the specs is asked about any    | `0`  | this spec and the statements about the kind |

## Data

There is no storage of its own. All four kinds are files of the package sources.

## Screens and states

Not applicable: there are no screens.

## Cross-cutting requirements

### Locales

Not applicable: all four are written in the language of the rules layer.

### SEO

Not applicable.

### Mobile layout

Not applicable.

### Several objects

All four are laid out into every consumer tree. A tree switches off the mandatory call of a role by
a key in its settings, and that removes the call, not the file.

## Decisions

- **One subdomain for four kinds.** Rejected: a subdomain each — the only statement they share, that
  the name is the whole of the tie, would stand four times.
- **A skill without a law is described as a kind, not as an exception.** It is the third lawful case
  next to the rule and the pattern, and listing it as an exception would invite inventing a law for
  it.

## Open questions

- `Q-RO-1` — a role called with the tools it did not declare is indistinguishable afterwards from
  one called lawfully: the declaration is read at the call and left nowhere.

## History of changes

- 2026-09-10 — the subdomain was created: the last four kinds of the package, and after it the
  measure of the uncovered shows zero.
