# План

**Task:** RT-3701 · **Branch:** RT-3701-epic-merge-by-executor
**Behaviour:** unchanged — правятся правило поставки пакета правил и хук слияния, код приложения не трогается

## Точки

- **A:** PR задачи в ветку эпика ждёт, пока владелец его сольёт, — одно обращение и около получаса на
  задачу. Слово владельца «Сливай задачи RT-3693 сам» есть только в окне. Хук слияния не смотрит базу:
  исполнитель может слить и в main. Кнопка хоста подписывает слияние личным адресом машинной учётной
  записи — 26.11 ветку эпика пришлось переписывать.
- **Эта задача доводит до:** исполнитель сливает PR задачи в ветку эпика сам, после зелёного набора
  перед пушем и ревью, одной командой `gh pr merge <номер> --merge --author-email <адрес noreply>`; в
  этом дереве хук отказывает исполнителю в слиянии в main и в слиянии, база которого неизвестна; хук
  отказывает в `gh pr merge` с чужим адресом автора или без него; слово владельца записано в плане
  эпика.
- **Признак:** пробы таблицы решений и сценарии хуков зелёные: слияние в main при включённой настройке
  профиля — отказ, база неизвестна — отказ, `gh pr merge` без адреса или с чужим — отказ, в ветку эпика с
  объявленным адресом в форме `--author-email` или `-A` — проходит. После слияния PR этой задачи новой
  формой `git log -1 --format=%ae origin/RT-3693-owner-touches` даёт адрес noreply, и следующий пуш
  ветки эпика проходит хук подписи — это проверяется сразу после слияния, и ответ двух команд идёт в отчёт владельцу.
- **Веха G эпика:** медиана обращений к владельцу на задачу не выше 2 за шесть дней после слияния
  эпика (слово владельца), при доле обращений вне задач не выше 10 % и медиане задач с обращениями
  ниже 4,5.
- **Метрика:** обращения к владельцу на задачу, медиана; до эпика 4 на 43 задачах. Эта задача снимает
  одно обращение на задачу эпика, где слово дано; слово на каждый следующий эпик даёт окно одобрения
  его плана — RT-3699 (П4).

## Решение

| Часть | Что выбрано |
| --- | --- |
| Модули | `projects/agent-kit/assets/checks/board.github.mjs:pullState` — состояние PR несёт базу `base`; `projects/agent-kit/assets/hooks/git-guard-delivery-merge.sh:rt_delivery_merge_who` — факты слияния исполнителем: база — главная ветка при включённой настройке профиля, база неизвестна, адрес автора слияния `gh pr merge` равен `RT_COMMIT_EMAIL` или нет |
| Зависимости | хук слияния читает состояние PR через `rt_pull_state` профиля, адрес — `RT_COMMIT_EMAIL`, настройку — `RT_MAIN_MERGE_BY_OWNER` профиля; `board.github.mjs` никого нового не импортирует |
| Зацепление | `projects/agent-kit/assets/checks/board.github.mjs` исходящие 0 → 0; `projects/agent-kit/assets/hooks/git-guard-delivery-merge.sh` no code: оболочка, проверка связей её не видит; циклов нет; импортов мимо входа нет |
| Паттерны | паттерна нет: строки таблицы решений и одна функция фактов рядом с `rt_delivery_merge_run`; отброшено: отдельный хук слияния — второй хук на ту же команду |
| Термины | ветка эпика, машинная учётная запись — в словаре; новых слов нет |
| Данные | команда агента `gh pr merge <номер> --merge [--author-email <адрес> \| -A <адрес>]` и состояние PR от хоста: база `main` при `RT_MAIN_MERGE_BY_OWNER=1` — отказ, база неизвестна при той же настройке — отказ, адреса нет или он чужой — отказ, база ветки эпика с объявленным адресом — проходит; `glab mr merge` и `az repos pr update` адрес не судят — у них нет такого ключа. SC-AK-2008, SC-AK-2009, `projects/agent-kit/tests/git-guards-readiness.test.sh` |
| Границы | закон `delivery` не меняется: слово на слияние эпика в main по-прежнему законно, запрет — настройка профиля этого дерева, по умолчанию выключен; слияние владельцем кнопкой в браузере хуки не видят; профиль без `RT_COMMIT_EMAIL` адрес не судит; хук не сверяет, дано ли слово на эпик базы, и не судит зелёный набор и ревью до слияния — их держит правило цикла задачи, а пуш без зелёного набора уже отказан хуком пуша; `gh api …/merge` хук не ловит — путь назван в спутнике правила; формат таблицы решений не меняется |
| Приоритет | надёжность важнее скорости: слияние в main исполнителем — поломка, которую видят все; при неизвестной базе слияние ждёт, а не идёт вслепую |
| Бюджет | `projects/agent-kit/assets/checks/board.github.mjs` плюс 3; `projects/agent-kit/assets/hooks/git-guard-delivery-merge.sh` до 80 строк; новых файлов кода: 0; новых зависимостей: 0 |

## След задачи

| Что | Где |
| --- | --- |
| Состояние PR (правится) | `projects/agent-kit/assets/checks/board.github.mjs` |
| Хук слияния (правится) | `projects/agent-kit/assets/hooks/git-guard-delivery-merge.sh`, `projects/agent-kit/assets/hooks/git-guard-delivery.sh` |
| Настройка профиля (правится) | `projects/agent-kit/assets/defaults/project.sh`, `.claude/rt-kit/project.sh` |
| Таблица решений (правится) | `projects/agent-kit/assets/checks/decision-table.json` |
| Сценарии (правится) | `projects/agent-kit/tests/git-guards-readiness.test.sh` |
| Спецификация (правится) | `docs/specs/agent-kit/delivery-gate/` |
| Правило поставки (правится) | `projects/agent-kit/assets/rules/git-workflow-hosting.github.md`, `.claude/skills/git-workflow-hosting/implementation.md` |
| Цикл задачи (правится) | `.claude/skills/task-delivery-loop/SKILL.md` |
| План эпика (правится) | `docs/plans/owner-touches.md` |
| Разложенное (правится) | `.claude/hooks/`, `.claude/skills/git-workflow-hosting/`, `tools/board.mjs` |

## Этапы

### 1. Хук слияния знает базу и автора

- **Steps:**
    1. Состояние PR несёт базу
       Check: `grep -c 'baseRefName' projects/agent-kit/assets/checks/board.github.mjs` → >= 2
    2. Слияние исполнителем в главную ветку отказано по настройке профиля
       Check: `jq '[.rows[]|select(.when.merge_into_main=="yes")]|length' projects/agent-kit/assets/checks/decision-table.json` → >= 1
    3. Слияние без объявленного адреса автора отказано
       Check: `jq '[.rows[]|select(.when.merge_author_declared=="no")]|length' projects/agent-kit/assets/checks/decision-table.json` → >= 1
    4. Сценарии слияния исполнителем
       Check: `grep -cE 'SC-AK-200[89]' projects/agent-kit/tests/git-guards-readiness.test.sh` → >= 2
    5. Дерево включает запрет слияния в main исполнителем
       Check: `grep -c '^RT_MAIN_MERGE_BY_OWNER=1' .claude/rt-kit/project.sh` → >= 1
    6. Слияние при неизвестной базе отказано с ходом «повтори, когда хост ответит»
       Check: `jq '[.rows[]|select(.when.pr_base_known=="no")]|length' projects/agent-kit/assets/checks/decision-table.json` → >= 1
- **Readiness sign:** пробы таблицы и сценарии хуков зелёные.
- **Verified by:** `bash projects/agent-kit/tests/decision-table.test.sh && bash projects/agent-kit/tests/git-guards-readiness.test.sh` — «0 провалов» у обоих.

### 2. Правило и слово владельца

- **Steps:**
    1. Правило поставки называет форму слияния в ветку эпика и условие — зелёный набор и ревью
       Check: `grep -c 'after the green push set and the review' projects/agent-kit/assets/rules/git-workflow-hosting.github.md` → >= 1
    2. Цикл задачи называет слияние в ветку эпика исполнителем вместо строки «только по слову владельца»
       Check: `! grep -q '^- The executor merges only by the owner.s word\.$' .claude/skills/task-delivery-loop/SKILL.md` → exit 0
    3. Слово владельца записано в плане эпика
       Check: `grep -c 'Сливай задачи RT-3693 сам' docs/plans/owner-touches.md` → >= 1
    4. Спутник правила называет хук, который судит слияние, и то, что не судит никто: зелёный набор и ревью до слияния, слово на эпик, `gh api …/merge`
       Check: `grep -cE 'rt_delivery_merge_who|gh api .*merge|the word on the epic' .claude/skills/git-workflow-hosting/implementation.md` → >= 3
    5. Сценарии в спецификации
       Check: `grep -c 'SC-AK-2009' docs/specs/agent-kit/delivery-gate/scenarios.md` → >= 1
    6. Правило разложено в дерево
       Check: `grep -c 'author-email' .claude/skills/git-workflow-hosting/SKILL.md` → >= 1
    7. Окно старта эпика (П4, RT-3699) несёт вариант «задачи эпика в его ветку сливает исполнитель»
       Check: `grep -c 'П4.*сливает исполнитель' docs/plans/owner-touches.md` → >= 1
- **Readiness sign:** разложенное сходится с пакетом.
- **Verified by:** `pnpm run agent-kit:check` — «разложенное сходится с пакетом».

## Чего эта работа не делает

- Слово на слияние задач в ветку каждого следующего эпика — вариант окна одобрения плана эпика,
  RT-3699 (П4).
- Слияние эпика в main — кнопка владельца, как было.
- Адрес машинной учётной записи на хосте — настройка владельца; с ним ключ `--author-email` не нужен,
  но хук адреса остаётся.
- Выпуск пакета — один после слияния эпика в main.
