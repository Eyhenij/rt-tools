# What it is carried out by — the snapshots of the showcase

The first column is the rule of the spec next to it verbatim. The second is where it is carried out
in the tree; the scenario it is checked by is named there too, and what exactly every scenario is
covered by is said in `scenarios.md`.

A rule without a line and a line without a rule is a divergence: the spec promises what is not in the
tree, or the tree holds what the spec is silent about.

- **Every kit has a harness of the snapshots of its own and a catalogue of the references of its own.** — `projects/ui-kit-v2/.storybook/test-runner.ts:SNAPSHOT_DIR` — a harness of its own and a catalogue of its own; there is no file shared with the first kit; scenario `SC-UKV-07`
- **Everything is shot except what is marked by an exception.** — `projects/ui-kit-v2/src/showcase/story-snapshot.ts:storySnapshotSkip`, the early exit `projects/ui-kit-v2/.storybook/test-runner.ts:postVisit`; scenario `SC-UKV-02`
- **An exception without a reason fells the run.** — `projects/ui-kit-v2/.storybook/test-runner.ts:preVisit`; scenario `SC-UKV-11`
- **A reference that has no story fells the run.** — `projects/ui-kit-v2/.storybook/test-runner.ts:remember`, `tools/visual-snapshots-v2.mjs:requireNoOrphans`; scenario `SC-UKV-12`
- **The frame is taken by the root of the show, not by the whole page.** — `projects/ui-kit-v2/src/showcase/story-snapshot.ts:STORY_SNAPSHOT_ROOT_ATTRIBUTE`, `projects/ui-kit-v2/.storybook/test-runner.ts:shoot`; scenario `SC-UKV-13`
- **Any frame beyond the bounds of the window is shot by a window widened to it, not by a shooting past those bounds.** — a frame of a whole page by `projects/ui-kit-v2/.storybook/test-runner.ts:fitViewportToPage`, a frame by the root of the show by `projects/ui-kit-v2/.storybook/test-runner.ts:fitViewportToNode`, guarded by the probe `tools/snapshot-window-probe.mjs`; the parameter is declared in `projects/ui-kit-v2/src/showcase/story-snapshot.ts:IStorySnapshotParameters`; scenarios `SC-UKV-57`, `SC-UKV-131`
- **A frame of a threshold is taken at every threshold the component itself names.** — `projects/ui-kit-v2/src/showcase/story-snapshot.ts:storySnapshotWidths`; scenario `SC-UKV-03`
- **A frame of a threshold is shot on the side of the threshold the media query switches on.** — `projects/ui-kit-v2/src/showcase/story-snapshot.ts:storyWidthAtMost`, `projects/ui-kit-v2/src/showcase/story-snapshot.ts:storyWidthOver`; scenario `SC-UKV-03`
- **A frame is determinate: two shootings in a row without edits agree.** — `projects/ui-kit-v2/.storybook/snapshot-wait.ts:quiet`; scenario `SC-UKV-06`
- **A story that fell is not reshot a second time.** — `tools/visual-snapshots-v2.mjs:runnerArgs` — the run has no sign of repeats at all; scenario `SC-UKV-19`
- **A state the frame did not reach fells the run, it does not get into a reference.** — `projects/ui-kit-v2/.storybook/test-runner.ts:requireOpenedOverlay`, `projects/ui-kit-v2/src/showcase/story-overlay.ts:openStoryOverlay`; scenario `SC-UKV-04`
- **A missing reference is a refusal of the run, not a silent shooting after the fact.** — `projects/ui-kit-v2/.storybook/test-runner.ts:UPDATING`; scenario `SC-UKV-05`
- **A reference is shot from what is fixed.** — `.claude/skills/ui-component-tests-visual/SKILL.md:parameters` — a rule of the taking apart of a change; it is not checked by the run; scenario `SC-UKV-14`
- **The threshold of the divergence is named by a measurement, not carried over from the first showcase.** — `projects/ui-kit-v2/.storybook/test-runner.ts:FAILURE_THRESHOLD`; scenario `SC-UKV-15`
- **A reference is shot and checked in one environment.** — `tools/visual-snapshots-v2.mjs:CONFIG_DIR` — one harness for the checking and both reshootings; scenario `SC-UKV-16`
- **A frame that diverged gives out a picture of the differences, and it does not go into the repository.** — `.github/workflows/ci.yml:visual-diffs-ui-kit-v2`, the mask of the catalogue of the differences in `.gitignore:__diff_output__`; scenario `SC-UKV-08`
- **A red frame is not merged.** — `.github/workflows/ci.yml:STORYBOOK_URL` — the step is blocking, without `continue-on-error`; scenario `SC-UKV-10`
- **A component that arrived into the showcase after this work brings its reference by the same change.** — `projects/ui-kit-v2/.storybook/test-runner.ts:shoot` — the refusal at a missing reference; scenario `SC-UKV-10`
- **A reshooting goes by a named story.** — `tools/visual-snapshots-v2.mjs:updateOne`; the reshooting of the catalogue — `tools/visual-snapshots-v2.mjs:updateAll`; scenario `SC-UKV-20`
- **The language of the labels in a frame is one and is appointed by the harness.** — `projects/ui-kit-v2/.storybook/preview.ts:showcaseTranslator`; scenario `SC-UKV-17`
- **The theme of a matrix is one and is appointed by the harness.** — `projects/ui-kit-v2/src/showcase/story-themes.component.ts:StoryThemesComponent`; scenario `SC-UKV-09`
- **An empty show does not become a reference.** — `projects/ui-kit-v2/src/lib/components/tabs/stories/tabs.stories.ts:storySnapshotSkip` and 59 more such marks; scenario `SC-UKV-14`
- **The number of the stories opened at once is set by the run, not by the machine.** — `tools/visual-snapshots-v2.mjs:MAX_WORKERS`; scenario `SC-UKV-06`
- **The readiness of an icon is checked by a drawn icon, not by a sign of the loading.** — `projects/ui-kit-v2/.storybook/snapshot-wait.ts:drawnIcons` — the icon is looked for by the link into the set, `projects/ui-kit-v2/.storybook/snapshot-wait.ts:ICON_USE_SELECTOR`; scenario `SC-UKV-06`
- **The run refuses if the wrong showcase is at the named address.** — `tools/visual-snapshots-v2.mjs:requireOwnShowcase`; scenario `SC-UKV-18`
- **A component whose filling arrives later declares its unfinishedness itself, and the shooting waits for it.** — `projects/ui-kit-v2/.storybook/snapshot-wait.ts:PENDING_SELECTOR` and `projects/ui-kit-v2/src/lib/components/rich-editor/rt-rich-editor.component.ts:mounted`; scenario `SC-UKV-53`
- **A story showing an opened panel names its node, and the leading away of the pointer on its page is muted.** — `projects/ui-kit-v2/.storybook/test-runner.ts:freezeHover` and `requireOpenedOverlay` there too; the parameter is declared in `projects/ui-kit-v2/src/showcase/story-snapshot.ts:IStorySnapshotParameters`; scenario `SC-UKV-54`
- **A probe of the harness pointed at a showcase that serves no story names that showcase, not the harness.** — `tools/showcase-probe.mjs:openStory`, the refusal text — `tools/showcase-probe.mjs:complaintAbout`. Both probes of the second showcase open a story by it: `tools/snapshot-window-probe.mjs:heightAroundTheShot` and `tools/snapshot-icon-probe.mjs:shoot`; scenario `SC-UKV-132`
