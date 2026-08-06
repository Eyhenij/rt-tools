---
name: rt-tools-storybook
description: Add or edit a Storybook story or MDX page for a kit component — the Test*Component wrapper convention, Meta/StoryObj typing, applicationConfig decorators, argTypes controls, and the ui-kit-v2 state-coverage contract. Use when creating any *.stories.ts or docs *.mdx, adding a demo variant for a component, or wiring token/theming docs into Storybook.
---

# Storybook

**Two kits, two independent showcases.** They share no config, no port and no
conventions beyond `@storybook/angular` itself. Check which package you are in
before copying anything across.

|                  | `@rt-tools/ui-kit`            | `@rt-tools/ui-kit-v2`                                    |
| ---------------- | ----------------------------- | -------------------------------------------------------- |
| Config           | `projects/ui-kit/.storybook/` | `projects/ui-kit-v2/.storybook/`                         |
| Port             | 6006                          | 6007                                                     |
| Command          | `pnpm run storybook`          | `pnpm run storybook:ui-kit-v2`                           |
| Wrapper prefix   | `Test*Component`              | `TestRt*Component`                                       |
| Global providers | per-story `applicationConfig` | `preview.ts` (zoneless, transloco, icons, theme toolbar) |
| Story set        | `Default` + ad-hoc variants   | fixed set — see the coverage contract below              |

Everything from here to the ui-kit-v2 section describes **`@rt-tools/ui-kit`**.

Storybook 10 with `@storybook/angular`. Config lives in
`projects/ui-kit/.storybook/`; stories are discovered from
`../src/**/*.stories.@(js|jsx|mjs|ts|tsx)` and docs from `../docs/**/*.mdx`.

```bash
pnpm run storybook          # nx run @rt-tools/ui-kit:storybook — port 6006
pnpm run build-storybook    # dist/storybook/@rt-tools/ui-kit
```

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

import { TOGGLE_SIZE_TYPE_ENUM } from '../toggle-size.type.enum';
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
            options: [TOGGLE_SIZE_TYPE_ENUM.MD, TOGGLE_SIZE_TYPE_ENUM.SM, 'fat'],
            control: { type: 'select' },
        },
    },
} as Meta<TestToggleComponent>;

type Story = StoryObj<TestToggleComponent>;

export const Toggle: Story = {
    args: {
        value: true,
        disabled: false,
        size: TOGGLE_SIZE_TYPE_ENUM.MD,
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
    public size: ToggleSizeType = TOGGLE_SIZE_TYPE_ENUM.MD;
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
`TestRt*Component`, and story titles are `Components/<PascalName>`.

```bash
pnpm run storybook:ui-kit-v2        # nx run @rt-tools/ui-kit-v2:storybook — port 6007
pnpm run build-storybook:ui-kit-v2  # dist/storybook/@rt-tools/ui-kit-v2
```

## What `preview.ts` already provides

Do **not** re-declare these in a story's `applicationConfig` — they are global in
`projects/ui-kit-v2/.storybook/preview.ts`:

`provideZonelessChangeDetection()`, `provideHttpClient()`, `provideRouter([])`,
`provideRtStorage()`, `provideRtIcons('/icons')`, `provideTransloco(…)` with a
loader returning `of({})`, and `provideRtKitTranslations()`.

- Icons are served by `staticDirs` from `src/assets/icons` to `/icons`; `rt-icon`
  fetches them over HTTP and inlines a sprite.
- The theme toolbar writes `<html data-theme>` — the same attribute `ThemeService`
  sets in an application, so the showcase renders what a consumer gets.
- Sidebar order is fixed by `storySort`: `Foundation` (Design Tokens: Overview,
  Colors, Semantic, Spacing, Theming) → `Components` → the rest.

## State-coverage contract

Under law `docs/constitution/verifiability.md` (section «Демонстрация видимого
состояния») and ADR `docs/adr/0002-ui-kit-v2-state-coverage.md`. A component is
covered when **every input axis is shown at every value**, not when a control
exists that could reach it.

Required per component — a missing entry is a defect, not a preference:

| Story / page       | What it must show                                                                                                                                                                                                                                         |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Overview` (MDX)   | Purpose, when to use / when not to use, axis tables, states table, accessibility, theming, related components, and a hand-written input/output table. `compodoc` is deliberately off — `tools/verify-ui-kit-v2-docs.cjs` is what keeps that table honest. |
| `Playground`       | The single arg-driven story (today's `Default`, renamed).                                                                                                                                                                                                 |
| one story per axis | Every value of that axis, laid out at once and labelled.                                                                                                                                                                                                  |
| `States`           | `default`, `hover`, `focus-visible`, `active`, `disabled`, plus `loading` / `readonly` where the component has them.                                                                                                                                      |
| `Themes`           | Light and dark side by side.                                                                                                                                                                                                                              |

Rules that decide what goes in a matrix:

- **Cross axes only when they visually interact.** `theme × appearance` earns a
  grid because the pair changes how each reads; `size × theme` does not. The full
  cartesian product is explicitly rejected — see ADR 0002 decision 3.
- **An axis you cannot show is declared, not skipped.** Say so in `Overview` with
  the reason; a silent gap looks exactly like coverage.
- **A story that renders an empty collection is not coverage.** Ten stories
  currently pass an empty array and paint nothing (`UI-KIT-V2-ISSUES.md` §2.3);
  seed a realistic fixture instead.

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

## Gotchas — ui-kit-v2

- **`tsconfig.lib.json` excludes `**/*.stories.ts` but not `**/stories/**`.**
  Wrappers stay out of `dist` only because `public-api.ts` never reaches them
  (`UI-KIT-V2-ISSUES.md` §2.7). One stray barrel export ships demo code.
- **Every wrapper adds a lint warning.** `rt/require-host-bem-block` fires on
  demo wrappers — 80 warnings today (§2.6). They are warnings, so the real
  eighty-first drowns.
- **`skill-gate.sh` does not match `*.mdx`.** Editing a docs page hands out no
  rule; load this skill yourself before writing MDX.
- MDX tables need `remark-gfm` — already wired in `main.ts`. Without it a table
  renders as raw text.
- Foundation docs live in `projects/ui-kit-v2/docs/*.mdx`. `Overview` and
  `Theming` are still styled unlike `Colors`/`Semantic`/`Spacing` (§2.4).

## Gotchas

- `.storybook` is excluded from ESLint (`eslint.config.cjs` ignores), and
  `main.ts` carries a `/* eslint-disable */`. Do not rely on lint to catch
  mistakes in that folder.
- `projects/ui-kit/src/lib/ui-kit/dynamic-selectors/` uses a misspelled
  `strories/` folder. It is matched by the `../src/**` glob and works; leave it
  unless you are deliberately renaming it (both the stylelint ignore and any
  tooling reference the typo).
- Token/theming documentation is MDX in `projects/ui-kit/docs/` (`DesignTokens.mdx`,
  `Theming.mdx`, `TokenColors.mdx`, …), not stories. Adding a token → update the
  matching MDX page and `projects/ui-kit/src/styles/TOKENS.md`.
- `console.log` in a wrapper needs an explicit `// eslint-disable-next-line no-console`
  (`no-console` is `error` repo-wide).
