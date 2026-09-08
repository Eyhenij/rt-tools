# The design of the kit

**Status:** in force · **Revision:** 2026-08-17 · **Scenario prefix:** `SC-UKV`
**Depends on:** the service of the theme of the kit and the sign of the theme at the root of the page; a
list of what is accepted of its own next to its own check of the styles — `tools/styles-allowlist.json`
is taken by the check of the classes of the layout and is not shared
**Laws:** `verifiability`, `frontend-application`
**Procedures:** none

## Why

The design of the kit is its public surface on a par with the components: the kit stands on
`ViewEncapsulation.None`, its rules are global, and everything that is changed from outside is changed
by tokens.

The subdomain names what a consumer repaints the kit by, which names are obliged to exist, what the dark
theme is obliged to say and in which place a check is obliged to refuse instead of going green.

## Terminology

- **A scale** — the layer of the tokens with the values: the codes of the colours, the steps of the
  paddings, the sizes, the lengths. A step of a scale is one token of that layer.
- **An appointment** — a token speaking not of a value but of a role: the ground of a surface, the colour
  of a dangerous action, the border at a focus. A step of a scale serves as the value of an appointment.
- **A property of a component** — a token declared by the styles of one component and setting only it.
- **The brand** — the steps of the colour of the mark the action, the link, the border at a focus and the
  transparent shades of the same colour are painted by.
- **A handle of the consumer** — a token the kit does not declare on purpose: the value arrives from the
  application, and while there is none, a spare value works. The width of a panel, the height of a header
  and the face of a logo are handles.
- **A dead reference** — an address to a token that is declared by no layer and is not named a handle.
- **The sign of the theme** — `data-theme='dark'` at the root of the page and the class `rt-theme-dark`
  equal to it. The sign is put by the service of the theme of the kit, the set of the tokens does not
  depend on it.
- **The completeness of the dark theme** — a property of the set: every colour appointment of the light
  theme has either an override in the dark one or a named reason why the colour is one in both themes.
- **The threshold of the contrast** — the ratio of the brightnesses of a text and its ground, below which
  a pair counts as unreadable. Here it is 4.5:1.
- **A list of what is accepted** — the list of the places accumulated before the switching on of a check.
  The check lists them by a number, does not count them a refusal and falls at a new place.
- **The source of the design** — the node the layers are put together from: the steps, the appointments
  and the answer of the dark theme next to its own appointment. What is put together is edited in it, not
  in its place.

### What it is called in the interface

The design has no interface of its own. A person sees the output of the checks of the design: the list of
the places, of the names of the tokens and of the pairs "a text and a ground" that did not take the
threshold.

## Rules

- **The consumer repaints the kit by declarations over it and does not fork the kit.** The mark arrives by
  the steps of the brand, not by an edit of the scale of the blue: the blue stays a colour, the brand a
  role, and a consumer whose mark is green has no need to declare green by the name of blue.

- **The brand is declared by a line of the steps 50…950.** Not a single appointment takes the colour of the
  mark past the line, and not a single step of the line is derived by a computing from another one: the
  hovering and the press are steps of their own, not a lightened main one. Only the transparent shades are
  computed.

- **A palette holds one role, and the row at the palettes is common.** The row is eleven steps 50…950; a
  palette in which the colour of the mark, the ground of a correspondence and the dark backing of the
  harness lie at once is not a palette: one thing in it cannot be changed without moving the rest.

- **The steps of a palette go by an even row, they are not picked by the place.** The lightness changes by
  an equal step over the whole row, the tone and the chroma are common. A row put together from foreign
  palettes of different generations and hand-made pickings looks like a scale, but nothing can be chosen
  from it.

- **A transparent shade is counted from its own step, it does not repeat its code of the colour.** A
  repeated value diverges from the source silently, and an edit of the step leaves the shade the former one.

- **The ring of the focus is painted by the brand.** The ring is the most noticeable trace of the colour of
  the mark on the screen, and left blue it argues with the repainted button it outlines.

- **A token the kit refers to is either declared by the layer of the design or named a handle of the
  consumer.** There is no third state: a name that is not declared and not named a handle is a dead
  reference, and its value arrives from a spare value at the place.

- **A reference to a token of the kit goes without a spare value.** A spare value hides a dead reference,
  nails down a colour outside the palette and outlives a change of the theme: the override of the dark
  theme does not reach it, because there is nothing to override.

- **A spare value stands only at a handle of the consumer, and every handle is listed in the contract.** A
  handle is a promise to the consumer, not a forgotten declaration; a handle that is not listed cannot be
  told from a dead reference, and the check has nothing to set them apart by.

- **A token is declared by the layer of the design, not by the styles of a component.** A consumer that did
  not plug the component in otherwise does not get its declarations either, and one that plugged it in gets
  the declarations of a component they did not ask about. A property of a component at that stays with the
  component: the rule speaks of the common names.

- **The value lives in the scale; an appointment and an override of a theme refer to a step.** A literal in
  the layer of the appointments cancels the whole sense of the layer: it is found neither by a search over
  the scale nor by a page of the showcase, and it is changed one at a time instead of one step. A value that
  has no step creates a step.

- **The dark theme answers every colour appointment of the light one.** The answer is either an override or
  a named reason why the colour is common to both themes. An answer through a chain of references counts as
  an answer. Silence without a reason reads as "the colour suits both themes", and there is nothing to tell
  it from a forgotten one by.

- **A pair "the colour of a text and its ground" holds a contrast not below 4.5:1.** The threshold is named
  here because in the scales it lived as comments next to two steps, and the rest of the pairs were labelled
  by nothing.

- **A literal of a colour and a value in a property of the design in the styles of a component are refused by
  a check.** The properties of the design are the padding, the rounding, the size of the type, the thickness
  of a border, the length. A size as a number — `width`, `height`, `inline-size`, `outline` — the check does
  not judge: the kit has no scale of the heights of its own yet. The boundary is named here so that a green
  run does not read as "no literals are left".

- **What was accumulated before the switching on of a check stands by name in the list of what is accepted.**
  The check is switched on the same day it is written, not after the cleaning: otherwise the leak is closed
  at the same time the cleaning ends, that is, at an unknown time.

- **A record leaves the list of what is accepted together with the fixing and is not created back.** The list
  only shrinks. A list that is added to is the same unchecked scattering of literals, only with a table of
  contents.

- **A scale stays a scale: a step is chosen from the row, it is not written in for the case.** A step created
  for one place and named by a number between the neighbours takes off the scale its only property — nothing
  can be chosen from it. A shade needed by exactly one appointment lives as an appointment with a speaking
  name.

- **The interactive controls of one size coincide in height.** The height arrives by one scale for all the
  controls; a button, a field and a dropping list in one row do not diverge by pixels.

- **The properties of a component are created where the component is set from outside.** Not by a solid walk:
  a rule that on the day of its coming out is broken by sixty-five files out of seventy-eight stops being
  kept within a month. The created set at that is complete — a component consumes only its own properties,
  not half of its own and half of the appointments.

- **A rule of the application wins over a rule of the kit without a count of the specificity.** The styles of
  the kit are declared by a layer of the cascade; the consumer overrides them by an ordinary rule, not by a
  walk of a foreign layout and not by an exclamation mark.

- **Everything the kit declares by classes reaches the consumer by one point of entry.** The styles of a
  component go by its bundle, and the layout declared by classes only by the aggregator of the layer of the
  design: a file that was not written into it lies alive in the tree and is applied nowhere. Neither the
  build, nor the linter, nor the snapshots of the showcases show that — the rules are there, they are simply
  not delivered; that is visible only at a consumer and only by the eyes.

- **The layer of the design is put together from the source, it is not edited in the put-together look.** The
  name of a token addressed with a typo fells the build, it does not stay invisible until a look at the
  showcase. The pair "the light and the dark one" lies in one place, so a forgotten half is a refusal of the
  generation, not a skipped line.

- **The look of a component changes only where that is named aloud.** Nine places are named — from a
  switched-off button that was painted by a colour outside the palette to the role of a detail set apart from
  the mark. Everything else is obliged to pass the checking of the frames of the showcase without divergences,
  and a frame that diverged means a defect of the edit.

- **The state wins over the design, it does not stand with it on a par.** The switched-off state, the loading
  and the read-only cancel the filling, the outline and the palette; the other way round does not happen. The
  rules of equal strength are taken apart by the order in the file, so the block of the state stands below all
  the variants of the design and the palette of the same block.

- **The role of an action is a five, not one colour.** The backing, the hovering, the press, the label on them
  and the colour of the role on a surface are declared together and are taken by the component whole. A role
  that has no step under the press merges the press with the hovering.

- **The colour of a role on a surface is declared apart from its backing.** The groundless designs paint the
  label and the border by it. A role that has no colour of its own unfolds the backing into the surface — and
  the label taken from the backing lies onto itself.

## What is out of scope

- **The first kit and its design:** neither its tokens nor its checks are touched. The nine names both kits
  declare are accepted by a list: a new coincidence is refused by the check.
- **A move to a foreign library of the themes:** the arrangement of a foreign kit is taken as a sample of the
  layout and does not become a dependency — neither the library of the themes nor its format of the presets
  goes into the kit.
- **The taking apart of the accumulated literals by a solid walk:** replaced by the list of what is accepted.
  The leak is closed on the first day, and the cleaning goes in the background.
- **The setting of the design by code — a provider and an object of the settings over the roles in the
  styles:** rejected; the kit is set by its own properties of a component, by a pinpoint override.
- **The compatibility of the names of the tokens with the released edition:** the names are lifted and renamed
  freely while the consumer code is one. A layer of the aliases is not created; with a second consumer the same
  carrying-over will become a breaking change with a note about the transition.
- **The properties of a component as an output of the source:** the third layer lives in the styles of its own
  component next to its own rules and is not put together from the source.

## Contract

The design the kit gives out by one file of the tokens put together from three layers: the scale, the
appointments of the light theme, the overrides of the dark one. It is plugged in whole; a separate plugging in
of the layers the kit does not promise. The names it is put together from the kit gives out by code as well —
by a list and by a type.

The dark theme is switched on by the sign of the theme at the root of the page — by the attribute or by the
class equal to it. The sign is put by the service of the theme of the kit; the consumer has the right to put it
themselves.

The brand the consumer sets by a declaration of the steps of the brand after the plugging in of the file of the
tokens. Nothing besides those declarations is demanded of them: the appointments, the transparent shades and the
ring of the focus take the colour from there themselves, in both themes.

The handles of the consumer — the tokens the kit does not declare on purpose and reads with a spare value — are
listed by name in the documentation of the design of the kit. Everything that is not in that list the kit
declares itself.

The surface of the checks of the design is the linter of the styles on the styles of the kit, the list of what is
accepted next to it, the checks of the graph of the tokens, of the completeness of the dark theme, of the layer
of the cascade and the checking of what is put together against the source. Each answers with a code of return
and a list of the places.

### Refusal codes

Not applicable: the checks answer with a code of return and a list of the places, not with named codes.

## Data

The design has no storage of its own. The tokens are the text of three files of styles put together from the
source and reaching the consumer as one file; the steps of the brand the consumer keeps at home. The choice of the
theme is kept by the service of the theme by a key of the device: the set of the tokens does not depend on the
place of the keeping, it depends only on the sign of the theme at the root of the page.

The lists of what is accepted are files of the repository next to their own checks. They are read at every run and
are edited only by a shrinking.

## Screens and states

The design has no screen of its own. The states are those of the checks.

| state                                                                              | what it is visible by                                                               |
| ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| a literal in the styles of a component that is not in the list of what is accepted | the linter names the file, the line and the property, the run is red                |
| a literal standing in the list of what is accepted                                 | the run is green, the number of the accepted places in the summary                  |
| the place is fixed, and the record in the list of what is accepted stayed          | the check names the record that nothing answers to any more                         |
| a reference to a token that is not declared and not named a handle                 | the check names the name of the token and the place of the reference                |
| a spare value at a reference that is not named a handle                            | the check names the place                                                           |
| a colour appointment of the light theme without an answer of the dark one          | the check names the name of the appointment                                         |
| the mark "the colour is common" at an appointment the dark one edits               | the check names the name: the mark outlived the edit and lies                       |
| a dark answer declared by the sign of the theme in the styles of a component       | the check names the file                                                            |
| a step of the scale rewritten by the dark theme                                    | the check names the name of the step                                                |
| a pair "a text and a ground" below the threshold                                   | the counter names both names, the ratio and the theme                               |
| a step taken out of use is used again                                              | the check names the name and the place                                              |
| a typo in the name of a token in the source of the design                          | the build is red, the put-together files are not rewritten                          |
| a put-together file edited by hand                                                 | the checking names the file and commands a rebuild                                  |
| a rule of the kit arrived past the layer of the cascade                            | the check names the file                                                            |
| the look of a component went wrong                                                 | the frame of the showcase diverges from the reference, a picture of the differences |

## Cross-cutting requirements

### Locales

Not applicable: the tokens carry no labels.

### SEO

Not applicable.

### Mobile layout

Not applicable: the set of the tokens does not depend on the width of the window; the width is named by the
components themselves by their own media queries.

### Several objects

The tree holds two kits at once, and they share neither selectors nor tokens. The nine names both use are accepted
by a list by name: a new coincidence is refused by the check.

## Decisions

- **The brand is closed by a layer of the tokens, not by a setting from code.** A layer of the tokens works at a
  consumer who does not write in Angular at all and demands neither a provider nor a build.
- **The check for the literals is switched on at once, and what was accumulated goes away into the list of what is
  accepted.** The reverse order leaves the leak open for the whole time of the cleaning, and a cleaning over
  eighty-seven files stretches unpredictably.
- **The threshold of the contrast is counted by a machine, not by a comment next to a step.** The threshold is one
  for all the pairs — 4.5:1. Hand-written countings are not recounted at an edit of a value and grow stale silently.
- **The neutral row carries no chroma.** Its tone and chroma are common, as at any palette, but the chroma is zero:
  the grey stays grey at any step. Taken from one of the steps, they painted the light end of the row with blueness
  — and on it stand three roles at once: the ground of a field of input, a muted surface and the highlight of a
  hovering. All three unfolded into one step, and the field of input read as a saturated blue-grey block on an
  almost white page. At the dark end the same chroma is not noticeable, so the miss is visible only in the light
  theme. Rejected: to pick the light steps by hand — the row then stops being a row, and nothing can be chosen from
  it again.

- **A role the even row gives no step to is closed by a transparent shade, not by an edit of the step.** The muted
  surface and the highlight of the hovering lie in a band of the lightness 0.06 wide at the very light end, while
  the step of an even row of eleven steps is 0.0785: that many steps do not fit into such a band. A shade over the
  surface gives the needed value and does not touch the row. Rejected: to move the step for the sake of the light
  end — then the dark end stops reaching the almost black.

- **The row of the line is counted, it is not carried over from today's values.** The lightness goes by even steps,
  the tone and the chroma are taken from the colour of the mark, the mark itself stands as the step 500. Rejected:
  to carry the former values over into the new names — it is cheaper and moves not a pixel, but nails down in the
  new line the same hotchpotch. A decision of the owner: the system is more important than the immobility of the
  frames.
- **A transparent shade is written down by a mixing with a transparency.** The form is one for the whole kit: the
  check of the contrast takes apart the written value, and a second form is for it an unparsed colour, that is, a
  pair that silently fell out of the measurement.
- **The backing of the harness is not painted by the colour of the mark.** The header and the side navigation stand
  on a dark blueness, and whoever repainted the brand does not expect the backing of the header to change together
  with the button.
- **The ring of the focus is taken apart into the colour, the thickness and the offset.** A composite value with a
  sewn-in thickness gave no way to change the thickness without rewriting the shadow in both themes.
- **The completeness of the dark theme is checked by a machine.** It is a checking of two lists of names, not a
  judgement about a colour: it has no disputable findings.
- **The layer of the cascade around the styles of the kit was created after the properties of a component.** A layer
  changes the look at a consumer silently, without a refusal of the build, and the frames of the showcase will not
  catch that — there are no foreign overrides in the showcase. So it went after the consumer had got something to
  set by instead of overriding.
- **The source of the design was created by the last work of the line, not by the first.** A decision of the owner.
  A generator written before the cleaning would have nailed down by code the very scattering for the sake of the
  taking apart of which the work was begun; written after, it lifts the hand-written layer in which a typo in a name
  is caught by the eyes on the showcase.
- **The source became a node module next to the styles, not a JSON and not a typed module.** A JSON holds no
  comments, and the rows are counted in OKLCH and explained by prose; a typed module would pull into the harness a
  runner the checks of the tree have none of. A decision of the owner.
- **What is put together stays in the repository under the checking.** The showcase, the environment of the
  development and all the checks of the design read the files of the styles from the disk; to take them off the disk
  means to rewrite the checks along with it. An edit past the source is refused by the checking.
- **The look of the kit is kept, and every exception is named in advance.** Nine places are named — from a
  switched-off button to the role of a detail set apart from the mark. Any divergence of the frames not brought
  under one of them reads as a defect of the edit.

## Open questions

The open questions of the domain are shared, and they live in the spec next to it.

## Measurements

Taken 2026-08-13, after the epic on the design had closed. The numbers are reproduced by the commands from
`implementation.md` next to it and by the runs of the checks of the design.

| what                                                | value |
| --------------------------------------------------- | ----- |
| files of styles at the components                   | 87    |
| of them declare their own properties of a component | 61    |
| pixel numbers in them, outside the media queries    | 193   |
| literals of a colour in them                        | 3     |
| walks of a foreign layout in them                   | 1     |
| steps of the scale in the source                    | 163   |
| appointments of the light theme in the source       | 213   |
| answers of the dark theme in the source             | 62    |
| of them to their own light appointment              | 61    |
| names declared in all                               | 590   |
| handles of the consumer                             | 11    |
| names used by both kits, accepted by a list         | 9     |
| colour appointments of the light theme              | 119   |
| of them answered by an override                     | 58    |
| answered through a chain of references              | 17    |
| marked as common to both themes                     | 44    |
| accepted by a list                                  | 0     |
| dark answers past the layer of the design, accepted | 6     |
| pairs "a text and a ground" in the list             | 49    |
| reference snapshots of the showcase                 | 447   |

## History of changes

- 2026-08-17 — the subdomain was split out of the spec of the domain, which had outgrown the length limit. The
  rules, the scenarios and the bindings of the design moved here as they were: the scenario numbers were not
  recounted.
