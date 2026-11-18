# task-flow-handover — the retelling

Under each round stand its cases, given to a reader who saw only the hot part, as the gate gives it when a PR opens, leaves draft or merges, and then the
reply of `goal-critic` verbatim.

## Round 1 — the hot part of 1563 bytes

**Cases.**

Case 1. All stages are done. The task folder `docs/tasks/RT-7-x/` is still in the branch, the product agreement still sits in `docs/specs/app/proposed/x/`. You want to open the PR now and take the folder apart after the owner approves. What is the order, and what do you refuse?

Case 2. The pipeline wakes for PRs into the main branch only; your PR's base is an epic branch. Should the PR open as a draft or ready, and when do you ask the owner to merge? What do you tell the owner right after opening it?

Case 3. You want to skip taking the folder apart for a hotfix. How is that done lawfully, and what still reports it? Also: you deleted the folder instead of moving parts to the archive — what else must the branch carry?

Case 4. Right after opening the PR you plan to wait for the review before doing anything else, and to run the full test run before merging the agreement into the spec. What do you change?

**The critic.**

**Смысл потерян: горячая часть `task-flow-handover` меняет решение исполнителя в случаях 2 и 3 и частично в случае 1. Места под потерянное хватало: файл занимает 1 563 байта из 3 000.**

| Слова владельца | Что показывает результат | Выполнено |
|---|---|---|
| «ужимай горячую часть правил до 3000 знаков» | `wc -c`: task-flow/SKILL.md 2 647, task-flow-plan 2 608, task-flow-owner 2 341, task-flow-handover 1 563. Все четыре части не больше 3 000. Прежний цельный текст был 23 619 байт. | да |
| «убедись что смысл при этом не теряется» | По одной части handover читатель решил случай 2 наоборот: отказался просить слияние при открытии PR. В случае 3 он не знает, что обход всё равно попадает в аудит очереди и что запись в архив — это grill. Предложений, которые это решали, нет ни в одной из четырёх горячих частей: grep вернул rc=1. | нет |

**Что сузили.** В handover от каждого положения прежнего текста осталась только жирная первая фраза. Пояснения, в которых и было правило действия, срезаны. Они лежат только в холодной части `.claude/skills/task-flow/pitfalls-2.md`. Гейт при `gh pr create|ready|merge` её не выдаёт: он выдаёт только `task-flow-handover` (`.claude/rt-kit/defaults/gate-map.sh:232-233`).

**Потери по случаям**

Случай 1 — частичная потеря.
- Порядок «сначала договорённость в спеку, потом разбор папки, потом PR» и отказ открывать PR до разбора совпали с прежним текстом.
- Читатель не знает, что именно архивировать, и написал «The parts go to the archive». Прежний текст давал ответ:
  - «What explains a decision goes to `docs/archive/`; the rest is deleted.» (tf-former.md:268-269);
  - схема: «the grill — to the archive, findings — to the epic plan, the plan — away» (tf-former.md:112).
- Ни того ни другого в handover нет: grep «rest is deleted» дал 0.
- Последствие: исполнитель может унести в архив всю папку, план и progress вместе с остальным.
- Не потеря: «привести тексты в порядок, прогнать набор» и «аудит очереди перед PR». Эти шаги остались горячими в таблице состояний `task-flow/SKILL.md:25,27`.

Случай 2 — потеря, решение противоположное.
- Прежний читатель: пайплайн для этой базы не просыпается, значит, проверка — зелёный набор перед push. Он открывает PR готовым и в том же ходе просит слить, называя номер. Владельцу говорит, что PR ждёт его руки.
- Новый читатель: «When I ask for the merge: only after the work is checked, never at opening». Он отказывается от того, что прежний текст предписывал, и сам отмечает, что не знает, что считать проверкой.
- Выпали фразы:
  - «Where it does not wake, the green push gate is the check, and opening the PR and asking to merge are one turn.» (tf-former.md:189-190);
  - «Which of the two applies is decided by the bases the pipeline wakes for, and that is read from its file.» (tf-former.md:192).
- grep «push gate» и «one turn» по всем четырём горячим частям: 0.

Случай 3 — потеря.
- «Что всё равно сообщает об обходе». Новый читатель ответил: «the text names nothing that still reports a skip». Прежний текст: «An empty reason is no bypass, and the bypass lifts the refusal but does not silence the work queue audit line.» (tf-former.md:275-277). grep «does not silence» и «empty reason»: 0. Пустую причину читатель отсёк сам («with a real reason»), а про аудит не знает.
- «Удалил папку». Запись в архив читатель назвал, но её содержание — нет («does not say what that record contains»). Прежний текст: «Removing is cheaper than taking apart, and the grill leaves first — the only record of the owner's words.» (tf-former.md:273-274). grep «grill leaves»: 0. Последствие: при удалении папки слова владельца можно потерять.

Случай 4 — потери нет.
- Ревью правилами в фоне и «сначала дешёвый шаг» совпали с прежним текстом.
- «Run after the merge» читатель понял как слияние договорённости. Это согласуется со схемой tf-former.md:111.
- «Взять следующую задачу» остаётся горячим в `task-flow/SKILL.md:28`. В handover выпало «it takes the next task meanwhile» (tf-former.md:259-260), но на другом участке это сказано.

**Кратчайшие шаги** (правка надстройкой или в исходнике пакета `projects/agent-kit/assets/rules/task-flow-handover.md`, укладывается в оставшиеся ~1 400 байт):
1. К положению о просьбе слить добавить: «Where the pipeline does not wake for the base, the green push gate is the check, and opening the PR and asking to merge are one turn.»
2. К обходу добавить: «An empty reason is no bypass; the bypass does not silence the work queue audit line.»
3. К удалению папки добавить: «the grill goes to the archive first».
4. К разбору папки добавить: «what explains a decision goes to `docs/archive/`, the rest is deleted».
5. Перепрогнать читателя по `tf-casesC.md` и сверить.

**Источники**
- `/Users/eyhenij/WebstormProjects/rt-tools/.claude/skills/task-flow-handover/SKILL.md` — 1 563 байта, 11 положений без пояснений.
- `/private/tmp/claude-501/-Users-eyhenij-WebstormProjects-rt-tools/05592134-9b75-47c1-bc3e-50d988cba4dd/scratchpad/tf-former.md` — строки 111-112, 183-192, 258-277.
- `/private/tmp/claude-501/-Users-eyhenij-WebstormProjects-rt-tools/05592134-9b75-47c1-bc3e-50d988cba4dd/scratchpad/rC.txt` — решения читателя.
- `/Users/eyhenij/WebstormProjects/rt-tools/.claude/rt-kit/defaults/gate-map.sh:232-233` — при `gh pr create|ready|merge` выдаётся только handover.
- grep выпавших фраз («push gate», «one turn», «rest is deleted», «grill leaves», «does not silence», «empty reason») по task-flow, task-flow-plan, task-flow-owner и task-flow-handover SKILL.md: ничего не найдено, rc=1.

**Гипотеза:** к моменту PR основная часть `task-flow` уже загружена, потому что сессия правила progress. Тогда таблица состояний доступна, и поэтому шаги «набор», «аудит» и «следующая задача» я потерями не считаю. Проверить можно по журналу загрузки правил сессии на настоящем закрытии задачи. На потери случаев 2 и 3 это не влияет: тех фраз нет ни в одной горячей части.

Verdict (round 1): diverged

## Round 2 — the hot part of 2342 bytes

**Cases.**

Case 1. All stages are done. The task folder `docs/tasks/RT-7-x/` is still in the branch, the product agreement still sits in `docs/specs/app/proposed/x/`. You want to open the PR now and take the folder apart after the owner approves. What is the order, and what do you refuse?

Case 2. The pipeline wakes for PRs into the main branch only; your PR's base is an epic branch. Should the PR open as a draft or ready, and when do you ask the owner to merge? What do you tell the owner right after opening it?

Case 3. You want to skip taking the folder apart for a hotfix. How is that done lawfully, and what still reports it? Also: you deleted the folder instead of moving parts to the archive — what else must the branch carry?

Case 4. Right after opening the PR you plan to wait for the review before doing anything else, and to run the full test run before merging the agreement into the spec. What do you change?

**The critic.**

**Смысл почти сохранён. Случаи 1–3 совпали с прежним текстом, все три потери первого круга закрыты. Осталась одна потеря в случае 4: читатель одной горячей части переносит прогон набора на время после слияния PR, а прежний текст ставил его после слияния договорённости, до PR. Размер в норме: 2 342 байта из 3 000.**

| Слова владельца | Что показывает результат | Выполнено |
|---|---|---|
| «ужимай горячую часть правил до 3000 знаков» | `wc -c`: task-flow-handover/SKILL.md — 2 342, task-flow — 2 647, task-flow-plan — 2 996, task-flow-owner — 2 767. Все четыре части не больше 3 000. Прежний цельный текст был 23 619 байт. Исходник пакета `projects/agent-kit/assets/rules/task-flow-handover.md` отличается от разложенного файла только строкой заголовка. | да |
| «убедись что смысл при этом не теряется» | Случаи 1, 2 и 3 решены так же, как по прежнему тексту. В случае 4 прогон стоит не там: «Run the full test run after the merge, not before it», и под «the merge» читатель понимает слияние PR (rC2.txt, случай 4, Gap). По прежнему тексту набор идёт после слияния договорённости и до PR. | частично |

**Потери по случаям**

Случай 1 — потери нет.
- Порядок совпал: договорённость в спеку, затем разбор папки последним коммитом (grill в архив, находки в план эпика, остальное удаляется), затем PR. Открыть PR до разбора читатель отказывается.
- Опору дают SKILL.md:15, 21, 22, 23.
- Пробел «один коммит или два» оставлял открытым и прежний текст.
- Выпала фраза «What is ready to merge is listed by `npm run check:specs`» (tf-former.md:267, grep в SKILL.md: 0). На решение в этом случае она не влияет.

Случай 2 — потеря первого круга закрыта.
- Читатель открывает PR готовым, просит слить в том же ходе и называет владельцу номер. Это совпадает с tf-former.md:185-192.
- Фраза «Where it does not wake, the green push gate is the check, and opening the PR and asking to merge are one turn.» теперь стоит в SKILL.md:17.
- Какой файл пайплайна читать, не назывался и раньше («read from its file», tf-former.md:192), так что это не потеря.

Случай 3 — потеря первого круга закрыта.
- Пустая причина не считается обходом, аудит очереди по-прежнему называет папку (SKILL.md:25). При удалении папки нужна запись в архив, и grill уходит первым (SKILL.md:24). Всё это совпадает с tf-former.md:273-277.
- Пояснение «Removing is cheaper than taking apart» выпало (grep: 0), но действия оно не меняет.

Случай 4 — потеря.
- Ревью правилами в фоне и следующая задача совпали (SKILL.md:19).
- Прежний читатель понимает «the run — after the merge» как прогон после слияния договорённости. Порядок у него такой: договорённость в спеку, тексты, набор, разбор папки, PR. Неоднозначность снимала схема:
  - «The agreement merges into the domain spec, texts are brought up to what was done, then the suite runs» (tf-former.md:111);
  - grep «then the suite runs» в SKILL.md: 0.
- Новый читатель видит ту же фразу без схемы (SKILL.md:20) и относит её к слиянию PR. Действие меняется: полный прогон он делает после слияния PR и отказывается делать его до (rC2.txt, случай 4). Ещё он находит противоречие со схемой «run green → draft lifted» (SKILL.md:17), которого в прежнем тексте не было.
- Почему не считаю это пробелом прежнего текста: прежний текст его закрывал строкой 111.
- Смягчение: строка состояний «merge the agreement, bring the texts up to date, run the suite» горячая в `task-flow/SKILL.md:25`. Эта часть подгружается при правке любого файла в `docs/tasks/*` (`.claude/rt-kit/defaults/gate-map.sh:79-81`). Но при `gh pr create|ready|merge` проверка требует только `task-flow-handover` (gate-map.sh:232-233). Что `task-flow` к этому моменту уже загружен, не гарантировано.

**Что сузили, выпало или добавили**
- Сузили неоднозначность «the merge» (случай 4).
- Выпали пояснения без влияния на действие: `npm run check:specs`, «Removing is cheaper», «A person merges as soon as they see green», «The branch content is judged, not the working tree».
- Ничего лишнего не добавлено.

**Кратчайший шаг**
- В SKILL.md:20 (правка в исходнике пакета `projects/agent-kit/assets/rules/task-flow-handover.md`, затем `agent-kit:sync`) заменить «and the run — after the merge» на «and the suite runs after the agreement merges into the spec, before the PR». Это около 40 байт, места хватает.
- Затем перепрогнать читателя на случае 4.

**Источники**
- /Users/eyhenij/WebstormProjects/rt-tools/.claude/skills/task-flow-handover/SKILL.md — строки 15-25, 2 342 байта.
- /private/tmp/claude-501/-Users-eyhenij-WebstormProjects-rt-tools/05592134-9b75-47c1-bc3e-50d988cba4dd/scratchpad/tf-former.md — строки 111-112, 183-192, 258-277.
- /private/tmp/claude-501/-Users-eyhenij-WebstormProjects-rt-tools/05592134-9b75-47c1-bc3e-50d988cba4dd/scratchpad/rC2.txt — решения читателя.
- /Users/eyhenij/WebstormProjects/rt-tools/.claude/skills/task-flow/SKILL.md:25 — строка состояний `этапы-кончились`.
- /Users/eyhenij/WebstormProjects/rt-tools/.claude/rt-kit/defaults/gate-map.sh:76-81 и 232-233.

**Гипотеза:** если на настоящем закрытии задачи `task-flow` уже загружен, потеря случая 4 на деле закрыта строкой состояний. Проверить можно по журналу загрузки правил сессии, которая выполняет `gh pr create` после удаления папки через `git rm`: Bash-удаление может не вызвать проверку на `docs/tasks/*`.

Verdict (round 2): diverged

## Round 3 — the hot part of 2 434 bytes

**Cases.**

Case 1. All stages are done. The task folder `docs/tasks/RT-7-x/` is still in the branch, the product agreement still sits in `docs/specs/app/proposed/x/`. You want to open the PR now and take the folder apart after the owner approves. What is the order, and what do you refuse?

Case 2. The pipeline wakes for PRs into the main branch only; your PR's base is an epic branch. Should the PR open as a draft or ready, and when do you ask the owner to merge? What do you tell the owner right after opening it?

Case 3. You want to skip taking the folder apart for a hotfix. How is that done lawfully, and what still reports it? Also: you deleted the folder instead of moving parts to the archive — what else must the branch carry?

Case 4. Right after opening the PR you plan to wait for the review before doing anything else, and to run the full test run before merging the agreement into the spec. What do you change?

**The critic.**

**Смысл не потерян: потеря второго круга в случае 4 закрыта. Все четыре случая читатель одной горячей части решил так же, как решил бы читатель прежнего цельного текста. Размер в норме: 2 434 байта из 3 000.**

| Слова владельца | Что показывает результат | Выполнено |
|---|---|---|
| «ужимай горячую часть правил до 3000 знаков» | По `wc -c` все четыре горячие части укладываются в 3 000 байт: task-flow-handover — 2 434, task-flow — 2 647, task-flow-plan — 2 996, task-flow-owner — 2 767. Исходник в пакете `projects/agent-kit/assets/rules/task-flow-handover.md` по телу совпадает с разложенным файлом (diff без заголовка пуст). | да |
| «убедись что смысл при этом не теряется» | На всех четырёх случаях читатель новой части решил то же, что и читатель прежнего текста, `rC3.txt` сверен с `tf-former.md`. Дописанная во втором круге фраза о порядке «it, then the texts, then the suite, all before the PR» (SKILL.md:20) возвращает схему из tf-former.md:111. | да |

**По случаям**

**Случай 1 — потери нет.**
- По прежнему тексту (tf-former.md:111-114, 185-186, 265-273): договорённость сливается в спеку, затем правятся тексты, затем идёт набор. После этого папка разбирается последним коммитом: grill в архив, находки в план эпика, остальное удаляется. Только потом открывается PR. Открыть PR с папкой в ветке и разобрать папку после одобрения нельзя.
- Новый читатель (rC3.txt, случай 1) назвал тот же порядок и те же два отказа, опираясь на SKILL.md:15, 20, 21, 23.
- Пробел «куда находки, если эпика нет» прежний текст тоже не закрывал в этом месте.

**Случай 2 — потери нет.**
- По прежнему тексту (tf-former.md:187-194): база не будит пайплайн, значит PR открывается готовым. Зелёный набор перед отправкой считается проверкой, а открытие PR и просьба о слиянии делаются в одном ходе. Владельцу называют номер, чего PR ждёт и что дальше.
- Новый читатель решил так же (SKILL.md:16-18).
- Какой файл пайплайна читать, прежний текст тоже не называл («read from its file»), так что это не потеря.

**Случай 3 — потери нет.**
- По прежнему тексту (tf-former.md:274-277): обход — строка `Task-folder-skip: <reason>`. Пустая причина обходом не считается, и аудит очереди по-прежнему называет папку. Если папку удалили, ветка добавляет запись в архив, и grill уходит первым.
- Новый читатель решил так же (SKILL.md:24-25).
- Про исправления срочных ошибок (hotfix) прежний текст тоже ничего особого не говорил.

**Случай 4 — потеря второго круга закрыта.**
- По прежнему тексту (tf-former.md:111, 115-116, 258-264): ревью правилами запускается в фоне сразу после PR, и тем временем берётся следующая задача. Порядок такой: договорённость в спеку, затем тексты, затем набор, и всё это до PR.
- Новый читатель (rC3.txt, случай 4) решил так же и отказался от обоих неверных шагов. Опора — SKILL.md:19-20.
- Он отметил, что «the run — after the merge» спотыкает до следующей фразы. Но действие он выбрал верное, поэтому это не потеря.

**Что выпало без влияния на действие (grep в SKILL.md: 0)**
- «What is ready to merge is listed by `npm run check:specs`»
- «A person merges as soon as they see green»
- «Removing is cheaper than taking apart»
- «The branch content is judged, not the working tree»
- «One not taken apart is caught by the work queue audit»

Ни в одном из случаев эти фразы не меняют, что исполнитель делает или от чего отказывается. Лишнего не добавлено.

**Шаги**
Нужных шагов нет. Можно, но не обязательно, снять запинку в SKILL.md:20: заменить «and the run — after the merge» на «and the suite — after the agreement merges». Это около 20 байт, место есть.

**Источники**
- /Users/eyhenij/WebstormProjects/rt-tools/.claude/skills/task-flow-handover/SKILL.md — строки 15-25, 2 434 байта
- /private/tmp/claude-501/-Users-eyhenij-WebstormProjects-rt-tools/05592134-9b75-47c1-bc3e-50d988cba4dd/scratchpad/tf-former.md — строки 111-117, 185-194, 258-277
- /private/tmp/claude-501/-Users-eyhenij-WebstormProjects-rt-tools/05592134-9b75-47c1-bc3e-50d988cba4dd/scratchpad/rC3.txt
- /private/tmp/claude-501/-Users-eyhenij-WebstormProjects-rt-tools/05592134-9b75-47c1-bc3e-50d988cba4dd/scratchpad/tf-cC2.md

**Гипотезы:** нет.

Verdict: matched
