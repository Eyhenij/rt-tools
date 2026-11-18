# doc-style — the retelling

Under each round stand its cases, given to a reader who saw only the hot part, and then the
reply of `goal-critic` verbatim.

## Round 1 — the hot part of 2 994 bytes

**Cases.**

Case 1. You move a document `docs/plans/old-plan.md` into the archive. A live README links to it by path, and a personal draft covered by `.gitignore` also links to a file that no longer exists. Separately, a spec has grown to 340 lines against the prose limit of 330. What do you do with the moved file, the README link, the draft link and the spec?

Case 2. The tree wants to add one article of its own to the laid-out doc-style rule, and also to change one word of the glossary `docs/GLOSSARY.md`, which carries a layout header. Where does each edit go, under which heading, and what happens if the tree puts its article under the package heading «How the law applies here»? Should you edit the files with `sed`?

Case 3. Right after editing a spec you write the PR description and a new task in the queue for the owner. A sentence you drafted: «Работа передана, красное пролезло в прогон, договорённость слита». In which language and words do you write, and what does the task have to show? Also: you want to write in a trap of a rule «Node 20 is installed on this machine». How do you write that?

Case 4. An archive record is past its expiry while you push an unrelated branch, and a live rule text links to that record by its address. What do you do with the record and with the link, and how does the PR body treat the removal?

**The critic.**

Цель выполнена частично. Две статьи потеряли смысл, и это изменило решения читателя в случае 3: в ответе для владельца он оставил слова слоя правил, а в ловушке написал команду без значения, с которым сверять её ответ. Случаи 1, 2 и 4 по действиям совпали с прежним текстом.

| Слова владельца | Что показывает результат | Выполнено |
|---|---|---|
| «ужимай горячую часть правил до 3000 знаков» | `wc -c .claude/skills/doc-style/SKILL.md` = 2994 | да |
| «убедись что смысл при этом не теряется» | случаи 1, 2, 4 совпали; в случае 3 два расхождения | нет |

**Случай 1: совпал.**
- Перенесённый файл называет прежний адрес в заголовке, как в прежнем ds-former.md:143.
- Ссылку в README читатель заменил словами о решении, как в ds-former.md:197.
- Черновик под `.gitignore` не судится, как в ds-former.md:60-62.
- Спеку читатель делит. Прежний текст уточнял «is split into subdomains, the boundary is not moved» (ds-former.md:132). Читатель назвал это пробелом, но решил не ошибочно: деление на два документа порог не сдвигает. Это потеря уточнения, расхождением не считаю.

**Случай 2: совпал.**
- Статья дерева идёт в надстройку под `## This tree`. Этот заголовок не совпадает с разделами пакета (`.claude/rt-kit/overrides/rules/doc-style.md:1`).
- Последствие раздела с именем «How the law applies here» читатель описал верно (ds-former.md:159-162).
- Глоссарий правится там, где собирается; `sed` не годится.
- Пробел «где адрес надстройки» прежний текст закрывал отсылкой: «The companion of the rule names the override address» (ds-former.md:155-156). Читатель решил верно, но адреса не знал.

**Случай 3: разошёлся.**
1. В переписанной фразе остались «спеки», «в прогоне», «проверка», «договорённость». Прежний текст называл эти слова поимённо: «PR, run, suite, change size, agreement — those are the layer's words; in a text for the owner they are replaced with the ones the owner uses» (ds-former.md:220-222). В горячей части осталось только «uses the product's words, not the rules layer's» (SKILL.md:41), без списка. Читатель убрал страдательный залог и метафору, а слова слоя оставил.
2. Ловушку читатель записал как «Which Node runs here: `node --version`.», без значения для сверки. Прежний текст требовал: «the command and what to compare its answer with, instead of a snapshot of the answer» (ds-former.md:175-176). В горячей части осталось «written as the command asking it» (SKILL.md:32): вторая половина требования пропала.

**Случай 4: совпал.**
- Запись уходит отдельным коммитом, тело PR называет его не относящимся к изменению (ds-former.md:192).
- Ссылку в живом тексте читатель заменил словами (ds-former.md:197).
- Срок неделя плюс день проверки (ds-former.md:183, 315).
- Пробел «обязана ли ветка удалять запись» прежний текст закрывал: проверка «refuses whatever branch reaches it first» (ds-former.md:190-191). Читатель вывел то же действие.

**Что сузилось или выпало из горячей части; случаи этого не проверяли**
- «Untracked drafts are not judged» (SKILL.md:16) шире прежнего. Прежде не судились только файлы под `.gitignore` или `.git/info/exclude` (ds-former.md:60-61). Новый неотслеживаемый файл, который ещё не закоммичен, по новому тексту не судится, а по прежнему судится.
- Что считается путём: строка в обратных кавычках со слэшем или расширением; имя со слэшем, которое не адрес, пишется без кавычек (ds-former.md:23).
- Схема процесса (ds-former.md:39-54):
  - число в тексте пересчитывается командой в том же изменении или не пишется;
  - слова о проверке не пересказываются: проверку запускают;
  - новый термин добавляется в глоссарий тем же изменением или заменяется простым словом.
- Правило у потолка длины берёт новую статью только свёрткой довода или делением; числа порогов лежат в настройках проверок (ds-former.md:137-138).
- Строка индекса со ссылкой с заголовком допустима рядом с именем (ds-former.md:100-101).
- Раздел «What of the law is not here» (ds-former.md:246-280) целиком: что остаётся на авторе, а не на проверке. Сюда входят комментарии кода, заголовки PR и сообщения коммитов, ответ владельцу, список «сделать потом».
- Отсылка к правилу `status-report` о форме ответа о состоянии (ds-former.md:216). Из описания пропали паттерны `doc-style-sweep` и `doc-style-trace`.
- Чем заменять имя потребителя: «the application» или «the consumer» (ds-former.md:321-322).

Всё перечисленное лежит в холодной части `pitfalls-2.md` дословно (проверено grep по строкам 59, 130, 158, 173, 219). Но читатель горячей части без явного повода холодную не откроет.

**Кратчайшие шаги**
1. SKILL.md:41: добавить хвост «PR, run, suite, agreement are layer words.».
2. SKILL.md:32: дописать «…and the value to compare with.».
3. SKILL.md:16: заменить «Untracked» на «Gitignored».
4. Влезть в 3000 байт за счёт свёртки менее нагруженных хвостов, например SKILL.md:21 или 23. После правки заново прогнать случай 3 на новом читателе.

**Источники**
- `/Users/eyhenij/WebstormProjects/rt-tools/.claude/skills/doc-style/SKILL.md`
- `/private/tmp/claude-501/-Users-eyhenij-WebstormProjects-rt-tools/05592134-9b75-47c1-bc3e-50d988cba4dd/scratchpad/ds-former.md`
- `/private/tmp/claude-501/-Users-eyhenij-WebstormProjects-rt-tools/05592134-9b75-47c1-bc3e-50d988cba4dd/scratchpad/ds-decisions1.md`
- `/Users/eyhenij/WebstormProjects/rt-tools/.claude/skills/doc-style/pitfalls-2.md`
- `/Users/eyhenij/WebstormProjects/rt-tools/.claude/rt-kit/overrides/rules/doc-style.md`

**Гипотеза**
Если «живой текст правила» в случае 4 — разложенный файл, ссылка в нём вне проверки адресов (ds-former.md:76), а правится он надстройкой, а не на месте. Оба текста оставляют это одинаково открытым. Проверить: прогнать случай 4 с явно разложенным правилом.

Verdict (round 1): diverged

## Round 2 — the hot part of 2 996 bytes

**Cases.**

Case 1. Right after editing a spec you write a task in the queue and a PR description for the owner. Your draft: «Проверка в прогоне упала, договорённость слита в спеку, набор зелёный». Rewrite it and say what the task has to show. Also: you write in a rule's trap «Node 20 is installed on this machine». How do you write that instead?

Case 2. A spec file has 340 lines against a prose limit of 330. A new untracked file `docs/notes/x.md`, not yet committed and not in `.gitignore`, links to a missing path. In a README you write «the build takes 3.0 s» and «the size check passes». Also you introduce a new word «cargo-gate» in a rule. What do you do with each?

Case 3. A tree's rule is near its length ceiling and you need to add a new article. What may you do, and what not?

Case 4. A README names the path `docs/plans/old.md`, which was moved to the archive last week; a table row of a directory index names its entry only by a link with a title. What do you do with each?

**The critic.**

**Вердикт: цель выполнена частично.** Случаи 1 и 3 совпадают с решениями читателя прежнего текста. В случаях 2 и 4 есть по одному расхождению. Оба идут от одного выпавшего указания: горячая часть больше не называет `implementation.md`.

| Слова владельца / случай | Что показывает результат | Выполнено |
|---|---|---|
| «ужимай горячую часть правил до 3000 знаков» | `wc -c .claude/skills/doc-style/SKILL.md` → 2993 | да |
| «смысл при этом не теряется», случай 1 (текст владельцу, строка ловушки о машине) | Слова продукта; что сломалось у человека; без страдательного залога и метафор; описание PR на русском. Ловушка записана как «команда и ответ для сравнения». Всё как в прежнем тексте, стр. 172–176 и 219–243 | да |
| то же, случай 2: спека 340 строк, `x.md`, 3.0 s, «check passes» | Спека делится, предел остаётся. Файл без игнора проверяется. Число пересчитывается командой. Проверка запускается, а не пересказывается. Совпадает | да |
| то же, случай 2: новое слово «cargo-gate» | Читатель ответил «правлю там, где словарь собирается», но адреса не знает и сам назвал это пробелом. В прежнем тексте пробела нет: стр. 153–155 «The companion of the rule names the override address», стр. 29 «In this tree — the table in `implementation.md` next to it». Там же стр. 43: «Added to the glossary by the same change, or replaced with a plain word», и вариант «простое слово» читатель потерял | нет |
| то же, случай 3: правило у потолка | Свернуть довод или разделить правило, предел не поднимать, знаки считаются наравне со строками. Совпадает. Потеряны «only» и «next to it», стр. 137–138 | да |
| то же, случай 4: `docs/plans/old.md` | Решение названо словами, адреса архива нет. Совпадает со стр. 197 | да |
| то же, случай 4: строка оглавления | Читатель заменил ссылку с заголовком на имя в обратных кавычках. Ссылку он убрал и назвал пробелом, можно ли её оставить. Прежний текст, стр. 100–101: «A link with a title is legitimate and goes in the same row next to the name». Действие другое. Хвост «A titled link may join it» добавлен уже после ответа читателя, и повторно его никто не проверил. Не хватает и того, что в этом дереве `indexedDirs` пуст и проверка оглавлений не судит ни одной папки (прежний текст, стр. 298–300; `implementation.md:44`) | нет |

**Что сужено или выпало.** В горячей части по-прежнему нет следующего:
- Ссылки на `implementation.md`. Прежний текст, стр. 29: «In this tree — the table in `implementation.md` next to it». Без неё читатель не знает ни адреса словаря, ни что `indexedDirs` пуст.
- `.git/info/exclude` как равного `.gitignore` (стр. 61). В горячей части осталось только «Gitignored drafts».
- «or not written at all» для числа (стр. 50) и «or replaced with a plain word» для нового слова (стр. 43).
- «split into subdomains» (стр. 132) и «The numbers stand in the checks settings, not in the text» (стр. 137).
- «change size» в списке слов слоя (стр. 221).
- Весь раздел «What of the law is not here» (стр. 246–280). Код и комментарии шлюз не требует, ответ владельцу и тело коммита не читает ни одна проверка, выброшенное слово в заголовках PR держит автор.
- «A name with a slash that is no address goes without backticks» (стр. 23).

Добавленного сверх просьбы владельца нет.

**Кратчайшие шаги:**
1. В строке о холодной части горячей части назвать `implementation.md`. Например: «Here: `implementation.md`; cold: `pitfalls.md`, `pitfalls-2.md`.» Это несколько байт, в 3000 оно влезает.
2. К статье о словаре добавить хвост «or a plain word replaces it».
3. Заново прогнать читателя на случаях 2 (словарь) и 4 (строка оглавления) по текущей горячей части. Хвост о ссылке с заголовком пока не проверен.

**Источники:**
- `/Users/eyhenij/WebstormProjects/rt-tools/.claude/skills/doc-style/SKILL.md` (2993 байта)
- `/private/tmp/claude-501/-Users-eyhenij-WebstormProjects-rt-tools/05592134-9b75-47c1-bc3e-50d988cba4dd/scratchpad/ds-former.md`, стр. 23, 29, 43, 50, 59–62, 97–101, 129–141, 151–157, 219–243, 246–280, 296–301
- `/private/tmp/claude-501/-Users-eyhenij-WebstormProjects-rt-tools/05592134-9b75-47c1-bc3e-50d988cba4dd/scratchpad/ds-decisions2.md`
- `/Users/eyhenij/WebstormProjects/rt-tools/.claude/skills/doc-style/implementation.md:43-44,55`: `indexedDirs` пуст, адрес словаря `.claude/rt-kit/overrides/docs/GLOSSARY.md`
- `/Users/eyhenij/WebstormProjects/rt-tools/.claude/skills/doc-style/pitfalls-2.md`: выпавшие доводы лежат здесь целиком, стр. 41, 59, 99, 130, 135, 153, 292

**Гипотезы для проверки:**
- Читатель, которому назвали `implementation.md`, найдёт адрес словаря и пустой `indexedDirs`. Проверяется повторным прогоном читателя на случаях 2 и 4.
- «Gitignored» читатель может понять и как `.git/info/exclude`. Проверяется вопросом читателю про файл из `.git/info/exclude`.

Verdict (round 2): diverged

## Round 3 — the hot part of 2 998 bytes

**Cases.**

Case 1. You introduce a new word «cargo-gate» in a rule text. Where does the glossary edit go (name the file), and what is the other lawful option?

Case 2. A table row of a directory index names its entry only by a link with a title. What do you do with the row? Does any index check judge that directory in this tree at all?

Case 3. A personal draft listed in `.git/info/exclude` (not in `.gitignore`) links to a missing path; separately, a README says «the build takes 3.0 s», and you have no time to measure it again. What do you do with each?

This round's reader could read the companion too: the rules gate delivers the two together.

**The critic.**

Цель достигнута: ни в одном из трёх случаев читатель горячей части с компаньоном не поступил иначе, чем поступил бы читатель прежнего текста. Горячая часть всё же потеряла две оговорки, которые прежний текст закрывал. Читатель восстановил их сам и пометил как пробелы.

| Слова владельца | Что показывает результат | Выполнено |
|---|---|---|
| «ужимай горячую часть правил до 3000 знаков» | `wc -c .claude/skills/doc-style/SKILL.md` выдаёт 2998 | да |
| «убедись что смысл при этом не теряется», случай 1 (новое слово «cargo-gate») | Читатель кладёт правку в `.claude/rt-kit/overrides/docs/GLOSSARY.md` под заголовком, которого нет у пакета. Второй законный вариант у него — обычное слово. В прежнем тексте то же: «Added to the glossary by the same change, or replaced with a plain word», адрес надстройки даёт тот же компаньон. Пробел про правило самого пакета прежний текст тоже оставлял открытым | да |
| то же, случай 2 (строка указателя со ссылкой с заголовком) | Читатель дописывает имя файла в обратных кавычках и оставляет ссылку рядом. На вопрос, судит ли этот каталог проверка указателя, отвечает «нет», потому что `indexedDirs` пуст. В прежнем тексте: «A link with a title is legitimate and goes in the same row next to the name» и «`indexedDirs` in the checks config is empty». Действия совпадают | да |
| то же, случай 3a (черновик в `.git/info/exclude` с битой ссылкой) | Читатель считает черновик игнорируемым, ссылку не трогает и черновик не коммитит. В прежнем тексте: «a personal draft covered by `.gitignore` or `.git/info/exclude` is not read by the check». Действие то же. Пробел, который назвал читатель, прежний текст закрывал, но вывод читателя верный | да, с потерей формулировки |
| то же, случай 3b («the build takes 3.0 s», замерить некогда) | Читатель убирает число или заменяет его командой и ответом для сравнения. В прежнем тексте: «Recomputed by a command in the same change, or not written at all» и статья о состоянии машины «the command and what to compare its answer with». Совпадает. Пробелы «правка README не входит в изменение» и «дата рядом с числом из компаньона» прежний текст тоже оставлял открытыми | да, с потерей формулировки |

**Что сужено, выброшено или добавлено**

Ничего не добавлено.

Горячая часть по-прежнему теряет три вещи. Все три стоят в холодной части `pitfalls-2.md`.

1. **`.git/info/exclude`.** Прежний текст: «Only documents that go into the repository are judged: a personal draft covered by `.gitignore` or `.git/info/exclude` is not read by the check». В горячей части осталось только «Gitignored drafts aren't judged.» (`SKILL.md:16`). Читатель пришёл к верному действию через «treeOfRepo» и поведение git, но сам записал это как пробел. Другой читатель может пойти иначе.
2. **Вариант «не писать число вовсе».** Прежний текст: «Recomputed by a command in the same change, or not written at all». В горячей части остался только пересчёт (`SKILL.md:37`). Читатель вывел удаление числа из статьи о состоянии машины и из компаньона, а не из статьи о числах.
3. **Почему ссылка с заголовком не заменяет имя.** Прежний текст: «a row where the entry is named by a single link with a title is empty to it». В горячей части осталось «A titled link may join it» (`SKILL.md:22`). Решение читателя от этого не пострадало.

**Кратчайшие шаги**

Расхождений нет, поэтому обязательных шагов нет. Чтобы снять две пометки читателя:
- `SKILL.md:16`: «Gitignored drafts aren't judged.» заменить на «Untracked drafts (.gitignore, info/exclude) aren't judged.»;
- `SKILL.md:37`: дописать «, or not written».

Обе правки укладываются в лимит, если где-то в другом месте сократить около 30 байт.

**Источники**
- `/Users/eyhenij/WebstormProjects/rt-tools/.claude/skills/doc-style/SKILL.md:16,22,29,30,32,37`, всего 2998 байт (`wc -c`)
- `/Users/eyhenij/WebstormProjects/rt-tools/.claude/skills/doc-style/implementation.md:43-45,55,80-81`
- `/private/tmp/claude-501/-Users-eyhenij-WebstormProjects-rt-tools/05592134-9b75-47c1-bc3e-50d988cba4dd/scratchpad/ds-former.md:43,50,59-62,90-101,151-157,172-177,299`
- `/Users/eyhenij/WebstormProjects/rt-tools/.claude/skills/doc-style/pitfalls-2.md:41,48,59,99`: выброшенные формулировки на месте
- `/private/tmp/claude-501/-Users-eyhenij-WebstormProjects-rt-tools/05592134-9b75-47c1-bc3e-50d988cba4dd/scratchpad/ds-decisions3.md`

**Гипотезы**

Проверка `tools/check-doc-paths.mjs` на самом деле пропускает файлы из `.git/info/exclude`. Я этого не запускал. Проверить так: положить черновик с битой ссылкой и записью в exclude, затем выполнить `npm run check:docs`.

After this verdict both soft losses it named came back: drafts in `.git/info/exclude` are spared like ignored ones, and a number may be left unwritten instead of recomputed. The hot part is 2 998 bytes, and the meaning check finds nothing of the former text missing.

Verdict: matched
