# reuse-first — как это устроено здесь

Имена этого дерева при правиле `SKILL.md` рядом. Отдельный файл потому, что правило говорит
приёмом и переносится между репозиториями целиком, а всё, что ниже, верно только здесь и
устаревает при каждом переименовании.

Здесь дерево само и есть источник вида: правило смотрит внутрь кита. «Взять готовое» значит
опереться на соседний компонент, на основу поля или на примитив CDK, а не завести рядом второй
такой же.

## Как это называется здесь

- **В правиле** — Здесь
- **источник вида** — сам кит: `@rt-tools/ui-kit` с префиксом `rtui-` или `@rt-tools/ui-kit-v2` с префиксом `rt-`
- **базовый класс** — основа поля формы и основа боковой панели маршрута во втором ките
- **основа стора** — `BaseStoreService`, `BaseAsyncStoreService` из `@rt-tools/store`
- **общая шина сообщений** — шина оповещений второго кита в `projects/ui-kit-v2/src/lib/platform/`
- **общий слой раскладки** — `projects/<кит>/src/styles/`
- **разовое отступление** — маркер `native-ok` в той же строке — его снимает гард переизобретения

## Где это лежит

- **компоненты первого кита** — `projects/ui-kit/src/lib/ui-kit/` — кнопки, таблица, окно, панель, оповещение, загрузчики файлов и прочее
- **компоненты второго кита** — `projects/ui-kit-v2/src/lib/components/`
- **основа поля формы** — `projects/ui-kit-v2/src/lib/components/form-control/rt-form-control.base.ts`
- **основа боковой панели маршрута** — `projects/ui-kit-v2/src/lib/components/container/rt-route-aside.base.ts`
- **общие функции и типы** — `projects/utils/src/lib/`
- **директивы, токены и хранилища** — `projects/core/src/lib/`
- **гард переизобретения** — `.claude/hooks/reuse-first-guard.sh`, образцы — в `.claude/rt-kit/project.sh`
- **наборы признаков пакета** — `tools/signals/` — по файлу на пакет rt-tools; читает их `tools/signals.mjs`
- **свои признаки дерева** — `.claude/rt-kit/signals.json`, объявлен ключом `reuse.signals` в `.claude/rt-kit/checks.json`

## Где исполняются статьи

Первая колонка — статья дословно, как она написана в разделе «Как закон применяется здесь»
(жирная часть пункта). Статья без строки и строка без статьи — расхождение: правило обещает
то, чего в дереве нет, либо в дереве стоит то, о чём правило молчит.

- **The source of look is chosen by application, not by habit.** — **Не проверяется ничем.** Приложений в дереве нет, выбор идёт между двумя китами: у первого префикс `rtui-` и свой набор токенов, у второго — `rt-` и свой. Кода они не делят.
- **A value of an integration is taken the same way as the neighbouring value of the same integration.** — **Не проверяется ничем.** Зашитое в код значение синтаксически исправно: линт, сборка и сверка повторов молчат. Ближайшая интеграция дерева — ключи браузерного профиля в `.claude/rt-kit/browser-device-id`, и рядом с ними зашитых значений нет.
- **Work starts with reading the ready-made, not with a blank file.** — **Не проверяется ничем.** Чтение следа в дереве не оставляет. Соседняя папка кита читается целиком — `projects/ui-kit/src/lib/ui-kit/` и `projects/ui-kit-v2/src/lib/components/`.
- **A restriction invented on the spot is checked by a search over the tree before it becomes an argument.** — **Не проверяется ничем.** Ограничение живёт в рассуждении, а не в файле: поиск, которого не было, следа не оставляет. Держится тем, что довод «так делать нельзя», сказанный владельцу, называет команду, которой он проверен.
- **One's own primitive and one's own base are created only with the owner's explicit approval.** — **Не проверяется ничем.** Слово владельца машине не видно. Обе основы второго кита заведены решением, записанным в `docs/adr/`.
- **The record edit panel inherits the shared base, not its own markup.** — `projects/ui-kit-v2/src/lib/components/container/rt-route-aside.base.ts:RtRouteAsideComponent` — общая основа боковой панели маршрута; поля формы — `rt-form-control.base.ts`.
- **Success and failure are reported by the shared bus, not by one's own markup on the screen.** — `projects/ui-kit-v2/src/lib/platform/notification-bus.service.ts:NotificationBus` — шина второго кита; у первого ту же роль держит `snack-bar`.
- **An inline message is lawful where the record edit panel stays open after a failure.** — **Не проверяется ничем.** Место показа из кода не видно: и шина, и готовый компонент сообщения выглядят вызовом; держится разбором
- **The departure marker is set after reading the inventory of the ready-made, and what was read is named next to it.** — **Не проверяется ничем.** Гард единообразия читает сам маркер и не судит текст объяснения при нём
- **A check is not taken off the gate so that the push goes through.** — `.claude/rt-kit/project.sh:rt_push_checks` — набор гейта называет проверку строкой; снятая строка видна разбором правки профиля, но отказом не отбивается
- **A component is declared in three files: `.ts`, `.html`, `.scss`.** — `tools/check-reuse.mjs:SIGNALS` — шаблон и стили внутри декоратора стоят признаком обхода готового; тройка файлов выдержана во всех компонентах обоих китов.
- **A screen component outside the kit has an empty styles file by default.** — Не применимо: экранов здесь нет. Ближайшее — файл стилей компонента держит только его собственные отличия, а общее уезжает в слой стилей кита.
- **The ready-made is extended, not cloned next to it.** — `tools/check-dupes.mjs:known` — второй раз написанный образец находит проверка повторов. Сведение вариантов кнопки в один `rtui-button` — тот же приём, сделанный руками.
- **What accumulated before the guard is counted by the full check, and the list may only not grow.** — `tools/check-reuse.mjs:known` — снимок долга из `tools/reuse-allowlist.json`, а сверка идёт по файлу целиком.
- **Signs are declared by the tree, not hardcoded in the check.** — `tools/signals.mjs:loadSignals` — объявленные наборы и свои признаки поверх них; что объявлено, стоит в `.claude/rt-kit/checks.json`, ключ `reuse`.
- **The second value of the same integration follows its own kind, not its neighbour in the file.** — `.claude/rt-kit.json:intake` — обе половины связи с приёмом объявлены настройкой дерева: адрес ключом `intake`, токен ключом `token`, и второй сделан тем же способом, что и первый.

## Что ещё стоит знать при чтении кода

- Гард переизобретения читает два источника сразу: объявленные наборы признаков — те же, что
  берёт сплошная проверка, — и функцию профиля дерева `rt_reinvented_in` в
  `.claude/rt-kit/project.sh`. В профиле остаётся только то, чего данными не выразить: признак,
  зависящий от места файла в дереве. Сегодня там один образец — хост в стилях второго кита.
- Свои признаки дерева лежат в `.claude/rt-kit/signals.json`: чужой прогонщик спек,
  относительный путь через `projects/*` вместо алиаса, декораторы входа и выхода вместо
  реактивных.
- Из наборов пакета это дерево объявляет только `angular`: киты оно пишет, а не потребляет, и
  их наборы советовали бы звать кит на файлах самого кита.
- Мост к Material — осознанное исключение, а не переизобретение: он собран в одном файле
  стилей, чтобы при подъёме версии читать одно место.
- Перенос кода переизобретением не считается: строка, уже лежавшая в дереве, при переезде
  меняет отступ, оставаясь тем же кодом.

## Чем это проверяется

- Гард переизобретения на правке — отбивает до того, как строка написана.
- `pnpm exec nx lint @rt-tools/<пакет>` — правила BEM-директив и модификаторов ловят часть
  самодельной разметки.
- Витрина: новый вариант, показанный рядом с готовым, обычно и оказывается его повторением.
