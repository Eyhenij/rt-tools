# The boundary of the rules package

**Status:** in force · **Revision:** 2026-08-22 · **Scenario prefix:** `SC-AK`
**Depends on:** none
**Laws:** `work-conduct`, `project-documentation`, `delivery`
**Procedures:** none

A subdomain of the domain "the agent rules package": what the package carries to a consumer and what
stays with the tree that writes the package. What is shared — the terminology of the domain and the
cross-cutting requirements — lies in the domain spec next to it.

## Why

The package is installed by foreign trees. It carries them laws, rules, patterns, hooks and checks —
and together with them what cannot be used at their place.

That is how the review of the arrived cargo went away. The review rule and the pattern at it
describe the work of the receiving side: what the intake is read by, when a record moves into work,
where its state is looked at. The intake is an application, and it lives in one tree of the
workshop. There is nothing to fill the rule's companion with at a consumer: it has neither a
receiver, nor an intake admin panel, nor a marking command.

Of the same kind is the command of summing up the proposals. It says of itself outright: it is
called in the repository of the package itself, and in a foreign tree it is meaningless, because
only one's own half of the picture lies there. And it goes there all the same together with the
rest.

The price is not in the size of the layout but in the reader not telling one from the other. A rule
that arrived with the package reads as true for this tree: it has the same header, the same law
above it and the same place in the list. The executor of a foreign tree takes it into work and runs
into an empty companion — and that is the best outcome. The worst: they fill the companion by a
guess.

## Terminology

| Term                        | What it is                                                                                                |
| --------------------------- | --------------------------------------------------------------------------------------------------------- |
| a consumer of the package   | a tree that installs the package and does not write it: it gets the layout, it sends the cargo            |
| the package tree            | the tree where the package lives as sources: it edits the resources, accepts the cargo, releases          |
| the sending side            | what a tree sends the cargo into the intake by: the shape of the cargo, the sending, the proposal command |
| the receiving side          | what the cargo is taken apart by: the intake, its admin panel, the marking of states, the summing-up      |
| a resource not for carrying | a resource not carried out at a consumer: there is nobody to call it or nothing to fill it with           |

### What it is called in the interface

The subdomain has no screens: the subject is the layout of texts and the launch line. A person sees
the boundary in two ways — by a refusal of the check in the push gate and by the list of resources
in the output of the layout.

## Rules

- **The package carries to a consumer only what the consumer carries out.** A resource that in a
  foreign tree has neither an executor nor a subject is never a package resource.
- **The sign "not for carrying" is not an appraisal but two questions to the resource.** Does the
  consumer have what the resource speaks of, and is there anybody to call it. An answer of "no" to at
  least one — the resource stays with the package tree.
- **A resource not for carrying lives as a resource of the tree's own, it is not cancelled by the
  list.** The list of the cancelled says "I do not need this" and leaves the resource in the package:
  it goes on travelling to everyone else. It is removed from the package itself.
- **The sending side stays in the package whole.** The shape of the cargo, the sending and the
  command a tree sends a proposal by are exactly what the package is installed for.
- **The boundary is held by a check, not by reading.** The check lives in the package tree, enters
  its push gate and turns red on a resource that started speaking of the intake or of the package
  tree.
- **A resource that has not moved yet stands in the list of the debt and is named with the address of
  its move.** The list is read by the check: it holds the known silently and does not keep it from
  turning red on something new.
- **A law describing the subject of an application, not of a class of applications, is never a
  package resource.** Access, locales and visibility in search are each application's own: one has
  roles inside the side, another invitations by a link — and what stays shared is not the article but
  the observation that the subject exists at all. The sign is the same as for a resource not for
  carrying, only the second question differs: not "is there anybody to call it" but "is the article
  derived from the subject of the tree".
- **A package edition laid out over a rich local one turns out to be neither.** At a consumer tree
  the edition of the access law was twice as detailed as the package one, and the layout carried away
  half the articles. Merging them into one means losing the agreement, keeping them side by side
  means having two laws that say one thing in different words and diverge silently.
- **A rule is removed together with the law it stands under.** A rule left without a law loses its
  support: it names the technique a requirement is held by, and the requirement is no longer in the
  package.
- **A removed resource, alive in the package tree, stays a resource of the tree's own.** The file
  stays in place without the layout header, and the gate calls the rule as before — the reader cannot
  see how it is younger than a package one.
- **A rule of the tree's own is declared on a par with a package one.** It has the same shape, the
  same law above it and its own branch in the gate map: the reader must not be able to see how it is
  younger.

## What is out of scope

- The code of the receiver and of its admin panel: the work moves the rules layer and the launch
  line, not the intake.
- The sending side: its resources do not move and are not rewritten.
- Marking the cargo records accumulated in the intake: the list is closed by a person's entry.
- A new law under a local rule: the rule stands under the same law about the conduct of work.

## Contract

The subdomain serves no procedures. The contract here is of another kind — between the package and
the tree that installs it: the package promises that every laid-out resource is executable at a
consumer.

### Refusal codes

Not applicable: the subject does not go over the network and calls no procedures. The boundary check
answers with an exit code and a list of resources, not with a refusal code.

## Data

The subdomain creates no data of its own. It reads the resources of the package and the list of the
cancelled in the settings of the tree.

## Screens and states

There are no screens.

## Cross-cutting requirements

### Locales

Not applicable: the subject is the texts of the rules layer and the launch line, and they are
single-language.

### SEO

Not applicable: nothing is given outward.

### Mobile layout

Not applicable: there are no screens.

### Several objects

Not applicable: the package in a tree is one.

## Decisions

- **The sign is declared before the move, it is not derived along the way.** Otherwise every next
  resource is judged by whoever finds it convenient at that minute, and the boundary diverges from
  itself. The order "move the obvious, write the sign afterwards" was rejected: obvious looks exactly
  what has already been named.
- **The check lives in the package tree, not in the package itself.** It judges the resources of the
  package, and a foreign tree has nothing to judge. An edit of the layout check was rejected: that
  one checks the laid-out against the package, and a second subject in it would stop being read.
- **The marking command goes away together with the rule.** It is carried out by the receiving side,
  and in a foreign tree there is nobody to call it. "Leave it in the launch line as an exception" was
  rejected: the work was started exactly against such exceptions.
- **The known debt is held by a list with the address of the move.** A check turning red until the
  end of the move would refuse the push of every branch — including those that do the move. The list
  names for every resource where it will go, empties as the epic goes on and leaves together with it.
  Silence of the check until the end of the move was rejected: a silent check does not tell debt from
  a new miss.
- **The rule of taking the cargo apart moves whole, together with the pattern and the spec.** Half in
  the package and half in the tree is worse than either: the reader does not know where to look for
  an article.

## Open questions

- `Q-PB-2` — does the sign become an article of the delivery law. The rule holds it, the law is
  silent about it, and the work in the branch does not edit the law.

## History of changes

- 2026-08-22 — the subdomain was created: the sign of the boundary, the composition of the sides, the
  check in the gate.
- 2026-08-22 — `Q-PB-1` was closed by the owner: a resource needed by both sides is split by the
  sides of the boundary, not carried whole with a mark. The memo about the package was split — the
  consumer was left the layout, the overrides, the properties of the tree and the sending of the
  cargo, and the package tree got the editing of a resource, the build and the review of the arrived
  proposals.
- 2026-08-22 — the epic ended: the review of the cargo and both commands of the package tree went out
  of it, the list of the known debt emptied and was removed from the tree.
