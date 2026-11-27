# План

**Task:** RT-3732 · **Branch:** RT-3732-preset-dark-node
**Behaviour:** unchanged — тёмный узел снова тёмный, как уже объявлено у темы на узле; новых возможностей нет

## Точки

- **A:** на странице с `rt-theme-dark` тёмный узел набора Material внутри светлого куска светлый: фон `#fff`.
- **Эта задача доводит до:** такой узел тёмный, фон `#222629`, как на странице с `data-theme="dark"`.
- **Признак:** тест SC-UKV-1921 зелёный, а в браузере у узла в обоих способах включить тёмную тему одни значения.
- **Веха G эпика:** не меняется. Это исправление ошибки, найденной по ходу RT-3649.

## Решение

| Часть       | Что выбрано |
| ----------- | ----------- |
| Модули      | `tools/build-tokens-v2.mjs:SCOPE_NOTE` — генератор пишет листы токенов; `projects/ui-kit-v2/src/styles/theme-scope.theme.spec.ts:winnerOf` — выбирает объявление, побеждающее по весу и порядку; `projects/ui-kit-v2/src/showcase/stories/component/test-theme-scope-dark-set.component.ts:TestRtThemeScopeDarkSetComponent` — показывает тёмный узел набора на странице с `rt-theme-dark` |
| Зависимости | тест читает собранные стили, как соседние тесты того же файла; история показа берёт только Angular и стили кита; генератор зависит только от `tools/tokens-looks.mjs`, как раньше |
| Зацепление  | `tools/build-tokens-v2.mjs` исходящие 1 → 1; `projects/ui-kit-v2/src/styles/theme-scope.theme.spec.ts` исходящие 0 → 0; циклов и входов мимо точки нет |
| Паттерны    | паттерна нет: два новых селектора, одна функция сравнения в тесте и один показ |
| Термины     | новых слов нет: кусок темы, набор и узел уже названы в текстах кита |
| Данные      | разметка приложения: корень без темы, с `data-theme="dark"` или `rt-theme-dark`; кусок светлый, тёмный или нет; узел набора классом или атрибутом со светлой, тёмной темой или без неё. SC-UKV-1921, `projects/ui-kit-v2/src/styles/theme-scope.theme.spec.ts` |
| Границы     | прежние селекторы и их вес не меняются: добавляются два узких, `html.rt-theme-dark [data-theme='light']` перед тёмным узлом набора, весом (0,4,1). Значения и имена токенов и API не меняются. Вложенность глубже одного куска не различается, как раньше: набор без своей темы внутри такого узла остаётся светлым |
| Приоритет   | безопасность соседей важнее краткости: приставка `html ` к двум прежним селекторам подняла бы их вес на всех страницах и могла бы перебить правило приложения |
| Бюджет      | `tools/build-tokens-v2.mjs` плюс 12; `projects/ui-kit-v2/src/styles/theme-scope.theme.spec.ts` до 200; новых файлов кода: 1; новых зависимостей: 0 |

## След задачи

| Что                                      | Где                                                                                   |
| ---------------------------------------- | ------------------------------------------------------------------------------------- |
| Генератор (правится)                     | `tools/build-tokens-v2.mjs`                                                           |
| Лист генератора (правится)               | `projects/ui-kit-v2/src/styles/_theme-scope.scss`                                     |
| Тест кусков темы (правится)              | `projects/ui-kit-v2/src/styles/theme-scope.theme.spec.ts`                             |
| Истории кусков темы (правится)           | `projects/ui-kit-v2/src/showcase/stories/theme-scope.stories.ts`                      |
| Показ истории (правится)                 | `projects/ui-kit-v2/src/showcase/stories/component/test-theme-scope-dark-set.component.ts` |
| Сценарий раздельной поставки (правится)  | `tools/tests/build-tokens-split.test.sh`                                              |
| Сценарии спека (правится)                | `docs/specs/ui-kit-v2/tokens/scenarios.md`                                            |
| Порог веса (правится)                    | `tools/kit-weight-threshold.json`                                                     |
| План эпика (правится)                    | `docs/plans/kit-weight-remainder.md`                                                  |

## Что считается готовым

- Тёмный узел набора внутри светлого куска тёмный при обоих способах включить тёмную тему корня, в браузере тоже.
- Остальные сочетания темы и набора получают те же значения, что раньше.
- Тест SC-UKV-1921 красный на прежнем листе только на этом случае и зелёный на новом.
- Макет и витрина одобрены владельцем.

## Этапы

### 1. Макет

- **Steps:**
    1. Кадр тёмного узла внутри светлого куска нарисован в Figma и одобрен
       Check: `grep -c '^- \*\*Макет:\*\*' docs/tasks/RT-3732-preset-dark-node/approvals.md` → >= 1
- **Readiness sign:** в записи согласий есть ответ владельца и ссылка на кадр.
- **Verified by:** `grep -c 'node-id' docs/tasks/RT-3732-preset-dark-node/approvals.md` → >= 1

### 2. Тёмный узел тёмный

- **Steps:**
    1. Тест SC-UKV-1921 на прежнем листе краснеет только на тёмном узле под rt-theme-dark
       Check: `grep -c 'SC-UKV-1921 на прежнем листе: красные только два случая' docs/tasks/RT-3732-preset-dark-node/progress.md` → >= 1
    2. Два узких селектора и верный комментарий порядка записаны генератором, тест зелёный
       Check: `test "$(grep -c 'the node stays' tools/build-tokens-v2.mjs)" = 0 && grep -q 'SC-UKV-1921' projects/ui-kit-v2/src/styles/theme-scope.theme.spec.ts && pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=projects/ui-kit-v2/src/styles/theme-scope.theme.spec.ts` → exit 0
    3. Сценарий раздельной поставки держит новые селекторы тёмного правила
       Check: `grep -qF 'html.rt-theme-dark [data-theme=light] [data-preset=material][data-theme=dark]' tools/tests/build-tokens-split.test.sh && pnpm run -s build:tokens-v2 >/dev/null && RT_PUSH=1 bash tools/tests/build-tokens-split.test.sh` → exit 0
    4. Проверки токенов и веса кита проходят
       Check: `grep -qF "html.rt-theme-dark [data-theme='light'] [data-preset='material'][data-theme='dark']" projects/ui-kit-v2/src/styles/_theme-scope.scss && pnpm run -s check:tokens-build && node tools/check-tokens-graph.mjs && node tools/check-tokens-theme.mjs && node tools/check-tokens-styles.mjs && pnpm run -s check:kit-weight` → exit 0
    5. В браузере сравнены прежний и новый лист по сочетаниям темы и набора
       Check: `grep -c '^- \*\*Живая проверка:\*\*' docs/tasks/RT-3732-preset-dark-node/progress.md` → >= 1
- **Readiness sign:** в браузере отличается только тёмный узел набора под `rt-theme-dark` и то, что он наследует.
- **Verified by:** `bash tools/tests/build-tokens-split.test.sh` — 0 отказов в последней строке.

### 3. Витрина

- **Steps:**
    1. История показывает исправленный случай, и её эталон снят
       Check: `grep -q 'DarkSetNode' projects/ui-kit-v2/src/showcase/stories/theme-scope.stories.ts && node tools/visual-gate.mjs ui-kit-v2 'theme-scope'` → exit 0
    2. Витрина сверена с макетом и одобрена
       Check: `grep -c '^- \*\*Витрина:\*\*' docs/tasks/RT-3732-preset-dark-node/approvals.md` → >= 1
- **Readiness sign:** числа макета и витрины совпали, ответ владельца записан.
- **Verified by:** `grep -c '^- \*\*Совпадение:\*\*' docs/tasks/RT-3732-preset-dark-node/approvals.md` → >= 1

### 4. Тексты записаны

- **Steps:**
    1. Сценарий SC-UKV-1921 записан в спеке токенов
       Check: `grep -c '^### SC-UKV-1921' docs/specs/ui-kit-v2/tokens/scenarios.md` → = 1
    2. Признак выпуска в плане эпика проверяет этот случай на пакете из npm pack
       Check: `grep -c 'тёмный узел набора из RT-3732' docs/plans/kit-weight-remainder.md` → >= 1
- **Readiness sign:** сценарий ведёт на тест, выпуск проверит случай на пакете.
- **Verified by:** `node tools/check-specs.mjs` — расхождений нет.

## Чего эта работа не делает

- Не различает вложенность глубже одного куска темы: таблица кита со своим набором внутри такой карточки остаётся
  светлой, как и под `data-theme="dark"` на корне.
- Не меняет значения токенов и не выпускает пакет: выпуск — задача RT-3716.
