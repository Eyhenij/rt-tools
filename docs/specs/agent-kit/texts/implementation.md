# Тексты слоя правил — где исполняются правила

Первая колонка — правило дословно, как оно написано в разделе «Правила» спека рядом. Правило без
строки и строка без правила — расхождение: спек обещает то, чего в коде нет, либо в коде стоит
то, о чём спек молчит.

Якорь здесь — слово, которое утверждение и держит. Сверка ищет его по всему файлу и любым словом
удовлетворяется, поэтому имя поля из чужой строки проходит её так же, как нужное предложение, — и
утверждение остаётся зелёным, когда сам текст роли переписан целиком.

- **Текст правила не называет путей, доменов и портов дерева, которому он не принадлежит.** — `projects/agent-kit/tests/texts.test.sh:found_domains`
- **Поддомен сверяется наравне с доменом.** — `projects/agent-kit/assets/checks/check-specs.mjs:collectSpecDirs`
- **Предложенный закон правила не требует.** — `projects/agent-kit/assets/checks/check-specs.mjs:isProposedLaw`
- **Влитая договорённость ветку не запирает.** — `projects/agent-kit/assets/hooks/task-flow-draft-guard.sh:draft_path`
- **Префикс сценариев занят одним спеком по всему дереву.** — `projects/agent-kit/assets/checks/check-specs.mjs:prefixOwners`
- **Пакет везёт словарь как ресурс, а не только хук, который его читает.** — `projects/agent-kit/src/lib/config.ts:DEFAULT_LAYOUT`
- **Вводная перед словарём называет место, где слово заводят, а не файл, который она печатает.** — `projects/agent-kit/assets/hooks/glossary-load.sh:where` — строка собирается до печати и встаёт между вводной и телом словаря; сценарий SC-AK-819
- **Адрес надстройки вводная выводит из шапки словаря, а не зашивает.** — `projects/agent-kit/assets/hooks/glossary-load.sh:resource` — идентификатор ресурса вынимается из первой строки файла
- **Пакет везёт общую часть словаря, дерево дописывает предметную.** — `projects/agent-kit/src/lib/sections.ts:mergeDocuments`
- **Правило и паттерн судятся как спек, а не как файл агента.** — `projects/agent-kit/assets/defaults/gate-map.sh:skill_for_default`
- **Голое имя и каталог судятся наравне с полным путём.** — `projects/agent-kit/assets/checks/check-doc-paths.mjs:existsInTree`
- **Дерево для сверки путей берётся у системы контроля версий, а не обходом каталогов.** — `projects/agent-kit/assets/checks/check-doc-paths.mjs:treeOfRepo`
- **Папки задач выведены из сверки путей, как архив.** — `projects/agent-kit/assets/checks/check-doc-paths.mjs:isSkipped`
- **Переносимый текст из сверки адресов выведен.** — `projects/agent-kit/assets/checks/check-doc-paths.mjs:isPortable`
- **Полнота указателя каталога сверяется обеими сторонами.** — `projects/agent-kit/assets/checks/check-doc-paths.mjs:checkIndex`
- **Расхождение указателя печатается своим списком со своим доводом.** — `projects/agent-kit/assets/checks/check-doc-paths.mjs:reportIndex`
- **Привязками считаются строки одной таблицы компаньона, а не всякая строка, похожая на строку таблицы.** — `projects/agent-kit/assets/checks/spec-anchors.mjs:rowsOfMap`
- **Компаньон правила без раздела привязок — отказ, а не молчание.** — `projects/agent-kit/assets/checks/spec-anchors.mjs:rowsOfMap`
- **Символом якоря считается любая буква, а не только латинская.** — `projects/agent-kit/assets/checks/spec-common.mjs:ANCHOR`
- **Имя в якоре записывается так, как объявлено в коде, решётку включая.** — `projects/agent-kit/assets/checks/spec-common.mjs:ANCHOR`
- **Алфавит не перечисляется списком.** — `projects/agent-kit/assets/checks/spec-common.mjs:ANCHOR`
- **Путь пары разбирается по-прежнему.** — `projects/agent-kit/assets/checks/spec-common.mjs:ANCHOR`
- **Номер сценария из одной цифры сверка видит наравне с двумя и тремя.** — `projects/agent-kit/assets/checks/spec-common.mjs:SCENARIO_HEADING`
- **Шаги работы пронумерованы сплошь, и весь их список лежит в правиле ведения работы.** — `projects/agent-kit/assets/rules/task-flow.md:task-flow`
- **Номер сценария выдаётся один раз и повторно не используется.** — `projects/agent-kit/assets/rules/spec-driven.md:spec-driven`
- **Сценарий и заголовок его теста правятся одним изменением.** — `projects/agent-kit/assets/patterns/spec-driven-domain.md:spec-driven-domain`
- **Правило об оформлении документов держит раздел под скилы дерева.** — `projects/agent-kit/assets/rules/doc-style.md:doc-style`
- **Ресурс пакета не описывает состояние дерева как факт.** — `projects/agent-kit/assets/rules/spec-driven.md:spec-driven`
- **Тексты пакета судятся тем же набором требований, что и копии, разложенные в дерево.** — `projects/agent-kit/tests/rules-review.test.sh:missing_sections`
- **Невыбранный вид судится наравне с выбранным.** — `projects/agent-kit/tests/rules-review.test.sh:KINDS_WITH_SECTIONS`
- **Ресурс без обязательного раздела своего рода — расхождение.** — `projects/agent-kit/tests/rules-review.test.sh:missing_pitfalls`
- **Набор разделов объявлен на род и назван поимённо, а не выведен из образца.** — `projects/agent-kit/tests/rules-review.test.sh:sections_for`
- **Образец рода судится объявленным набором наравне с корпусом.** — `projects/agent-kit/tests/rules-review.test.sh:template_gaps`
- **Род, которому набор не объявлен, молчит, а не краснеет.** — `projects/agent-kit/tests/rules-review.test.sh:KINDS_WITHOUT_SECTIONS`
- **Пустой список долга называется вслух и с числом.** — `projects/agent-kit/tests/rules-review.test.sh:rules_without_pattern`
- **Правило без паттерна — расхождение.** — `projects/agent-kit/tests/rules-review.test.sh:rules_without_pattern`
- **Правило, чьи паттерны дерево пропустило при раскладке, паттерна не требует.** — `projects/agent-kit/assets/checks/check-specs.mjs:skippedPatterns`
- **Имя соседнего ресурса, названное прозой, проверяется наравне со ссылкой шапки.** — `projects/agent-kit/tests/rules-review.test.sh:unknown_neighbours`
- **Запреты текстов действуют и внутри блока кода.** — `projects/agent-kit/tests/texts.test.sh:domains_in`
- **Адресом конкретного дерева считается перечисленное, а не всё, что похоже на путь.** — `projects/agent-kit/tests/texts.test.sh:COMMON_SEGMENTS`
- **Вывод переносимого текста из сверки адресов старше нового требования.** — `projects/agent-kit/assets/checks/check-doc-paths.mjs:PORTABLE_DIRS`
- **Машинная половина краснеет только на считаемом.** — `projects/agent-kit/tests/rules-review.test.sh:suite_result`
- **Проверка текстов пакета стоит в наборе, который гоняется перед пушем.** — `projects/agent-kit/src/lib/assets.spec.ts:expectGreen`
- **Ревью читает семью целиком, а не файл по одному.** — `projects/agent-kit/assets/agents/rules-reviewer.md:Семья`
- **Роль возвращает находки и ничего не правит.** — `projects/agent-kit/assets/agents/rules-reviewer.md:tools`
- **Находка называет два места дословно и то, чем они расходятся.** — `projects/agent-kit/assets/agents/rules-reviewer.md:дословно`
- **Пробел ищется чтением, а не счётом привязок.** — `projects/agent-kit/assets/agents/rules-reviewer.md:Пробел`
- **Ревью зовётся двумя способами: командой вручную и машинной половиной в гейте.** — `.claude/commands/rules-review.md:ARGUMENTS`
- **Граф изображает ход правила и лежит в тексте самого правила.** — `projects/agent-kit/assets/templates/rule.md:mermaid`
- **Граф заводится каждому правилу, а не только ветвящемуся.** — `projects/agent-kit/tests/rules-review.test.sh:sections_for`
- **Граф правится тем же изменением, что и проза, которую он изображает.** — `projects/agent-kit/assets/agents/rules-reviewer.md:mermaid`
- **Таблица кодов отказа процедурой не считается.** — `projects/agent-kit/assets/checks/spec-contract.mjs:contractRows` — строка с числом во второй ячейке пропускается; сценарий SC-AK-688

- **Слово, объявленное словарём запретным, краснеет проверкой, а не вычиткой.** — `projects/agent-kit/assets/checks/check-glossary.mjs:forbiddenWords` — левая колонка читается из раздела словаря, а не перечисляется пакетом; сценарий SC-AK-690
- **Слово, у которого запрещено одно значение из двух, поиском не судится и называется вслух.** — `projects/agent-kit/assets/checks/check-glossary.mjs:HINT` — слово со скобочным уточнением уходит в перечень оставшегося читателю; сценарий SC-AK-691
- **Договорённость, ждущая своего домена дольше месяца, называется отдельным разделом вывода.** — `projects/agent-kit/assets/checks/spec-proposed.mjs:STALE_PROPOSED_DAYS` — порог в сутках; сценарий `SC-AK-807`
- **Возраст договорённости берётся из истории, а не со времени файла на диске.** — `projects/agent-kit/assets/checks/spec-proposed.mjs:lastCommits` — один проход по истории каталога спеков; сценарий `SC-AK-807`
- **Отказом это не делается.** — `projects/agent-kit/assets/checks/spec-proposed.mjs:staleProposed` — раздел печатается после перечня расхождений и кода возврата не меняет; сценарий `SC-AK-808`
- **Текст для владельца пишется словами продукта, а не словами слоя правил.** — `projects/agent-kit/assets/rules/doc-style.md:продукта` — статья раздела «Тексты для человека»; сценарий `SC-AK-837`
- **Из задачи видно, что сломалось у человека, а не только где красная проверка.** — `projects/agent-kit/assets/patterns/doc-style-human.md:Задача` — образцы «так» и «не так»; сценарий `SC-AK-837`
- **Страдательный залог и метафоры в этих текстах не пишутся.** — `projects/agent-kit/assets/patterns/doc-style-human.md:въехало` — образец «так» и «не так» на месте; сценарий `SC-AK-837`
- **Язык этих трёх текстов не проверяет ничто.** — Не проверяется ничем: задача живёт на хостинге, ответ в чате в дерево не ложится, описание заявки читает человек. Держит это раздел «Тексты для человека» правила `doc-style`.
