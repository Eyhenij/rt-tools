# The rules the package ships

**Status:** in force · **Revision:** 2026-09-10 · **Scenario prefix:** `SC-AK`
**Depends on:** `docs/specs/agent-kit/laws/spec.md`
**Laws:** `project-documentation`
**Procedures:** none

## Why

The package ships thirty rules, and twenty-six of them no spec speaks of. A rule is the layer a
session reads most: the gate demands it before an edit, and every refusal names one by name.

That makes a complaint about a rule the most frequent kind and the one with least to take it apart
by. The entry into the specs answers "no spec speaks of it", and the taking apart falls back on
memory: what a rule must contain, what tells it from the law above and from the pattern below, where
the tree's own names may stand and what of that a machine checks.

The neighbouring subdomain says the same about laws. This one says what a rule of this package is.

## Terminology

- **A rule** — a file of `rules/` in the package sources: by which technique the law above it is
  kept in a tree.
- **The companion** — the file next to the laid-out rule holding the tree's names and the binding of
  every statement.
- **The cold part** — the file next to the rule holding what is not read when deciding: pitfalls and
  incident analyses.
- **A trait of the tree** — a word the tree declares about itself; a rule marked by it reaches only
  a tree that declared it.
- **An edition of a rule** — one of several files of one subject differing by the platform the tree
  lives on; the tree takes exactly one.

### What it is called in the interface

There is no interface: a rule is loaded by the tool as a skill, and the gate names it in a refusal.

## Rules

- **A rule declares the law it is written under, and there is exactly one.** A rule without a law is
  a set of techniques that does not show what must be true; two laws above one rule leave no way to
  say which of them the technique keeps.
- **A rule says by which technique the law is kept, and it may name addresses — that is what tells
  it from the law.** The law knows no paths at all; a rule that names none says nothing about the
  tree it landed in.
- **The tree's own names live in the companion next to the rule, not in the rule itself.** The rule
  travels between repositories, the layout does not: a path written into the rule lies in the first
  tree that keeps its code differently.
- **A rule's description answers one question — load this rule or not.** It goes whole into the
  system prompt of every session, and the session pays for it whatever it works on; a description
  that retells the rule arrives a second time together with the rule.
- **A rule has at least one pattern next to it, and the pattern declares its rule.** The ready-made
  code is not written into the rule: it is read by whoever already decided to do it this way, and
  the rule is read by everyone.
- **A rule says what of its law is not kept here.** A requirement of the law that nothing carries
  out reads as carried out, and the hole is found by whoever steps into it.
- **A rule marked by a trait reaches only a tree that declared that trait.** Put at a guess, it
  comes back as an empty companion with nothing to fill it: the tree has no subject for it.
- **A rule of a platform ships in an edition per platform, and the tree takes exactly one.** The
  editions differ by the host and the pipeline, and two of them laid out at once contradict each
  other on every call.
- **What is not read when deciding leaves for the cold part next to the rule.** Pitfalls and
  incident analyses are needed by whoever reviews a miss, not by whoever makes an ordinary decision,
  yet they load with the rule every time and grow faster than the articles.
- **A rule is named by its subject, and the name is one across the whole tree.** The name stands in
  the gate map, in the checks, in the probes of their suites and in the state tables: a split that
  starts without a search for the name takes down a check per run.

## What is out of scope

- The wording of the articles: that is the rule about texts, and its own check judges it.
- The content of a particular rule: the subdomain describes the kind, not the articles.
- The layout mechanism: it is described by the subdomain about the layout.

## Contract

There is no surface of its own. A rule is a file; what is checked about it is checked by the spec
audit and by the suite of the package.

### Refusal codes

Not applicable: the checks answer with an exit code and a list of divergences.

| What happened                                  | Code | What it says                                |
| ---------------------------------------------- | ---- | ------------------------------------------- |
| a rule names a law that does not exist         | `1`  | the rule and the name it declared           |
| a statement of a rule has no binding           | `1`  | the companion and the statement             |
| a description is longer than the limit         | `1`  | the rule and the length                     |
| the entry into the specs is asked about a rule | `0`  | this spec and the statements about the kind |

## Data

There is no storage of its own. The rules are files of the package sources.

## Screens and states

Not applicable: there are no screens.

## Cross-cutting requirements

### Locales

Not applicable: the rules are written in the language of the rules layer.

### SEO

Not applicable.

### Mobile layout

Not applicable.

### Several objects

The rules are laid out into every consumer tree. What is its own in each of them stands in the
companion; what the tree does not need is dropped by a list in its settings.

## Decisions

- **The kind is described by one spec, not one spec per rule.** Thirty specs about thirty rules
  would repeat one and the same statements and drift apart at the first edit.
- **The statements are bound to the rule files themselves.** The kind has no code behind it: a rule
  is text, and the place a statement is carried out is the file that carries it out.

## Open questions

- `Q-RL-1` — a rule that declares a law and keeps none of it passes every check: the link is judged
  by the name, not by the content.

## History of changes

- 2026-09-10 — the subdomain was created: what a rule of this package is and what of that a machine
  checks.
