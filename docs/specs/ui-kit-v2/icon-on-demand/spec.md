# An icon on demand

**Status:** in force · **Revision:** 2026-08-26 · **Scenario prefix:** `SC-UKV`
**Depends on:** the snapshots of the showcase (the waiting for the icons in a frame and the probe of
the markups); the set of the icons of the package in `projects/ui-kit-v2/src/assets/icons`
**Laws:** `verifiability`, `delivery`, `frontend-application`
**Procedures:** none

## Why

The kit gives the page the whole set of the icons regardless of how many it draws. The registry puts
the sprite together by one bundle of requests over the whole list of the names, and a page showing
single icons pays for all of them: a measurement of a public page of a consumer on the mobile profile
counted 335 requests for the files of the icons out of the 383 requests of the page, of a total weight
of 291 KB, going away between 402 and 507 ms — that is, in one channel with the code of the application
and the pictures of the page itself.

There is nothing to go around this by from the side of the application: the intake of the kit accepts
the address of the set and nothing more. What is left is a loophole — to put a sprite of one's own into
the markup before the start — but then the step of the build, the names of the symbols and the sign of
the sprite are created at home by every application, although they belong to the kit.

The subdomain names what the kit promises instead: an icon goes when it was asked for, the page that
drew it pays for it, and a miss of one name no longer puts out the rest.

## Terminology

- **The set** — the files of the icons the application publishes from the catalogue of the icons of the
  package.
- **The list of the names** — the literal union of the names of the icons the input of the markup is
  typed by.
- **The sprite** — the node at the start of the page the registry puts the symbols that arrived into.
- **A symbol** — one icon inside the sprite the markup refers to.
- **A request of a name** — an address of the markup to the registry for a symbol: the loading starts
  with it.
- **A markup of an icon** — the way the kit draws an icon by. There are two: a component of its own and
  a button drawing an icon itself.

### What it is called in the interface

Not a single one of these terms is shown to the person behind the screen: an icon is either drawn or
not. The label to a control is given by the control itself — an icon is hidden from the reading from
the screen.

## Rules

- **An icon goes by a request of a name, not in advance.** The page pays for what it drew.
- **A repeated request of the same name does not touch the network.** The first request creates a
  stream, the rest wait for it; the symbol that arrived stays in the sprite to the end of the life of
  the page.
- **A refusal of one name puts out only its icon.** The rest of the icons of the page are drawn.
- **Both markups of an icon ask in the same way.** The component and the button go by one road, and an
  icon asked by both at once goes by one request.
- **A symbol already lying in the sprite of the page gives no request.** So the showcase does not chase
  one and the same thing between the stories, and the application has the right to put a sprite of its
  own in advance.
- **A change of the name at a drawn icon pulls the new name.** The former symbol stays in the sprite.
- **On the server the set is not loaded.** The icons are drawn after the hydration.
- **The kit has no preloading of the whole set.** Neither by a default nor by a sign of the intake: two
  roads would mean two outcomes at the waiting of the snapshots, and both would have to be held by
  checks.

- **A filled material drawing that did not arrive is closed by the outlined one of the same set.**
  The material set keeps two drawings per name, outlined and filled; a filled file the application
  did not publish falls back to the outlined one, and only after it to the kit's own.

## What is out of scope

- A ready sprite in the package and a list of the names as a parameter of the intake — both ways were
  taken apart and rejected.
- The taking apart of the set itself into the needed icons and the dead ones: that is a work about the
  content of the set.
- An edit of the application-consumer the measurement was taken on: it will get the edit by a version of
  the package.
- The publication of a new version of the package into the registry.

## Contract

The intake of the kit does not change from outside: it accepts the address of the set and nothing more.
What changes is what stands behind it — the minute of the loading. A consumer who waited for the whole
sprite by the start of the application does not get it any more: this is a breaking edit of a published
package, and it is declared by a raised version and a record in the section of the changes.

### Refusal codes

Not applicable: the subdomain gives no refusals outward. A refusal of the loading of one name stays
inside the registry and is visible as an icon that was not drawn; the row about it is written by the
application by its own techniques of observability, not by the kit.

## Data

The subdomain keeps no data of its own. The files of the set are published by the application, the list
of the names lives in the code of the kit.

## Screens and states

An icon lives in three states: not asked, asked and not arrived yet, drawn. The second is visible as an
empty place of the size of the icon — the place is taken at once so that the arrival of the symbol does
not move the neighbours. There is no fourth state on the screen: an icon that refused stays the same
empty place as one that is on its way.

## Cross-cutting requirements

### Locales

Not applicable: an icon carries no text.

### SEO

Not applicable: the icons are hidden from the reading from the screen and do not get into the output.

### Mobile layout

This requirement is what it solves: the mobile profile of the measurement was the very case where
hundreds of requests share the channel with the code of the page.

### Several objects

Not applicable: the set is one per application.

## Decisions

- **The loading on demand, not a ready sprite in the package.** A sprite as one file would have removed
  the number of the requests but would have left the page the weight of the whole set.
- **The preloading is lifted whole.** Left as not obligatory, it would have given the waiting of the
  snapshots two different outcomes, and both would have had to be held by checks.

## Open questions

There are no open questions. `Q-1` — by which place of the registry the markup asks for a name — was
closed by the work: starting the loading in the computing of the address of a symbol was rejected, the
registry has a call of its own for that which returns nothing, and the subscription lives inside it.

## History of changes

- 2026-08-26 — created by the request #1182 and merged into the spec of the domain together with the
  work RT-1182.
