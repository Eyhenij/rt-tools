# typescript-conventions — как это устроено здесь

Имена этого дерева при правиле `SKILL.md` рядом. Отдельный файл потому, что правило говорит
приёмом и переносится между репозиториями целиком, а всё, что ниже, верно только здесь и
устаревает при каждом переименовании.

Правило берётся на любой `.ts`, у которого нет своего: у файла компонента есть
`component-structure`, у класса каркаса — `angular-patterns`, у бареля — `lib-layers`, у спеки —
`testing`.

## Как это называется здесь

- **В правиле** — Здесь
- **род объявления в имени** — `I` у интерфейса, `T` у псевдонима типа, `E` у перечисления
- **приватное поле** — поле с решёткой (`#config`), а не ключевое слово доступа
- **источник, за которым следят** — поле с суффиксом `Source`
- **группа публичных типов фичи** — `export namespace IRtuiButton { … }` рядом с классом
- **межпакетный импорт** — алиас `@rt-tools/core`, `@rt-tools/store`, `@rt-tools/utils`

## Где это лежит

- **набор правил кода** — `eslint.config.mjs` в корне, общая часть — `eslint/base.config.mjs`
- **собственные правила этого дерева** — `tools/eslint-rules/rules/`, зовутся `@nx/workspace-<имя правила>`
- **алиасы пакетов** — `tsconfig.base.json`, раздел `paths`
- **форматирование** — `.prettierrc.json` — 140 колонок, отступ в четыре пробела, одинарные кавычки

## Где исполняются статьи

Первая колонка — статья дословно, как она написана в разделе «Как закон применяется здесь»
(жирная часть пункта). Статья без строки и строка без статьи — расхождение: правило обещает
то, чего в дереве нет, либо в дереве стоит то, о чём правило молчит.

- **The kind of a declaration shows in the name prefix, and three linter rules hold that.** — `tools/eslint-rules/rules/require-interface-prefix.ts:RULE_NAME` — с ним заодно `require-type-prefix` и `require-enum-prefix`, отказ на всех `.ts`. Накопленное к дню включения ими и найдено: приставки нет у 341 псевдонима типа, у 17 перечислений и у 10 интерфейсов.
- **A watched source is named by a suffix.** — `tools/eslint-rules/rules/require-source-suffix-for-subjects.ts:REQUIRED_SUFFIX` — отказ линтера; нарушений в дереве нет.
- **The file name suffix finds the promised declaration inside.** — **Не проверяется ничем.** Имя файла с объявлением внутри не сверяет ни линтер, ни сборка: файл `*.service.ts` без службы законен для обоих.
- **A file is no longer than 500 lines, and all lines count — blank ones and comments too.** — Для `.ts` — `max-lines` в `eslint.config.mjs`, считаются все строки; одноимённое правило набора sonarjs выключено — оно считает только код. Тексты и стили держит `tools/check-file-size.mjs:LIMIT` тем же числом.
- **A type is taken from the package where it is declared.** — `tsconfig.base.json:paths` — алиасы пакетов; импорт мимо них отбивает `@nx/enforce-module-boundaries`, относительный путь через `projects/*` не проходит.
- **A value declared by one side of an exchange is not recomputed by the other side but taken from the first.** — `tools/cargo-mark.mjs:treeSlug` — признак дерева берётся у пакета тем же вызовом, каким его считает отправка; своя копия счёта уже разошлась с пакетной молча.
- **A value from a closed set arrives as an enum `E<Name>`, not as a string or a number at the place of use.** — **Не проверяется ничем.** Линтер судит имя перечисления, но не то, что набор объявлен перечислением, а не строками на местах
- **A deprecation mark is set together with a walk over the consumers.** — **Не проверяется ничем.** Отметка — комментарий, и обход потребителей машине не виден. Образец — снятый набор `.c-button`: карта перехода на `.rtui-btn` осталась в `projects/ui-kit/src/styles/TOKENS.md`.
- **The two-step cast `as unknown as` is forbidden by a linter rule.** — `eslint.config.mjs:no-restricted-syntax` — отбор по узлу разбора, спеки из-под запрета выведены тем же блоком.

## Что ещё стоит знать при чтении кода

- Ничто не выводится неявно: `@typescript-eslint/typedef` требует тип у параметра, поля,
  объявления переменной и разбора массива, `explicit-function-return-type` — у возвращаемого
  значения, `explicit-member-accessibility` — у членов класса. Да, локальные переменные в
  спеках тоже аннотируются.
- Порядок членов держит `@typescript-eslint/member-ordering`: приватные поля, защищённые,
  публичные, конструктор, публичные методы, защищённые, приватные.
- Зависимости берутся через `inject()`, а не через конструктор.
- Пространства имён разрешены намеренно: `@typescript-eslint/no-namespace` выключен, это
  принятый здесь способ сгруппировать публичные типы фичи.
- Комментарии и блоки документации здесь пишут — короткое пояснение к неочевидному публичному
  символу и к причине обхода это домашняя манера, а не шум.
- `no-console`, `no-debugger`, `no-var`, `no-bitwise`, `no-eval` — отказы.

## Чем это проверяется

- `pnpm exec nx lint @rt-tools/<пакет>` или `pnpm run lint` — весь набор.
- `pnpm run check:affected` — линт, типы, спеки и сборка по задетым пакетам.
- На коммите `lint-staged` через husky гоняет исправляющий проход линтера и форматирование.
