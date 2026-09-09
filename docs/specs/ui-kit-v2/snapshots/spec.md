# The snapshots of the showcase

**Status:** in force · **Revision:** 2026-08-17 · **Scenario prefix:** `SC-UKV`
**Depends on:** the helpers of the showcase of the second kit (`src/showcase/`); the rule of the check
of a component of the kit; the plan of the coverage of the states, whose open question about the
checking of the frames this agreement closes
**Laws:** `verifiability`, `delivery`
**Procedures:** none

## Why

The showcase of the second kit shows the states of the components by matrices, and a matrix catches a
divergence only when somebody looks at it. It is looked at rarely: an edit of one component opens one
page, while the neighbouring one may go wrong, because the colour, the padding and the shadow live in
common tokens. While a frame is not checked against a saved one, "all the states are shown" means "the
states are shown to whoever opens them".

The first kit has such a checking, the second had nothing: neither a harness, nor references, nor a
step in the run. The subdomain names what exactly is shot, what a frame is held equal between the runs
by, and in which place the run is obliged to refuse instead of going green.

## Terminology

- **A frame** — a snapshot of a story of the showcase shot by the run in a window of a set size.
- **A reference** — a saved frame the newly shot one is checked against.
- **A matrix** — a story drawing an axis of the inputs whole or the crossing of two axes by cells.
- **The root of the show** — the element the helpers of the showcase draw a grid, a row or a comparison
  of the themes by. The frame is taken by it, not by the whole page.
- **The harness of the snapshots** — the setting of the run of the showcase: the size of the window, the
  quieting of the frame, the threshold of the divergence and the catalogue of the references.
- **The quieting of a frame** — bringing the page to a state in which two shootings in a row coincide:
  the movement is stopped, the fonts have arrived, the pointer is led away, an overlay is opened to the
  end.
- **The threshold of the divergence** — the share of the area of a frame below which a divergence counts
  as a coincidence.
- **A threshold of the width** — the width of the window named by the component itself: by a media query
  in its styles or by the service of the thresholds, if it looks at it.
- **A frame of a threshold** — an additional frame of the same story in a window taken by a threshold of
  the width. The word "narrow" is no good: one of the thresholds of the kit is wider than the base frame.
- **An exception** — a mark at a story lifting it from the shooting, together with a reason.
- **A picture of the differences** — the image the run gives out at a frame that diverged: the reference,
  the shot frame and the highlighted difference.

### What it is called in the interface

The harness has no interface. A person sees the command of the run, the command of the reshooting, the
list of the stories that diverged in the output and the pictures of the differences laid out by the run
as an attachment.

## Rules

- **Every kit has a harness of the snapshots of its own and a catalogue of the references of its own.** A
  file common to two kits would bind them where they are set apart on purpose: an edit for the sake of the
  second would fell the references of the first.

- **Everything is shot except what is marked by an exception.** The set is given by subtraction, not by
  an enumeration: a story they forgot to mark is shot and checked, it does not fall out silently. The
  reverse order — "what is marked is shot" — gives a green run and zero checked pixels at every matrix at
  which they forgot to put the sign, and that cannot be told from a sound run.

- **An exception without a reason fells the run.** The reason is the only thing "is not shot" differs from
  "was forgotten" by; an empty mark brings back that very silent skipping for the sake of which the set is
  given by subtraction.

- **A reference that has no story fells the run.** A story is renamed or deleted, and its frame stayed —
  such a reference is eternally green, because nobody opens it. The catalogue stops answering the question
  of what is checked.

- **The frame is taken by the root of the show, not by the whole page.** The threshold is counted from the
  area of the frame: in a page where a grid takes a small share, a cell that went wrong passes silently.
  The area of the frame decides that more surely than a picking of a number.

- **Any frame beyond the bounds of the window is shot by a window widened to it, not by a shooting past
  those bounds.** A shooting past the bounds of the window not only shoots the page but touches it: the
  browser substitutes the window for the time of the frame, the page gets a `resize`, and what is counted
  from the sizes of the window slides right under the shutter — a ribbon of the show loses its scroll, the
  height goes away by a pixel or two. Whether the shift manages to lie into the raster is decided by a
  race, so the story goes red inconstantly and every time another one looks guilty. The same movement made
  before the frame and with a waiting for the show to stand after it does not lose the scroll. The
  consequence is named here because it is visible in the reference: `100vh` and `100vw` of such a story are
  counted from the widened window, and the show takes the frame whole.

  This holds for both frames of the showcase, and the rule is one for them because the shutter is one. A
  frame of a whole page is widened to the page; a frame by the root of the show — to that root, not to the
  page: the page happens to be higher than the root being shot, and a superfluous growth of the window
  would change everything counted from the window at stories that did not ask for it. Named apart because
  the miss lands not where the high show stands: the neighbouring story is shot by a page already shifted,
  and the divergence comes to the story next in the file. A rearrangement of the stories then moves frames
  nobody touched.

- **A frame of a threshold is taken at every threshold the component itself names.** One additional frame
  at a component with three media queries would leave two branches of the layout unchecked and would show
  them as covered. A common set of the thresholds for the whole showcase is the other extreme: at a
  component that does not look at the width, the second frame repeats the first pixel for pixel.

- **A frame of a threshold is shot on the side of the threshold the media query switches on.** The rule
  `width <= 768` is checked by a frame in a window of 768, the rule `width >= 1441` by a frame in a window
  of 1441. Otherwise half of the thresholds check the side where the rule does not work, and the
  difference between "768" and "767" stays at the discretion of whoever writes the harness.

- **A frame is determinate: two shootings in a row without edits agree.** A divergence given not by an edit
  of the kit is a defect of the harness, not a ground to raise the threshold.

- **A story that fell is not reshot a second time.** A repeat turns a blinking story into a green one at the
  second attempt, and the rule about determinacy becomes uncheckable: a run with repeats is green regardless
  of whether the frame holds or not.

- **A state the frame did not reach fells the run, it does not get into a reference.** An overlay that did
  not open cannot be told in a frame from a sound story with a closed overlay, and a reference of such a
  frame legalises the silence.

- **A missing reference is a refusal of the run, not a silent shooting after the fact.** Otherwise the run
  is green exactly because there was nothing to check against.

- **A reference is shot from what is fixed.** A divergence found by a shooting is fixed, not nailed down: a
  frame over a known defect declares the defect the norm and takes it off the count forever.

- **The threshold of the divergence is named by a measurement, not carried over from the first showcase.** A
  component takes in a matrix a share of the frame not equal to the one the first kit was measured on, and a
  carried-over number is wrong in both directions at once.

- **A reference is shot and checked in one environment.** A frame depends on the fonts and the drawing of the
  system, and the environment is neither the machine of the author nor the machine of the reviewer but the
  run standing where the reference was shot. Otherwise the rule about determinacy is broken as a matter of
  course, at every new component.

- **A frame that diverged gives out a picture of the differences, and it does not go into the repository.** A
  red run happens both from a shift by a pixel and from a block that disappeared; by the name of the story
  alone that cannot be told. But a picture is a trace of one run, not a description of the kit, and its
  getting into a change is closed by a mask, not by the memory of the author.

- **A red frame is not merged.** A run showing divergences and not holding the merge is a switched-off test:
  in the summary it is green, and the divergences stay in the output nobody opens.

- **A component that arrived into the showcase after this work brings its reference by the same change.** A
  show shot by a separate pass falls behind the code exactly as long as it lives between the passes.

- **A reshooting goes by a named story.** A reshooting of the whole catalogue erases the divergence that was
  not expected too — it stays a separate command, not a default.

- **The language of the labels in a frame is one and is appointed by the harness.** The language from the
  settings of the machine sets the references of the author and of the run apart without a single edit of the
  kit. Mixed languages at that do not hide but become visible by a picture.

- **The theme of a matrix is one and is appointed by the harness.** The theme from the settings of the system
  sets the references apart the same way the language does. The second theme is checked by the story of the
  comparison of the themes, not by the switch of the showcase.

- **An empty show does not become a reference.** A story whose wrapper gives back an empty set draws a clean
  ground, and a frame of such a show declares the emptiness the norm: a filled set then fells the run and
  reads as a breakage. Such a story is marked by an exception with a reason until it is filled.

- **The number of the stories opened at once is set by the run, not by the machine.** The showcase at the
  address is one, and the default of the builder — a thread per core — outruns it: the application of a story
  does not manage to stand, the waiting for the readiness inside the builder ends empty, and the frame either
  diverges or the story falls. It is not cured by a repeat: a repeat makes the rule about determinacy
  uncheckable.

- **The readiness of an icon is checked by a drawn icon, not by a sign of the loading.** The set of the icons
  goes by the network and is put together anew between the stories; in the meantime it is on the page, and
  `<use>` is empty. A frame without the icons differs from the reference by the whole layout of the row, not
  by one icon.

- **A component whose filling arrives later declares its unfinishedness itself, and the shooting waits for
  it.** An empty place in the place of such a component stands for seconds and all that time does not change
  its sizes — that is, it looks like a show that has stood; neither a counting of the time nor a comparison of
  the sizes catches that. The frame of the editor came out three times lower than the reference and felled the
  run of every open branch.

- **A story showing an opened panel names its node, and the leading away of the pointer on its page is muted.**
  A panel of the kit opened by a hovering goes out not at once but with a delay after the leaving of the
  pointer — and the preparation of the frame, which leads the pointer away into a corner, managed to put it out
  between the opening and the snapshot. The frame at that came out with a closed panel, and the run stayed
  green: a closed panel cannot be told from a story that must have no panel at all. The named node closes both
  halves — the run refuses by it, not having found what was promised.

- **The run refuses if the wrong showcase is at the named address.** The showcases of the two kits are told
  apart only by the content; a run pointed at a foreign one or at one left from the last time gives either a
  mountain of stories that were not found or a checking of foreign frames, and the reason is looked for in the
  harness.

Below are the rules of the design of the kit: in the same list, because the binding to the code is read by a
machine, and a heading inside a list breaks its reading off.

## What is out of scope

- **The showcase of the first kit:** its harness, its references and its step of the run are not touched.
- **A check of accessibility:** a work of its own with a run of its own. The owner marked it needed; it stands
  apart because there is not a trace of it in the tree, the number of the violations is unknown, and a red run
  of accessibility must not hold green snapshots.
- **The debt on the specs of the components:** a work of its own. Eleven folders where there is less spec than
  there are components; it has nothing to do with the shooting of the frames and is merged independently.
- **The bringing of the coverage to the end by the waves of the composite components and of the remainder:**
  works of their own in the plan of the coverage. After the turning of the order they bring the references
  themselves.
- **The bringing of the thresholds that diverged from the common set to the common set:** this is an edit of
  the layout of released components under the guise of a setting of the run. What is shot is what is written.
- **An edit of the released components:** the fix goes by a change of its own. What exactly is fixed is decided
  by the shooting, but a change of the behaviour at the consumers of the package rolls back apart from the
  harness.
- **Frames in seven languages out of eight.** Declared unshowable: a cutting of a label in a long language is
  not caught by this work. The frame is shot in one language, and that is written down as a debt, not given out
  as coverage.

## Contract

There is no contract of the network: the work serves no procedures. The surface is the command of the run, the
command of a pinpoint reshooting, the command of the reshooting of the whole catalogue and the address of an
already raised showcase that they read. The run does not raise its showcase: it checks what is open at the
named address, and refuses if it is not it that answers at the address.

Zero — all the frames agreed. A non-zero code — the list of the stories that diverged and an attachment with
the pictures of the differences.

### Refusal codes

Not applicable: the run answers with a code of return and a list of the stories, not with named codes.

## Data

The snapshots have no storage of their own. The references lie at the showcase of the second kit as ordinary
files: they are read together with the stories, and there is nothing to check them against if they live apart.
No separate storage is created for them — at the chosen set of the frames and the frame by the root of the show
the matter is about single megabytes.

The pictures of the differences do not go into the repository. That statement alone is too little: the library
of the checking writes them next to the references, so the catalogue of the differences is closed by a mask, and
after a red run not a single file for a commit is left in the tree.

## Screens and states

The harness of the snapshots has no screens. The states of the run at one story:

| state                                   | what it is visible by                                                              |
| --------------------------------------- | ---------------------------------------------------------------------------------- |
| the frame agreed                        | the story is not named in the output                                               |
| the frame diverged                      | the name of the story, the share of the divergence, the picture of the differences |
| there is no reference                   | the name of the story and the demand to shoot a reference on purpose               |
| there is no story, there is a reference | the name of the orphaned reference and the demand to lift it                       |
| the story did not open                  | the name of the story and the reason, the frame is not checked at all              |
| an exception without a reason           | the name of the story and the demand to name a reason                              |
| the wrong showcase at the address       | the address and what the showcase was recognised as a foreign one by               |

## Cross-cutting requirements

### Locales

The kit carries labels in eight languages. The frame is shot in Russian — this is the language the showcase
works in today — and the language is appointed by the setting of the showcase, not by the settings of the
machine.

The other seven languages are not checked by a frame, and that is declared, not kept quiet: a label cut in a
long language is not caught by this work. The mixed labels the kit shows today the frame does not hide — it
makes them visible, and the fix goes by a task of its own.

### SEO

Not applicable.

### Mobile layout

A frame of a threshold is a part of the set, not a separate work. It is taken at the components that name the
width themselves, at every threshold of theirs and on the side of the threshold the media query switches on.

### Several objects

The tree holds two kits at once, and they share neither selectors, nor tokens, nor showcases. The harness of the
snapshots is set apart the same way: its own setting, its own catalogue of the references, its own port, its own
commands. There is no shared file between the kits.

## Decisions

- **The harness of the second kit is written as a file of its own, it is not taken out into a common base.** The
  saving of the repetition is not worth a bond between kits set apart on purpose.
- **The shooting goes from what is already in the showcase, and the waves that are missing bring the references
  themselves.** A decision of the owner, taken by the second pass of the grilling instead of the first answer.
  The argument: the waves of the coverage that are missing are about two volumes of all the work already done by
  this line, and all that time the written matrices are checked by nothing; and the threshold of the divergence
  and the time of the run at a waiting would be found out at the very end, when changing the decision is already
  dear. The price is named aloud: a wave touching the common helpers of the show will demand a reshooting with a
  looking at the pictures of the differences.
- **The set is given by subtraction, not by an enumeration.** A mistake in an enumeration stays silent, a mistake
  in a subtraction goes red. The price: the stories with values by default are marked by an exception by name, and
  that is a one-off work over the whole showcase.
- **The frame is taken by the root of the show.** The open question about the threshold for the matrices is solved
  not by a picking of a number but by a change of the area of the frame: in a frame where a grid takes almost
  everything, the threshold means again what it meant at the first kit.
- **A frame of a threshold is shot by the fact of what is written in the component.** The width today is named by
  ten folders by media queries and by an eleventh — the table — through the service of the thresholds; the rest of
  the media queries of the kit speak of the movement, the hovering and the kind of the pointer and have nothing to
  do with the width.
- **The references lie as ordinary files of the repository.** A separate storage would have to be set up both at
  the run and at everyone who clones, and the references would stop being visible as pictures at the taking apart
  of a change — that is, would stop working exactly where they are read.
- **The defects found by the shooting are fixed, but an edit of a released component goes by a change of its own.**
  The volume of the fix is not cut down. What is cut down is the size of the change: an edit changing the look of a
  component at the consumers of the package is obliged to roll back apart from the harness and to be released
  knowingly.
- **A red frame holds the merge from the first day.** A first run that does not block would be a test switched off
  by a sign of the environment; the sign of acceptance of the owner is a green run, not a green summary at red
  frames in the output.
- **The run has no repeats.** A blinking story must be visible as blinking, not pass at the second attempt. The
  price: the stories with overlays are obliged to have an open limit of the waiting, otherwise they fell the run by
  the time without a reason that can be told.

## Open questions

The open questions of the domain are shared, and they live in the spec next to it.

## Measurements

Taken 2026-08-09 on one's own machine, the showcase raised from the sources.

| what                                                           | value                                                                |
| -------------------------------------------------------------- | -------------------------------------------------------------------- |
| stories in the showcase                                        | 288                                                                  |
| of them lifted from the shooting by an exception with a reason | 62                                                                   |
| references in the catalogue                                    | 255, of them 29 are frames of the thresholds of the width            |
| the weight of the catalogue                                    | 4.2 MB, the average frame 17 KB                                      |
| a full pass, two threads                                       | 86 s; two runs in a row green                                        |
| a full pass, six threads                                       | 43 s, but up to eight frames diverged per pass                       |
| the run of the first showcase on the same machine              | 6.5 s at 47 frames (the measurement from the run of the main branch) |

The threshold of the divergence was checked on the spot: the padding of a label was increased by one pixel — **14**
frames in four components diverged, because the label is shown also by the chips of a multiple choice, the icons of
the header of a panel and the row of the details. The run laid out 14 pictures of the differences and left not a
single file for a commit in the tree; after the rolling back of the edit the run is green again.

## History of changes

- 2026-08-17 — the subdomain was split out of the spec of the domain, which had outgrown the length limit. The
  rules, the scenarios and the bindings of the snapshots of the showcase moved here as they were: the scenario
  numbers were not recounted.
