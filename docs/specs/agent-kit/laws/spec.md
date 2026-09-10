# The laws the package ships

**Status:** in force · **Revision:** 2026-09-10 · **Scenario prefix:** `SC-AK`
**Depends on:** none
**Laws:** `project-documentation`
**Procedures:** none

## Why

The package ships fifteen laws, and not one spec speaks of them. A law stands at the top of the
rules layer: every rule declares the law it is written under, and a session reads the law in full
before a decision it touches.

That makes a complaint about a law the most expensive kind to take apart and the one with least to
take it apart by. The entry into the specs answers "no spec speaks of it", and the taking apart
falls back on memory: whether an article belongs in a law or in a rule, whether a law may name a
file, what a law holds besides its articles — all of it lives in the rule `spec-driven` as a
technique of writing, and nowhere as a promise about the resource itself.

The subdomain says what a law of this package is: what it must contain, what it must not, and what
of that a machine checks.

## Terminology

- **A law** — a file of `laws/` in the package sources: what must be true in an application of this
  class, without paths and without file names.
- **An article** — an item of the law's mandatory articles section: one statement and the price of
  reversing it.
- **An open question** — the only thing a law holds besides articles: a decision not yet taken,
  numbered and referred to by tasks.
- **A rule under a law** — a text of the rules layer that declares this law and binds it to a tree.

### What it is called in the interface

There is no interface: a law is read by a session as a file and shown at the start of a session as
a line of the index.

## Rules

- **A law says what must be true and knows no addresses.** A path, a file name or a binding inside a
  law makes it unreadable in another tree of the same class, and there is nowhere to fix that: the
  consumer carries a laid-out copy. Addresses live in the rule under the law.
- **A law has one mandatory section — the articles — and beyond it holds only open questions.** A
  history of edits, an argument with a rejected option, a list of the rules under it: version
  control holds the first, the rule's cold part the second, and the third goes stale silently, since
  a rule declares its law itself and the law learns of a new rule from nobody.
- **An article carries the statement and the price of reversing it, not the story of the miss.** The
  law loads into a session in full before a decision it touches, and pays for its whole length every
  time. The story of how the miss happened, how many times and in which branch belongs to the cold
  part of the rule under the law.
- **A law is named by its subject, and the name is unique across both layers of the constitution.**
  The shared layer and the application layer are one namespace: neither the rule's declaration line
  nor the spec header says which layer the name belongs to, so a repeated name binds the rule to
  whichever law the reader finds first.
- **A law with no rule under it is legitimate only while the agreement is written before the code.**
  Such a law names its state in a status line of its own; afterwards it gets a rule, or it promises
  what nobody carries out.
- **A law of the package is true for any tree of its class, not for the tree that wrote it.** A law
  whose article holds only where a storage, an admin panel or an application exists names the trait
  by a prefix in its file name, and a tree that did not declare the trait does not get the law at
  all.
- **The index of the laws is printed at the start of a session from the laid-out directory, not
  from a list.** A list would be kept fresh by hand and would fall behind by exactly one law — the
  new one, the one the session most needs to know about.

## States

| What is asked of a law     | What must be true                                                     |
| -------------------------- | --------------------------------------------------------------------- |
| the articles section       | present and not empty                                                 |
| any other section          | only open questions; anything else is a divergence                    |
| an address inside the text | absent: a path, a file name or a binding makes the law untransferable |
| a trait of the tree        | named by a prefix in the file name, or the law goes to every tree     |
| a rule under the law       | at least one, unless the law declares itself an agreement before code |

## What is out of scope

- The wording of the articles: how a statement is compressed and what leaves for the cold part is
  the subject of the rule `spec-driven`.
- The content of any particular law: this subdomain speaks of the kind, not of what the law on
  delivery or the law on lists says.
- The rules under the laws: they are a resource of their own and get a spec of their own.
- The layout of the laws into a tree: which files a consumer receives is the subject of the layout
  subdomain.

## Contract

There is no surface of its own: a law is a text file read by a session. What holds the kind is the
audit of the specs, the index printed at the start of a session and the entry into the specs by a
resource name.

### Refusal codes

Not applicable: a law is not called and answers nothing.

## Data

There is no storage of its own. The laws lie in the package sources; a consumer tree gets laid-out
copies with a layout header.

## Screens and states

Not applicable: there are no screens.

## Cross-cutting requirements

### Locales

The laws are written in English: a session reads them, and the same articles cost it a fifth less.

### SEO

Not applicable.

### Mobile layout

Not applicable.

### Several objects

A consumer tree may drop a law by name, and then neither the law nor the draft of the rule under it
is laid out. A dropped law stays in the package and keeps going to every other tree.

## Decisions

- **One subdomain for the whole kind, not a spec per law.** Fifteen specs would repeat one and the
  same statements fifteen times and would drift apart at the first edit. Rejected: a subdomain per
  law.
- **The spec speaks of the kind and does not retell the articles.** A retelling diverges from the
  laws silently and cannot be checked against anything: the articles are the law's own text.

## Open questions

- `Q-LW-1` — nothing counts whether a law has at least one rule under it. A law that lost its last
  rule to a rename reads exactly like a law written before the code.

## History of changes

- 2026-09-10 — the subdomain was created: the kind of the laws the package ships, for the taking
  apart of a complaint about a law.
