# ui-component-tests — how it is arranged here

The names of this tree, next to the rule `SKILL.md`. The rule is this tree's own, the package
carries no such thing: it is about checking a kit component, and the kit is this repository's
subject.

## What it is called here

- **In the rule** — Here
- **a component's spec** — a `*.spec.ts` next to the component, Jest with `jest-preset-angular`
- **a story for the sake of a check** — an export in a `*.stories.ts` — an axis matrix, `States`, `Themes`
- **a story snapshot** — a PNG in `<package>/.storybook/__snapshots__`, taken by a run against an already raised showcase
- **a screen frame** — a PNG in `apps/message-bus-admin-e2e/__snapshots__/<run>`, taken by that screen's end-to-end spec
- **the snapshot harness** — `projects/ui-kit-v2/.storybook/test-runner.ts` and `tools/visual-snapshots-v2.mjs`
- **the screen-frame harness** — `apps/message-bus-admin-e2e/src/support/shot.ts` and the runner's settings next to it
- **a measurement of computed values** — the computed properties of a node on a showcase page: the padding, the font size, the rounding, the colour
- **the divergence threshold** — a share of the frame's area: `0.0002` on the showcase, `0` on the screen frames

## Where it lives

- **The component specs** — next to the component, `projects/<package>/src/**/…spec.ts`
- **The kit's snapshot harness** — `projects/ui-kit-v2/.storybook/test-runner.ts` + `tools/visual-snapshots-v2.mjs`
- **The references** — `projects/<package>/.storybook/__snapshots__`
- **A story's shot parameters** — `projects/ui-kit-v2/src/showcase/story-snapshot.ts`
- **The agreement about the snapshots** — `docs/specs/ui-kit-v2/`
- **The shared showing harness** — `projects/ui-kit-v2/src/showcase/`
- **The sweep over the showcase's stories** — `tools/story-sweep-v2.mjs`
- **The admin panel's end-to-end suite** — `apps/message-bus-admin-e2e/src`
- **The end-to-end suite's stand** — `apps/message-bus-admin-e2e/stand`
- **The screen references** — `apps/message-bus-admin-e2e/__snapshots__`
- **The screen runner's settings** — `apps/message-bus-admin-e2e/playwright.config.ts`

## Where the articles are carried out

The first column is the article verbatim, as it is written in the rule's section "How the law
applies here". An article without a line and a line without an article are a divergence.

- **A wave of showings is closed by a sweep over all the stories, not by the colour of a run.** — `tools/story-sweep-v2.mjs:measureShownArea`, the command `pnpm run test:stories:v2`. It opens every story of the raised showcase and refuses on an empty showing area and on an error in the console. That what is shown is shown **rightly** it does not check — that is a look by eye.
- **The sweep opens the overview pages too, and by the same call.** — `tools/story-sweep-v2.mjs:ownShowings` — the index is read for entries of both kinds, and an overview page is asked for in the `docs` mode. The output names two numbers apart: stories and overview pages. Belonging to the showcase is judged by the stories alone, because a tree may have no overview page at all.
- **The showing root is chosen by the mode, not by the first node a chain of selectors finds.** — `tools/story-sweep-v2.mjs:measureShownArea` — the mode goes into the measurement, and the root is taken by it: the overview container for an overview page, the showing root or the showcase root for a story. **Not checked by anything** is that the pair stays right: a chain of selectors returns a node of zero area and passes the tooling all the same.
- **A check written for the wave judges the wrap, not the sighting.** — **Not checked by anything.** The sweep measures the area of the showing root, and a root with an area counts as drawn whatever lies inside it: to the machine an empty half and a filled one look the same. Held by the look over the frames, which the sweep narrows but never replaces.
- **A state invisible in the frame is not checked by a snapshot.** — **Not checked by anything.** A state that is not in the frame is indistinguishable to a machine from one that does not exist. The closest is the harness's refusal on a missing reference.
- **A state's sign is checked by the same thing a person sees it by: a frame or a measurement of the raster, not by the value of a written style.** — **Not carried out.** Nothing reads the raster here. A machine sees a style's value, while whether it applied shows only in the picture. The closest is the sweep `tools/story-sweep-v2.mjs:measureShownArea`, and it judges the area rather than the glyph.
- **A `play` step that asserts a node exists proves nothing about what is seen.** — **Not checked by anything.** No check reads what a `play` step asserts. A size against a lower bound is written by the story author.
- **If there is a pair of states, both must be in the frame.** — **Not carried out.** A pair of states is declared in the stories. A machine does not know how many the shown element has: a missing side is indistinguishable from a non-existent one.
- **A styling edit that passed the snapshots without divergences is half checked.** — `projects/ui-kit-v2/.storybook/test-runner.ts:FAILURE_THRESHOLD` — the comparison threshold is set by each showcase's harness. The share of the divergence is printed by the run and is read instead of the colour.
- **A settled frame is waited for by an event, not by a countdown, and the technique is repeated in every harness.** — `projects/ui-kit-v2/.storybook/snapshot-wait.ts:settled` — the network's silence and two identical sizes in a row. The screen-frame harness gets the same from its runner.
- **A wait that swallows its own refusal takes the frame too early.** — `projects/ui-kit-v2/.storybook/snapshot-wait.ts:drawnIcons` — an icon that did not arrive fails the run naming the story instead of a quiet frame. That not one wait swallows its own refusal nothing checks: a swallowed refusal is indistinguishable from one that never arose.
- **A wait waits for what is awaited, not for its consequence.** — `projects/ui-kit-v2/.storybook/snapshot-wait.ts:ICON_USE_SELECTOR` — an icon is looked for by its reference into the set rather than by the `rt-icon` host, because the kit draws it with two markups and only one has a host. The rightness of the chosen sign nothing checks — it is visible only by a measurement.
- **An arrived resource and the component that noticed it are not the same, and both are waited for.** — `projects/ui-kit-v2/.storybook/snapshot-wait.ts:drawnIcons` — the sprite growing as the symbols arrive, and a drawn `<use>` on every visible icon. There is nothing to wait for the whole sprite with — an icon travels on a request by name, and a full set on a page never happens. That there are two waits everywhere a resource arrives at a component nothing checks: a missing second one is visible only by a series of runs.
- **A settled layout is not yet a drawn page, and the frame is taken after two in a row match.** — **Not carried out in the showcase.** The end-to-end suite's runner takes frames until two in a row match. The showcase harness has no such cycle: a measurement showed that its frame diverges for another reason, and a cycle there pins the shift down.
- **A settled page and a drawn page are different, and the frame waits for the second.** — **Not carried out.** The harness that waited for the drawn frame left the tree with the first kit, and the showcase harness has no such wait.
- **A divergence that falls out rarely leaves evidence, otherwise there is nothing to sort out.** — `projects/ui-kit-v2/.storybook/snapshot-evidence.ts:keepEvidence` — the difference frame and the run's conditions land in `.rt-snapshot-evidence/<story>--<timestamp>/`. The directory is outside the repository and outside the references directory. The conditions carry the digit advance of the kit's font stack — `projects/ui-kit-v2/.storybook/snapshot-evidence.ts:conditionsOfPage`. The browser computes the width of a field from that, while a measurement of the visible label answers another question: the label is Cyrillic and is drawn by the fallback either way.
- **A shot beyond the window touches the page under the shutter, and that is cured not by a cycle but by the window.** — `projects/ui-kit-v2/.storybook/test-runner.ts:fitViewportToPage` — the window is widened to the page before the shot. Then an ordinary frame is taken.
- **A frame of a node beyond the window is cured the same way.** — `projects/ui-kit-v2/.storybook/test-runner.ts:fitViewportToSpan`, guarded by `tools/snapshot-window-probe.mjs` — the window is widened to the root of the showing before an ordinary frame. The base window is 1280×720, and almost every matrix of the kit is higher.
- **The trace of such a shot is left at the story after the tall one.** — **Not checked by anything.** The run says only that a frame diverged. That the carrier is the previous story is seen by a measurement of the node before the frame and after it. Held by the widened window itself: with it the trace does not appear.
- **A frame is assembled from what lies in the tree, and the harness cuts the shot off from a foreign network.** — **Not carried out.** The harness that refused a request beyond the local machine left the tree with the first kit; the showcase harness has no such cutting off yet.
- **A settled showing and a state that came about are not the same, and a story is waited for by the second.** — `projects/ui-kit-v2/src/showcase/templates/stories/bookings-template.stories.ts:awaitScreen` — each story waits in its `play` step for its own node. Those are a list cell, the emptiness view and a toast that left. That the sign is named rightly nothing checks: a story without the step is shot the same way, and a diverged frame is found by the reviewer.
- **An overlay opened by a story lives to the frame only where that is declared.** — `projects/ui-kit-v2/.storybook/test-runner.ts:freezeHover` — the muting of the pointer leaving is set before the story is drawn. `requireOpenedOverlay` there refuses if the named node is gone by the shot.
- **A value that comes from the machine is caught by two raisings of the showcase, not by one run.** — **Not checked.** Nothing counts the raisings behind a green sweep. The run knows the showcase it was pointed at and nothing of the one before. Held by the order of work: `tools/visual-gate.mjs` raises a showcase of its own, so two calls are two raisings.
- **A size the kit did not declare is taken from the browser's default, and that default is not a constant.** — `projects/ui-kit-v2/src/rich-editor/lib/components/message-composer/rt-message-composer.component.scss:inline-size` — the first place this was paid for and fixed. The field takes the width of its host, and the input keeps its own default size out of the measurement.

## What of the law is not here

There is one end-to-end run in the tree — the admin panel's suite with its own stand; nothing else
in the tree has a stand, because the rest is published here as libraries. Everything the law of
verifiability says about a stand and data applies to that one alone.

The completeness of the set of shot stories nothing checks. The showcase's harness refuses
on a mark without a reason and on an orphaned reference, but whether the axes showed the whole
surface of a component is invisible to a machine — that is reading and the rule
`rt-tools-storybook`.

## What else is worth knowing when reading the code

- The snapshot run raises no showcase of its own: the address arrives by the variable
  `STORYBOOK_URL`.
- The showcase's harness reads a story's parameters from the `snapshot` branch and refuses to
  shoot a story that has neither a showing root nor a declared whole-page frame.
- The registry of taken frames lives in a temporary directory and does not travel into the
  repository; by it one checks whether a reference has been orphaned.
- The browser driver arrives as a dependency of the snapshot runner rather than by the tree's
  manifest: pnpm's strict layout does not put it into the root `node_modules`, and the sweep takes
  it from the shared links directory `node_modules/.pnpm/node_modules`.

## What this is checked by

- `pnpm test` — the specs of all packages; `passWithNoTests` is on, so the number of tests is read.
- `pnpm exec nx run @rt-tools/ui-kit-v2:typecheck` — the types of the specs and the stories.
- `pnpm run test:stories:v2` — the sweep over all the showcase's stories: an empty showing
  and drawing errors.
- `node tools/visual-gate.mjs ui-kit-v2` — the showcase's frames: it builds the showcase, serves it
  as files and shoots with a browser raised in an image; `--update` re-takes them by the same road.
  `pnpm run test:visual:v2` called on its own refuses and names this command.
- `pnpm run build-storybook:ui-kit-v2` — the only thing that checks the showcase config.
- `pnpm exec nx run message-bus-admin-e2e:e2e` — the admin panel's end-to-end suite together with
  the screen frames; it raises the stand for itself and the shooting browser in an image.
