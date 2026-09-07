<!-- rt-kit v0.25.0 · pitfalls/testing.md · b5d595f8cc4f · правится надстройкой, не здесь -->
# Verification — cold part

Pitfalls: traps already stepped on. Loaded not with the rule but on demand — an ordinary
decision does not need it.

The rule is `testing`; the articles that hold the law stand there.

## Pitfalls

- **A green test of a pure function is silent about a series the working path never produces.**
  The function is right on what it was given, and the input is given by the test itself: a series
  assembled for the convenience of the check proves behaviour on a case that never occurs in
  work. Two green tests of the notification decision stood this way, and the safeguard the
  decision was written for never fired once. The input shape is taken from the boundary where
  the decision is called — the procedure, the service, the handler — and checked against it, not
  invented next to the test.
- **A green `nx test <project>` does not mean a single file was executed.** A lib without its own
  `vitest.config.mts` runs nothing — that is how the tests of the booking domain never ran once.
  A lib with a config but without a single `*.spec.ts` passes green because of
  `passWithNoTests: true`, which usually stands in every config of the tree, and by eye the two
  cases are indistinguishable: in both the run succeeds. The share of libs without a single test
  is measured by the count below — in the tree where it was first done, it came out at almost
  two thirds. Before an edit in an unfamiliar lib, check whether it has at least one
  `*.spec.ts`; if not, the first one is created by that same edit, not postponed: there is
  nothing to postpone from, the debt is already accumulated. The count:
  `for d in $(find libs -name vitest.config.mts -exec dirname {} \;); do
  [ -z "$(find "$d" -name '*.spec.ts')" ] && echo "$d"; done | wc -l`.
- **A green coverage summary does not mean the tests pass.** The audit reads test titles and
  matches them to the spec's scenarios; whether a test executes and how it ends, it does not know
  at all, and a failing test is listed in it as coverage. Three scenarios of one panel were
  failing before the screen edit too, and that was found only by a run. Before editing a screen,
  its end-to-end tests are run once before the first line of code: otherwise someone else's
  failure reads as one's own regression, and one's own as someone else's.
- **"Executable doesn't exist" is the state of the machine, not a defect of the edit.** Only
  chromium is installed, `firefox` and `webkit` always fail: run `--project=chromium`, narrow
  screen — `--project=mobile-chrome`. The same error comes after a Playwright version change: the
  browser is installed for a specific version, and after a bump a repeated
  `npx playwright install chromium` is needed. Nine tests failed this way, and it looked like a
  regression of the upgrade.
- **The first run right after installing the browser cannot be trusted.** Two failures of the
  end-to-end set repeated neither in a separate run of the same tests nor in a second full one.
  Such a run is repeated, and conclusions are drawn from the second.
- **A rerun through the push gate repeats the whole set, not the failed test.** The gate runs
  what the tree's profile listed, whole and from scratch: for the end-to-end set that is minutes,
  and every push attempt costs them anew. The neighbouring pitfall holds exactly up to this
  point: repeating is cheap — through the gate it no longer is, and "repeat" turns into "push
  until it passes". So the full set is run by hand before the push call, and the gate only
  confirms what is already known. A test that failed in the full set and passed in a separate
  run does not count as green: it is a flaky test, and it is filed as a task in the same turn.
  Running until green carries the sign away together with the failure, and the next session
  meets the same thing as news — with nothing to tell someone else's flakiness from its own
  regression: both cases look the same.
- An end-to-end test that needs a login is skipped silently without credentials in the
  environment — in the summary it is listed as `skipped`, and the run looks successful. The
  variable names are with the tree.
- **The flows reference creates no second scenarios.** `docs/E2E_<DOMAIN>_FLOWS.md` holds what is
  not and must not be in the domain spec: the elements' `qa-dataid`, markup states, stand
  pitfalls. Promised behaviour stays a scenario in `scenarios.md`: copied into a second place,
  the copies diverge silently — `npm run check:specs` will not see it.
- `npx nx serve` does not count as a check: it is a step from the `browser-verification` rule,
  not a test.
- **A frame that depends on machine load checks the machine, not the layout.** Waiting by a timer
  ends exactly there: on a free machine the set is green whole, on a busy one it fails, and which
  frame did not make it is a matter of chance. It is cured by waiting for an event, not by
  lengthening the timer: fonts loaded, images painted, motion stopped, the node's position
  unchanged for two frames in a row. While the wait goes by time, "checked by snapshots" means
  "the machine was free", and a rerun that gave green does not cancel that but hides it. Eight
  frames diverged from the reference by 0.15–0.74 % in the pipeline step and passed on the same
  machine outside it.
- **A stand raised by the previous step is stopped before the shoot.** Left running, it competes
  for the machine with what is being shot and makes the run's outcome depend on what the
  neighbour is busy with. Load the step creates for itself — a neighbouring showcase, a build
  just finished — differs in nothing from someone else's.
- **One's own stand is taken down before the set is called.** The run reuses what is raised on
  its ports, and a stand left for measurement hands it someone else's build with someone else's
  data. The red then comes not as a line about a busy port but as a dozen screen tests — that
  is, it looks like a defect of the edit: in one session first six new tests turned red, then the
  push gate, and both times the cause was one's own stand. The busy-port case already taken
  apart does not close this side: it is about someone else's stand, and this one is about one's
  own.
- **Investigating a failed frame starts with the numbers, not with the diff picture.** The area
  share says how much diverged and is silent about what: a whole-frame shift by a pixel,
  reordered rows and ripple on antialiased corners look the same in the picture — "became
  different". The coordinates of the diverged points and the size of the divergence per channel
  are read: shifted block boundaries are layout, diverged text with boundaries in place is data,
  one or two per channel on curved edges is colour. Three divergences of one set were taken
  apart exactly so, and none of the three turned out to be a screen defect.
- **A test's expected value is not taken from the code the test checks.** Imported from the lib
  under test, it makes the test green at any value: "the wheel shows five rows" matches even
  when the rows became three. The expected value is written as a number in the test itself next
  to the check, and the shared module of the end-to-end tests holds the techniques — open, wait,
  read off the page — but not what is expected of the page.
- **Red that came without a code edit is investigated from the side of time.** A green run of the
  same tip an hour earlier means the search is not in the edit: a fixture's expiry date, a leap
  day, the day rolling over in universal time, the machine's time zone. A test waited two days
  and turned red by itself — the run fell four minutes after the date written in its fixture.

## What stood in the articles

- **The seed and content with an author.** Three invented quotes lived until a separate task and
  all that time looked like reviews by real people.
- **The browser raster.** The divergence wanders over the frame, comes about once in four runs
  and does not show on light screens at all, so it reads as random.
- **The mask and the width.** The list frame shifted by a pixel whole, including the columns
  where nothing changed.

