---
name: rt-tools-storybook-story
kind: pattern
rule: rt-tools-storybook
description: Паттерн правила rt-tools-storybook. Брать при заведении или правке *.stories.ts — обёртка Test*Component рядом с историей, типизация Meta и StoryObj, декораторы applicationConfig, контролы argTypes, механика матрицы состояний и параметры снимка второй витрины. Не брать для разбора упавшего снимка — это паттерн ui-component-tests-visual.
---

# История витрины — готовый код

Паттерн правила `rt-tools-storybook`. Что при этом должно быть верно — закон
`docs/constitution/verifiability.md`.

## Когда брать

- Заводится или правится `*.stories.ts` в любом из двух китов.
- Компоненту нужна матрица состояний либо демонстрационная обёртка.
- Истории нужен свой кадр снимка: наведение, перекрытие, пропуск съёмки.

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
`TestRt*Component`, and story titles are `Components/<PascalName>`.

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
  Панель CDK Overlay рисуется в контейнере на `body`, то есть вне `[data-story-root]`: кадр по
  корню показа не содержит её вовсе, и истории, открывающей панель, ставится
  `snapshot: { fullPage: true }`.
- **Компонент, который в приложении держит хозяин — стек, перекрытие, панель, — в ячейке сетки
  сам по себе не работает.** От хозяина ему достаются две вещи, и обе пропадают в матрице:
  обязательные входы, которые хозяин считает сам (`NG0950` и сломанная отрисовка), и
  позиционированный предок — плашка с `position: absolute` уезжает из ячейки в угол показа.
  Обязательные входы задаются ячейкой, ячейке ставится `position: relative`. Значения, при
  которых компонент закрывает себя сам, в матрице подменяются — это свойство компонента, и
  названо оно в его `CONTEXT.md`, а не здесь.

## Snapshot parameters — ui-kit-v2

Стories are compared against baselines, and what gets a frame is decided **by
subtraction**: everything is shot except what carries a skip with a reason. Get it
backwards — shoot only what is marked — and a matrix whose marker was forgotten
passes green with zero pixels checked, indistinguishable from a healthy run.

Helpers live in `projects/ui-kit-v2/src/showcase/story-snapshot.ts`:

```typescript
import { storySnapshotSkip, storyWidthAtMost } from '../../../../showcase';

// A story that repeats a matrix cell — skip it, and say why. An empty reason fails the run.
export const Playground: Story = {
    parameters: storySnapshotSkip('значения по умолчанию уже стоят ячейкой в матрице этого компонента'),
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

## Частые промахи

- **Стили из `styles:` обёртки матрицы не действуют на разметку внутри `ng-template`,
  спроецированного в компонент показа.** Инкапсуляция эмулированная: атрибут обёртки на такие
  узлы не попадает вовсе, правило пишется в файл и не применяется ни к чему. Оформление ячейки
  матрицы задаётся встроенным `style`, либо узел выносится из проецируемого шаблона.
- **`tsconfig.lib.json` excludes `**/*.stories.ts` but not `**/stories/**`.**
  Wrappers stay out of `dist` only because `public-api.ts` never reaches them
  (`UI-KIT-V2-ISSUES.md` §2.7). One stray barrel export ships demo code.
- **Every wrapper adds a lint warning.** `rt/require-host-bem-block` fires on
  demo wrappers — 80 warnings today (§2.6). They are warnings, so the real
  eighty-first drowns.
- MDX tables need `remark-gfm` — already wired in `main.ts`. Without it a table
  renders as raw text.
- **Комментарий вида `{/* … */}` в `.mdx` не ставится: форматтер портит его молча.** Prettier
  разбирает `.mdx` как разметку и превращает звёздочки в подчёркивания — `{/_ … _/}`, — после
  чего MDX перестаёт разбираться вовсе, а витрина отдаёт 500 на указатель историй и ни одного
  кадра не снимает. Ловится это только повторным заходом в браузер **после** форматирования:
  до него страница рисуется, и прогон кадров падает уже потом. Пояснение ставится обычным
  `/* … */` внутри блока `export const`.
- Foundation docs live in `projects/ui-kit-v2/docs/*.mdx`. `Overview` and
  `Theming` are still styled unlike `Colors`/`Semantic`/`Spacing` (§2.4).
