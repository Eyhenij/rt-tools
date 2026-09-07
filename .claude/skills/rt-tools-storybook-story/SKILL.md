---
name: rt-tools-storybook-story
kind: pattern
rule: rt-tools-storybook
description: A pattern of the rule rt-tools-storybook. Take it when creating or editing a story: the Test*Component wrapper, the typing, the environment decorators, the controls, the state matrix and the second showcase's snapshot parameters. A failed snapshot — the pattern ui-component-tests-visual.
---

# A showcase story — the ready-made code

A pattern of the rule `rt-tools-storybook`. What must be true at that is the law
`docs/constitution/verifiability.md`.

## When to use

- A `*.stories.ts` in either of the two kits is created or edited.
- A component needs a state matrix or a demonstration wrapper.
- A story needs a snapshot frame of its own: hover, an overlay, skipping the shot.

## Golden rule

**A story never targets the `rtui-*` component directly — it targets a
`Test*Component` wrapper** that lives next to the story in `stories/component/`.
Every story in the kit follows this (checkbox, toggle, modal, header, side-menu,
snack-bar, info-badge, file-uploader, image-uploader, dynamic-selectors). The
wrapper owns the plain mutable demo state that Storybook `args` can bind to,
because the real component's API is `InputSignal`-based.

```
toggle/
  rtui-toggle.component.ts
  stories/
    toggle.stories.ts
    component/
      test-toggle.component.{ts,html,scss}
```

## Story file shape

```typescript
import { provideAnimations } from '@angular/platform-browser/animations';
import { applicationConfig, Meta, StoryObj } from '@storybook/angular';

import { EToggleSizeType } from '../toggle-size.type.enum';
import { TestToggleComponent } from './component/test-toggle.component';

export default {
    title: 'Components/Toggle',
    component: TestToggleComponent,
    decorators: [
        applicationConfig({
            providers: [provideAnimations()],
        }),
    ],
    argTypes: {
        size: {
            type: 'string',
            options: [EToggleSizeType.MD, EToggleSizeType.SM, 'fat'],
            control: { type: 'select' },
        },
    },
} as Meta<TestToggleComponent>;

type Story = StoryObj<TestToggleComponent>;

export const Toggle: Story = {
    args: {
        value: true,
        disabled: false,
        size: EToggleSizeType.MD,
        label: 'Label Example',
    },
};
```

- `title` is `Components/<PascalName>`.
- Default export is `as Meta<TestX>`; alias `type Story = StoryObj<TestX>` and type
  every named export with it.
- Providers go through `applicationConfig` in `decorators` — `provideAnimations()`
  is the standard one. There is no global `preview.ts` provider for it.
- One named export per variant (`Default`, `Mobile`, `InfoBadgeColors`, …),
  differing only in `args`. Enumerate options with the component's own
  `*_ENUM` const rather than string literals.

## The wrapper component

```typescript
@Component({
    selector: 'app-toggle',
    templateUrl: './test-toggle.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // directives
        BlockDirective,
        ElemDirective,

        // components
        RtuiToggleComponent,
        FormsModule,
    ],
})
export class TestToggleComponent {
    public value: boolean = true;
    public size: TToggleSizeType = EToggleSizeType.MD;
}
```

- `app-` selector (demo scaffolding, not a shipped `rtui-` component).
- Plain public fields — these are the Storybook control surface.
- Wrapper styles are exempt from the design-token stylelint rule (the
  `**/stories/**` ignore), so demo layout CSS is fine there.
- The wrapper is **not** exported from any `public-api.ts` — it must never ship.

---

# `@rt-tools/ui-kit-v2`

Second kit, own showcase. Selectors are `rt-*`, wrappers are named
`TestRt*Component`, and story titles are `<Level>/<Group>/<PascalName>` — level is
`Atoms`, `Molecules` or `Organisms`, and the group is optional:

```typescript
title: 'Atoms/Buttons/IconButton';
title: 'Molecules/Navigation/Pagination';
title: 'Organisms/Dialog/DialogHeader'; // a child part — in its parent's group
title: 'Molecules/Card'; // no group — the name stands right under the level
```

A component's overview page goes under that same title with the tail `/Overview`, and a snapshot
reference's name is the slug of the whole title: `atoms-buttons-iconbutton--states.png`. The level
of a new component is taken from the layout in the rule `rt-tools-storybook`.

```bash
pnpm run storybook:ui-kit-v2        # nx run @rt-tools/ui-kit-v2:storybook — port 6007
pnpm run build-storybook:ui-kit-v2  # dist/storybook/@rt-tools/ui-kit-v2
```

## Matrix mechanics

Grids are drawn by the shared harness in `projects/ui-kit-v2/src/showcase/`, not
by 72 hand-written templates. The folder is excluded from the library build
alongside `src/testing/**`, and it is linted like any other source — unlike
`.storybook/`, which ESLint ignores.

- Interaction states come from `storybook-addon-pseudo-states`. Never simulate
  `:hover` by adding a class to shipped SCSS.
- Dark-side-by-side works because the dark theme is a mixin
  (`rt-theme-dark-tokens` in `src/styles/_theme-dark.scss`), so it applies to a
  scoped selector, not only `:root`. The `body` gradient and the `.rt-logo`
  inversion stay `:root`-scoped and will not follow into a scoped block.
- **Overlay components** (13 of them use CDK Overlay: aside, autocomplete,
  confirm-popover, container, dialog, file-drop, menu, multiselect, page-header,
  popover, select, split-button, tooltip) split in two: matrix the presentational
  inner component (dialog header, menu item, toast, panel), and open the overlay
  itself from a `play` function clicking the trigger on mount. Only
  `rt-bottom-sheet` takes a declarative `open` input.
  A CDK Overlay panel is drawn in a container on `body`, that is, outside `[data-story-root]`: a
  frame by the showing root does not hold it at all, so a story that opens a panel is given
  `snapshot: { fullPage: true }`.
- **A component an application keeps a host for — a stack, an overlay, a panel — does not work by
  itself in a grid cell.** It gets two things from its host, and both are lost in a matrix: the
  mandatory inputs the host computes itself (`NG0950` and broken rendering) and a positioned
  ancestor — a plate with `position: absolute` moves out of the cell into the corner of the
  showing. The mandatory inputs are set by the cell, and the cell is given `position: relative`.
  The values at which the component closes itself are substituted in the matrix — that is a
  property of the component, and it is named in its `CONTEXT.md` rather than here.

## Snapshot parameters — ui-kit-v2

Stories are compared against baselines, and what gets a frame is decided **by
subtraction**: everything is shot except what carries a skip with a reason. Get it
backwards — shoot only what is marked — and a matrix whose marker was forgotten
passes green with zero pixels checked, indistinguishable from a healthy run.

Helpers live in `projects/ui-kit-v2/src/showcase/story-snapshot.ts`:

```typescript
import { storySnapshotSkip, storyWidthAtMost } from '../../../../showcase';

// A story that repeats a matrix cell — skip it, and say why. An empty reason fails the run.
export const Playground: Story = {
    parameters: storySnapshotSkip('the default values already stand as a cell in this component matrix'),
    args: { … },
};

// A component that names a width itself — one extra frame per threshold it declares.
export default {
    parameters: {
        controls: { disable: true },
        snapshot: { widths: [storyWidthAtMost(768)] },
    },
} as Meta<TestRtContainerMatrixComponent>;
```

- **The frame is taken by the show root**, not the whole page: `app-story-grid`,
  `app-story-row` and `app-story-themes` all carry `data-story-root`. A story
  whose display is not drawn by the harness asks for `snapshot: { fullPage: true }`.
- **Pick the width helper that matches the media query**, not the raw number:
  `storyWidthAtMost(768)` for `width <= 768px`, `storyWidthAtLeast(1441)` for
  `width >= 1441px`, `storyWidthOver(1080)` for `width > 1080px`,
  `storyWidthUnder(480)` for `width < 480px`. The strict ones shift by a pixel —
  at the threshold itself the rule does not apply yet, and the frame would check
  the side where it is absent.
- **Only 11 folders of 74 name a width**: `calendar`, `chat`, `workspace`,
  `toast`, `toolbar`, `container`, `page-header`, `photo-viewer`,
  `filter-control`, `aside` by media query, and `table` through the breakpoints
  service. Every other `@media` in the kit is `prefers-reduced-motion`,
  `hover: hover` or `pointer: coarse` — nothing to do with width.

The agreement behind all of this is
`docs/specs/ui-kit-v2/`.

## Frequent misses

- **Styles from a matrix wrapper's `styles:` do not act on markup inside an `ng-template`
  projected into a showing component.** The encapsulation is emulated: the wrapper's attribute
  never reaches such nodes, the rule is written into the file and applies to nothing. A matrix
  cell's styling is set by an inline `style`, or the node is taken out of the projected template.
- **`tsconfig.lib.json` excludes `**/*.stories.ts` but not `**/stories/**`.**
  Wrappers stay out of `dist` only because `public-api.ts` never reaches them
  (`UI-KIT-V2-ISSUES.md` §2.7). One stray barrel export ships demo code.
- **Every wrapper adds a lint warning.** `rt/require-host-bem-block` fires on
  demo wrappers — 80 warnings today (§2.6). They are warnings, so the real
  eighty-first drowns.
- MDX tables need `remark-gfm` — already wired in `main.ts`. Without it a table
  renders as raw text.
- **A comment of the form `{/* … */}` is not put into an `.mdx`: the formatter spoils it
  silently.** Prettier parses `.mdx` as markup and turns the asterisks into underscores —
  `{/_ … _/}` — after which MDX stops parsing at all. The showcase then answers 500 on the story
  index and takes not one frame. This is caught only by a second visit to the browser **after**
  the formatting: before it the page draws, and the frame run falls later. An explanation is put
  as an ordinary `/* … */` inside the `export const` block.
- Foundation docs live in `projects/ui-kit-v2/docs/*.mdx`. `Overview` and
  `Theming` are still styled unlike `Colors`/`Semantic`/`Spacing` (§2.4).
