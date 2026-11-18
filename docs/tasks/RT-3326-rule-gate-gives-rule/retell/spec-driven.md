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
