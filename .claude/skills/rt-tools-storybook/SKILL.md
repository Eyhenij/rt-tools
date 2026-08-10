---
name: rt-tools-storybook
kind: rule
law: verifiability
description: Add or edit a Storybook story or MDX page for a kit component — the Test*Component wrapper convention, Meta/StoryObj typing, applicationConfig decorators, argTypes controls, and the ui-kit-v2 state-coverage contract. Use when creating any *.stories.ts or docs *.mdx, adding a demo variant for a component, or wiring token/theming docs into Storybook.
---

# Storybook

Правило под «Закон о проверяемости», раздел «Демонстрация видимого состояния». Текст ниже
написан по-английски и приведётся к одному языку отдельным проходом; статьи — здесь.

## Как закон применяется здесь

- **Витрина у каждого кита своя, и общего между ними нет ничего.** Ни настройки, ни порта, ни
  договорённостей об именах: киты разведены намеренно, и приём, снятый с одного, на втором
  оказывается неверным молча.
- **История целит в обёртку, а не в компонент кита.** Вход компонента сигнальный, и привязать к
  нему изменяемое значение витрины нечем; обёртка держит демонстрационное состояние и не едет
  в пакет.
- **Компонент покрыт, когда каждая ось входов показана всеми значениями сразу.** Существующий
  контрол, которым до значения можно доехать, покрытием не является: расхождение, видное на
  сочетании, не видит ни автор правки, ни ревьюер.
- **Оси перемножаются только там, где видно влияют друг на друга.** Полный декартов продукт
  отвергнут: у кнопки это тысяча с лишним ячеек.
- **Ось, которую показать нельзя, объявляется с причиной.** Молчаливый пропуск выглядит ровно
  как покрытие.
- **История, рисующая пустой набор, покрытием не считается.** Сначала правдоподобные данные,
  потом матрица.
- **Сетку рисует общая обвязка показа, а не разметка каждой истории.** Иначе одно и то же
  показывается семьюдесятью способами и расходится при первой правке.
- **Провайдер, без которого компонент не поднимается, стоит в `preview.ts`, а не декоратором
  одной истории.** Локальный декоратор чинит ту историю, где его написали, и оставляет матрицу
  того же компонента падать — дефект при этом наполовину известен и всё равно повторяется.

**Two kits, two independent showcases.** They share no config, no port and no
conventions beyond `@storybook/angular` itself. Check which package you are in
before copying anything across.

|                  | `@rt-tools/ui-kit`            | `@rt-tools/ui-kit-v2`                                    |
| ---------------- | ----------------------------- | -------------------------------------------------------- |
| Config           | `projects/ui-kit/.storybook/` | `projects/ui-kit-v2/.storybook/`                         |
| Port             | 6006                          | 6007                                                     |
| Command          | `pnpm run storybook`          | `pnpm run storybook:ui-kit-v2`                           |
| Wrapper prefix   | `Test*Component`              | `TestRt*Component`                                       |
| Global providers | per-story `applicationConfig` | `preview.ts` (zoneless, storage, icons, labels, theme toolbar) |
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

## Что уже даёт `preview.ts`

`projects/ui-kit-v2/.storybook/preview.ts` объявляет это глобально, и повторять их декоратором
истории не надо:

| что                                        | зачем                                                                                                     |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| `provideZonelessChangeDetection()`         | кит собран без зоны                                                                                       |
| `provideHttpClient()`                      | им ходит за спрайтом `rt-icon`                                                                            |
| `provideRouter([])`                        | ссылки кита требуют маршрутизатор в инжекторе                                                             |
| `provideRtStorage()`                       | службы кита, помнящие выбор пользователя                                                                  |
| `provideRtIDBStorage()`                    | настройки колонок таблица держит в IndexedDB и внедряет службу полем: без провайдера таблица не поднимается вовсе — `NG0201` и пустая разметка вместо строк |
| `provideRtIcons('/icons')`                 | адрес набора значков                                                                                      |
| `provideRtKitLabels({ translator, locale })` | подписи кита — русский набор лежит рядом с витриной, в `showcase-labels.ru.ts`                            |
| `registerLocaleData(localeRu)`             | не провайдер, а вызов на уровне модуля: без него любой `DatePipe` падает `Missing locale data for "ru"` и рисует пустоту вместо ленты |

Список полный. Провайдер, понадобившийся ради одной истории, дописывается сюда, а не остаётся в
её декораторе: следующая матрица того же компонента поднимается уже без него.

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

## Gotchas — ui-kit-v2

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
- Foundation docs live in `projects/ui-kit-v2/docs/*.mdx`. `Overview` and
  `Theming` are still styled unlike `Colors`/`Semantic`/`Spacing` (§2.4).

## Gotchas

- **Настройку витрины не проверяет ни линтер, ни тайпчек пакета — только её сборка.**
  `.storybook` исключена из ESLint, а `main.ts` вдобавок несёт `/* eslint-disable */`;
  `nx run @rt-tools/ui-kit-v2:typecheck` эту папку не видит вовсе. `process.env.RT_SNAPSHOT_RUN`
  вместо `process.env['RT_SNAPSHOT_RUN']` прошло `check:all` целиком и отказало только на
  `pnpm run build-storybook:ui-kit-v2`. Правка в `.storybook/` подтверждается сборкой витрины,
  а не общим прогоном проверок.
- `projects/ui-kit/src/lib/ui-kit/dynamic-selectors/` uses a misspelled
  `strories/` folder. It is matched by the `../src/**` glob and works; leave it
  unless you are deliberately renaming it (both the stylelint ignore and any
  tooling reference the typo).
- Token/theming documentation is MDX in `projects/ui-kit/docs/` (`DesignTokens.mdx`,
  `Theming.mdx`, `TokenColors.mdx`, …), not stories. Adding a token → update the
  matching MDX page and `projects/ui-kit/src/styles/TOKENS.md`.
- `console.log` in a wrapper needs an explicit `// eslint-disable-next-line no-console`
  (`no-console` is `error` repo-wide).
