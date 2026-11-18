# git-workflow-push — the retelling

Under each round stand its cases, given to a reader who saw only the hot part together with the branch part `git-workflow`, as the gate gives them on a commit or a push, and then the
reply of `goal-critic` verbatim.

## Round 1 — the hot part of 1752 characters

**Cases.**

Case 1. Your task branch was taken from the epic branch. A neighbouring task merged into the epic branch an hour ago and touched the same files. You want to bring it in by `git rebase origin/<epic>` and then force-push. Also your last commit holds a typo in a file, and you plan to fix it by one more commit "fix typo". What do you do?

Case 2. You are about to push. You ran `npm run lint` for one project and the unit tests, but not the build. The push guard does not fire in this terminal (you are pushing from a script). You also want to skip the layout audit because "it is slow". What do you do before the push?

Case 3. A teammate asks you to review their branch. You read the diff and plan to approve it by eye. Separately, you just merged the epic branch into yours, and it brought new files from another package. What changes in your checks?

Case 4. You created a branch named `fix-login` (no task number) and committed to it. You then open a second working copy to try something, run the commit from there, and to free space for a tool you plan to `git stash` your working tree. What do you do with each?

**The critic.**

**Цель выполнена частично: обе горячие части укладываются в 3000 знаков, но смысл потерян в двух случаях из четырёх (3 и 4).**

| Слова владельца | Что показывает результат | Выполнено |
|---|---|---|
| «ужимай горячую часть правил до 3000 знаков» | `wc -m`: `git-workflow/SKILL.md` — 2721, `git-workflow-push/SKILL.md` — 1752. Раньше был один горячий текст на 24212 знаков | да |
| «убедись что смысл при этом не теряется» | В случаях 1 и 2 читатель новых частей решает так же, как читатель прежнего текста. В случаях 3 и 4 он делает другое: исчезли сами действия, а не только пояснения. Исчезнувшие фразы теперь лежат только в холодной части `pitfalls-2.md`, а проверка при коммите и отправке её не выдаёт | нет |

## Решения по случаям

**Случай 1 (rebase эпика, force push, коммит «fix typo»). Потери нет.** Читатель прежнего текста делает то же: вливает эпик merge'ем и отказывается от rebase, force push и исправляющего коммита. Если коммит ещё не на сервере — `--soft`, а не `--hard`. Пробел «опечатка уже отправлена» был и в прежнем тексте.
- Пропала одна фраза, но в этом случае на действие она не влияет: «Before its PR opens a branch takes its base in; with the PR open — only on a conflict.» (`gw-former.md:109-110`). В случае не сказано, открыт ли PR, а соседняя задача трогала те же файлы, поэтому конфликт вероятен и решение не меняется. В других случаях потеря возможна: при открытом PR и без конфликта новый читатель вольёт базу, а прежний не стал бы. В горячих частях этой фразы нет, она есть только в `pitfalls-2.md:109`.

**Случай 2 (отправка из скрипта, неполный набор, пропуск аудита раскладки). Потери нет.** Оба читателя отправляют по пути, где стоит проверка, запускают все линтеры, сборку и аудит раскладки и не пропускают аудит как «медленный». Новый читатель видит противоречие между «только по пути проверки» и «где ничего не срабатывает — набор целиком». Прежний текст снимает его фразой «unless the tree wired the git hook `pre-push`» (`gw-former.md:136-137`), но решение от этого не меняется.
- Пробел «где читать итоговый набор»: прежний текст называет раздел — «The "set before push" section prints it whole» (`gw-former.md:193-194`). В горячих частях его нет. Действие то же: читать набор из обзора состояния, а не собирать по памяти.

**Случай 3 (ревью чужой ветки и пересмотр набора после слияния). Потеря есть.** Прежний читатель запускает набор на вершине чужой ветки, а кроме того отдельно гоняет проверку формулировок по изменённым текстам. Вывод он кладёт в ревью, а при следующей отправке в эту ветку прогоняет набор снова. Новый читатель запускает только набор на вершине: проверку формулировок не запускает, вывод в ревью не кладёт. Фраза «approve only if it passes» — его собственное добавление, этого нет ни в одном тексте. Пересмотр набора после слияния оба делают одинаково.
- Прежняя фраза (`gw-former.md:140-142`): «A check that stands only on an edit, such as the wording one, is run over the changed texts apart. The output goes into the review, and a later push into that branch is run again.»
- grep по `changed texts apart`, `output goes into the review`, `run again` в двух SKILL.md ничего не находит. Есть только в `/Users/eyhenij/WebstormProjects/rt-tools/.claude/skills/git-workflow/pitfalls-2.md:140-141`.
- Короткий хвост к пункту в `git-workflow-push/SKILL.md` (около 110 знаков, запас 1248): «**A review of a foreign branch starts with the gate set run on its tip.** The wording check runs apart over the changed texts; the output goes into the review.»

**Случай 4 (ветка без номера, вторая копия, stash). Потеря есть, в части про stash.** Ветка без номера и вторая копия решаются так же. Но прежний текст даёт замену stash: «The comparison goes on a second copy» — инструмент запускается во второй копии. Новый читатель такого хода не знает и пишет «find space another way», это неопределённое действие.
- Прежняя фраза (`gw-former.md:272-273`): «The comparison goes on a second copy: stashing takes uncommitted work where neither the tree state nor the audit sees it.»
- grep по `comparison goes on a second copy` в двух SKILL.md ничего не находит. Есть только в `pitfalls-2.md:271`.
- Короткий хвост в `git-workflow/SKILL.md` (около 35 знаков, запас 279): «**The working tree is not emptied for a tool run** — the tool runs on a second copy.»

## Что сужено, выброшено, добавлено

- **Сужено:** условие «with the PR open — only on a conflict» и название раздела «set before push» ушли в холодную часть. В случаях 1 и 2 действие от этого не меняется.
- **Выброшено из горячего:** отдельный прогон проверки формулировок при ревью чужой ветки, вывод в ревью и повторный прогон (случай 3); вторая копия как замена stash (случай 4).
- **Добавлено:** ничего, чего владелец не просил.

## Кратчайший шаг на каждый промах

1. Случай 3 — дописать хвост выше к пункту о ревью чужой ветки в `git-workflow-push` (сейчас 1752 знака, станет около 1860).
2. Случай 4 — дописать хвост выше к пункту о рабочем дереве в `git-workflow` (сейчас 2721, станет около 2760).
3. Затем ещё раз дать случаи 3 и 4 читателю, который видит только две горячие части.

## Источники и гипотезы

- `wc -m`: 2721 `/Users/eyhenij/WebstormProjects/rt-tools/.claude/skills/git-workflow/SKILL.md`, 1752 `/Users/eyhenij/WebstormProjects/rt-tools/.claude/skills/git-workflow-push/SKILL.md`.
- Прежний текст: `/private/tmp/claude-501/-Users-eyhenij-WebstormProjects-rt-tools/05592134-9b75-47c1-bc3e-50d988cba4dd/scratchpad/gw-former.md`, строки 109-110, 136-137, 140-142, 193-194, 272-273.
- Решения нового читателя: `/private/tmp/claude-501/-Users-eyhenij-WebstormProjects-rt-tools/05592134-9b75-47c1-bc3e-50d988cba4dd/scratchpad/gwA1.txt`.
- Где сейчас лежат исчезнувшие фразы: `/Users/eyhenij/WebstormProjects/rt-tools/.claude/skills/git-workflow/pitfalls-2.md:78,109,140-144,190-193,271`.
- Гипотеза: проверка при коммите и отправке выдаёт только эти две горячие части, а `pitfalls-2.md` не выдаёт. Это сказано в поручении, но я не проверял. Как проверить: найти `git-workflow-push` в `/Users/eyhenij/WebstormProjects/rt-tools/.claude/rt-kit/defaults/gate-map.sh` и в `.claude/hooks/skill-gate.sh`.

Verdict (round 1): diverged

## Round 2 — the hot part of 1838 characters

**Cases.**

Case 1. Your task branch was taken from the epic branch. A neighbouring task merged into the epic branch an hour ago and touched the same files. You want to bring it in by `git rebase origin/<epic>` and then force-push. Also your last commit holds a typo in a file, and you plan to fix it by one more commit "fix typo". What do you do?

Case 2. You are about to push. You ran `npm run lint` for one project and the unit tests, but not the build. The push guard does not fire in this terminal (you are pushing from a script). You also want to skip the layout audit because "it is slow". What do you do before the push?

Case 3. A teammate asks you to review their branch. You read the diff and plan to approve it by eye. Separately, you just merged the epic branch into yours, and it brought new files from another package. What changes in your checks?

Case 4. You created a branch named `fix-login` (no task number) and committed to it. You then open a second working copy to try something, run the commit from there, and to free space for a tool you plan to `git stash` your working tree. What do you do with each?

**The critic.**

**Цель достигнута: все четыре горячие части укладываются в 3000 знаков, и во втором круге ни в одном из четырёх случаев новый читатель не решает иначе, чем читатель прежнего текста.**

| Слова владельца | Что показывает результат | Выполнено |
|---|---|---|
| «ужимай горячую часть правил до 3000 знаков» | `wc -m`: `git-workflow/SKILL.md` — 2823, `git-workflow-push/SKILL.md` — 1838, `git-workflow-queue/SKILL.md` — 2388, `git-workflow-hosting/SKILL.md` — 2904. Прежний единый горячий текст был 24212 знаков (`gw-former.md`) | да |
| «убедись что смысл при этом не теряется» | При коммите и отправке проверка выдаёт `git-workflow` вместе с `git-workflow-push` (`.claude/rt-kit/defaults/gate-map.sh:204-205`). По этим двум частям новый читатель (`gwA2.txt`) в случаях 1–4 делает и запрещает то же, что сделал бы и запретил читатель прежнего текста. Обе потери первого круга закрыты хвостами. Пробелы, которые остались, были и в прежнем тексте | да |

## Решения по случаям

**Случай 1: rebase эпика, force push, коммит «fix typo». Потери нет.**
- Оба читателя вливают эпик merge'ем. Оба отказываются от rebase, force push и исправляющего коммита, а неотправленный коммит снимают через `--soft`, не через `--hard`.
- Прежний текст говорит «rewriting history hides the trace, not the cause» (`gw-former.md:247`). Но он же прямо разрешает «that is `--soft`» (`gw-former.md:105`), так что прежний читатель тоже снимает коммит через `--soft`.
- Фразы «Before its PR opens a branch takes its base in; with the PR open — only on a conflict» в горячих частях нет, она есть только в `pitfalls-2.md:109`. Здесь она на действие не влияет: соседняя задача трогала те же файлы, конфликт есть, и база вливается при любом прочтении.
- Пробел «опечатка уже отправлена» был и в прежнем тексте.

**Случай 2: отправка из скрипта, неполный набор, пропуск аудита раскладки. Потери нет.**
- Оба читателя запускают все линтеры, сборку и аудит раскладки. Оба отказываются пропустить аудит и берут набор из обзора состояния.
- Хвоста «unless the tree wired the git hook `pre-push`: then git runs the set there too» (`gw-former.md:136-137`) в горячих частях нет, он есть только в `pitfalls-2.md:136`. Хук в этом дереве подключён: `.husky/pre-push` → `bash .claude/hooks/pre-push.sh`. Поэтому прежний читатель мог бы считать отправку из скрипта допустимой. Новый от неё отказывается и отправляет по пути, где стоит проверка. Его действие допустимо и по прежнему тексту, ничего запрещённого он не делает, так что потерей я это не считаю.
- Противоречие, которое видит новый читатель, отчасти снимает уже горячая фраза «nor the git hook fires».

**Случай 3: ревью чужой ветки и пересмотр набора после слияния. Потеря первого круга закрыта.**
- Теперь в горячей части есть: «The wording check runs apart over the changed texts; the output goes into the review.» (`git-workflow-push/SKILL.md:16`). Новый читатель отдельно запускает проверку формулировок и кладёт вывод в ревью, как и прежний.
- Хвоста «a later push into that branch is run again» в горячих частях нет, он есть только в `pitfalls-2.md:141`. В этом случае отправки в чужую ветку нет, поэтому на решение он не влияет.
- Пробел «в какой копии гонять набор чужой ветки» прежний текст тоже не закрывал.

**Случай 4: ветка без номера, вторая копия, stash. Потеря первого круга закрыта.**
- Теперь в горячей части есть: «The tool runs on a second copy.» (`git-workflow/SKILL.md:36`). Новый читатель вместо stash запускает инструмент во второй копии, как и прежний.
- По ветке `fix-login` оба читателя решают одинаково: PR нет, условий доставки нет, работа переносится в ветку с номером. Прежний текст добавляет «The work moves to a branch with a number», и новый читатель пришёл к тому же сам.
- Коммит оба делают из копии, где стоит сессия.

## Что сужено, выброшено, добавлено

- **Ушло в холодную часть, но в случаях действие не меняет:**
  - «with the PR open — only on a conflict»;
  - оговорка о хуке `pre-push`;
  - «a later push into that branch is run again»;
  - название раздела «set before push»;
  - обоснования («rewriting history hides the trace…», «The gate runs its set where the session was started…»).
- **Добавлено:** ничего, о чём владелец не просил.

## Шаги на промахи

Промахов, которые меняют действие, нет. Если нужен запас, есть необязательный шаг на случай, которого в этом наборе нет: дописать «; a later push into that branch is run again» к пункту о ревью в `git-workflow-push` (получится около 1880 знаков).

## Источники и что ещё стоит проверить

- `wc -m` по четырём файлам в `/Users/eyhenij/WebstormProjects/rt-tools/.claude/skills/git-workflow*/SKILL.md` — цифры в таблице.
- grep по двум SKILL.md:
  - «changed texts» и «output goes into the review» → `git-workflow-push/SKILL.md:16`;
  - «second copy» → `git-workflow/SKILL.md:36`;
  - «run again», «only on a conflict», «pre-push», «set before push», «rewriting history» в этих двух файлах не находятся; первые три лежат в `/Users/eyhenij/WebstormProjects/rt-tools/.claude/skills/git-workflow/pitfalls-2.md:109,136,141`.
- Состав того, что выдаёт проверка: `/Users/eyhenij/WebstormProjects/rt-tools/.claude/rt-kit/defaults/gate-map.sh:204-205`.
- Хук: `/Users/eyhenij/WebstormProjects/rt-tools/.husky/pre-push`, `core.hooksPath=.husky/_`.
- Прежний текст: `/private/tmp/claude-501/-Users-eyhenij-WebstormProjects-rt-tools/05592134-9b75-47c1-bc3e-50d988cba4dd/scratchpad/gw-former.md`. Решения нового читателя: `/private/tmp/claude-501/-Users-eyhenij-WebstormProjects-rt-tools/05592134-9b75-47c1-bc3e-50d988cba4dd/scratchpad/gwA2.txt`.
- Не проверено: здесь проверены только четыре случая и только части `git-workflow` и `git-workflow-push`. Части `-queue` и `-hosting` и случаи про PR, доску и машинную учётную запись не проверялись. Как проверить: те же опросы по `gw-casesB.md` и `gw-casesC.md`.

Verdict: matched
