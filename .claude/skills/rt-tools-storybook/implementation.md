# rt-tools-storybook — how it is arranged here

The names of this tree, next to the rule `SKILL.md`. The rule is this tree's own, the package
carries no such thing: the showcase is this repository's subject, and there is no other tree with
two kits at once.

## What it is called here

- **In the rule** — Here
- **the showcase** — two independent ones: the first kit on `6006`, the second on `6007`
- **a story wrapper** — `Test*Component` in the first kit, `TestRt*Component` in the second
- **the showing harness** — `projects/ui-kit-v2/src/showcase/` — the grid, the row, the theme comparison, the states, the overlays
- **the showing root** — the attribute `data-story-root` on the hosts of the grid, the row and the theme comparison
- **a story's snapshot parameters** — the `snapshot` branch in `parameters`, declared in `src/showcase/story-snapshot.ts`
- **the state-coverage contract** — the ADR `docs/adr/0002-ui-kit-v2-state-coverage.md`. The course of the six waves lies in the history as a record of the closed state-coverage line; the tree no longer holds it, and the line is closed

## Where it lives

- **The first showcase's config** — `projects/ui-kit/.storybook/`
- **The second showcase's config** — `projects/ui-kit-v2/.storybook/`
- **The stories** — `projects/<package>/src/**/stories/*.stories.ts`
- **The component overview pages** — `projects/ui-kit-v2/src/**/Overview.mdx`
- **The styling pages** — `projects/ui-kit-v2/docs/*.mdx`
- **The showing harness** — `projects/ui-kit-v2/src/showcase/`
- **Whole screens of the template level** — `projects/ui-kit-v2/src/showcase/templates/`
- **The guard of the input tables** — `tools/verify-ui-kit-v2-docs.cjs`

## Where the articles are carried out

The first column is the article verbatim, as it is written in the rule's section "How the law
applies here". An article without a line and a line without an article are a divergence.

- **Each kit has a showcase of its own, and they share nothing.** — `projects/ui-kit-v2/.storybook/main.ts:stories` — each showcase has its own set of paths. The second config lies with the first kit, and the ports and commands are kept apart in `package.json`.
- **A link between the showcase's pages dies with a rename of a section.** — `tools/check-showcase-links.mjs:LINK` — every link of an overview is collected and matched against the page addresses, and those come from `storybook/internal/csf:toId` over the titles. The step stands in the pipeline and in the push gate set.
- **A link to a family that has not migrated is not written at all.** — **Not checked by anything.** Such a family looks to the check like a renamed section: an address with no page. Held by the article: the family is named in words, and the task number stands next to it.
- **A story targets the wrapper, not the kit's component.** — **Not checked by anything.** A story targeting the kit's component directly builds and draws; it is caught by reading. The wrappers lie in `stories/component/` at every component.
- **A component is covered when every input axis is shown at every value at once.** — `tools/verify-ui-kit-v2-docs.cjs:BASE_SECTION` — the overview page's input table is matched against the `input()` of that folder's components. The completeness of the axes is judged by reading.
- **Axes are crossed only where they visibly affect one another.** — **Not checked by anything.** How axes affect one another is visible by eye, not to a machine. The decision and its price — `docs/adr/0002-ui-kit-v2-state-coverage.md`.
- **An axis that cannot be shown is declared with a reason.** — **Not checked by anything.** A silent gap in an axis looks like coverage. It is declared by a section on the component's overview page.
- **A component is counted apart from its family, and a component the family shows is not covered by that.** — `tools/kit-coverage-components.mjs:declarationsOf` collects the kit's declarations, `tools/kit-coverage-components.mjs:storySubjectsOf` the names the story titles speak about. Their difference is `tools/check-kit-coverage.mjs:storyless`; the reasons lie under the key `notShownComponents` of `tools/kit-coverage-allowlist.json`.
- **A component shown inside a neighbour's story is named, not left to be guessed.** — `tools/kit-coverage-allowlist.json:shownWithin` — the selector against the story file that shows it; the check refuses when the named file is not in the tree.
- **A styling preset wraps the whole matrix as a pair of halves; it never becomes an axis inside it.** — `projects/ui-kit-v2/src/showcase/story-presets.component.ts:StoryPresetsComponent` — the pair takes the matrix as a content template and draws it twice: the kit's own set and the material one, the second marked `data-preset='material'`. The component's host carries the showing root, so one frame takes both halves. **Not checked by anything** is that a preset did not ride into a matrix as an axis: to a machine an extra axis looks like any other.
- **The pair belongs to every story of a family the preset touches, not to one story of the ten.** — **Not checked by anything.** A machine has nowhere to take the list of touched families from: the set rewrites the values of the assignments, and which component reads which assignment shows only by drawing it. The buttons carry the pair on all nine of their matrices — `projects/ui-kit-v2/src/lib/components/button/stories/component/test-button-matrix.component.ts`.
- **The halves wrap by the width of their own content, not by a threshold in a length unit.** — `projects/ui-kit-v2/src/showcase/story-presets.component.scss:__panes` — the panes are a wrapping flex row, and a pane shrinks no further than its content. A grid of fixed columns stood there before and cut the button matrix at the third column in both halves at once.
- **A story that draws an empty collection is not coverage.** — **Not checked by anything.** An empty frame is indistinguishable to a machine from a full one: a snapshot pins down what got drawn. The sweep does not see it either: the showing harness draws a frame and the cell label even where the cell has nothing to show, and such a root passes the area threshold. Not one story of the kit draws an empty collection today — the last three were seeded by RT-2020.
- **The grid is drawn by the shared showing harness, not by the markup of every story.** — `projects/ui-kit-v2/src/showcase/story-snapshot.ts:STORY_SNAPSHOT_ROOT_ATTRIBUTE` — the frame is taken by the showing root. That root is drawn by the shared harness: the grid, the row and the theme comparison.
- **A provider without which the component does not come up stands in `preview.ts`, not as one story's decorator.** — `projects/ui-kit-v2/.storybook/preview.ts:provideRtIDBStorage` — the only shared injector of the second showcase. Neither the linter nor the typecheck tells a story decorator with a provider apart.
- **A template-level story shows a whole screen, and the coverage contract does not apply to it either.** — `projects/ui-kit-v2/src/showcase/templates/stories/component/test-bookings-template.component.ts:TestRtBookingsTemplateComponent` — the wrapper of a whole screen. Three stories of one file target it instead of `Playground`, `States` and `Themes`. The order of the showcase's sections is set by `projects/ui-kit-v2/.storybook/preview.ts`.
- **The demonstration state one screen's stories differ by is declared by a story decorator, not in `preview.ts`.** — `projects/ui-kit-v2/src/showcase/templates/bookings/bookings.store.ts:BOOKINGS_FIXTURE` — the demonstration server's answer with a default. The stories `Empty` and `Failed` substitute their own by a decorator.

## What of the law is not here

The completeness of a matrix is checked by nothing: an axis forgotten in a matrix looks the same
as an axis with one value. The guard matches the input table against the code, but not that every
input is shown by a grid — that is written down as an open question in the coverage plan.

The language of the labels is not held by the rule: the kit's labels are given by a translator
function, and the second showcase's Russian set lies in
`projects/ui-kit-v2/.storybook/showcase-labels.ru.ts`. A key forgotten in the set draws an empty
string and refuses by nothing.

## What else is worth knowing when reading the code

- `.storybook` is excluded from ESLint whole, and `main.ts` carries `/* eslint-disable */`: an
  error in the showcase config is caught only by its build.
- `src/showcase/` is excluded from the library build next to `src/testing/`, but is linted as an
  ordinary source.
- The gate map leads `src/showcase/*` and the whole showcase config `.storybook/*.ts` to this
  rule rather than to the application components rule: both the showing harness and the config are
  the showcase's demonstration code. There is one exception — `test-runner.ts`: frame comparison is
  led by `ui-component-tests`.

## What this is checked by

- `pnpm run build-storybook:ui-kit-v2` — the showcase builds, the story templates are checked.
- `pnpm exec nx verify @rt-tools/ui-kit-v2` — the overview pages' input tables match the code.
- `pnpm exec nx run @rt-tools/ui-kit-v2:typecheck` — the types of the stories and of the showing
  harness.
- By eye over the raised showcase: the law demands a showing, not only a green build.
