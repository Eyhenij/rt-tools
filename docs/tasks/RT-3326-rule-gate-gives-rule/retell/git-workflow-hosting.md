# git-workflow-hosting — the retelling

Under each round stand its cases, given to a reader who saw only the hot part, as the gate gives it on every call of the hosting client about a PR, and then the
reply of `goal-critic` verbatim.

## Round 1 — the hot part of 2860 characters

**Cases.**

Case 1. Your task's work is done and pushed. The pipeline wakes only for PRs into main; your base is the epic branch. You plan to push the branch and tell the owner "it's on the branch, look there". When you do open the PR, you plan to set the labels and the reviewer afterwards by `gh pr edit`. What do you do?

Case 2. Your PR is a draft; the run is green, but nobody has reviewed it yet. You want to lift the draft and then press merge yourself, since everything is green. What do you do?

Case 3. The reviewer left five remarks on your PR. You fixed them and pushed. The PR body still describes the first version. You plan to reply nowhere and just mention «fixed» in chat. What do you do?

Case 4. You open a PR from the machine account. The client's active account on this machine is the owner's. You plan to switch the client's account globally to the machine one, and to add yourself (the machine account, the PR author) as the reviewer. You copy the commit email from memory. What do you do with each?

**The critic.**

**Смысл потерян в одном месте. Новая горячая часть не говорит, кому ставить ревьюера, исполнителя и метки PR, и это меняет действия в случаях 1 и 4. Остальные решения совпали с бывшим текстом, лимит соблюдён.**

| Слова владельца | Что показывает результат | Выполнено |
|---|---|---|
| «ужимай горячую часть правил до 3000 знаков» | `wc -m .claude/skills/git-workflow-hosting/SKILL.md` даёт 2860. Остальные части git-workflow тоже не больше 3000: самая большая, `git-workflow-pr`, — 2771. Бывший цельный текст `gw-former.md` занимал 24212 знаков. | да |
| «убедись что смысл при этом не теряется» | Случаи 2 и 3 решены так же, как по бывшему тексту. В случаях 1 и 4 решение то же по сути, но не определено, кто ревьюер, кто исполнитель и какие метки. Бывший текст это называл (`gw-former.md:33`), а в новую часть эта строка не попала: она есть только в холодной `git-workflow/pitfalls-2.md:32`. | нет |

## Потери по случаям

**Случай 1. Задача готова, base — ветка эпика, метки и ревьюер.**
- Читатель бывшего текста открывает PR сразу, без `--draft`. Тело пишет в том же ходе, ревьюера ставит в том же ходе («The reviewer is set in the same turn», `gw-former.md:213`), метки и ревьюера ставит через `gh api` и знает значения: ревьюер — владелец репозитория, исполнитель — машинная учётка, метки — как у задачи.
- Читатель новой части делает то же самое и отказывает в тех же двух вещах (сдача веткой и `gh pr edit`). Спор между «draft» и «ready» он решил верно, сам, по частному случаю, хотя бывший текст снимал его явно: «where no run comes, a draft waits for nothing».
- Потеря в значениях полей. Бывшая фраза: «discussion of an edit | PR review: reviewer — the repository owner, assignee — the machine account, labels — the same as on the task» (`gw-former.md:33`). Grep `repository owner|same as on the task` по `.claude/skills/git-workflow-hosting/SKILL.md` ничего не находит. Новый читатель тоже не назвал ни исполнителя, ни метки, ни ревьюера.

**Случай 2. Черновик без ревью, зелёный прогон.**
- Решения совпали: черновик не снимать, сливать не самому. Исключение бывшего текста «merges their own PR only when a person said so about this PR» (`gw-former.md:240`) в этом случае не срабатывает. Пробел «кто снимает черновик после ревью» новый читатель закрыл верно, сам, отдельным вызовом `gh pr ready`.
- Потери нет.

**Случай 3. Замечания и устаревшее тело PR.**
- Решения совпали: тело перечитать и поправить, спросить человека, после «да» ответить под каждым замечанием. Обоснование бывшего текста («names the tip by its sha… makes it false in silence», `gw-former.md:232`) новый читатель восстановил сам.
- Потери нет.

**Случай 4. Машинная учётка, ревьюер, почта.**
- Не переключать учётку глобально, не ставить себя ревьюером и брать почту из компаньона — эти решения совпали. Что подстановка делается явным токеном (`gw-former.md:243`), новый читатель не знает, но действие от этого не меняется.
- Потеря та же, что в случае 1. Новый читатель ставит «someone other than the author», а бывший текст требует именно владельца репозитория (`gw-former.md:33`). Значит, ревьюером может оказаться любой участник.

## Самый короткий шаг

Дописать в строку 35 `SKILL.md`, после двоеточия, такой хвост (около 90 знаков, итог около 2950 из 3000):
` reviewer — the repository owner, assignee — the machine account, labels — as on the task.`
Заодно это закроет пробел, который назвал сам читатель: строка, оканчивающаяся двоеточием, получит содержание.

## Что сужено, выброшено, добавлено
- Сужено: в горячей части остались одни заголовки правил, обоснования ушли в холодную часть. Решения по четырём случаям от этого не изменились, кроме названной потери.
- Выброшено из горячей части: таблица словаря с ревьюером, исполнителем и метками.
- Добавлено: ничего сверх просьбы.

## Источники и гипотезы
- `/Users/eyhenij/WebstormProjects/rt-tools/.claude/skills/git-workflow-hosting/SKILL.md`, строки 15–40. `wc -m` даёт 2860.
- `/private/tmp/claude-501/-Users-eyhenij-WebstormProjects-rt-tools/05592134-9b75-47c1-bc3e-50d988cba4dd/scratchpad/gw-former.md`, строки 33 и 207–268.
- `/private/tmp/claude-501/-Users-eyhenij-WebstormProjects-rt-tools/05592134-9b75-47c1-bc3e-50d988cba4dd/scratchpad/gwC1.txt`
- `/Users/eyhenij/WebstormProjects/rt-tools/.claude/skills/git-workflow/pitfalls-2.md:32` — словарь лежит только здесь.
- `/Users/eyhenij/WebstormProjects/rt-tools/.claude/rt-kit/defaults/gate-map.sh`, строки 194–218: при `gh pr create|merge|edit|ready` и при `gh api` с PATCH/PUT на pulls выдаётся только `git-workflow-hosting`.
- Гипотеза: `gh api -X POST …/requested_reviewers`, которым ставят ревьюера, проверка правил не ловит, и при этом вызове часть hosting не выдаётся. Как проверить: прогнать `gate-map.sh` на такой команде и посмотреть, что он печатает.

Verdict (round 1): diverged

## Round 2 — the hot part of 2904 characters

**Cases.**

Case 1. Your task's work is done and pushed. The pipeline wakes only for PRs into main; your base is the epic branch. You plan to push the branch and tell the owner "it's on the branch, look there". When you do open the PR, you plan to set the labels and the reviewer afterwards by `gh pr edit`. What do you do?

Case 2. Your PR is a draft; the run is green, but nobody has reviewed it yet. You want to lift the draft and then press merge yourself, since everything is green. What do you do?

Case 3. The reviewer left five remarks on your PR. You fixed them and pushed. The PR body still describes the first version. You plan to reply nowhere and just mention «fixed» in chat. What do you do?

Case 4. You open a PR from the machine account. The client's active account on this machine is the owner's. You plan to switch the client's account globally to the machine one, and to add yourself (the machine account, the PR author) as the reviewer. You copy the commit email from memory. What do you do with each?

**The critic.**

**Смысл всё ещё теряется в одном месте. Потеря, найденная в первом круге (кому назначать ревьюера, исполнителя и метки), закрыта. В случаях 1, 3 и 4 решения совпали с бывшим текстом, в случае 2 совпало само действие. Но из всех горячих частей пропало исключение «исполнитель сливает свой PR, если человек сказал об этом PR». Новый читатель сам назвал это пробелом в случае 2, а бывший текст этот пробел закрывал. Объём в норме: 2904 знака.**

| Слова владельца | Что показывает результат | Выполнено |
|---|---|---|
| «ужимай горячую часть правил до 3000 знаков» | `wc -m .claude/skills/git-workflow-hosting/SKILL.md` даёт 2904. Остальные горячие части `git-workflow*/SKILL.md` тоже не больше 3000, самая большая — `git-workflow` с 2823. | да |
| «убедись что смысл при этом не теряется» | Случаи 1, 3 и 4 решены так же, как по бывшему тексту, в случае 2 совпало действие. Строка 34 теперь называет ревьюера, исполнителя и метки. Но фраза бывшего текста «The executor merges their own PR only when a person said so about this PR» (`gw-former.md:240`) есть только в холодной части `git-workflow/pitfalls-2.md:239`. Читатель горячей части откажется сливать PR даже по прямому слову владельца. | частично |

## Случаи

**Случай 1. Сдача веткой, база — ветка эпика, `gh pr edit`.**
- По бывшему тексту: открыть PR в том же ходе, где работа сдаётся (`gw-former.md:207-208`). Открыть без `--draft`, потому что прогон не придёт (`:211-213`). Ревьюера поставить в том же ходе через `gh api`/REST: ревьюер — владелец репозитория, исполнитель — машинная учётка, метки — как у задачи (`:33`, `:252`, `:267`). Сдачу словами «смотрите в ветке» и `gh pr edit` отклонить.
- Новый читатель (`gwC2.txt`) решил так же, значения полей теперь берутся из строки 34. «В том же ходе» для ревьюера в горячей части не сказано, но читатель всё равно ставит его при открытии, так что действие не меняется.
- Вопрос «кого спрашивать о проверках не-main» бывший текст тоже оставлял открытым (`:165-167`), это не потеря. **Потери нет.**

**Случай 2. Черновик без ревью, зелёный прогон.**
- По бывшему тексту: черновик не снимать (`:237`), сливать не самому (`:239`). Исключение — человек сказал об этом PR (`:240`), но в этом случае такого слова нет.
- Действие нового читателя совпало. Однако он сам пишет в пробелах: «It does not say what to do if the owner tells the executor to merge». Бывший текст на это отвечал: можно, и только для этого PR.
- Проверка поиском: `grep -c "said so\|person's word" .claude/skills/git-workflow-hosting/SKILL.md` даёт 0. Поиск по `.claude/skills/git-workflow*/SKILL.md` тоже ничего не находит, фраза осталась только в `git-workflow/pitfalls-2.md:239`.
- Потеря меняет поведение. Если владелец пишет «влей», читатель горячей части откажется: строка 29 говорит без исключений «pressed by a person, not by the work's executor». Это противоречит постоянному указанию владельца, по которому агент сам сливает PR от его имени. Проверка правил на `gh pr merge` выдаёт именно эту часть (`gate-map.sh:195-197`).
- **Потеря.**

**Случай 3. Замечания и устаревшее тело PR.**
- По бывшему тексту: спросить человека, после «да» ответить под каждым замечанием (`:234-236`). Тело перечитать, потому что ссылка на sha зелёного прогона устарела (`:231-233`).
- Новый читатель решил так же, а переписывание тела вывел сам. Что делать после «нет», бывший текст тоже не говорил. **Потери нет.**

**Случай 4. Машинная учётка, ревьюер, почта.**
- По бывшему тексту: учётку не делать активной, подставлять явным токеном (`:243-246`). Автор PR не может быть ревьюером, ревьюер — владелец репозитория (`:33`, `:248`). Почту копировать из компаньона, адрес вида `<число>+<логин>@users.noreply.github.com` (`:255-257`).
- Действия нового читателя совпали. Формат адреса и механизм подстановки ему не известны, но шаг от этого не меняется: он всё равно копирует почту из компаньона и не переключает учётку. **Потери нет.**

## Что сужено, выброшено, добавлено
- Выброшено из горячих частей: исключение для слияния по слову человека и его область — только этот PR (`gw-former.md:240-241`).
- Сужено: обоснования ушли в холодную часть. На действия в случаях это не повлияло.
- Добавлено: ничего.

## Самый короткий шаг
Дописать в конец строки 29 файла `SKILL.md` (64 знака, итог около 2968 из 3000):
` The executor merges only on a person's word about this very PR.`

## Источники и гипотезы
- `/Users/eyhenij/WebstormProjects/rt-tools/.claude/skills/git-workflow-hosting/SKILL.md`, строки 15–39, 2904 знака.
- `/private/tmp/claude-501/-Users-eyhenij-WebstormProjects-rt-tools/05592134-9b75-47c1-bc3e-50d988cba4dd/scratchpad/gw-former.md`, строки 33, 165–167, 207–268.
- `/private/tmp/claude-501/-Users-eyhenij-WebstormProjects-rt-tools/05592134-9b75-47c1-bc3e-50d988cba4dd/scratchpad/gwC2.txt` — пробел в случае 2.
- `/Users/eyhenij/WebstormProjects/rt-tools/.claude/skills/git-workflow/pitfalls-2.md:239` — единственное место, где есть исключение.
- `/Users/eyhenij/WebstormProjects/rt-tools/.claude/rt-kit/defaults/gate-map.sh:195-197, 216-218`.
- Гипотеза: в четырёх случаях нет сценария «владелец велел влить». Как проверить: дать новому читателю пятый случай («владелец написал: влей #N») и сравнить его решение с бывшим текстом.

Verdict (round 2): diverged

## Round 3 — the hot part of 2 968 characters

**Cases.**

Case 1. Your task's work is done and pushed. The pipeline wakes only for PRs into main; your base is the epic branch. You plan to push the branch and tell the owner "it's on the branch, look there". When you do open the PR, you plan to set the labels and the reviewer afterwards by `gh pr edit`. What do you do?

Case 2. Your PR is a draft; the run is green, but nobody has reviewed it yet. You want to lift the draft and then press merge yourself, since everything is green. Later, after the review, the owner writes «влей #57» about this PR. What do you do in each moment?

Case 3. The reviewer left five remarks on your PR. You fixed them and pushed. The PR body still describes the first version. You plan to reply nowhere and just mention «fixed» in chat. What do you do?

Case 4. You open a PR from the machine account. The client's active account on this machine is the owner's. You plan to switch the client's account globally to the machine one, and to add yourself (the machine account, the PR author) as the reviewer. You copy the commit email from memory. What do you do with each?

**The critic.**

**Смысл не потерян: во всех четырёх случаях новый читатель поступает так же, как читатель бывшего текста. Исключение про слияние, которое пропало во втором круге, вернулось в строку 29. Объём 2968 знаков из 3000.**

| Слова владельца | Что показывает результат | Выполнено |
|---|---|---|
| «ужимай горячую часть правил до 3000 знаков» | `wc -m .claude/skills/git-workflow-hosting/SKILL.md` даёт 2968. Остальные горячие части тоже не больше 3000: самая большая из них `git-workflow` с 2823, следом `git-workflow-pr` с 2762. | да |
| «убедись что смысл при этом не теряется» | Во всех четырёх случаях решения совпали с бывшим текстом. Случай 2 теперь проверяет и слово владельца «влей #57». Читатель сливает только #57, и это совпадает с бывшей фразой «said about one, it does not carry to the next». | да |

## Случаи

**Случай 1. Сдача веткой, база — ветка эпика, `gh pr edit`.**
- Бывший текст: «A code edit is handed to a person by an open PR, not by a pushed branch» и «A PR the pipeline does not wake for opens ready, without `--draft`… The reviewer is set in the same turn» (`gw-former.md:207-213`). Метки, исполнитель и ревьюер ставятся через `gh api` (`:252`), значения полей взяты из таблицы (`:33`).
- Новый читатель (`gwC3.txt`, Case 1) открывает PR с `--base` без черновика и в том же ходе ставит поля через `gh api`. «Смотрите в ветке» и `gh pr edit` он отказывает.
- Его пробелы про черновик и «кого спрашивать о проверках не в main» бывший текст тоже не закрывал (`:165-167`). Работа в случае готова, поэтому выбор открыть PR готовым не меняется. **Потери нет.**

**Случай 2. Черновик без ревью, потом «влей #57».**
- Бывший текст: «The draft is not lifted while the PR has no review» (`:237`) и «The executor merges their own PR only when a person said so about this PR; said about one, it does not carry to the next» (`:239-241`).
- Поиск `grep -n "this very PR" SKILL.md` находит строку 29: «The executor merges only on a person's word about this very PR».
- Новый читатель сначала ничего не делает. После «влей #57» снимает черновик через `gh pr ready 57`, если ветка сливается, затем вливает только #57 и перечитывает состояние PR. Это совпадает с бывшим текстом.
- Пробел читателя «влей» не говорит, включает ли он снятие черновика. Бывший текст отвечал на это фразой «Lifting the draft and asking to merge are one turn» (`:217`), но действие читателя то же: снять черновик, потом влить. Чьё слово считается, бывший текст тоже не уточнял, там сказано «a person». **Потери нет.**

**Случай 3. Замечания и устаревшее тело PR.**
- Бывший текст: тело перечитать после пуша (`:231-233`). Спросить человека, отвечать ли под замечаниями, после «да» ответить на каждое (`:234-236`).
- Новый читатель делает то же: правит тело и отвечает на все пять замечаний. Ответ «fixed» в чате он отказывает.
- Что делать после «нет» и кто такой «person», бывший текст тоже не говорил. **Потери нет.**

**Случай 4. Машинная учётка, ревьюер, почта.**
- Бывший текст: учётка подставляется на один вызов и не делается активной (`:243-246`). Автор не может быть ревьюером (`:248`), ревьюер — владелец репозитория (`:33`), запрос через REST (`:266`). Почта копируется из компаньона (`:255-257`).
- Новый читатель делает всё то же.
- Формат адреса `<число>+<логин>@users.noreply.github.com` ушёл в холодную часть. Читатель всё равно копирует почту и не набирает её по памяти, так что действие не меняется. **Потери нет.**

## Что сужено, выброшено, добавлено
- Сужено: из горячей части ушли обоснования. Это «why» к правилам: адрес по номеру, поле `mergeable` на хосте, sha в теле PR. Ни в одном случае это не изменило, что исполнитель делает или отказывает.
- Выброшено: ничего, от чего зависит действие.
- Добавлено: ничего.

## Шаги
Потерь нет, дописывать ничего не нужно. Свободно 32 знака.

## Источники и гипотезы
- `/Users/eyhenij/WebstormProjects/rt-tools/.claude/skills/git-workflow-hosting/SKILL.md`, строки 15–39, 2968 знаков.
- `/private/tmp/claude-501/-Users-eyhenij-WebstormProjects-rt-tools/05592134-9b75-47c1-bc3e-50d988cba4dd/scratchpad/gw-former.md`, строки 33, 165–167, 207–266.
- `/private/tmp/claude-501/-Users-eyhenij-WebstormProjects-rt-tools/05592134-9b75-47c1-bc3e-50d988cba4dd/scratchpad/gwC3.txt`
- `/private/tmp/claude-501/-Users-eyhenij-WebstormProjects-rt-tools/05592134-9b75-47c1-bc3e-50d988cba4dd/scratchpad/gw-casesC3.md`
- `/Users/eyhenij/WebstormProjects/rt-tools/.claude/rt-kit/defaults/gate-map.sh:197, 218`: при вызове клиента хостинга про PR проверка выдаёт `git-workflow-hosting`.
- Гипотеза, не проверено. Бывшая фраза «Asked from the host's `mergeable` field; a local merge does not derive it» (`gw-former.md:220-221`) теперь есть только в холодной части. Читатель горячей части может проверить сливаемость локальным слиянием, а не по хосту. Ни один случай этого не проверяет. Как проверить: дать новому читателю пятый случай «локально ветка сливается чисто, база на хосте ушла вперёд; снимаешь черновик?». Если он снимет черновик без запроса к хосту, это потеря. Тогда в строку 23 нужно дописать хвост « Asked from the host's `mergeable` field.» (40 знаков). Он не помещается в оставшиеся 32 знака, и что-то другое в файле придётся сократить.

Verdict: matched
