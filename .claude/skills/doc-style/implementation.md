# doc-style — как это устроено здесь

Имена этого дерева при правиле `SKILL.md` рядом. Отдельный файл потому, что правило говорит
приёмом и переносится между репозиториями целиком, а всё, что ниже, верно только здесь и
устаревает при каждом переименовании.

Тексты этого дерева читает не только тот, кто его правит: README и журнал изменений уезжают в
опубликованный пакет, а описание набора токенов — единственное место, где имена токенов вообще
перечислены.

## Как это называется здесь

- **В правиле** — Здесь
- **документ** — README пакета, `CONTEXT.md` компонента, `TOKENS.md`, решение в `docs/adr/`, план в `docs/plans/`, журнал изменений
- **пара «правка и её документ»** — компонент второго кита и `CONTEXT.md` рядом; токены оформления и `TOKENS.md`
- **отметка обхода** — строка `Docs-skip: <причина>` в теле коммита; пустая причина не принимается
- **словарь проекта** — `docs/GLOSSARY.md` — общую часть везёт пакет, предметную дописывает надстройка

## Где это лежит

- **законы** — `docs/constitution/` — разложены пакетом, руками не правятся
- **правила и паттерны** — `.claude/skills/<имя>/SKILL.md`, имена этого дерева при них — `implementation.md` рядом
- **принятые решения** — `docs/adr/`
- **планы работ** — `docs/plans/`
- **описание набора токенов** — `projects/ui-kit/src/styles/TOKENS.md`
- **описание компонента** — `CONTEXT.md` рядом с компонентом второго кита
- **перечень непокрытого** — `UI-KIT-V2-ISSUES.md`
- **гард пары** — `.claude/hooks/docs-guard.sh`, пары — в `.claude/rt-kit/project.sh`
- **словарь проекта** — `docs/GLOSSARY.md` — разложен пакетом, предметные разделы — надстройкой
- **сверка адресов** — `tools/check-doc-paths.mjs`, настройка — `tools/rt-kit-checks.config.mjs`

## Где исполняются статьи

Первая колонка — статья дословно, как она написана в разделе «Как закон применяется здесь»
(жирная часть пункта). Статья без строки и строка без статьи — расхождение: правило обещает
то, чего в дереве нет, либо в дереве стоит то, о чём правило молчит.

- **A path named in a document exists.** — `tools/check-doc-paths.mjs:checkDoc`, запуск — `npm run check:docs`
- **A bare name and a directory are judged the same as a full path.** — `tools/check-doc-paths.mjs:existsInTree`; дерево берётся у git — `tools/check-doc-paths.mjs:treeOfRepo`
- **The description of the past is excluded from the path check entirely.** — `tools/check-doc-paths.mjs:isSkipped` — `docs/archive/` и папки задач под `docs/tasks/`
- **Portable text is excluded from the address check, like the archive.** — `tools/check-doc-paths.mjs:isPortable`; исходники — `portableDirs` в `.claude/rt-kit/checks.json`, здесь это `projects/agent-kit/assets`
- **An index is kept for a directory people read through it, not by walking it.** — `.claude/rt-kit/checks.json:indexedDirs` — здесь список пуст и перебивает умолчание пакета: у описания прошлого указателя нет, записи ищут именем файла.
- **A directory index is checked against its contents from both sides.** — `tools/check-doc-paths.mjs:checkIndex`; какие каталоги сверяются — `indexedDirs` в `tools/rt-kit-checks.config.mjs`, здесь это архив
- **An index entry is named by its file name in backticks.** — `tools/check-doc-paths.mjs:PATH_IN_BACKTICKS` — из строки таблицы берётся первое имя в кавычках с расширением `.md`; во второй колонке стоит проза, и брать оттуда нечего.
- **A name mentioned only to say "it is gone" is listed in the exceptions by name.** — `tools/check-doc-paths.mjs:parseAllowlist`; сам список — `tools/doc-paths-allowlist.json`: имена правил линтера, куски кода, имена веток, порождённое сборкой
- **A document goes in the same commit as the change it describes.** — `.claude/rt-kit/project.sh:rt_docs_pair_for` — пары этого дерева; сторожит их `.claude/hooks/docs-guard.sh`, обход — строка `Docs-skip:` с причиной.
- **A file placed by the layout needs no pair.** — `.claude/hooks/docs-guard.sh:rt-kit` — признак читается шапкой раскладки в первых строках файла.
- **A document is no longer than the length limit.** — `tools/check-file-size.mjs:LIMIT` — предел общий с кодом и стилями; описание прошлого и папки задач из счёта выведены.
- **A record in the description of the past has an expiry, and after it the record is removed.** — `tools/check-archive-age.mjs:RETENTION_DAYS` — число суток приходит ключом `archiveRetentionDays` настройки проверок; здесь назначена неделя. Снимает записи `tools/archive-prune.mjs`, отбор у обеих один — `tools/archive-age.mjs:staleRecords`, а проверка зовёт его с запасом в сутки — `tools/archive-age.mjs:CHECK_GRACE_DAYS`. Проверка стоит в наборе гейта пуша и шагом конвейера.
- **A link to a record of the past in a live text lives exactly until the record's expiry.** — **Не проверяется ничем.** Проверка путей архив не читает, поэтому мёртвая ссылка краснеет не в нём, а в том тексте, который сослался. Так первая же чистка сломала две ссылки, и обе нашлись сверкой адресов.
- **A file leaving for the description of the past names its former address in its header.** — **Не проверяется ничем.** Проверка путей архив не читает вовсе, и промах там не краснеет никогда. Держится порядком переезда.
- **The glossary is edited where it is assembled, not where it is read.** — `.claude/hooks/glossary-load.sh:where` — вводная называет адрес правки сама: надстройка `.claude/rt-kit/overrides/docs/GLOSSARY.md`, куда идёт своё слово этого дерева; общая часть приезжает пакетом, а правку на месте отбивает `.claude/hooks/rule-source-guard.sh`
- **An override section replaces the package section of the same name entirely; it does not append to it.** — **Не проверяется ничем.** Слияние по разделу лежит в `projects/agent-kit/src/lib/sections.ts:mergeDocuments`, а того, что раздел заместил пакетный, не видит ни сверка раскладки, ни проверка словаря. Обе читают собранный вид
- **The working glossary and the screen language are two different vocabularies.** — **Не проверяется ничем.** Словарь везёт пакет, а подписи принадлежат дереву: списка своих экранных строк нет ни у одного, и искать в них слова левой колонки нечем.
- **A text naming the state of a machine goes stale without a single edit in the tree.** — **Не проверяется ничем.** Сверки читают дерево, а состарилась машина: утверждение о ней пишется способом её спросить.
- **A diagram is edited by the same change as the text it depicts.** — **Не проверяется ничем.** Схема набрана словами внутри того же файла, и отличить её расхождение с прозой можно только чтением обеих.

## Что ещё стоит знать при чтении кода

- Разложенные пакетом файлы (законы, правила, паттерны) правятся не на месте, а надстройкой в
  `.claude/rt-kit/overrides/<ресурс>`: правка на месте теряется на следующей раскладке, и
  раскладка на неё отказывает.
- Оставшаяся работа не записывается в документ, а заводится задачей на доске. Исключение —
  `UI-KIT-V2-ISSUES.md`: там перечень непокрытого, и он существует именно для того, чтобы долг
  был виден.
- Выпущенные разделы журнала изменений собираются из заголовков коммитов и не переписываются;
  правится только неизданный.
- Числа в текстах (сколько спек, сколько компонентов) стареют внутри одной ветки — рядом с
  числом называется день, на который оно верно.

## Чем это проверяется

- `.claude/hooks/docs-guard.sh` на коммите — только те пары, где связь механическая.
- `npm run check:docs` — адреса, названные в текстах, и полнота указателя архива.
- `pnpm run agent-kit:check` — разложенное сходится с пакетом и надстройкой.
- Разбором: всё остальное в этом правиле машина не проверяет.
