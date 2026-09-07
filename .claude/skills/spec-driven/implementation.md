# spec-driven — как это устроено здесь

Имена этого дерева при правиле `SKILL.md` рядом. Отдельный файл потому, что правило говорит
приёмом и переносится между репозиториями целиком, а всё, что ниже, верно только здесь и
устаревает при каждом переименовании.

Здесь дерево не только применяет слои документации, но и производит их: пакет `@rt-tools/agent-kit`
везёт законы, правила и паттерны другим репозиториям, а это дерево — первый их потребитель.
Поэтому правку правила надо читать дважды: как правку своего текста и как правку того, что
уедет чужим деревьям.

## Как это называется здесь

- **В правиле** — Здесь
- **закон** — файл в `docs/constitution/`, разложенный из пакета
- **правило** — `.claude/skills/<имя>/SKILL.md` с шапкой `kind: rule` и объявленным законом
- **паттерн** — `.claude/skills/<правило>-<что>/SKILL.md` с шапкой `kind: pattern`
- **имена дерева при правиле** — `implementation.md` рядом с правилом — этот файл и есть его образец
- **спек домена** — каталог в `docs/specs/<пакет>/` — `spec.md`, `scenarios.md`, `implementation.md`; договорённость незакрытой работы лежит в `proposed/<фича>/` рядом
- **принятое решение** — файл в `docs/adr/`
- **надстройка проекта** — файл в `.claude/rt-kit/overrides/<ресурс>`, сливается с текстом пакета по разделам `## `

## Где это лежит

- **исходники законов и правил** — `projects/agent-kit/assets/` — `laws/`, `rules/`, `patterns/`, `hooks/`, `templates/`
- **раскладка и её проверка** — `projects/agent-kit/src/lib/` — `sync.ts`, `plan.ts`, `sections.ts`, `companion.ts`
- **выбор дерева** — `.claude/rt-kit.json` — раскладка по родам и список того, от чего дерево отказалось
- **надстройки** — `.claude/rt-kit/overrides/`
- **шаблоны правила, паттерна, имён** — `.claude/rt-kit/templates/`
- **указатель законов на входе сессии** — `.claude/hooks/constitution-index.sh`

## Где исполняются статьи

Первая колонка — статья дословно, как она написана в разделе «Как закон применяется здесь»
(жирная часть пункта). Статья без строки и строка без статьи — расхождение: правило обещает
то, чего в дереве нет, либо в дереве стоит то, о чём правило молчит.

- **The set of spec sections is fixed in advance, and a missing section is a refusal.** — `tools/check-specs.mjs:REQUIRED_HEADINGS` — состав разделов спека домена. У правил и паттернов набор задан шаблонами в `.claude/rt-kit/templates/` и отказом не держится.
- **Every statement is bound to a place in code, and the link is checked both ways.** — `tools/check-specs.mjs:checkRuleImplementation` — статья без строки и строка без статьи называются обе.
- **A binding does not lead into code nobody calls:** — `tools/spec-anchors.mjs:codeOf` — комментарии вычищаются, и символ, объявленный в своём файле и больше нигде не встречающийся, называется мёртвой привязкой.
- **A "not carried out" binding moves together with its article.** — `tools/check-specs.mjs:checkRuleImplementation` — сверка называет привязку без пункта, и снятая порознь строка компаньона краснеет именно здесь.
- **The procedure table is checked against the decorators both ways, the permission together with the name.** — **Не применимо.** Процедур серверной стороны в дереве нет. Ближайшее исполнение на другом предмете: `tools/verify-ui-kit-v2-docs.cjs` сверяет таблицы входов с самими компонентами.
- **There are two layers of laws, and a law name is one for both.** — `tools/check-specs.mjs:laws` — общий слой в корне конституции, закон приложения в `application/`; имя в оба слоя одно.
- **Portable text speaks of a neighbouring resource conditionally and names it by name.** — **Не проверяется ничем.** Безусловную фразу о соседнем ресурсе машине не отличить от условной: обе — проза.
- **An article of a rule speaks of its own applicability itself, by a sign line at its side.** — `.claude/hooks/rule-article.sh:rt_rule_articles` — признаки читаются по всему файлу правила, образец сверяется с путём правки средствами оболочки.
- **An article without a sign is legitimate, and so is a rule without a single sign.** — `.claude/hooks/rule-article.sh:rt_rule_article_marks` — не нашлось ни одного признака, печатается пусто, и зовущий остаётся при прежнем отказе.
- **A pattern is found by the `rule:` field, not by the name prefix.** — `tools/check-specs.mjs:patterned` — паттерны собираются полем шапки, и правило без единого паттерна называется.
- **A decision from a spec goes to the layer, not to the archive.** — **Не проверяется ничем.** Отличить действующее требование от рассказа о состоявшемся может только тот, кто спросит, останется ли это верным завтра.
- **A name in an anchor is written as declared in code.** — `tools/spec-common.mjs:ANCHOR` — решётка перед именем принимается; имя без неё помнится наравне с ним самим в `tools/spec-anchors.mjs:symbolOwners`.
- **An anchor is checked against the raw text of the file, and a comment counts the same as code.** — `tools/spec-anchors.mjs:fileHasSymbol` — существование символа ищется словом по всему файлу, а живость считается только у объявленного в коде.
- **A refusal code is accepted only if the domain throws it.** — Не применимо: серверной стороны и кодов отказа в дереве нет.
- **A spec has one scenario prefix, and across the whole tree it is taken by that spec alone.** — `tools/check-specs.mjs:prefixOwners` — `SC-AK` у `docs/specs/agent-kit/`, `SC-UKV` у `docs/specs/ui-kit-v2/`.
- **A scenario number is issued once and never reused.** — `tools/check-specs.mjs:parseScenarios` собирает номера домена, но повторную выдачу не судит: номер, отданный второму сценарию, для неё такой же законный. Держится чтением и разбором PR.
- **A scenario and the title of its test are edited by one change.** — `tools/check-specs.mjs:collectReferences` видит только пропавшую ссылку; заголовок, оставшийся при изменившемся обещании, зелёный. Держится разбором.
- **A subdomain is asked the same as a domain.** — `tools/check-specs.mjs:collectSpecDirs` — поддомены есть у трёх доменов: шесть у пакета правил, три у второго кита, четыре у приёмника; обязательные разделы и компаньон спрашиваются у них наравне с доменом.
- **A proposed law requires no rule.** — `tools/check-specs.mjs:isProposedLaw` — признак читается строкой статуса в самом законе.
- **A law has a mandatory "Articles" section, and beyond it holds only open questions.** — `tools/check-specs.mjs:LAW_HEADINGS` — отсутствие раздела статей называется; законы правятся в `projects/agent-kit/assets/laws/`, форма держится там.
- **A law that names a project file is a refusal.** — `tools/check-specs.mjs:CONSTITUTION_DIR` — каждый файл конституции проверяется на путь с расширением в обратных кавычках.
- **A rule description is no longer than three hundred characters and answers one question — load this rule or not.** — `tools/check-descriptions.mjs:main` — считает знаки описания у каждого скила, предел `LIMIT`; принятый долг читается из `.claude/rt-kit/description-debt.json`. Смысл описания при этом не судит никто.
- **A rule declares the law it is written under.** — `tools/check-specs.mjs:law` — правило без поля `law` в шапке называется, и закон без единого правила тоже.
- **A divergence between a rule and its companion is resolved in favour of the rule.** — **Не проверяется ничем.** Согласие двух текстов между собой не считает нигде и ничто: раскладка сверяет копию с источником, а не смысл одного текста со смыслом соседнего
- **A companion's statement about the state of an external service is checked by the command the companion itself names.** — **Не проверяется ничем.** Сверка путей читает адреса в дереве, а состояние соседней службы живёт у соседа; спросить его может только вызов, и делает это исполнитель
- **A rule may have a third file, and what is not read when deciding goes there.** — `projects/agent-kit/src/lib/config.ts:PITFALLS_FILE` — имя третьего файла; `projects/agent-kit/src/lib/assets.ts:targetOf` кладёт его рядом с правилом, `projects/agent-kit/src/lib/cascade.ts:pitfallsCutByRules` снимает вслед за отказанным правилом.
- **A spec declares the laws it applies, and the link is checked both ways.** — `tools/check-specs.mjs:checkSpecLaws` — строка `**Законы:**` в `spec.md` сверяется с законами, названными в тексте спека.

- **A check nailed to a resource name breaks when the resource is split, and this has to be known before the edit.** — **Не проверяется.** Имена ресурсов стоят в `tools/check-states.mjs`, `tools/check-state-next.mjs` и в пробах наборов под `projects/agent-kit/tests/`; отличить прибитое к имени упоминание от законного машине нечем — ищется оно поиском по всему дереву перед делением

- **The first column of the companion is the article text copied, not retold.** — **Не проверяется.** `tools/check-specs.mjs` ищет статью по её тексту и краснеет на ненайденной; строка, стоящая при верной статье и описывающая не её, для проверки неотличима от верной

## Что ещё стоит знать при чтении кода

- Разложенный файл несёт шапку `rt-kit v… · <ресурс> · <сумма>` и руками не правится: правка на
  месте теряется на следующей раскладке, а `agent-kit sync` на неё отказывает и не пишет ничего
  вовсе — ни этот файл, ни остальные.
- Проект дописывает свой раздел надстройкой в `.claude/rt-kit/overrides/<ресурс>`; слияние идёт
  по разделам `## `, поэтому правки пакета доезжают во все разделы, которых дерево не трогало.
- Пока в `implementation.md` стоит метка незаполненного места, правило считается неразвёрнутым:
  проверка раскладки отказывает, а агент читает указание, которому здесь нечего назвать.
- Гейт правил не даёт править файл, пока не загружено правило, под которое он подпадает. Карта
  «файл — правило» этого дерева — `.claude/rt-kit/gate-map.sh`.
- **Приватное поле привязкой не бывает: образец сверки принимает символ, начинающийся с буквы
  или подчёркивания.** Правило устройства кода велит писать приватное поле решёткой, и правило,
  исполняемое таким полем, приходится привязывать к публичному входу, который это поле зовёт.
  Отказ при этом говорит «пустая привязка» — то же слово, что и при вовсе не заполненной
  строке, поэтому по тексту отказа промах не отличить от незаполненного места.
- **Строка таблицы в разделе контракта читается сверкой как процедура.** Доводы команды строки
  запуска, поставленные таблицей, сверка ищет среди объявленных процедур — и печатает по
  расхождению на каждый: четыре на ровном месте. Список вместо таблицы этого не даёт, и знать
  это надо до того, как раздел написан, а не по отказу сверки.
- **Пробел внутри обратных кавычек ломает привязку молча.** Ровняя колонки таблицы, легко
  дописать пробелы перед закрывающей кавычкой; образец их не принимает, а выравненная строка
  выглядит верной. Пробелы ставятся за кавычкой, а не под ней.

## Чем это проверяется

- `pnpm run agent-kit:check` — разложенное сходится с пакетом, надстройкой и заполненностью
  файлов имён.
- `pnpm run agent-kit:sync` — раскладка; отказ хотя бы по одному файлу не пишет ничего.
- `pnpm exec nx test @rt-tools/agent-kit` — спеки самой раскладки: выбор, слияние разделов,
  решение о судьбе файла.

- **Свободный номер сценария ищется во всех ветках.** — `tools/spec-next-id.mjs:main` — читает заголовки сценариев в своих и удалённых ветках и печатает первый свободный за наибольшим занятым; зовётся `npm run spec:next-id [<префикс>]`
