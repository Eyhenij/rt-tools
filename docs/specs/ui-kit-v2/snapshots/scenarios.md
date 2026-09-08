# Scenarios — the snapshots of the showcase

The prefix `SC-UKV` is shared across the domain together with the subdomains. The numbers were not
changed at the move into the subdomain: the titles of the tests refer to them.

What a scenario is covered by is said under it. Where the run does not cover a scenario, that is said
openly.

### SC-UKV-01 — an edit of the design that changed a matrix fells the run

Given a reference is shot at a matrix of the states of a component
When a common token of the design changes the look of at least one cell of that matrix
Then the run of the snapshots names that story as diverged and gives out the share of the divergence

Not covered: it cannot be closed by a test with an identifier — it is checked by the run of the snapshots, and its tests are created by the stories of the showcase and carry no identifier. Checked on the spot: the padding of a label was increased by a pixel — the run named 14 diverged stories in four components and gave out the share of the divergence at each.

### SC-UKV-02 — a story marked by an exception gives no frame, and an unmarked one gives it

Given the showcase holds a matrix of a component and a story with the values by default marked by an
exception with a reason
When the run of the snapshots goes
Then the matrix is shot, and the marked story gets no frame and is not created in the catalogue of the
references; a matrix at which there is no sign at all is shot on a par with the rest

Coverage: partial — the spec checks the form of the mark, not that a marked story gives no frame. The second is checked by the run of the snapshots: 62 stories out of 288 are lifted from the shooting by a reason, the rest gave 255 frames together with the frames of the thresholds.

### SC-UKV-03 — a frame of a threshold is taken at every threshold the component names

Given three thresholds of the width are declared in the styles of one component, and none at another
When the run of the snapshots goes
Then four frames are checked at the first — the base one and one at every threshold — and one at the
second

Coverage: partial — the spec checks the side of a threshold and the list, not the shooting of a frame in a window of that width. The second is checked by the run of the snapshots: 29 frames of the thresholds at five folders.

### SC-UKV-04 — an overlay that did not open by the minute of the shooting fells the run

Given a story opens an overlay itself, and by the minute of the shooting it did not open
When the story is shot
Then the run refuses and names the reason, and a frame with a closed overlay does not become a reference

Not covered: it cannot be closed by a test with an identifier — it is checked by the run of the snapshots. Checked on the spot — the story of the hints `Hosts` refused by exactly this while the harness was moving the focus and putting out the neighbouring panels.

### SC-UKV-05 — there is no reference, and the run refuses instead of shooting after the fact

Given a story has no reference in the catalogue
When an ordinary run of the snapshots goes
Then the run names the story without a reference and refuses, and the file of the reference does not
appear silently

Not covered: it cannot be closed by a test with an identifier — it is checked by the run of the snapshots. Checked on the spot — the first pass over the marked-up showcase gave 230 such refusals, and not a single file of a reference appeared at that.

### SC-UKV-06 — two shootings in a row without edits agree

Given the kit and the showcase did not change between the shootings
When the run of the snapshots goes twice in a row
Then both runs are green, and not a single story is named as diverged

Not covered: it cannot be closed by a test with an identifier — the determinacy is checked by two passes of the run in a row — 86.1 s and 91.0 s, both green, 255 frames agreed.

### SC-UKV-07 — the run of the second showcase does not touch the references of the first

Given the references of both showcases lie in the tree
When the run of the snapshots of the second showcase goes
Then only the references of the second are checked and reshot, and the catalogue of the first stays
untouched

Not covered: it cannot be closed by a test with an identifier — it is held by the layout: the second showcase has a setting of the run, a catalogue of the references, a port and commands of its own. Checked on the spot: the catalogue of the first showcase was not changed by a single file over the whole work.

### SC-UKV-08 — a frame that diverged gives out a picture of the differences and leaves no files for a commit

Given at least one frame diverged
When the run ended with a refusal
Then the pictures of the differences are laid out as an attachment of the run, by them it is visible what
exactly went wrong, and not a single untracked file is left in the tree

Not covered: it cannot be closed by a test with an identifier — it is checked by the run of the snapshots together with the mask of the catalogue of the differences. Checked on the spot — a divergence made on purpose laid out 14 pictures of the differences, and `git status` after it showed not a single file for a commit.

### SC-UKV-09 — the theme of a frame is appointed by the harness, and the second theme is checked by a frame of its own

Given a story of the comparison of the themes is created at a component, and the dark theme is chosen in
the settings of the machine
When the run of the snapshots goes
Then the matrices are shot in the theme the harness appointed and agree with the reference, and the light
and the dark halves are checked by the frame of the story of the comparison of the themes

Not covered: it cannot be closed by a test with an identifier — the theme is appointed by the setting of the showcase, the second theme is checked by the frames of the stories of the comparison of the themes — there are 34 of them in the catalogue.

### SC-UKV-10 — a new component brings the reference itself, and a red frame is not merged

Given a new matrix of the states is added into the showcase
When the change with it comes for the checking
Then the run of the snapshots is green only provided that the reference of that matrix came by the same
change, while a red run holds the merge instead of staying a record in the output

Not covered: it cannot be closed by a test with an identifier — it is held by the step of the run in CI: it is blocking from the first day, and a missing reference of a new matrix fells it by a refusal.

### SC-UKV-11 — an exception without a reason fells the run

Given a story is marked by an exception, but the reason is not named at the mark
When the run of the snapshots goes
Then the run refuses and names that story, and a frame is not shot from it and it is not skipped silently

Coverage: partial — the spec checks that an empty reason reaches the harness empty, not that the run refuses at it. The second is checked by the run itself.

### SC-UKV-12 — a reference that has no story fells the run

Given a story is renamed, and its former reference stayed in the catalogue
When the run of the snapshots goes
Then the run refuses and names the orphaned reference, it does not pass it green

Not covered: it cannot be closed by a test with an identifier — it is checked by the checking of the catalogue against the registry of what was shot. Checked on the spot — four frames of the thresholds were orphaned when their stories fell before the shooting, and the run named each.

### SC-UKV-13 — the frame is taken by the root of the show, not by the whole page

Given a story draws a grid by the helpers of the showcase, and the page around the grid is noticeably
higher than it
When the story is shot
Then the frame holds the grid and does not hold the empty field of the page around it

Coverage: partial — the spec checks only that the sign of the root at the helpers and at the harness is one and the same. The area of the frame is checked by the run: a story without a root refuses with the demand to declare the frame a whole page, and three such shows were found that way.

### SC-UKV-14 — a reference is shot from what is fixed

Given a shooting opened up a divergence showing a defect of the kit
When the reference of that story is put into the catalogue
Then it is shot after the fixing of the defect, not over it

Not covered: it is not covered by the run at all — a frame of a defect cannot be told from a frame of the norm, and in that the danger of the rule consists. It is checked by the taking apart of the change. In this work it is carried out: 22 frames shot over an empty show and a page of a refusal were deleted, and a reference was shot only after a fixing or was not shot at all.

### SC-UKV-15 — the threshold of the divergence catches an edit of one token

Given the threshold is appointed by a measurement on a matrix
When one token of the design changes, touching one cell of the grid
Then the run names that story as diverged, it does not pass green

Not covered: it cannot be closed by a test with an identifier — it is checked by a measurement: an edit of one value of a padding felled 14 frames at the threshold 0.0002 of the area of the frame.

### SC-UKV-16 — the reshooting and the checking go by one harness in one environment

Given the references are reshot by the command of the reshooting
When an ordinary run of the checking goes right after that
Then it is green without a single edit of the kit

Not covered: it cannot be closed by a test with an identifier — the reshooting and the checking go by one harness, and the pass of the checking right after the reshooting is green.

### SC-UKV-17 — the language of a frame is appointed by the harness, not by the settings of the machine

Given a language different from the language of the frame is chosen in the environment of the run
When the run of the snapshots goes
Then the labels in the frames are the same as in the references, and not a single story is named as
diverged

Not covered: it cannot be closed by a test with an identifier — the language of the labels is nailed in the setting of the showcase and is not taken from the environment.

### SC-UKV-18 — the run refuses when the wrong showcase is at the address

Given the showcase of the first kit answers at the named address
When the run of the snapshots of the second goes
Then the run refuses and names the address and the sign the showcase was recognised as a foreign one by,
and the frames are not checked against a single reference

Not covered: it cannot be closed by a test with an identifier — it is checked by the recognising of the showcase by the index of the stories: the run refuses before the first shooting, naming the address and the path the stories came from.

### SC-UKV-19 — a story that fell is named once and is not shot anew

Given a story did not reach the needed state
When the run reached it
Then it is named as fallen and is not shot a second time, and the run stays red

Not covered: it cannot be closed by a test with an identifier — no repeats are set at the run at all. A blinking story is visible as blinking — that is how an unhandled refusal of the loading of the icons was found that felled one or two stories per pass.

### SC-UKV-20 — a pinpoint reshooting does not touch the neighbouring references

Given the references of many stories lie in the catalogue
When the reshooting of one named story goes
Then only its reference is rewritten, and the rest of the files of the catalogue are not changed

Not covered: it cannot be closed by a test with an identifier — checked on the spot: the reshooting of one table rewrote its two frames and did not touch the other 253.

### SC-UKV-53 — an unfinished component does not get into a frame

Given a story shows a component whose filling arrives by a dynamic import
When the run of the snapshots reaches that story
Then the frame is shot after the component took the sign of the unfinishedness off itself, not by a
counting of the time

Covered: `projects/ui-kit-v2/src/lib/components/rich-editor/rt-rich-editor.component.spec.ts`.

### SC-UKV-54 — an opened panel lives until the frame

Given a story opens a panel of the kit itself and names its node by a parameter of the shooting
When the run of the snapshots reaches that story
Then the panel in the frame is open, and a story that has no named node by the minute of the shooting
fells the run

Not covered: it cannot be closed by a test with an identifier — checked on the spot: two frames of a whole
screen came out with a closed panel and a green run until the refusal was created.

### SC-UKV-57 — a frame of a whole page is shot by a widened window, not by a shooting past its bounds

Given a story declared a frame of a whole page, and the page does not fit into the base window
When the run of the snapshots reaches that story
Then the window is widened to the sizes of the page, the show is waited for as having stood, and only
after that an ordinary frame is shot; the scroll of the inner ribbons and the height of the page do not
change at that

Not covered: it cannot be closed by a test with an identifier — it is checked by the run of the snapshots. Checked by a measurement: at a shooting past the bounds of the window the ribbon of the viewer of the photos lost its scroll — 2624 to 2 — and the first snapshot of the set instead of the last got into the frame, while the height of the page went away by two pixels; after the widened window three frames in a row coincided pixel for pixel, and the ribbon stayed at the last snapshot.
