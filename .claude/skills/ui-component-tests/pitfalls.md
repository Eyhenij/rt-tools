# ui-component-tests — the cold part

Loaded on demand rather than together with the rule: here are the measurements, the numbers and the
cases needed by whoever sorts out a red snapshot, not by whoever writes a spec.

## What stood in the articles

- **A wait that swallows its own refusal.** There is one sign: the frame is taken, and the promised
  node is not in it — and it diverged alike at every meeting, because the state "did not wait" is
  steady. That reads as a layout divergence, and the sorting out goes where nobody edited anything:
  one such shot refused the push gate three times in a row and three times passed on the second call
  of the same command.
- **A resource and the component that noticed it.** It is caught not by reading the code but by a
  series: a single run matches on an unfixed race too.
- **A settled layout against a drawn page.** A measurement caught a frame in which everything
  matched — the sizes, the fonts, the network's silence, the finished animations — and which still
  diverged from the reference by sub-pixel halos on the labels at the same geometry to the
  hundredth. What differs there is not the layout but the rasterisation, and the browser gives no
  "the page is drawn" event at all. A divergence caught that way is visible only by a series: a
  single run is green in thirty-nine cases out of forty.
- **The gap between the layout and the drawing — the price as a number.** Zero drawn frames give an
  early frame five times out of five; one and more give the reference one, and so on two, three,
  four, six and ten. This is caught not by a series: the divergence falls out once in fifty runs, and
  twenty green ones in a row fall out on an unfixed harness as easily as on a fixed one.
- **The evidence of a rare divergence.** The difference frame the comparison library puts next to the
  references, and the very next green run erases it: over fifty-eight runs one red left nothing
  behind it.
- **A shot beyond the window.** A measurement caught this twice in one task — the photo viewer's
  strip lost its scrolling, and the first shot of the set got into the frame instead of the last; the
  page height moved by two pixels. Whether the shift makes it into the raster is decided by a race,
  so one and the same story turns red now and then, and every time a different one looks guilty —
  that reads as drifting layout, while there is no layout there at all.
- **A showing settled on skeletons.** The harness judges the frame by the network's silence and the
  motionless size of the node, while a screen with skeletons has a size just as motionless as a
  screen with a list: three references in a row pinned the skeletons and came out indistinguishable
  from one another.
- **An overlay going out before the frame.** The kit's panel, menu and popup, opened by hover, go out
  with a delay after the pointer leaves, and preparing the frame takes the pointer away: the panel
  managed to close between the story's step and the shot.
- **What drifts in a screen frame.** Of the three divergences in the admin panel's suite not one was
  a screen defect: the colour from the display profile, the column width from the value of the
  current moment, the order of the rows from the seeding.

## A divergence that came from the neighbouring story

Seven stories of the second showcase diverged at once, and none of them had been edited. Six were
renamed, one was new; the content of all seven stayed as it was. Five candidates were refuted one by
one: the style tag of the frame preparation, the pointer taken into a corner, the animations driven
to the end, the sign of the styling set, the scroll to the top. Each was switched off in turn, and
each time the seven stayed.

The carrier was found by a measurement of the node around the shot rather than by reading the code.
The height before the frame and after it:

```
atoms-forms-textarea--presets  box=812->810   y=16->0
atoms-icon--social             box=1072->1070 y=16->0
atoms-icon--themes             box=710->710   y=16->10
```

The base window is 1280×720, and every one of those nodes is higher. The browser takes such a frame
by substituting the window, the page gets a `resize`, and it loses two pixels of height and sixteen
of scroll. The next story is shot by an already shifted page, so the divergence lands on it and not
on the tall one.

With the window widened to the node the height holds and matches a measurement of the same story
opened on a page of its own: 150 against 148 at the button, 736 against 734, 395 against 391, 923
against 919. All four old references were short. The whole catalogue held 70 such: they were re-taken
by families, one family per call, and 38 more frames moved within the threshold.

The lesson is in the order of sorting out. A divergence at a story nobody edited is asked first about
its neighbour above, and the node is measured around the shot before a single wait is switched off.
The five refuted candidates cost about two hours.
