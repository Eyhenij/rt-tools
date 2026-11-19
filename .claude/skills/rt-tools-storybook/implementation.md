# rt-tools-storybook — how it is arranged here

The names of this tree, next to the rule `SKILL.md`. The rule is this tree's own, the package
carries no such thing: the showcase is this repository's subject.

## What it is called here

- **In the rule** — Here
- **the showcase** — the kit's showcase on port `6007`
- **a story wrapper** — `TestRt*Component`
- **the showing harness** — `projects/ui-kit-v2/src/showcase/` — the grid, the row, the theme comparison, the states, the overlays
- **the showing root** — the attribute `data-story-root` on the hosts of the grid, the row and the theme comparison
- **a story's snapshot parameters** — the `snapshot` branch in `parameters`, declared in `src/showcase/story-snapshot.ts`
- **the state-coverage contract** — the ADR `docs/adr/0002-ui-kit-v2-state-coverage.md`. The course of the six waves lies in the history as a record of the closed state-coverage line; the tree no longer holds it, and the line is closed

## Where it lives

- **The showcase's config** — `projects/ui-kit-v2/.storybook/`
- **The stories** — `projects/<package>/src/**/stories/*.stories.ts`
- **The component overview pages** — `projects/ui-kit-v2/src/**/Overview.mdx`
- **The styling pages** — `projects/ui-kit-v2/docs/*.mdx`
- **The showing harness** — `projects/ui-kit-v2/src/showcase/`
- **Whole screens of the template level** — `projects/ui-kit-v2/src/showcase/templates/`
- **The guard of the input tables** — `tools/verify-ui-kit-v2-docs.cjs`

## Where the articles are carried out

The first column is the article verbatim, as it is written in the rule's section "How the law
applies here". An article without a line and a line without an article are a divergence.

- **A link between showcase pages dies with a section rename; a link to an unmigrated family is not written.** — `tools/check-showcase-links.mjs:LINK` — every link of an overview is collected and matched against the page addresses, and those come from `storybook/internal/csf:toId` over the titles. The step stands in the pipeline and in the push gate set. Also: **Not checked by anything.** Such a family looks to the check like a renamed section: an address with no page. Held by the article: the family is named in words, and the task number stands next to it.
- **A story targets the wrapper, not the kit's component.** — **Not checked by anything.** A story targeting the kit's component directly builds and draws; it is caught by reading. The wrappers lie in `stories/component/` at every component.
- **Covered is every input axis at every value at once.** — `tools/verify-ui-kit-v2-docs.cjs:BASE_SECTION` — the overview page's input table is matched against the `input()` of that folder's components. The completeness of the axes is judged by reading. Also: **Not checked by anything.** How axes affect one another is visible by eye, not to a machine. The decision and its price — `docs/adr/0002-ui-kit-v2-state-coverage.md`. Also: **Not checked by anything.** A silent gap in an axis looks like coverage. It is declared by a section on the component's overview page. Also: **Not checked by anything.** An empty frame is indistinguishable to a machine from a full one: a snapshot pins down what got drawn. The sweep does not see it either: the showing harness draws a frame and the cell label even where the cell has nothing to show, and such a root passes the area threshold. Not one story of the kit draws an empty collection today — the last three were seeded by RT-2020.
- **A component is counted apart from its family; one shown in a neighbour's story is named.** — `tools/kit-coverage-components.mjs:declarationsOf` collects the kit's declarations, `tools/kit-coverage-components.mjs:storySubjectsOf` the names the story titles speak about. Their difference is `tools/check-kit-coverage.mjs:storyless`; the reasons lie under the key `notShownComponents` of `tools/kit-coverage-allowlist.json`. Also: `tools/kit-coverage-allowlist.json:shownWithin` — the selector against the story file that shows it; the check refuses when the named file is not in the tree.
- **The arg-driven page is `Playground`, or the family names why not.** — `tools/check-kit-coverage.mjs:hasPlayground` reads the family's stories folder and looks for the page as text. The reasons lie under the key `noPlayground` of `tools/kit-coverage-allowlist.json`. The check refuses a family without the page, and also a reason left behind the page that appeared.
- **A styling preset wraps the matrix as a pair of halves, never an axis.** — `projects/ui-kit-v2/src/showcase/story-presets.component.ts:StoryPresetsComponent` — the pair takes the matrix as a content template and draws it twice: the kit's own set and the material one, the second marked `data-preset='material'`. The component's host carries the showing root, so one frame takes both halves. **Not checked by anything** is that a preset did not ride into a matrix as an axis: to a machine an extra axis looks like any other. Also: **Not checked by anything.** A machine has nowhere to take the list of touched families from: the set rewrites the values of the assignments, and which component reads which assignment shows only by drawing it. The buttons carry the pair on all nine of their matrices — `projects/ui-kit-v2/src/lib/components/button/stories/component/test-button-matrix.component.ts`. Also: `projects/ui-kit-v2/src/showcase/story-presets.component.scss:__panes`, `projects/ui-kit-v2/src/showcase/story-themes.component.scss:__panes` — in both pairs the panes are a wrapping flex row, and a pane shrinks no further than its content unless the pair is asked to fill. A grid of fixed columns stood there before and cut the button matrix at the third column in both halves at once. Also: `projects/ui-kit-v2/src/showcase/story-presets.component.ts:fill` — the input draws the modifier on the pair's host. The styles then give the showing the cross-axis size of the half. Eighteen showings of one instance carry it. The confirmation popover does not: it holds a width of its own and stood the same on the page. Also: **Not checked by anything.** A machine cannot tell a deliberate refusal from a forgotten wrap: both are a matrix without the pair's host. Three such showings stand in the tree today — the icon catalogue, the compact page header and the floating message, each with its reason written in the template above the markup. The message is pinned to the window: in a half it leaves the half whole, both halves stay empty, and the second instance lies over the first.
- **A component that does not give its width collapses in a half; its cell gets a width by name.** — `projects/ui-kit-v2/src/showcase/story-row.component.ts:slotWidth` — the row's cell takes the named width, and the row wraps instead of squeezing the cell. The pagination host measured 8 pixels inside a half while its content drew 300: four cases lay on top of one another and the frame was green. `projects/ui-kit-v2/src/lib/components/workspace/stories/component/test-workspace-matrix.component.ts:TestRtWorkspaceMatrixComponent` — the three rows of the workspace take 56rem, and the box inside the cell takes the cell's full width. The named width alone was not enough: the box is a flex item and shrank to its content, so the cell measured 896 while the box measured 557. Without either, the cell of the widths row came out 150 points on a window of 768, against panels declared at 320 and 360.
- **A component sized by its parent gets a box of the showing, its surface too.** — `projects/ui-kit-v2/src/lib/components/aside/stories/component/test-aside-matrix.component.ts:TestRtAsideMatrixComponent` — the five panels stand in a box of their own. The former rule by the block class reached only the host, declared `display: contents`. The panel measured 0 by 0 at a declared 320. `projects/ui-kit-v2/src/rich-editor/lib/components/chat/stories/component/test-chat-matrix.component.ts:TestRtChatMatrixComponent` — the nine boxes give the chat its width. The chat takes their full height. Also: `projects/ui-kit-v2/src/rich-editor/lib/components/chat/stories/component/test-chat-matrix.component.ts:TestRtChatMatrixComponent` — the box carries the ground, the border and the radius. The chat draws its own ground only when expanded over the page. Also: `projects/ui-kit-v2/src/lib/components/file-card/stories/component/test-file-card-matrix.component.ts:TestRtFileCardMatrixComponent` — four widths by measurement instead of one for the family. The matrix of sizes and the row of disabling take 24rem, the row of interaction 22rem, the rows of one button 17rem.
- **A window-pinned component needs a containing-block box; a window-tall one a clipping box.** — `projects/ui-kit-v2/src/lib/components/bottom-sheet/stories/component/test-bottom-sheet-matrix.component.ts:TestRtBottomSheetMatrixComponent` — the five demonstration boxes of the sheet carry `contain: paint`. Four showings of the family drew a dashed line instead of the sheet, and the sheet itself lay across the page under them all. A measurement over 546 stories found no other such node in the tree. Also: `projects/ui-kit-v2/src/lib/components/workspace/stories/component/test-workspace-matrix.component.ts:TestRtWorkspaceMatrixComponent` — the five demonstration boxes of the workspace carry a clip, and what is drawn stops at the box. The workspace takes `calc(100dvh - …)`, so under a window grown for the shot it measured 720, 2500 and 7046 points in turn.
- **The grid is drawn by the shared showing harness.** — `projects/ui-kit-v2/src/showcase/story-snapshot.ts:STORY_SNAPSHOT_ROOT_ATTRIBUTE` — the frame is taken by the showing root. That root is drawn by the shared harness: the grid, the row and the theme comparison.
- **A provider the component needs stands in `preview.ts`; one screen's demo state is a story decorator.** — `projects/ui-kit-v2/.storybook/preview.ts:provideRtIDBStorage` — the only shared injector of the showcase. Neither the linter nor the typecheck tells a story decorator with a provider apart. Also: `projects/ui-kit-v2/src/showcase/templates/bookings/bookings.store.ts:BOOKINGS_FIXTURE` — the demonstration server's answer with a default. The stories `Empty` and `Failed` substitute their own by a decorator.
- **A template-level story shows a whole screen, outside the coverage contract.** — `projects/ui-kit-v2/src/showcase/templates/stories/component/test-bookings-template.component.ts:TestRtBookingsTemplateComponent` — the wrapper of a whole screen. Three stories of one file target it instead of `Playground`, `States` and `Themes`. The order of the showcase's sections is set by `projects/ui-kit-v2/.storybook/preview.ts`.

## What of the law is not here

The completeness of a matrix is checked by nothing: an axis forgotten in a matrix looks the same
as an axis with one value. The guard matches the input table against the code, but not that every
input is shown by a grid — that is written down as an open question in the coverage plan.

The language of the labels is not held by the rule: the kit's labels are given by a translator
function, and the showcase's Russian set lies in
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
