# Тексты слоя правил — где исполняются правила

Первая колонка — правило дословно, как оно написано в разделе «Правила» спека рядом. Правило без
строки и строка без правила — расхождение: спек обещает то, чего в коде нет, либо в коде стоит
то, о чём спек молчит.

Якорь здесь — слово, которое утверждение и держит. Сверка ищет его по всему файлу и любым словом
удовлетворяется, поэтому имя поля из чужой строки проходит её так же, как нужное предложение, — и
утверждение остаётся зелёным, когда сам текст роли переписан целиком.

| Правило                                                                                              | Где исполняется                                                               |
| ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Текст правила не называет путей, доменов и портов дерева, которому он не принадлежит.                | `projects/agent-kit/tests/texts.test.sh:found_domains`                        |
| Поддомен сверяется наравне с доменом.                                                                | `projects/agent-kit/assets/checks/check-specs.mjs:collectSpecDirs`            |
| Предложенный закон правила не требует.                                                               | `projects/agent-kit/assets/checks/check-specs.mjs:isProposedLaw`              |
| Влитая договорённость ветку не запирает.                                                             | `projects/agent-kit/assets/hooks/task-flow-guard.sh:draft_path`               |
| Префикс сценариев занят одним спеком по всему дереву.                                                | `projects/agent-kit/assets/checks/check-specs.mjs:prefixOwners`               |
| Пакет везёт словарь как ресурс, а не только хук, который его читает.                                 | `projects/agent-kit/src/lib/config.ts:DEFAULT_LAYOUT`                         |
| Пакет везёт общую часть словаря, дерево дописывает предметную.                                       | `projects/agent-kit/src/lib/sections.ts:mergeDocuments`                       |
| Правило и паттерн судятся как спек, а не как файл агента.                                            | `projects/agent-kit/assets/defaults/gate-map.sh:skill_for_default`            |
| Голое имя и каталог судятся наравне с полным путём.                                                  | `projects/agent-kit/assets/checks/check-doc-paths.mjs:existsInTree`           |
| Дерево для сверки путей берётся у системы контроля версий, а не обходом каталогов.                   | `projects/agent-kit/assets/checks/check-doc-paths.mjs:treeOfRepo`             |
| Папки задач выведены из сверки путей, как архив.                                                     | `projects/agent-kit/assets/checks/check-doc-paths.mjs:isSkipped`              |
| Переносимый текст из сверки адресов выведен.                                                         | `projects/agent-kit/assets/checks/check-doc-paths.mjs:isPortable`             |
| Полнота указателя каталога сверяется обеими сторонами.                                               | `projects/agent-kit/assets/checks/check-doc-paths.mjs:checkIndex`             |
| Расхождение указателя печатается своим списком со своим доводом.                                     | `projects/agent-kit/assets/checks/check-doc-paths.mjs:reportIndex`            |
| Привязками считаются строки одной таблицы компаньона, а не всякая строка, похожая на строку таблицы. | `projects/agent-kit/assets/checks/spec-anchors.mjs:rowsOfMap`                 |
| Компаньон правила без раздела привязок — отказ, а не молчание.                                       | `projects/agent-kit/assets/checks/spec-anchors.mjs:rowsOfMap`                 |
| Символом якоря считается любая буква, а не только латинская.                                         | `projects/agent-kit/assets/checks/spec-common.mjs:ANCHOR`                     |
| Алфавит не перечисляется списком.                                                                    | `projects/agent-kit/assets/checks/spec-common.mjs:ANCHOR`                     |
| Путь пары разбирается по-прежнему.                                                                   | `projects/agent-kit/assets/checks/spec-common.mjs:ANCHOR`                     |
| Номер сценария из одной цифры сверка видит наравне с двумя и тремя.                                  | `projects/agent-kit/assets/checks/spec-common.mjs:SCENARIO_HEADING`           |
| Шаги работы пронумерованы сплошь, и весь их список лежит в правиле ведения работы.                   | `projects/agent-kit/assets/rules/task-flow.md:task-flow`                      |
| Номер сценария выдаётся один раз и повторно не используется.                                         | `projects/agent-kit/assets/rules/spec-driven.md:spec-driven`                  |
| Сценарий и заголовок его теста правятся одним изменением.                                            | `projects/agent-kit/assets/patterns/spec-driven-domain.md:spec-driven-domain` |
| Правило об оформлении документов держит раздел под скилы дерева.                                     | `projects/agent-kit/assets/rules/doc-style.md:doc-style`                      |
| Ресурс пакета не описывает состояние дерева как факт.                                                | `projects/agent-kit/assets/rules/spec-driven.md:spec-driven`                  |
| Тексты пакета судятся тем же набором требований, что и копии, разложенные в дерево.                  | `projects/agent-kit/tests/rules-review.test.sh:missing_sections`              |
| Невыбранный вид судится наравне с выбранным.                                                         | `projects/agent-kit/tests/rules-review.test.sh:KINDS_WITH_SECTIONS`           |
| Ресурс без обязательного раздела своего рода — расхождение.                                          | `projects/agent-kit/tests/rules-review.test.sh:missing_pitfalls`              |
| Набор разделов объявлен на род и назван поимённо, а не выведен из образца.                           | `projects/agent-kit/tests/rules-review.test.sh:sections_for`                  |
| Образец рода судится объявленным набором наравне с корпусом.                                         | `projects/agent-kit/tests/rules-review.test.sh:template_gaps`                 |
| Род, которому набор не объявлен, молчит, а не краснеет.                                              | `projects/agent-kit/tests/rules-review.test.sh:KINDS_WITHOUT_SECTIONS`        |
| Пустой список долга называется вслух и с числом.                                                     | `projects/agent-kit/tests/rules-review.test.sh:rules_without_pattern`         |
| Правило без паттерна — расхождение.                                                                  | `projects/agent-kit/tests/rules-review.test.sh:rules_without_pattern`         |
| Правило, чьи паттерны дерево пропустило при раскладке, паттерна не требует.                          | `projects/agent-kit/assets/checks/check-specs.mjs:skippedPatterns`            |
| Имя соседнего ресурса, названное прозой, проверяется наравне со ссылкой шапки.                       | `projects/agent-kit/tests/rules-review.test.sh:unknown_neighbours`            |
| Запреты текстов действуют и внутри блока кода.                                                       | `projects/agent-kit/tests/texts.test.sh:domains_in`                           |
| Адресом конкретного дерева считается перечисленное, а не всё, что похоже на путь.                    | `projects/agent-kit/tests/texts.test.sh:COMMON_SEGMENTS`                      |
| Вывод переносимого текста из сверки адресов старше нового требования.                                | `projects/agent-kit/assets/checks/check-doc-paths.mjs:PORTABLE_DIRS`          |
| Машинная половина краснеет только на считаемом.                                                      | `projects/agent-kit/tests/rules-review.test.sh:suite_result`                  |
| Проверка текстов пакета стоит в наборе, который гоняется перед пушем.                                | `projects/agent-kit/src/lib/assets.spec.ts:expectGreen`                       |
| Ревью читает семью целиком, а не файл по одному.                                                     | `projects/agent-kit/assets/agents/rules-reviewer.md:Семья`                    |
| Роль возвращает находки и ничего не правит.                                                          | `projects/agent-kit/assets/agents/rules-reviewer.md:tools`                    |
| Находка называет два места дословно и то, чем они расходятся.                                        | `projects/agent-kit/assets/agents/rules-reviewer.md:дословно`                 |
| Пробел ищется чтением, а не счётом привязок.                                                         | `projects/agent-kit/assets/agents/rules-reviewer.md:Пробел`                   |
| Ревью зовётся двумя способами: командой вручную и машинной половиной в гейте.                        | `projects/agent-kit/assets/commands/rules-review.md:ARGUMENTS`                |
| Граф изображает ход правила и лежит в тексте самого правила.                                         | `projects/agent-kit/assets/templates/rule.md:mermaid`                         |
| Граф заводится каждому правилу, а не только ветвящемуся.                                             | `projects/agent-kit/tests/rules-review.test.sh:sections_for`                  |
| Граф правится тем же изменением, что и проза, которую он изображает.                                 | `projects/agent-kit/assets/agents/rules-reviewer.md:mermaid`                  |
