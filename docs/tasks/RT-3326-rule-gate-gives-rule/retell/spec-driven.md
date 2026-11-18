# spec-driven — the retelling

The cases and the decisions of the reader who saw only the shortened hot part are kept in the
progress of the task; below is the reply of `goal-critic` verbatim, round by round.

## Round 1 — the hot part of 2 977 bytes

**Итог: цель выполнена частично, смысл потерян.** Сокращённая горячая часть `spec-driven` даёт иные решения, чем прежний текст, в случаях 1 и 2. Случай 3 совпал.

| Слова владельца | Что показывает результат | Выполнено |
|---|---|---|
| «ужимай горячую часть правил до 3000 знаков» | `SKILL.md` занимает 2 977 байт, в нём остались только утверждения статей | да |
| «убедись что смысл при этом не теряется», случай 1 (SC-AK-1669, изменилось обещание) | Номер сохраняется, заголовок теста правится той же правкой. С прежним текстом совпадает | да |
| то же, случай 1 (SC-AK-1224 заменён новым сценарием) | Читатель допускает «retitled» старого теста под новый номер. Прежний текст требует удалить тест вместе со сценарием. Пробел про пометку «superseded» прежний текст закрывал | нет |
| то же, случай 1 и 2 (выбор свободного номера) | Читатель берёт «next unused» сам, не спрашивая команду дерева | нет |
| то же, случай 2 (привязка к функции, которую зовут только тесты) | Читатель запрещает такую привязку без исключений. Прежний текст делает исключение для символа, который пакет публикует наружу | нет |
| то же, случай 2 (места в коде нет) | Читатель пишет в спутнике строку «not carried out». Прежний текст для правила спеки велит открытый вопрос спеки | нет |
| то же, случай 3 (спутник, история инцидентов, требование в холодной части) | Первый столбец копируется дословно в той же правке, история уходит в холодную часть, требования там нет. С прежним текстом совпадает | да |

**Где разошлось, с цитатами прежнего текста** (`sd-former.md`):

1. **Случай 1, заменённый сценарий.** Прежний текст, строки 128–130: «the scenario deleted — the test is deleted too. Having drifted apart, they leave the run green while it checks something else.»
   - Читатель же пишет: «Its test is retitled or rewritten under the new number». Если переименовать старый тест, его тело проверяет отменённое обещание под новым номером. Именно этот случай прежний текст запрещает.
   - Пробел читателя «does not say whether a superseded marker stays at 1224» прежний текст закрывал, строка 122: «the deleted number's place stays empty».
2. **Случаи 1 и 2, свободный номер.** Прежний текст, строки 125–127: «The free number is asked of the tree's command before the scenario heading is written, and the companion names that command: the main branch alone does not show numbers neighbouring work holds on disk.»
   - Читатель этого шага не делает и берёт номер по тому, что видит, хотя ветка main не показывает номера, которые заняла соседняя работа.
   - Команду называет только спутник: `/Users/eyhenij/WebstormProjects/rt-tools/.claude/skills/spec-driven/implementation.md:21`, `pnpm run spec:next-id <PREFIX>`. Из горячей части путь к ней пропал.
3. **Случай 2, исключение для привязки.** Прежний текст, строки 102–103: «The exception is a symbol declared in the suite harness itself or published outward by a package — there the caller is the test or the consumer by the very purpose of the file.»
   - `@rt-tools/agent-kit` публикует всё из `src/lib/assets.ts` через `export *` (`projects/agent-kit/src/index.ts:1`, `package.json:33-35`).
   - В варианте «только тесты» читатель прежнего текста принял бы привязку к `targetOf`, а читатель нового её запрещает.
   - Сейчас это на деле не мешает: `targetOf` зовёт код раскладки (`projects/agent-kit/src/lib/sync.ts:194,233`).
4. **Случай 2, места в коде нет.** Прежний текст, схема хода, строка 81: «a spec rule: the spec's open questions». Строку «not carried out» прежний текст держит за статьями правил, а утверждение спеки идёт в открытый вопрос `Q-…`. Так это и сделано в дереве: `docs/specs/agent-kit/edit-place/spec.md:212` (`Q-EP-2`).
   - Читатель же говорит: «record the binding as "not carried out"». Это действие придумано выводом, и прежний текст для спеки его не предусматривает.

**Что сокращение сузило и выбросило.** Выброшены:
- исключение «published outward by a package / suite harness»;
- шаг «free number is asked of the tree's command»;
- «the scenario deleted — the test is deleted too» и «the deleted number's place stays empty»;
- развилка схемы «rule article: verdict line / spec rule: open questions»;
- «A product agreement is numbered together with the spec it will merge into, and the prefix does not become taken by it». На решения в этих случаях последнее не повлияло, но без него новая формулировка «taken by no other spec» читается как запрет на `proposed/` с префиксом SC-AK.

Лишнего не добавлено.

**Самый короткий шаг на каждый промах.** Каждый пункт вернуть к статье (не в холодную часть), как велит прежняя строка 271: «They diverged — surplus was removed, and it comes back at the article, not to the cold part»:
- к «A scenario number is issued once…» дописать: «The free number comes from the command the companion names; a deleted number stays empty.»;
- к «A scenario and the title of its test…» дописать: «A deleted scenario takes its test with it.»;
- к «A binding does not lead into code nobody calls…» дописать: «Except a symbol of the suite harness or one a package publishes.»;
- к «A "not carried out" binding…» дописать: «A spec rule with no place in code goes to the spec's open questions.».

Затем проверить, что `SKILL.md` по-прежнему не больше 3 000 знаков (`wc -c`), и прогнать тот же пересказ заново.

Verdict (round 1): diverged

## Round 2 — the hot part of 2 999 bytes

Цель выполнена частично. По трём случаям решения читателя новой горячей части совпадают с решениями по прежнему тексту, расхождений нет. Но смысл потерян в местах, которые эти случаи не проверяют: ниже два таких места, и одно из них нарушает собственную статью правила.

| Слова владельца | Что показывает результат | Выполнено |
|---|---|---|
| «ужимай горячую часть правил до 3000 знаков» | `wc -c .claude/skills/spec-driven/SKILL.md` даёт 2999. Холодная часть: `pitfalls.md` (6153 байта) и `pitfalls-2.md` (23015 байт) | да, для `spec-driven` |
| «убедись что смысл при этом не теряется» — случай 1 | Совпадает: номер SC-AK-1669 сохраняется, заголовок теста правится в той же правке, SC-AK-1224 удаляется вместе с тестом, его номер остаётся пустым, новый номер берётся у команды | да |
| то же — случай 2 | Совпадает: строка привязки с дословной первой колонкой, проверка в обе стороны; подобласть проверяется как домен; один префикс общий с договорённостью; номера берутся у команды; функцию, которую вызывают только тесты, привязывать нельзя, кроме обвязки набора и публикуемого символа; имя пишется как объявлено, ищется по сырому тексту; утверждение без места в коде уходит в открытые вопросы | да |
| то же — случай 3 | Совпадает: первая колонка спутника переписывается дословно, до этого работа идёт по правилу, история инцидентов уходит в третий файл, требование там жить не может | да |
| то же — вне трёх случаев | Требования раздела «The shape of a compressed article» теперь стоят только в холодной части (`pitfalls-2.md:238-273`). Прежняя статья это запрещает | нет |

**Случаи по отдельности**

- **Случай 1.** Прежний текст говорит: «The promise changed — the number stays, and the test title is edited by the same commit; the scenario deleted — the test is deleted too» и «does not take a deleted one — the deleted number's place stays empty». Это те же действия, что у читателя.
  - Пробелы, которые назвал читатель, прежний текст тоже не закрывал. Слово «superseded» там не определено. Про заголовок, который ещё подходит, сказано так же категорично: «edited by the same commit».
- **Случай 2.** Прежний текст: «A product agreement is numbered together with the spec it will merge into», «A new one takes the next free number; it is not inserted in the middle», исключение «a symbol declared in the suite harness itself or published outward by a package», схема «a spec rule: the spec's open questions». Всё совпадает.
  - Пробел про судьбу сценариев, когда утверждение ушло в открытые вопросы, прежний текст тоже оставлял открытым.
- **Случай 3.** Прежний текст закрывал этот случай прямо: «The key of the link is the statement text itself, so it cannot be reworded with the binding forgotten». Новый текст закрывает его только выводом читателя, но действие получилось то же.
  - «until then the work goes by the rule» — совпадает.
  - «The cold part holds explanation, not requirement» — совпадает.
  - Пробел про деление между `pitfalls.md` и `pitfalls-2.md` новый: в прежнем тексте второго файла нет, так что это не расхождение.

**Что сужено, выброшено или добавлено**

1. **Выброшено из горячей части, и это нарушает собственную статью правила.** Требования формы сжатия больше не стоят в горячей части: «What stays at the article is the statement and what it reads wrong without», «An argument folds to one line», «An incident analysis leaves for the cold part whole, with its numbers and rejected options», «Compression is judged by retelling», «Room is measured before an article is added… compressed in the same edit». Прежний текст это прямо запрещает: «A statement absent from the rule never lives there: a rule whose requirement lives in the cold part promises what the session loading it will not see».
   - Случай 3 этого не поймал. Читатель не сказал «целиком, с числами и отвергнутыми вариантами» и не сказал «сжать в той же правке». Противоположного действия он тоже не выбрал.
2. **Сужено.** Статья о расхождении правила и спутника потеряла слова «A divergence found is named to the owner and fixed in the text that fell behind». В случае 3 расхождение создаёт сама сессия, поэтому действие не разошлось. На расхождении, найденном в чужом тексте, оно разойдётся (это гипотеза, ниже).
3. **Сужено.** Про описание правила длиннее предела выпали слова «what is left longer than the limit is named in the accepted-debt list by name, with a reason».
4. **Добавлено.** Второй файл холодной части `pitfalls-2.md` и строка «Cold part: `pitfalls.md`, `pitfalls-2.md`». Прежний текст знал только `pitfalls.md`.

**Кратчайший шаг на каждый промах**

1. **Форма сжатия.** Вернуть в горячую часть одну статью-утверждение, например «A compressed article keeps its statement and boundary; an argument folds to one line; an incident analysis leaves for the cold part whole.». Либо явно перенести эти требования в паттерн `spec-driven-rule` и назвать его в статье. Затем повторить пересказ на случае «правило выросло — что вырезать».
2. **Расхождение правила и спутника.** Дописать к «Where a rule and its companion diverge, the rule wins.» хвост «Named to the owner; the lagging text is fixed».
3. **Описание длиннее предела.** Дописать к статье об описании «Over the limit — named in the accepted-debt list».

**Гипотезы, которые стоит проверить**
- **Чужое расхождение.** Дать читателю только горячей части случай «спутник чужого правила разошёлся с правилом». Ожидается, что он не сообщит владельцу.
- **Правило у предела размера.** Дать случай «правило у предела, нужно добавить статью». Ожидается, что он не станет мерить `wc -lc` до правки и не станет сжимать в той же правке.

Verdict (round 2): matched on the three cases, with three losses outside them; they came back at their articles, and round 3 tests them

## Round 3 — the hot part of 3 000 bytes

Цель достигнута в пределах трёх случаев этого раунда. Ни один случай не разошёлся с решением читателя прежнего текста. Три потери второго раунда вернулись в статьи, и читатель их применил.

| Слова владельца / случай | Что прежний текст требует (цитата) | Что решил читатель только горячей части | Совпало |
|---|---|---|---|
| «смысл не теряется»: случай 1, сопутствующий файл соседнего правила разрешает повторный номер | «A new one takes the next free number; it is not inserted in the middle and does not take a deleted one»; «The free number is asked of the tree's command… and the companion names that command»; «A divergence found is named to the owner and fixed in the text that fell behind, and until then the work goes by the rule.» | Берёт новый номер у команды, которую называет сопутствующий файл. Удалённые номера не занимает. Правило главнее. Владельцу называет строку, отставший текст исправляется. | да |
| случай 2: горячая часть 2 990 из 3 000, нужна новая статья | «Room is measured before an article is added… a rule near either limit is compressed in the same edit»; «What stays at the article is the statement and what it reads wrong without»; «An argument folds to one line»; «leaves for the cold part whole»; «The cold part holds explanation, not requirement»; «Compression is judged by retelling» | Сначала меряет. Место освобождает той же правкой. Утверждение и границу оставляет. Довод сворачивает в строку или переносит в холодную часть целиком. Утверждение в холодную часть не уносит. Сжатие судит пересказом. | да |
| случай 3: описание правила в 340 знаков с пересказом статей | «no longer than three hundred characters and answers one question — load this rule or not»; «what is left longer than the limit is named in the accepted-debt list by name, with a reason» | Не больше 300 знаков, отвечает только «грузить или нет». Пересказ статей неверен по сути. Длиннее можно только записью в списке долга с причиной. | да |

**Что сузилось, выпало или добавилось.** Действия ни в одном случае не изменились. Ниже то, что читатель назвал пробелом, хотя прежний текст его закрывал. На решение это не повлияло, поэтому расхождением не считаю.
- **Чем мерить.** Прежний текст: «The measurement is two numbers from `wc -lc` against the limits the check prints». Там же: «the size check judges lines and characters apart». В горячей части осталось только «Room: measured first». О пределе по строкам там нет ни слова. Читатель мерил только байты. В этом случае это ничего не меняет: упираемся в байты. Но правило, которое близко к пределу по строкам, такой читатель может пропустить.
- **Что считается границей статьи.** Прежний текст перечисляет: «The boundary, the exception, the applicability sign, the name of whoever guards it». В горячей части осталось «statement and boundary». Читатель сам отнёс исключение к границе. Знак применимости (`rt-when`) случай не проверял.
- **Куда возвращается лишнее, если пересказ разошёлся.** Прежний текст: «it comes back at the article, not to the cold part». В горячей части этого нет. Случай этот шаг не проверял.
- **«Третий файл» и два файла pitfalls.** Читатель увидел тут двусмысленность, но решил верно: холодная часть и есть третий файл.

Остальные пробелы читатель назвал правильно, и прежний текст их тоже оставляет открытыми, так что это не расхождения:
- кто чинит сопутствующий файл чужого правила;
- где лежит список долга и кто одобряет запись;
- кто пересказывает и что считать пройденным пересказом.

**Самые короткие шаги.** Обязательных нет. По желанию, чтобы закрыть первую мягкую потерю: дописать в хвост статьи о сжатой статье «lines and characters, `wc -lc`» (примерно +30 байт, их придётся освободить в другом месте). Вторая потеря закрывается так: «boundary» заменить на «boundary, exception, sign».

**Источники.**
- /Users/eyhenij/WebstormProjects/rt-tools/.claude/skills/spec-driven/SKILL.md (3 000 байт по `wc -c`), строки статей о номере сценария, о расхождении, об описании и о сжатой статье.
- /private/tmp/claude-501/-Users-eyhenij-WebstormProjects-rt-tools/05592134-9b75-47c1-bc3e-50d988cba4dd/scratchpad/sd-former.md: статьи о номере сценария, об описании и о расхождении; разделы «The shape of a compressed article» и «What of the law is not here».
- /private/tmp/claude-501/-Users-eyhenij-WebstormProjects-rt-tools/05592134-9b75-47c1-bc3e-50d988cba4dd/scratchpad/sd-decisions3.md

**Гипотеза, которую стоит проверить.** Если дать читателю горячей части правило с запасом по байтам, но у предела по строкам, он, вероятно, не сожмёт его в той же правке. Проверить отдельным случаем.

After this verdict the two soft losses it named came back at the compressed-article statement, and seven statements were shortened to make room; the hot part is 2 997 bytes, and the meaning check finds nothing of the former text missing.

Verdict: matched
