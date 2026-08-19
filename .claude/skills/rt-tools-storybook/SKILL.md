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
- **История уровня шаблонов показывает целый экран, и договор о покрытии к ней не относится
  тоже.** У экрана нет ни осей входов, ни состояний в смысле компонента: он собран из готовых
  компонентов кита и показывает, как из них складывается страница — отступы, порядок блоков,
  панели, открытые адресом. Требовать от него `Playground`, `States` и `Themes` не с чего, а
  вместо них он показывает те виды, в которых бывает сам: список с записями, пустой список,
  отказ чтения. Уровень стоит в `storySort` последним, файлы лежат в
  `src/showcase/templates/`, обёртка — рядом со своей историей, в `stories/component/`.
- **Демонстрационное состояние, которым истории одного экрана и различаются, объявляется
  декоратором истории, а не в `preview.ts`.** Статья о провайдере говорит о другом: там —
  инжектор, без которого компонент не поднимается вовсе, и объявленный у одной истории он
  оставляет падать все остальные. Здесь наоборот: у такого объявления есть умолчание, экран
  поднимается и без него, а история именно им и отличается от соседней.

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
  Colors, Semantic, Spacing, Theming) → `Atoms` → `Molecules` → `Organisms` → `Templates` → the rest.
- **Заголовок истории начинается уровнем атомарного дизайна, а не общим разделом.** Уровней
  четыре — атомы, молекулы, организмы, шаблоны, — и между уровнем и именем компонента стоит
  необязательная предметная группа: кнопки, поля формы, навигация, данные, файлы, окно, боковая
  панель, таблица, переписка, рабочий стол, каркас. Дочерняя часть стоит в группе своего
  родителя и на его уровне: шапка окна — рядом с окном, пункт меню — рядом с меню. Общего корня
  над уровнями нет, порядок разделов задаёт `storySort` — по алфавиту молекулы встали бы перед
  организмами.
- **Имя эталона снимка — слаг заголовка, поэтому уровень переносится вместе с ним.** Перекладка
  заголовка без переименования эталонов оставляет 445 файлов, которым не отвечает ни одна
  история: прогон снимает всё заново, а сверка каталога краснеет на каждый.

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
- **История уровня основ живёт при обвязке показа, а не в папке компонента, и договор о
  покрытии к ней не относится.** Она показывает приём, общий для всего кита, — у неё нет ни
  осей входов, ни состояний, и требовать от неё `Playground`, `States` и `Themes` не с чего.
  Заголовок начинается разделом Foundation, файл лежит в `src/showcase/stories/`, обёртка — рядом,
  в `component/`. Foundation-страницы при этом остаются в `projects/ui-kit-v2/docs/`: MDX
  Angular не поднимает, и живой компонент показать со страницы нечем.
- **Обёртка, переопределяющая своё свойство компонента, снимает инкапсуляцию.** Компонент
  объявляет свойство на корне своего блока, а корень рисуется шаблоном кита — правило с
  атрибутом инкапсуляции до него не доходит вовсе, и переопределение молча ничего не меняет.

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

## Паттерны

- `rt-tools-storybook-story` — готовая история: обёртка, типизация, контролы, матрица состояний,
  параметры снимка второй витрины.
