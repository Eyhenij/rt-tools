# Сверка спеков и адресов — где исполняются правила

Первая колонка — правило дословно, как оно написано в разделе «Правила» спека рядом. Правило без
строки и строка без правила — расхождение: спек обещает то, чего в коде нет, либо в коде стоит
то, о чём спек молчит.

Якорь здесь — слово, которое утверждение и держит. Сверка ищет его по всему файлу и любым словом
удовлетворяется, поэтому имя поля из чужой строки проходит её так же, как нужное предложение, — и
утверждение остаётся зелёным, когда сам текст роли переписан целиком.

- **Поддомен сверяется наравне с доменом.** — `projects/agent-kit/assets/checks/check-specs.mjs:collectSpecDirs`
- **Предложенный закон правила не требует.** — `projects/agent-kit/assets/checks/check-specs.mjs:isProposedLaw`
- **Влитая договорённость ветку не запирает.** — `projects/agent-kit/assets/hooks/task-flow-draft-guard.sh:draft_path`
- **Префикс сценариев занят одним спеком по всему дереву.** — `projects/agent-kit/assets/checks/check-specs.mjs:prefixOwners`
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
- **Номер сценария выдаётся один раз и повторно не используется.** — `projects/agent-kit/assets/rules/spec-driven.md:spec-driven`
- **Сценарий и заголовок его теста правятся одним изменением.** — `projects/agent-kit/assets/patterns/spec-driven-domain.md:spec-driven-domain`
- **Правило, чьи паттерны дерево пропустило при раскладке, паттерна не требует.** — `projects/agent-kit/assets/checks/check-specs.mjs:skippedPatterns`
- **Вывод переносимого текста из сверки адресов старше нового требования.** — `projects/agent-kit/assets/checks/check-doc-paths.mjs:PORTABLE_DIRS`
- **Таблица кодов отказа процедурой не считается.** — `projects/agent-kit/assets/checks/spec-contract.mjs:contractRows` — строка с числом во второй ячейке пропускается; сценарий SC-AK-688
- **Договорённость, ждущая своего домена дольше месяца, называется отдельным разделом вывода.** — `projects/agent-kit/assets/checks/spec-proposed.mjs:STALE_PROPOSED_DAYS` — порог в сутках; сценарий `SC-AK-807`
- **Возраст договорённости берётся из истории, а не со времени файла на диске.** — `projects/agent-kit/assets/checks/spec-proposed.mjs:lastCommits` — один проход по истории каталога спеков; сценарий `SC-AK-807`
- **Отказом это не делается.** — `projects/agent-kit/assets/checks/spec-proposed.mjs:staleProposed` — раздел печатается после перечня расхождений и кода возврата не меняет; сценарий `SC-AK-808`
