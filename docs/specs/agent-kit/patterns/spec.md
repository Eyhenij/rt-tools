# The patterns and the cold parts the package ships

**Status:** in force · **Revision:** 2026-09-10 · **Scenario prefix:** `SC-AK`
**Depends on:** `docs/specs/agent-kit/rules/spec.md`
**Laws:** `project-documentation`
**Procedures:** none

## Why

The package ships fifty patterns and ten cold parts, and no spec speaks of any of them. Both live
next to a rule and do not exist without one: a pattern carries the ready-made code the rule's
technique is done by, a cold part carries what is not read when deciding.

That makes them the cheapest kind to edit and the easiest to break in silence. A pattern renamed
apart from its rule stays laid out and stops being found; a requirement that drifts into a cold part
promises what the session loading the rule will never see. Neither has a spec to check a complaint
against.

The subdomain says what a pattern of this package is, what a cold part is, and how each of them is
tied to the rule it stands next to.

## Terminology

- **A pattern** — a file of `patterns/` in the package sources: the ready-made code and the concrete
  technique of the rule it declares.
- **The rule of a pattern** — the rule named in the pattern's header; the link is read from there,
  not from the name.
- **A cold part** — a file of `pitfalls/` in the package sources: pitfalls and incident analyses of
  one rule, loaded on demand.
- **A requirement** — a statement by which an edit is decided. Its place is the rule; a cold part
  holds explanation only.

### What it is called in the interface

There is no interface: both are loaded by the tool as skills, and the rule names its patterns in a
section of its own.

## Rules

- **A pattern declares the rule it stands next to, and the link is read from the header.** Not every
  pattern carries the rule's name as a prefix, and a search by prefix does not see those: a count
  gathered by prefixes comes out below the true one, and that number then goes into splitting the
  work.
- **The rule named by a pattern exists.** A name nothing answers to leaves the pattern outside the
  ladder: it is laid out, it is loaded, and no rule leads to it.
- **A pattern carries ready-made code and the concrete technique, not the statement of the rule.**
  The statement retold in a pattern drifts from the rule at the first edit, and the reader has two
  answers to one question with nothing to choose between them.
- **A rule names its patterns in a section of its own.** The audit finds them by the header field, a
  person by that section: without it the ready-made code is found only by whoever already knows it
  is there.
- **A cold part belongs to exactly one resource and is named after it.** Usually that is a rule, and
  where there is no law above the subject — the skill itself. Two owners over one cold part leave no
  way to say which of them the pitfall belongs to; named otherwise, it is not found at all.
- **A cold part holds explanation, not requirement.** A statement absent from the rule promises what
  the session loading the rule will not see: whatever can be decided by the cold part must be
  decidable by the rule.
- **A cold part names the resource its statements stand in.** Read on its own — and it is read
  exactly on its own, on demand — it gives no way back to the text that holds the requirements.
- **A rule with a cold part names it in its header.** The gate refusal calls the rule, and the rule
  itself speaks of the third file: nothing else points at it.
- **A pattern and a cold part are described by one subdomain.** Both live next to a rule and do not
  exist without one; described apart, they would repeat the statements about that tie twice.
- **A pattern of a platform ships in an edition per platform, on a par with its rule.** The rule and
  its ready-made code cannot diverge by host: the tree takes one edition of both.
- **A name of a pattern is not taken by two different patterns.** It stands in the rule's own
  section, in the audit and in the probes of the suites: a name shared by two leaves the ready-made
  code unreachable while every check stays green. The editions of one subject share a name lawfully
  — the tree lays out exactly one of them.

## What is out of scope

- The wording of a pattern: that is the rule about texts, and its own check judges it.
- The content of a particular pattern: the subdomain describes the kind, not the ready-made code.
- The rule itself: the neighbouring subdomain speaks of it.

## Contract

There is no surface of its own. Both are files; what is checked about them is checked by the spec
audit and by the suite of the package.

### Refusal codes

Not applicable: the checks answer with an exit code and a list of divergences.

| What happened                                     | Code | What it says                                |
| ------------------------------------------------- | ---- | ------------------------------------------- |
| a pattern names a rule that does not exist        | `1`  | the pattern and the name it declared        |
| a rule has no pattern at all                      | `1`  | the rule                                    |
| a cold part answers to no rule                    | `1`  | the file and the name it was looked by      |
| the entry into the specs is asked about a pattern | `0`  | this spec and the statements about the kind |

## Data

There is no storage of its own. Both are files of the package sources.

## Screens and states

Not applicable: there are no screens.

## Cross-cutting requirements

### Locales

Not applicable: both are written in the language of the rules layer.

### SEO

Not applicable.

### Mobile layout

Not applicable.

### Several objects

Both are laid out into every consumer tree next to the rule they belong to. A rule dropped by the
tree takes its pattern and its cold part with it.

## Decisions

- **One subdomain for two kinds.** Rejected: a subdomain each — the statements about the tie to the
  rule would stand twice and drift apart at the first edit.
- **The tie is read from the header, not from the name.** The name carries the rule's word only
  sometimes, and a count by prefix is quietly short.

## Open questions

- `Q-PT-1` — a pattern that declares a rule and shows a technique of another passes every check: the
  tie is judged by the name, not by the content.

## History of changes

- 2026-09-10 — the subdomain was created: what a pattern and a cold part of this package are and how
  each is tied to its rule.
