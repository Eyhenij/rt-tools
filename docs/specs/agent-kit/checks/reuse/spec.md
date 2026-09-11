# The uniformity signs

**Status:** in force · **Revision:** 2026-09-10 · **Scenario prefix:** `SC-AK`
**Depends on:** none
**Laws:** `reuse-first`, `verifiability`
**Procedures:** none

## Why

The sweeping uniformity check and the guard on an edit judge one and the same thing — whether the
ready-made was bypassed or not — and read the same signs. By this day the signs have fifteen
scenarios, and the scenario file of the domain outgrew the limit along with them: the subdomain is
split off so that the list of the domain reads and this one grows in its own order.

The subject of the subdomain is the signs themselves: what they are declared by, who gets them and
what a sign counts as a match. The other checks of the domain — file length, repeats, class
declarations — stay in the parent.

## Terminology

- **A sign** — a rule of the shape "the text holds such and such, so the ready-made was bypassed",
  together with what to replace it by.
- **A sign bundle** — the signs of one workshop package declared by one file.
- **A declared bundle** — a bundle the tree named as its own in the setting of the checks.
- **Own signs** — the signs of the tree itself, declared by it at home and arriving on top of the
  declared bundles.

### What it is called in the interface

The subdomain does not come outward: the check has no screens. Its refusal is read by whoever sets
the tree up.

## Rules

- **A uniformity sign lives as data, not as the code of the check.** The check and the guard read
  the same declared files: a divergence between them becomes impossible by construction, not by
  attentiveness.
- **A sign bundle is cut by the rt-tools packages.** Each package has a file of its own, and it
  holds only what that package carries: the names of its components, of its bases and of its
  directives.
- **A tree gets the signs of the packages it named.** A bundle that is not named is not read at all:
  a sign about the ready-made from a package the tree does not have answers falsely.
- **A tree appends signs, it does not edit foreign ones.** Own signs arrive on top of the declared
  bundles; a matching key replaces the package one, a new one is appended.
- **A check that got not a single sign refuses, it does not answer zero.** A green answer without a
  single file read is indistinguishable from an honest zero: the number of signs stands in the same
  line as the number of divergences and reads as a detail. What is judged is the total, not the list
  of bundles: a tree that keeps only its own signs lawfully takes no package bundles.
- **The directives of the tree's own design system are cut out of the signs of native tags.** There
  is not always one source of appearance in a tree: the owner panel is assembled from a kit set, the
  public site from a system of its own, and the uniformity law splits them by application. A
  directive of such a system stands on a native tag the same way a kit button directive does; the
  button sign already cuts it out, while a field, a text area and a list cut nothing out — a form
  assembled from one's own ready-made counts as a divergence whole. The list of directives is named
  by the tree; it did not name one — nothing is cut out, and a tree with one source of appearance
  behaves as before.
- **The source folder of the ready-made is taken out from under a sign apart from the bundle.** A
  tree that writes the ready-made itself had to choose until now between noise on every file of its
  own and silence everywhere: a bundle about a ready-made component set is addressed to a consumer,
  and inside the bundle itself nothing caught a bypass of the ready-made. A sign carries a reverse
  path sample next to the direct one, and the sweeping check and the guard on an edit read it the
  same way.
- **A bundle is declared with the area of the tree it holds over — a directory or a list of them.**
  There is more than one source of appearance in a tree oftener than one, and a sign of the first
  answers falsely over the second. Without an area such a tree has a single move — not to declare the
  bundle at all, and then nothing catches a bypass of the ready-made in the area where the bundle
  does hold. An application outside the area drops out of the walk by the declaration. The boundary
  is judged by the directory, not by the beginning of the string: a neighbouring application whose
  name starts the same is not taken in. An area is not written for a tree with one source of
  appearance — a bundle without one holds over the whole tree, as before.
- **One bundle carries one area, and a second declaration of it is a refusal.** Declared a second
  time, it takes the first declaration away silently, and the area named there is left judged by
  nothing — the check answers as usual and reads not a file of it. Two areas of one bundle are
  written as one list of directories.
- **A sign naming a global judges the position of the name, not a substring.** A name inside a
  quoted string, an access through a field of an object and a declaration of one's own with the same
  name are never a global: the first is text, the second is the injected token the rule prescribes,
  the third is a subject name that is not to be renamed.

## What is out of scope

- The guard on an edit: it judges the added text, and its articles stand in the parent spec next to
  the other guards of the checks.
- The list of the accepted and of the debt: it is shared by the checks of the domain and lives in the
  parent.

## Contract

The surface is the bundle files at the package and the file of the tree's own signs. Two read them:
the sweeping check and the guard on an edit; the fields of a sign are the same, and they must not
diverge.

### Refusal codes

- `1` — not a single sign is left: neither a bundle nor own ones. The refusal names the bundles at
  the package and the key they are declared by.
- `1` — the named bundle is not found at the package: the refusal names the name of the bundle and
  those that are there.
- `0` — the file of one's own signs is named but not found: the work goes on, a skip is cheaper than
  a stop.
- `1` — one bundle is declared twice: the refusal names the bundle and says that two areas of one
  bundle are written as one list.

## Data

The subdomain keeps no data of its own: the signs lie as bundle files at the package and as the file
of the tree's own signs, and the list of the accepted and of the debt is shared by the checks of the
domain.

## Screens and states

There are no screens.

## Cross-cutting requirements

### Locales

The refusal is written in the language of the tree.

### SEO

Not applicable.

### Mobile layout

Not applicable.

### Several objects

A tree holds more than one source of appearance: a bundle is declared with the area it holds over,
and each application is judged by its own set of signs.

## Decisions

- **The total is judged, not the list of bundles.** A tree that keeps only its own signs lawfully
  takes no package bundles, and a refusal over an empty list of bundles would refuse it for nothing.
- **The position of a name instead of a substring.** Thirty-seven places in one tree fell under the
  global sign, and all thirty-seven were false: a quoted string, a subject variable and an access
  through an injected token — the very thing the rule on access to the environment prescribes.

## History of changes

- 2026-08-30 — the subdomain was split off from the checks spec: the scenario file outgrew the length
  limit, and the signs grow in their own order.
- 2026-09-10 — a bundle is declared with the area of the tree it holds over; that closes the question
  about the scope of a bundle.

## Open questions

- None: the question about the scope of a bundle is closed by the area of the declaration.
