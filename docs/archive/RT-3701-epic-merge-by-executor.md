# RT-3701 — Задачи эпика исполнитель сливает в его ветку сам, слияние в main — кнопка владельца

Задача RT-3701 эпика RT-3693, запись от 2026-11-27. Прежний адрес: `docs/tasks/RT-3701-epic-merge-by-executor/`.

## Шапка разбора

**Behaviour:** unchanged — правятся правило поставки пакета правил и хук слияния, код приложения не трогается

## The owner request

> Изучи досконально task flow и вынеси в предложение, что можно уменьшить по ресурсам и времени… Свести
> несколько подтверждений в одно со стороны человека, либо еще как-то другими способами ускорить процесс
> разработки и уменьшить количество обращений к человеку.

The card RT-3701 is proposal П3 of the epic RT-3693, approved by the owner on 26.11 in one window
together with the plan of RT-3695. In the window of the plan of RT-3696 the owner gave the word for
this epic: «Сливай задачи RT-3693 сам (Recommended)». On 26.11, after the host signed the merge of
PR #3708 by the private email of the machine account, the owner chose in a window: «Переписать и
force push (Recommended)» — the epic branch was rewritten with the merge signed by the noreply email,
and later tasks of the epic merge by a local merge, not by the host's button.

## Questions and answers

No question went to the owner: the card and the two window answers close the six.

- **Does the task change the application's behaviour** — closed by the card: no application code.
- **Does it need an edit of a law or a rule** — closed by exploration: no law; the rule
  `git-workflow-hosting` and the loop `task-delivery-loop` name the allowance and the form.
- **One task or several** — closed by the card: one.
- **What is not part of the task** — closed by assumption: the merge of the epic into main stays the
  owner's; the bot account's email setting on the host is the owner's.
- **What will show that the task is closed** — closed by the card: the word is written; the rule and
  the hooks let the executor merge a task into the epic branch and refuse a merge into main.
- **Is there a sample** — closed by exploration: the refusal pieces of `git-guard-delivery.sh`.

## Решения разбора

- **A task PR goes into the epic branch by `gh pr merge <номер> --merge --author-email <noreply-адрес
  машинной учётной записи>`** — the client names the author of the merge commit, and the signature
  stays declared. Rejected: a local merge pushed by hand — a second road past the host's merge state;
  `gh pr merge` without the key — the host signs by the account's private email.
- **The delivery guard refuses the executor's `gh pr merge` whose base is the main branch, and one
  without the noreply author email.** The merge into main stays the owner's button. Rejected: a check
  of the base only — the host's merge would still sign the epic branch by the private email.

## What is left unclear

- Nothing blocks the work: the committer of a host merge is the host itself, which the signature hook
  already accepts on the main branch.

## Решения по ходу

- **2026-11-26. Отказ от `docs/specs/agent-kit/delivery-gate/`: сценарии SC-AK-2008, SC-AK-2009, статья и
  привязка легли в `docs/specs/agent-kit/delivery-signature/`.** Файл сценариев `delivery-gate` стоит у
  предела в 500 строк (496), а подпись слияния — тема спецификации подписи.
- **Проверка шага 2.5 заменена:** `grep -c 'SC-AK-2009' docs/specs/agent-kit/delivery-signature/scenarios.md` → >= 1
- **2026-11-27. Живая проверка.** Настоящий хук поставки этого дерева на четырёх командах против
  хоста: `gh pr merge 3707 --merge` (база `main`) — отказ «names no author» и «goes into «main»… by
  the button»; то же с `--author-email` машинной записи — остаётся только отказ «main»;
  `gh pr merge 3708 … --author-email <noreply>` (база `RT-3693-owner-touches`) — пропуск;
  с `bot@example.com` — отказ «foreign one (bot@example.com)». Сценарии хуков 74 ok, таблица решений 517 ok.
- **2026-11-27. Превышение бюджета `projects/agent-kit/assets/hooks/git-guard-delivery-merge.sh`: 59 → 94
  строки при плане до 80.** Причина — два круга ревью: слияния полным путём, через обёртку, с
  номером после ключей и в цепочке проходили мимо проверок. Хук узнаёт слияние в любом виде вне
  кавычек и принимает одну форму команды целиком.
- **2026-11-27. Второй круг ревью.** Две роли по риску. Разбор аргументов первого круга открыл новые
  обходы: `GH_TOKEN=$(cat …)` без кавычек — форма самого отказа, `env`, `timeout`, фон `&`,
  `bash -c`, `$(…)`, `gh -R … pr merge`, склеенные ключи. Исправлено иначе: в дереве с адресом
  машинной записи исполнитель сливает одной формой — подстановка токена из профиля,
  `gh pr merge <номер> --merge --author-email <адрес>`, и больше ничего в команде; любое иное
  слияние вне кавычек и heredoc отбивается и получает эту форму в отказе. Сценарии хуков 99 ok;
  живые пробы под `/bin/bash` 3.2 на #3708 и #3703 — форма проходит в ветку эпика и отбита в `main`.
  Чтение описания PR сверкой с целью: `gh pr "merge"` и `gh 'pr merge'` проходили — кавычки вокруг
  одного слова теперь снимаются до поиска; упоминание слияния в heredoc получало отказ — внешний
  поиск идёт по тексту без heredoc; `gh alias` назван в границах спутника. Сценарии хуков 102 ok;
  хук 94 строки.
  Списано: второй запрос к хосту в ярусе папки — было до задачи, в разнице его нет; ложный отказ на
  `echo pr merge` вне кавычек — исполнитель так не пишет, отказ закрыт, а не открыт.
- **2026-11-27. Первый круг ревью.** Три роли полного пути. Исправлено: полный путь и обёртка
  клиента, номер после ключей, цепочка слияний, адрес автора только из ключа, слитный `-A`,
  справка не судится, три разных отказа при неизвестной базе, `--repo` спрашивается адресом,
  слияние без токена машинной записи отбивается, один разбор и один запрос к хосту, таблица
  состава эпика. Сценарии хуков 85 ok.
  Списано:
  - кнопка владельца в `main` не входит в счётчик обращений — так было и до задачи, потому что
    слияние в `main` всегда шло кнопкой владельца;
  - хук не сверяет слово на эпик базы и `gh api …/merge` — принятая граница плана;
  - строка разбора о локальном слиянии — разбор после коммита плана не правится, решение
    записано ниже в том же разборе;
  - хук ловит слияние внутри текста heredoc — было до задачи, в разнице его нет.
- **Цена:** одно окно владельцу — одобрение плана и форма слияния вместе; два чтения плана ролями до
  коммита; первый круг ревью из трёх ролей нашёл обходы хука полным путём, обёрткой, номером после
  ключей и цепочкой — 162 строки правок; второй круг по риску.
- **Отменено:** сценарии в спецификации ворот поставки — легли в спецификацию подписи; один разбор
  номера регуляркой сразу после `merge` — заменён разбором аргументов каждого слияния.
- **2026-11-26. Строки профиля сжаты до одной.** `.claude/rt-kit/project.sh` стоял на 499 строках при пределе
  500: настройка `RT_MAIN_MERGE_BY_OWNER=1` идёт одной строкой с пояснением, а соседний комментарий
  слит в одну строку.

## Цитаты из разбора и хода работы

- `task-delivery-loop` says «The executor merges only by the owner's word.»

- The epic plan `docs/plans/owner-touches.md` holds П3 and the owner's decision on it; the word
  «Сливай задачи RT-3693 сам» is not written there yet.

- [x] 2.2 Цикл задачи называет слияние в ветку эпика исполнителем вместо строки «только по слову владельца»

- **Эпик:** RT-3693, задача 3 из 8; RT-3695 и RT-3696 влиты. Слово владельца 26.11: «Сливай задачи
  RT-3693 сам (Recommended)» — PR задач этого эпика в его ветку исполнитель сливает сам после зелёного
  набора и ревью; эпик в main сливает владелец. Шаг 2.3 пишет это слово в план эпика.

- **Что помнить:** слияние кнопкой хоста подписывает коммит личным адресом машинной учётной записи;
  ветка эпика переписана 26.11 по слову владельца «Переписать и force push (Recommended)».

## Одобрение плана

«Одобряю план RT-3701 (Recommended)»

## Чем подтверждено

- Путь полный (`node tools/review-path.mjs`: правка защит правил). Два круга ревью: первый — `qa-engineer`, `goal-critic`, `product-strategist`; второй — `qa-engineer`, `goal-critic`, назван командой `review-path.mjs --round-two --serious 3`.
- Первый круг — коммит «…после первого круга ревью (RT-3701)»: полный путь и обёртка клиента, номер после ключей, цепочка, адрес только из ключа, справка, причины отказа при неизвестной базе, `--repo`, токен машинной записи.
- Второй круг — коммит «…после второго круга ревью (RT-3701)»: разбор первого круга открыл новые обходы, исправлено одной формой команды.
- Списано с причиной: кнопка владельца в `main` вне счётчика обращений — так было и до задачи; слово на эпик базы, `gh api …/merge` и `gh alias` — граница плана; второй запрос к хосту в ярусе папки — было до задачи; ложный отказ на `echo pr merge` вне кавычек — отказ закрыт, а не открыт.
- Живая проверка: настоящий хук дерева на PR #3707, #3703 (база `main`) и #3708 (база ветки эпика), без слияния.
- Красный набор перед отправкой: сценарии состояния заявки ждали список полей без `baseRefName` — исправлено отдельным коммитом, все наборы хуков зелёные.
- Набор перед отправкой — зелёный перед этим PR.

## Оставшийся шаг

- Слияние этого PR исполнителем в ветку эпика RT-3693 формой из правила — первое настоящее слияние этой формой. Ветка эпика 26.11 переписана по слову владельца «Переписать и force push (Recommended)», потому что слияние кнопкой хоста подписало её личным адресом машинной записи. Сразу после — `git log -1 --format='%ae %ce' origin/RT-3693-owner-touches` и проход хука подписи на следующем пуше, ответ — в отчёт владельцу.
- Слово на каждый следующий эпик — окно одобрения его плана, RT-3699 (П4).
- Хук не сверяет слово на эпик базы и не видит `gh api …/merge` и кнопку в браузере — граница, записанная в спутнике правила.
- Выпуск пакета правил — один после слияния эпика в main.
