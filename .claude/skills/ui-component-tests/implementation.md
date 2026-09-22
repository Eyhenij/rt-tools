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
- **the snapshot harness** — `<package>/.storybook/test-runner.ts`; the second showcase also has `tools/visual-snapshots-v2.mjs`
- **the screen-frame harness** — `apps/message-bus-admin-e2e/src/support/shot.ts` and the runner's settings next to it
- **a measurement of computed values** — the computed properties of a node on a showcase page: the padding, the font size, the rounding, the colour
- **the divergence threshold** — a share of the frame's area: `0.0002` on both showcases, `0` on the screen frames

## Where it lives

- **The component specs** — next to the component, `projects/<package>/src/**/…spec.ts`
- **The first kit's snapshot harness** — `projects/ui-kit/.storybook/test-runner.ts`
- **The second kit's snapshot harness** — `projects/ui-kit-v2/.storybook/test-runner.ts` + `tools/visual-snapshots-v2.mjs`
- **The references** — `projects/<package>/.storybook/__snapshots__`
- **A story's shot parameters** — `projects/ui-kit-v2/src/showcase/story-snapshot.ts`
- **The agreement about the snapshots** — `docs/specs/ui-kit-v2/`
- **The shared showing harness** — `projects/ui-kit-v2/src/showcase/`
- **The sweep over the second showcase's stories** — `tools/story-sweep-v2.mjs`
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
- **If there is a pair of states, both must be in the frame.** — **Not carried out.** A pair of states is declared in the stories. A machine does not know how many the shown element has: a missing side is indistinguishable from a non-existent one.
- **A styling edit that passed the snapshots without divergences is half checked.** — `projects/ui-kit-v2/.storybook/test-runner.ts:FAILURE_THRESHOLD` — the comparison threshold is set by each showcase's harness. The share of the divergence is printed by the run and is read instead of the colour.
- **A settled frame is waited for by an event, not by a countdown, and the technique is repeated in every harness.** — `projects/ui-kit/.storybook/test-runner.ts:settled` and `projects/ui-kit-v2/.storybook/snapshot-wait.ts:settled` — the network's silence and two identical sizes in a row. The agreement of the two copies nothing checks: to a machine they are two files, and they will diverge silently.
- **A wait that swallows its own refusal takes the frame too early.** — `projects/ui-kit/.storybook/test-runner.ts:postVisit` — a font that did not come up fails the run naming the families instead of a quiet frame. That not one wait swallows its own refusal nothing checks: a swallowed refusal is indistinguishable from one that never arose.
- **A wait waits for what is awaited, not for its consequence.** — `projects/ui-kit/.storybook/test-runner.ts:ICON_FONTS` — the wait calls the loading of the families themselves and matches them. It does not look at the icon's wait class: that one is removed by the page's font readiness, and that comes about with an empty set too. The rightness of the chosen sign nothing checks — it is visible only by a measurement. The second showcase has the same technique in `projects/ui-kit-v2/.storybook/snapshot-wait.ts:ICON_USE_SELECTOR`: an icon is looked for by its reference into the set rather than by the `rt-icon` host, because the kit draws it with two markups and only one has a host.
- **An arrived resource and the component that noticed it are not the same, and both are waited for.** — `projects/ui-kit/.storybook/test-runner.ts:ICON_REPAINT_TIMEOUT_MS` — after matching the families the wait class removed by the component is awaited, with its own refusal. That there are two waits everywhere a resource arrives at a component nothing checks: a missing second one is visible only by a series of runs. In the second showcase both are awaited by `projects/ui-kit-v2/.storybook/snapshot-wait.ts:drawnIcons`: the sprite growing as the symbols arrive, and a drawn `<use>` on every visible icon. There is nothing to wait for the whole sprite with — an icon travels on a request by name, and a full set on a page never happens.
- **A settled layout is not yet a drawn page, and the frame is taken after two in a row match.** — `projects/ui-kit/.storybook/test-runner.ts:stableShot` — frames are taken until two in a row match, and the last is compared. The end-to-end suite has a cycle of its own just like it. The second showcase has none and will have none: a measurement showed that its frame diverges for another reason, and a cycle there pins the shift down.
- **A settled page and a drawn page are different, and the frame waits for the second.** — `projects/ui-kit/.storybook/test-runner.ts:painted` — a nested pair of animation-frame calls, three frames in reserve. It is called between the wait for the settled sizes and the shot. The rollback is guarded by `tools/snapshot-paint-probe.mjs`: it reads the order of the calls in the harness and measures the frame before the wait and after it. The probe goes over the same raised showcase as the snapshots — `tools/visual-gate.mjs:KITS`, the field `probes`; the command is `npm run check:paint`.
- **A probe judging by one measurement inherits the very rarity it guards against.** — `tools/snapshot-paint-probe.mjs:MAX_PAIRS` — the pairs are taken one after another until they diverge, but no more than three. The refusal comes only when they all matched, and it names their number.
- **A probe names the state of the showcase it was pointed at, not only the state of the harness.** — `tools/showcase-probe.mjs:openStory` — the wait for the showing root is wrapped there, and the refusal is worded by `tools/showcase-probe.mjs:complaintAbout`. Both probes of the second showcase open a story by it: `tools/snapshot-window-probe.mjs:heightAroundTheShot` and `tools/snapshot-icon-probe.mjs:shoot`. The drawing probe of the first showcase waits otherwise and stays outside it — `tools/snapshot-paint-probe.mjs`.
- **A probe reading the harness as text separates the code from the explanations.** — `tools/snapshot-paint-probe.mjs:codeOnly` — block and line explanations are removed before the word search, so a commented-out wait call does not count as live.
- **A wait removed from the harness is guarded by a probe, not by the snapshot run.** — `tools/snapshot-icon-probe.mjs:harnessWaitsForIcons` — the second showcase's probe reads the wait module and the shot harness. Then it holds the set back on its approach and matches the frame before the wait against the frame after it. It goes over the same raised showcase as the snapshots — `tools/visual-gate.mjs:KITS`, the field `probes`; the command is `npm run check:icons`.
- **A probe judges the markup it was created for.** — `tools/snapshot-icon-probe.mjs:STORY` — the split button's story: zero `rt-icon` hosts and seven icons drawn by the button's directive. Should it get a host, the probe refuses and says so: it would be judging a different miss.
- **A divergence that falls out rarely leaves evidence, otherwise there is nothing to sort out.** — `projects/ui-kit/.storybook/test-runner.ts:keepEvidence` and `projects/ui-kit-v2/.storybook/snapshot-evidence.ts:keepEvidence` — the difference frame and the run's conditions land in `.rt-snapshot-evidence/<story>--<timestamp>/`. The directory is outside the repository and outside the references directory. The second kit's conditions carry the digit advance of the kit's font stack — `projects/ui-kit-v2/.storybook/snapshot-evidence.ts:conditionsOfPage`. The browser computes the width of a field from that, while a measurement of the visible label answers another question: the label is Cyrillic and is drawn by the fallback either way.
- **A shot beyond the window touches the page under the shutter, and that is cured not by a cycle but by the window.** — `projects/ui-kit-v2/.storybook/test-runner.ts:fitViewportToPage` — the window is widened to the page before the shot. Then an ordinary frame is taken. The first kit has no such step: it always shoots the whole page, and a task of its own is created for that.
- **A frame of a node beyond the window is cured the same way.** — `projects/ui-kit-v2/.storybook/test-runner.ts:fitViewportToSpan`, guarded by `tools/snapshot-window-probe.mjs` — the window is widened to the root of the showing before an ordinary frame. The base window is 1280×720, and almost every matrix of the kit is higher. The first kit has no such step: it shoots the whole page.
- **The trace of such a shot is left at the story after the tall one.** — **Not checked by anything.** The run says only that a frame diverged. That the carrier is the previous story is seen by a measurement of the node before the frame and after it. Held by the widened window itself: with it the trace does not appear.
- **A frame is assembled from what lies in the tree, and the harness cuts the shot off from a foreign network.** — `projects/ui-kit/.storybook/test-runner.ts:cutOffNetwork` — a request beyond the local machine is refused on the spot. A returned external address fails its own story. The second showcase has no such cutting off: the kits are kept apart, and its harness creates its own by a separate task.
- **A settled showing and a state that came about are not the same, and a story is waited for by the second.** — `projects/ui-kit-v2/src/showcase/templates/stories/bookings-template.stories.ts:awaitScreen` — each story waits in its `play` step for its own node. Those are a list cell, the emptiness view and a toast that left. That the sign is named rightly nothing checks: a story without the step is shot the same way, and a diverged frame is found by the reviewer.
- **An overlay opened by a story lives to the frame only where that is declared.** — `projects/ui-kit-v2/.storybook/test-runner.ts:freezeHover` — the muting of the pointer leaving is set before the story is drawn. `requireOpenedOverlay` there refuses if the named node is gone by the shot. The first showcase has no such parameter at all: its harness does not take the pointer away.
- **A reference is taken after the frame has been looked at, not before.** — **Not checked by anything.** `tools/visual-snapshots-v2.mjs` refuses on a missing reference and on an orphaned one, and it writes an empty frame silently. The closest machine answer is the sweep `pnpm run test:stories:v2` before the shot.
- **A re-taken reference is confirmed by a second raising before it is committed.** — **Not checked by anything.** Neither the snapshot run nor the gate knows how many raisings stand behind a reference: a frame taken once and a frame confirmed twice are the same bytes. The closest machine answer is a repeated call of the same set after a restart of the showcase, and it is made by the hand of whoever re-took.
- **A reference is re-taken deliberately and one at a time.** — `tools/visual-snapshots-v2.mjs:SNAPSHOT_DIR` — the re-take selects story files by path rather than stories by name: a selection by name breaks the run's environment.
- **A reference is taken from the same showcase the gate raises.** — `tools/visual-gate.mjs:freePort` — the gate builds the showcase itself and serves it on a free port. It points the run at that address by `STORYBOOK_URL`; both kits go that road. A re-take is made against that same target. **Not checked by anything** is which showcase the address given to the run belongs to: to the harness it is one more address that answers.
- **A frame is taken by the drawn span, not by the node's box.** — `projects/ui-kit-v2/.storybook/test-runner.ts:spanOfNode` — the span is the union of the root and every descendant. Each rect is first clipped by the nearest ancestor that scrolls or hides its overflow. `fitViewportToSpan` grows the window to the span's right and bottom edges, and the frame is a page shot with that clip. **Not checked by anything** is whether the span matches what a person sees. The sweep over the showcase at the base window found 35 showings of 545 whose drawing went past the node's box, and that count came from a script of its own.
- **A one-off check script does not travel into the repository.** — **Not checked by anything.** A one-off script is indistinguishable to a machine from a permanent check; the difference pictures are closed by a mask in the ignore settings.
- **A branch the spec does not reach is named in the PR.** — **Not checked by anything.** The guards judge files and commands rather than the text of a PR description: a silent gap looks the same as coverage.
- **An application screen is closed by an end-to-end suite frame, not by a showcase story.** — `apps/message-bus-admin-e2e/src/support/shot.ts:expectScreen` — a frame of a whole page matched against a reference; it is called in that screen's spec. That every screen is closed by a frame nothing checks: a machine has nowhere to take the list of screens from.
- **The end-to-end suite writes no settled-frame wait of its own.** — **Not checked by anything.** The wait cycle lives in the end-to-end spec runner; its refusal text is "Failed to take two consecutive stable screenshots". A second such cycle written next to it is indistinguishable to a machine from the needed code.
- **Screen frames have no step of their own in the gate or in the pipeline.** — `.claude/rt-kit/project.sh:rt_push_checks` — the admin panel's end-to-end suite is named in the gate by one line. The step "E2E admin" in `.github/workflows/ci.yml` calls that same command. The frames are taken inside it; they have no separate step, and that is visible by the list of steps.
- **What drifts in a screen frame is removed by name, not covered by a threshold.** — `apps/message-bus-admin-e2e/playwright.config.ts:toHaveScreenshot` — `threshold` and `maxDiffPixelRatio` are held at zero; the browser's colour profile and the way of drawing are named there too. The causes of a divergence are closed in the stand's seeding rather than by a threshold.
- **A mask covers the content but not the width.** — **Not checked by anything.** The width of a column under a mask is invisible to a machine. The frame matches or it does not, and why is read by comparing pixel by pixel.
- **Not only time is made constant but everything the application derived from it.** — `apps/message-bus-admin-e2e/stand/seed-self-check.mjs:checkNothingDrifts` — the self-check's second sign. A record's month is matched against its own run time, and the diverged ones end the stand's startup with a refusal. The rest of what is derived from the clock the receiver does not yet store; once it appears, it will stand in that same query.
- **The seeding checks itself instead of relying on the frame.** — `apps/message-bus-admin-e2e/stand/seed.mjs:seed` — the self-check stands as the seeding's last step, before the first frame, and it refuses in words. The boundary of the deliberate future is named next to it — `apps/message-bus-admin-e2e/stand/seed-self-check.mjs:FAR_FUTURE`.
- **The self-check judges the time columns of every table the screens read, not only those shown today.** — `apps/message-bus-admin-e2e/stand/seed-self-check.mjs:checkNothingDrifts` — the query gathers every time column of the trees, the analyses, the proposals, the month records and the invitations. **Not checked by anything** is that a column created tomorrow will be appended to it: the list is assembled by hand.
- **A value that comes from the machine is caught by two raisings of the showcase, not by one run.** — **Not checked.** Nothing counts the raisings behind a green sweep. The run knows the showcase it was pointed at and nothing of the one before. Held by the order of work: `tools/visual-gate.mjs` raises a showcase of its own, so two calls are two raisings.
- **A size the kit did not declare is taken from the browser's default, and that default is not a constant.** — `projects/ui-kit-v2/src/lib/components/message-composer/rt-message-composer.component.scss:inline-size` — the first place this was paid for and fixed. The field takes the width of its host, and the input keeps its own default size out of the measurement.

## What of the law is not here

There is one end-to-end run in the tree — the admin panel's suite with its own stand; nothing else
in the tree has a stand, because the rest is published here as libraries. Everything the law of
verifiability says about a stand and data applies to that one alone.

The completeness of the set of shot stories nothing checks. The second showcase's harness refuses
on a mark without a reason and on an orphaned reference, but whether the axes showed the whole
surface of a component is invisible to a machine — that is reading and the rule
`rt-tools-storybook`.

## What else is worth knowing when reading the code

- The snapshot run raises no showcase of its own: the address arrives by the variable
  `STORYBOOK_URL`.
- The second showcase's harness reads a story's parameters from the `snapshot` branch and refuses to
  shoot a story that has neither a showing root nor a declared whole-page frame.
- The registry of taken frames lives in a temporary directory and does not travel into the
  repository; by it one checks whether a reference has been orphaned.
- The browser driver arrives as a dependency of the snapshot runner rather than by the tree's
  manifest: pnpm's strict layout does not put it into the root `node_modules`, and the sweep takes
  it from the shared links directory `node_modules/.pnpm/node_modules`.

## What this is checked by

- `pnpm test` — the specs of all packages; `passWithNoTests` is on, so the number of tests is read.
- `pnpm exec nx run @rt-tools/ui-kit-v2:typecheck` — the types of the specs and the stories.
- `pnpm run test:stories:v2` — the sweep over all the second showcase's stories: an empty showing
  and drawing errors.
- `node tools/visual-gate.mjs ui-kit-v2` — the second showcase's frames: it builds the showcase,
  serves it as files and shoots with a browser raised in an image; `--update` re-takes them by the
  same road. `pnpm run test:visual:v2` called on its own refuses and names this command.
- `node tools/visual-gate.mjs ui-kit` — the first showcase's frames. It builds the showcase, serves
  it as files and shoots with a browser raised in an image; `--update` re-takes them by the same
  road. `pnpm run test:visual` called on its own refuses and names this command.
- `pnpm run build-storybook:ui-kit-v2` — the only thing that checks the showcase config.
- `pnpm exec nx run message-bus-admin-e2e:e2e` — the admin panel's end-to-end suite together with
  the screen frames; it raises the stand for itself and the shooting browser in an image.
