# browser-verification — how it is arranged here

The names of this tree, next to the rule `SKILL.md`. A separate file because the rule speaks by
technique and travels between repositories whole, while everything below is true only here and
goes stale at every renaming.

There are three kinds of stand here, and they answer different questions. The showcase shows a kit
component in all its declared states — the layout of a component is judged by it. The tree's
applications — the receiver and the admin panel — come up on one's own machine by the `serve:*`
commands and show what a person sees. The end-to-end suite's stand raises the production builds of
both on ports of its own with its own seeded database: on it one looks at the states that never
happen in the working database.

## What it is called here

- **In the rule** — Here
- **a stand** — the showcase: the first kit at `http://localhost:6006`, the second at `:6007`; the applications: the receiver at `:3000`, the admin panel at `:4200`; the end-to-end suite — its own `:3310` and `:4310`
- **the browser driver** — the claude-in-chrome extension; there are no other doors
- **the pinned profile** — the identifier from `.claude/rt-kit/browser-device-id` — a file of the machine, it does not travel into the repository
- **a measurement** — the computed values of a node, taken from the page rather than by eye from a screenshot

## Where it lives

- **the helper that prints the profile** — `.claude/hooks/browser-device-id.sh`
- **the profile choice guard** — `.claude/hooks/browser-guard-device-id.sh`
- **the choice freshness guard** — `.claude/hooks/browser-guard-require-select.sh`
- **the workaround guard** — `.claude/hooks/browser-guard-no-other-drivers.sh`
- **the listing and switching guard** — `.claude/hooks/browser-guard-no-listing.sh`
- **the guard against asking about the profile** — `.claude/hooks/browser-guard-no-asking.sh` — a file of this tree, the package does not carry it
- **the stories and the overview pages** — `projects/<kit>/src/**/stories/`, `projects/ui-kit/docs/*.mdx`

## The stands of this tree

The list the hooks print in a refusal is declared by the profile override —
`.claude/rt-kit/project.sh:RT_STANDS`: the receiver on 3000, the admin panel on 4200, the end-to-end suite's stand on 3310 and 4310, the `ui-kit` showcase on 6006, the `ui-kit-v2` showcase on 6007. The hook that reads the variable is not laid out here — it stands in the `skip` list of `.claude/rt-kit.json` — so the list is read by a person, and the refusal text of the browser guards stays general.

## Where the articles are carried out

The first column is the article verbatim, as it is written in the section "How the law applies
here" (the bold part of the item). An article without a line and a line without an article are a
divergence: the rule promises what the tree does not have, or the tree holds what the rule is
silent about.

- **A second instance of an application that is already up is not raised.** — **Not carried out.** No second-instance guard is laid out; it is held by the order: `lsof -nP -iTCP:<port> -sTCP:LISTEN` before the startup — `6006` and `6007` on the showcases, `3000` and `4200` on the applications, `3310` and `4310` on the end-to-end suite's stand. A taken port means something already up rather than a reason to take the next one; a separate showcase instance for the snapshot run comes up on its own port and is passed through `STORYBOOK_URL`. Everything is raised by the agent itself: `pnpm run storybook`, `storybook:ui-kit-v2`, `serve:db`, `serve:api`, `serve:admin`, `serve:stand`.
- **The browser is driven by one driver on the pinned profile.** — `.claude/hooks/browser-guard-no-other-drivers.sh:deny` — it refuses the second and third drivers, opening a link by system means, launching the binary and driving by an automation script.
- **A browser raised by a library from inside a script is the same door as launching the binary.** — `.claude/hooks/browser-guard-no-other-drivers.sh:launch` — it judges the content of the file being run and the code passed as an argument instead of a file, against the entry points of browser libraries; a file that does not exist it does not judge at all.
- **The browser choice goes stale and needs a repeated call.** — `.claude/hooks/browser-guard-require-select.sh:ttl` — the choice mark lives five minutes and is refreshed by every call that passes.
- **A refused profile choice ends the work with the browser; it does not start a search for a workaround.** — **Not checked by anything.** The choice freshness guard judges calls after a choice has taken place, while the refusal of the choice itself is seen only by the executor: from outside "there is no profile" and "the choice has not been called yet" are indistinguishable. Held by the article; the miss has already happened in the tree — the refusal was read as an obstacle and the calls went on without a choice.
- **The profile is not picked from the list and not asked from the owner.** — `.claude/hooks/browser-guard-no-listing.sh:device_id` refuses the listing and the switching, `browser-guard-no-asking.sh` — the question about the profile itself.
- **An unconfigured guard is a reason to stop, not a permission to go on.** — **Not checked by anything.** The browser guards let a call through when they themselves failed to work — that is their declared `FAIL-OPEN`; whether the executor stopped after the helper's empty output or went on is visible to none of them.
- **A screen behind sign-in is checked on a stand with a substituted sign-in answer, not with a live account.** — `apps/message-bus-admin-e2e/src/support/admin.ts:signIn` — the sign-in goes through the form, as a person's does, and the pair is taken from the stand: `apps/message-bus-admin-e2e/stand/stand.mjs:ACCOUNT`.
- **A screen whose data never exists in the development database is measured with the component's real styles.** — **Not checked by anything.** To a machine inserted markup is indistinguishable from markup that came from the server — that is exactly how the technique works; the honesty of the measurement is held by the styles being taken from the open screen rather than invented together with the row
- **Changing the number of elements in a container is a layout edit.** — **Not checked by anything.** The document width is invisible in the text of the edit, and a guard has nothing to judge by; it is caught by a measurement on a narrow viewport — the pattern `browser-verification-measure` or an end-to-end spec with a set viewport
- **A measurement is taken on the longest value, not on the sample one.** — **Not checked by anything.** Text clipping by the browser is invisible in the markup: the specs read the whole text and are green on both sides of the miss. Held by a measurement — the pattern `browser-verification-measure`
- **A ready-made kit piece taken for values of another size is measured, not looked at.** — **Not checked by anything.** Neither the linter, nor the build, nor a showcase snapshot knows what value the component will be filled with at a consumer; a snapshot catches this only where a frame of its own is started for the new place
- **The stand proxy supplies what the application recognises the request's tenant by.** — **Not applicable.** Neither application here keeps several organisations behind one address: the receiver tells callers apart by the token of the request, not by a header of the host, and a request to the showcase belongs to nobody at all.
- **The production configuration is checked only behind the real proxy.** — `apps/message-bus-admin-e2e/stand/` — the suite's stand raises production builds of both applications, and the admin panel proxies `/api` to the receiver: that is the real request path of this tree. There is no nginx in front of them, so what lives in a proxy config elsewhere is not checked here at all. On the kits the closest is the built showcase (`pnpm run build-storybook`) against the showcase in development mode.
- **What is shown to a person is built from the work under discussion.** — **Not checked by anything:** building the stand is an ordinary build command, and it is invisible from it that what was built will go to the owner. Held by what is said about the shown naming the branch.
- **The work branch keeps the tip of main merged in the whole time, not only before delivery.** — `.claude/hooks/git-guard-delivery.sh:behind` — the guard judges how far behind the branch is when a request is opened; between deliveries nothing judges it.
- **A measurement that will have to be repeated is taken by an end-to-end test, not by the driver.** — `apps/message-bus-admin-e2e/src/list-state-filter.narrow.spec.ts:viewport` — the window width is taken from the page, the position and width of a node from its rectangle; the rest of the specs with the `.narrow` suffix measure the list and the filter the same way. The viewport is set for the whole suite in `apps/message-bus-admin-e2e/playwright.config.ts`.
- **A measurement is taken before the work is shown to the owner, not after their remark.** — **Not checked by anything:** the turn has no minute of showing at all, and there is nothing to tell a measurement before it from one after. Held by the order: the reference numbers lie in the grill of the request, and the audit against them goes in the same turn as the showing.
- **Work that carries a look over from a sample is accepted by a frame of one's own screen next to the sample's frame.** — **Not checked by anything.** No check knows whether a screen was opened after the edit. A frame next to the sample's is read by a person. Held by the closing step: the frames go into the PR body before the draft is lifted.
- **The first visit to a public screen is marked with the service-visit sign.** — **Not applicable.** The library has no public screen: the only stand is the showcase, and there is nothing to mark in it.

## What else is worth knowing when reading the code

- **There are two doors into the browser here, and the second is not a workaround.** The
  extension drives a live tab on the pinned profile and demands the owner at the machine. The
  driver standing in the tree for the snapshot runner is driven by a script without it — it is
  what takes the measurements, the narrow screen and the sweep over all the stories
  (`tools/story-sweep-v2.mjs`). The workaround guard watches opening an address by system means,
  driving the driver from the command line and a second driver of a live tab, not the running of
  a script. A measurement taken by the second path is just as much a measurement.
- The profile is pinned on the machine and does not travel into the repository: the file
  `.claude/rt-kit/browser-device-id` is excluded from the index. With no file all the browser
  guards let through, and that is done deliberately: a guard that cannot name the right profile
  offers nothing in its stead.
- A spec and a showing in the showcase do not replace one another: a spec proves that a state
  came about, and the showcase that it looks as promised. That is written down by the law of
  verifiability and by the override to it in `.claude/rt-kit/overrides/laws/verifiability.md`.
- The second kit's showcase must show every declared state of a component; what cannot be shown
  is marked with a reason — the rule `rt-tools-storybook`.
- The showcase for the eyes may not be raised with `RT_SNAPSHOT_RUN=1`: the variable removes the
  pseudo-state addon, and hover, focus and active disappear from the showing. It is set only by
  the snapshot run command.

## What this is checked by

- `pnpm run storybook` and `pnpm run storybook:ui-kit-v2` — the showcases of the first and the
  second kit.
- `pnpm run build-storybook` — the built showcase, if a divergence looks like a trace of
  development mode.
- `pnpm run test:visual` — a snapshot of every story of the first kit against a reference; the
  references themselves lie in `projects/ui-kit/.storybook/__snapshots__/`, the divergences in
  `__diff_output__` next to them, and they do not travel into the repository. They are updated
  deliberately: `pnpm run test:visual:update`. The run goes against an already raised showcase;
  the address is overridden by `STORYBOOK_URL`.

## About the showcase snapshots

- **A reference is pinned to the machine.** Here that costs nothing: the CI runner is the same
  machine as the developer's, so a reference taken locally matches the run in CI. A change of
  machine or of browser version means re-taking all the references, not sorting out divergences.
- **A snapshot and a measurement answer different questions.** A measurement of computed values
  says only what it was asked about; a snapshot catches everything visible, but fires on a shift
  of one pixel too. One does not replace the other.
- **What is not deterministic does not get into a story.** Random data is pinned by the
  generator's seed (`faker.seed` in `preview.ts`), pictures are embedded into the address instead
  of being loaded from the network, the icon font waits for readiness — until then `rtui-icon`
  keeps itself invisible.
- **The framework's animations do not go through CSS.** Declaring a zero duration does not stop
  them: before a snapshot they are driven to the end through the animations interface, otherwise
  the action bar gets into the frame halfway along.

## About the narrow screen

The narrow-screen threshold here is `599px` — both the media query
`media-breakpoint-down($device-xs)` and `BreakpointService` measure by it. A browser window on
macOS does not narrow below about `606px`, so neither by the driver nor by hand can the threshold
be reached: the narrow view is checked by the showcase driver, which sets the frame size itself.

The driver stands in the tree for the snapshot runner; it is called by a one-off script from a
temporary directory, and such a script does not travel into the repository:

```javascript
const page = await browser.newPage({ viewport: { width: 599, height: 900 } });
await page.goto('http://localhost:6006/iframe.html?id=<story>&viewMode=story', { waitUntil: 'networkidle' });
await page.evaluate(() => getComputedStyle(document.querySelector('<selector>')).visibility);
```

- **The measurement is taken on both sides of the threshold, not on one.** A value on a narrow
  screen without the value on a wide one does not tell a rule that moved from a rule that always
  applied.
- **The showcase passes `isMobile` deliberately**, and on a narrow frame the markup branch stays
  the wide one. The branch is switched not by the frame size but by the story argument:
  `&args=isMobile:!true`.
- **A rule with nothing to hang it on is checked by hanging the class.** A modifier that is set by
  measuring the content may fire at no width at all in the showcase; then the class is added from
  the page, and the computed value under it is measured.
