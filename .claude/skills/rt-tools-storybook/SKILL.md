---
name: rt-tools-storybook
description: Add or edit a Storybook story for a kit component — the Test*Component wrapper convention, Meta/StoryObj typing, applicationConfig decorators and argTypes controls. Use when creating any *.stories.ts, adding a demo variant for a component, or wiring token/theming docs into Storybook.
---

# Storybook

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
