# The second kit

**Status:** in force · **Revision:** 2026-08-17 · **Scenario prefix:** `SC-UKV`
**Depends on:** named in the subdomains — each names its own
**Laws:** `verifiability`, `delivery`, `frontend-application`
**Procedures:** none

The subjects of the domain are listed by the table of the subdomains below, and each of them lives
as a subdomain of its own. There is no count of them here on purpose: it ages with every new
subdomain and has diverged once already.

## Why

The second kit is a package of components of its own: its own selectors, its own set of tokens, its
own showcase. It does not replace the first one and shares no code with it, so one application has
the right to hold both.

Everything else follows from that: there is nothing to check its look against the first showcase by,
nothing to paint it by the first set of tokens, and its promises are its own. The domain names those
promises and the place where each of them is obliged to refuse instead of going green.

## Terminology

The terms of the subjects live in the subdomains. What is shared by the domain is that the kit
stands on `ViewEncapsulation.None`: its rules are global, and everything that is changed from
outside is changed by tokens.

### What it is called in the interface

The domain has no interface of its own: a person sees the output of the commands of the run and of
the checks, and of what is shown on the screen only the window "unsaved edits". What exactly is
visible at each subject is named by its subdomain.

## Rules

The rules of the subjects live in the subdomains — the domain outgrew the length limit, and reading
it whole for the sake of one detail became dearer than finding it. Some of the subdomains repeat the
boundaries of the agreements the domain was put together from; some were created by merging an
agreement about their own subject and describe the surface of a component, not a check of the look.

- **The scenario prefix belongs to the domain together with the subdomains.** A domain is split when
  its spec has outgrown the length limit, and the scenarios move as they were: the number ties a
  scenario to the title of its test, and a numbering of its own at every subdomain would mean
  recounting all the numbers at once.

| Subdomain                                                                 | About what                                                                                                                      |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| [The snapshots of the showcase](snapshots/spec.md)                        | what is shot, what a frame is held between runs by, where the run is obliged to refuse                                          |
| [The leaving of a route panel](aside/spec.md)                             | whom the guard asks about the edits, the permission to leave, a cancel instead of a loss                                        |
| [The design of the kit](tokens/spec.md)                                   | the brand and the palettes, the graph of the tokens, the completeness of the dark theme, the contrast, the layer of the cascade |
| [The field of input](input/spec.md)                                       | what the field declares the kind of the value to the browser by and where the promise of the kit ends                           |
| [The actions at a reply](chat-actions/spec.md)                            | what a consumer declares its own action at a reply of a correspondence by and where the boundary is                             |
| [The field and a signal form](signal-forms/spec.md)                       | where a field of the set takes the state of the form from and what happens to both bindings                                     |
| [The form dictionary of a panel](form-dictionary/spec.md)                 | the hierarchy of the form of a panel, where the gap comes from, what the consumer does not write                                |
| [The digits of a number field](number-grouping/spec.md)                   | what a field separates the digits of a number by and where a consumer says a number is solid                                    |
| [A boolean input and the bare attribute](boolean-input-attribute/spec.md) | what a boolean input of the kit accepts, and which input is boolean by declared type alone                                      |

## What is out of scope

The boundaries of the subjects are named in the subdomains. What is shared by the domain:

- **The first kit.** Neither its tokens, nor its showcase, nor its checks are touched. The nine names
  both kits declare are accepted by a list: a new coincidence is refused by the check.
- **A check of accessibility.** A work of its own with a run of its own: there is not a trace of it in
  the tree, the number of the violations is unknown, and a red run of accessibility must not hold
  green snapshots.
- **The debt on the specs of the components.** The folders where there is less spec than there are
  components; it is merged independently. The field of input left the debt — it has a subdomain of
  its own.

## Contract

The domain has no contract of the network: it serves no procedures. There are three surfaces — the
commands of the run of the snapshots, the three things the kit gives outward for the leaving of a
panel, and the file of the tokens together with the checks of the design. What each of them gives is
named by its subdomain.

### Refusal codes

Not applicable: both the run and the checks answer with a code of return and a list of the places,
not with named codes.

## Data

The domain has no storage of its own. The references and the lists of what is accepted are ordinary
files of the repository, the count of the panels lives in the memory of the application, the tokens
are the text of the files of styles. What lies where is named by the subdomain that puts it there.

## Screens and states

The domain has no screens of its own: at the leaving of a panel the window about the edits is shown,
at the snapshots and the design nothing is shown. The tables of the states are in the subdomains.

## Cross-cutting requirements

### Locales

The kit carries labels in eight languages. A frame of the showcase is shot in one, and that is
declared a debt, not given out as coverage; the window about the unsaved edits takes its labels from
the dictionary of the kit.

### SEO

Not applicable.

### Mobile layout

The width is named by the components themselves — by media queries in their own styles or by the
service of the thresholds. A frame of a threshold is taken at everyone who names it.

### Several objects

The tree holds two kits at once, and they share neither selectors, nor tokens, nor showcases. The
harness of the snapshots is set apart the same way: its own setting, its own catalogue of the
references, its own port, its own commands. There is no shared file between the kits.

## Decisions

The decisions of the subjects live in the subdomains. What is shared by the domain:

- **The domain is split into subdomains by the agreements it was put together from.** The boundaries
  taken are the ones the subheadings of the sections had already drawn; the scenario prefix stayed one
  for the domain, and the numbers were not recounted at the move.

## Open questions

- **`Q-4` — the boundaries of the work on the leaving of a panel, apart from the window about the
  edits, the owner did not confirm by a list.** An edit of the first kit and an edit of the
  application-consumer were taken out of the work by the work itself. It does not affect the code.

- **`Q-7` — what to do with the nine names of tokens shared by the two kits.** It was taken apart by
  the check of the graph: the first kit does not declare them — it uses them, without a spare value.
  They are declared only by the second one, in a scale of its own. That is, an application with the
  first kit alone draws its button without a rounding, and a renaming of a step in the second kit
  breaks the first one silently. The fix touches the released first kit and is created as a task of
  its own, RT-391; here today's state is accepted — nine names in the list of what is accepted, a new
  coincidence is refused by the check.

- **`Q-8` — what a step taken out of use is to be refused by.** The rule demanded a check, and there
  is no check: not a single list of what is accepted keeps a list of the steps taken out, and the use
  of a name that was taken out passes silently today. The rule is lifted until such a list is created
  — otherwise the spec promises what is not in the tree.

Closed by the revision of the 13th of August 2026: `Q-1`, `Q-2` and `Q-3` of the line of the leaving
of a panel — what the permission is lifted by, whether the leaving of a panel counts as a leaving when
the record was not found, and in which order two panels answer. The first two are closed by one point
of the issuing of the permission and by the lifting at the outcome of the navigation, the third is
lifted together with the rule: the count is marked by the route, and the order of the putting decides
nothing. `Q-5` — a check on the application-consumer — is taken outside the spec: the version is
published, the run is on the owner.

Closed by the past revision: `Q-2` of the line of the snapshots — the owner named a full pass in
**86 s** acceptable. That number is not about the machine but about a decision: the showcase at the
address is one, and on six threads the pass goes in 43 s, but diverges up to eight frames — twice the
time is bought by the frame being held between the runs.

Closed by past revisions: `Q-1` — the threshold of the divergence stays `0.0002` of the area of the
frame; `Q-3` — the language of the frame is one and is appointed by the setting of the showcase;
`Q-4` — a red frame holds the merge from the first day; `Q-5` — the references lie as ordinary files
of the repository; `Q-6` — the fix is not cut down, but an edit of a released component goes by a
change of its own.

## History of changes

- 2026-08-09 — the agreement about the snapshots of the showcase was created by the grilling of the
  owner's request.
- 2026-08-09 — `Q-2` was closed by the word of the owner: 86 s for a full pass are acceptable. The
  agreement was left with no open questions.
- 2026-08-09 — merged into the spec of the package after the references lay over the whole showcase.
  Three rules opened up by the shooting were added: an empty look does not become a reference, the
  number of the threads is set by the run, the readiness of an icon is checked by a drawn icon. The
  language of the frame was fixed to Russian — the showcase works in it, and the frames were shot in
  it too.
- 2026-08-09 — brought up to the decisions of the second pass of the grilling and to the findings of
  the adversarial grilling: the order of the works, the set by subtraction, the area of the frame, a
  frame of the threshold at every threshold, the environment of the shooting, an orphaned reference,
  the repeats, the reshooting, the language and the theme of the frame, a foreign showcase at the
  address. `Q-3`…`Q-6` were closed.
- 2026-08-13 — the agreement about the design was merged: the brand by a line, the graph of the
  tokens, the completeness of the dark theme and the contrast, the gate of the literals with the list
  of what is accepted, the layer of the cascade around the styles of the kit and the source the layers
  are put together from. The spec came to hold three agreements instead of two.
- 2026-08-13 — `--rt-color-bg-surface-subtle-2` got the answer of the dark theme: the same graphite as
  at the neighbouring step of the surface. There is no free step under a third surface in the
  graphite, and both steps coincide in the dark theme on purpose. The list of what is accepted by the
  check of the completeness became empty: not a single silent appointment was left.
- 2026-08-17 — the spec was split into three subdomains: the domain outgrew the length limit. The
  rules, the scenarios and the bindings moved as they were, the scenario numbers were not recounted.
- 2026-08-20 — the agreement about the type of the address at the field of input was merged: a fourth
  subdomain was created, the scenarios `SC-UKV-55` and `SC-UKV-56` arrived with their former numbers.
- 2026-08-30 — the agreement about a field of the set and a signal form was merged: a sixth subdomain
  was created, the scenarios `SC-UKV-77`…`SC-UKV-83` arrived with their former numbers.
