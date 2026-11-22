# Plan

**Task:** RT-3427 · **Branch:** RT-3427-long-rules-fit-2
**Behaviour:** unchanged — код приложений не меняется. Меняются тексты правил пакета и дерева: горячие части девяти правил помещаются в выдачу проверки правил вместе с соседями, а доводы и примеры уходят в холодные части.

## Points

- **A:** проба проверки правил на копии дерева 22.11 даёт 37 «pass» из 43 строк. Отказывают:
  правка хранилища, панели записи и компонента кита с `window.` в тексте — вместе с
  `platform-access` 5 645 байт; правка сервиса и входа приёмника с `process.env` —
  `observability` 14 133 байта длиннее предела; правка плана эпика — вместе с
  `task-delivery-loop` 9 399 байт. За 14–21.11 без записей пробы «вместе» 29 и «слишком длинное»
  27; из них 28 приходятся на правила этой задачи.
- **This task reaches:** правка с `window.`, с `process.env` и правка плана эпика получают правила
  одним куском с первого раза: проба печатает «pass» на всех 43 строках.
- **Sign:** проба `gate-probe.sh` — 43 «pass»; сверка смысла — 0 потерь, таблица имён в горячей
  части; пересказ вслепую и сверка критиком на итоговом тексте — 0 потерь у каждого из девяти
  правил. Видит исполнитель, числа в ходе работы.
- **Milestone G of the epic:** за рабочий день отказов меньше пяти на сто вызовов и ни одного
  тупика. `skill-gate` даёт 0,32–0,58 отказа на сто за 19–21.11; задача снимает отказы на строках
  пробы. Отказы «вместе» на папке задачи и на командах с телом PR и карточки она не снимает: им
  нужна выдача правил частями, это решение владельца.
- **Metric:** записи `gate-deny` с `why: together` и `why: too-long` за неделю после слияния эпика
  в `main`, без записей пробы; база 14–21.11 — 29 и 27, вниз.

## Task footprint

| What  | Where                                                         |
| ----- | ------------------------------------------------------------- |
| Code (правится) | `projects/agent-kit/assets/rules/observability.needs-app.md`, `platform-access.md`, `epic-flow.md`, `mockups.needs-mockups.md`, `queue-audit.github.md`, `task-flow.md`, `task-flow-owner.md` |
| Code (правится) | `projects/agent-kit/assets/patterns/doc-style-human.md`        |
| Code (правится) | `projects/agent-kit/assets/pitfalls/` — холодные части тех же правил |
| Code (правится) | `.claude/skills/task-delivery-loop/SKILL.md`, `.claude/skills/task-delivery-loop/pitfalls.md` — правило дерева |
| Code (правится) | `.claude/rt-kit/overrides/rules/task-flow.md`, `.claude/rt-kit/overrides/rules/task-flow-owner.md` |
| Code (правится) | `.claude/skills/` — разложенные копии, `pnpm run agent-kit:sync` |
| Specs | `docs/specs/agent-kit/patterns/implementation.md`              |
| Rules | `.claude/skills/agent-kit-source/`, `.claude/skills/spec-driven/`, `.claude/skills/doc-style/` — читаются |

## What counts as done

- Горячая часть каждого из девяти правил держит заявление, границу, исключение и признак каждой
  статьи и таблицу имён; доводы и примеры стоят в холодной части слово в слово.
- Восемь правил не длиннее 3 000 знаков, `platform-access` — 2 700: столько оставляет строка
  хранилища с `window.`. Знаки считаются как у проверки правил: `LC_ALL=en_US.UTF-8 wc -m`.
- `observability` не длиннее 4 800 знаков: одни его таблица имён и 29 заявлений весят около
  4 200, и 3 000 их не вмещают без потери смысла. Это отступ от слов «ужимай до 3000», и PR
  называет его первой строкой.
- `task-delivery-loop` держит горячими статьи, таблицу имён и пять обязанностей из шагов одной
  строкой каждая: PR в `main` — черновик, в ветку эпика — готовый; `goal-critic` не получает план;
  `skill-curator` идёт в фоне; экран показывается владельцу; после слияния в тот же ход берётся
  следующая задача. Сами шаги и раздел «After the owner answers» уходят в его холодную часть.
- Таблица состояний `task-flow` пишется `tools/flow-sync.mjs` в горячую часть и остаётся в ней.
- Проба печатает «pass» на всех 43 строках `gate-probe-paths.txt` и не пишет в наблюдения дерева.
- Сверка смысла `meaning-check.mjs` от коммита до работы находит 0 потерь: абзацы старой горячей
  части стоят в папке правила, заявления статей и строки таблицы имён — в горячей части.
- Пересказ вслепую каждого сжатого правила ролью-читателем по новой горячей части и сверка
  критиком со старым текстом целиком, вместе с шагами, записаны в `retell.md`: 0 потерь у каждого
  из девяти правил.
- Разложенные копии сходятся с пакетом; границы пакета и описания проверены.

## Stages

### 1. The package rules fit

Rules: the hot part keeps the statement, the boundary, the exception and the sign of every article
and the table of names; arguments and examples go into the cold part word for word; a rule is not
cut below what its line of the probe needs.

- **Steps:**
    1. observability fits with the rules of a service of the receiver
       Check: `LC_ALL=en_US.UTF-8 wc -m < .claude/skills/observability/SKILL.md | tr -d ' '` → <= 4800
    2. platform-access fits with the three rules of a store edit
       Check: `LC_ALL=en_US.UTF-8 wc -m < .claude/skills/platform-access/SKILL.md | tr -d ' '` → <= 2700
    3. epic-flow, mockups and queue-audit fit
       Check: `for r in epic-flow mockups queue-audit; do LC_ALL=en_US.UTF-8 wc -m < .claude/skills/$r/SKILL.md; done | sort -n | tail -1 | tr -d ' '` → <= 3000
    4. task-flow and task-flow-owner fit with their overrides
       Check: `for r in task-flow task-flow-owner; do LC_ALL=en_US.UTF-8 wc -m < .claude/skills/$r/SKILL.md; done | sort -n | tail -1 | tr -d ' '` → <= 3000
    5. doc-style-human fits
       Check: `LC_ALL=en_US.UTF-8 wc -m < .claude/skills/doc-style-human/SKILL.md | tr -d ' '` → <= 3000
- **Readiness sign:** `pnpm run -s agent-kit:check` and `npm run -s check:boundary` exit 0.
- **Verified by:** `pnpm run -s agent-kit:check` — exit 0.

### 2. The loop of a task fits

Rules: the rule of the tree keeps its articles, the table of names and the five duties of the steps
hot; the steps of one task and the moves after the owner's answer go to its cold part.

- **Steps:**
    1. task-delivery-loop fits with the rules of an edit of the epic plan
       Check: `LC_ALL=en_US.UTF-8 wc -m < .claude/skills/task-delivery-loop/SKILL.md | tr -d ' '` → <= 3000
- **Readiness sign:** the probe passes the line `docs/plans/x.md`.
- **Verified by:** `bash docs/tasks/RT-3427-long-rules-fit-2/gate-probe.sh "$PWD" docs/tasks/RT-3427-long-rules-fit-2/gate-probe-paths.txt` — the line of the epic plan prints «pass».

### 3. Every line passes, and nothing is lost

Rules: every line of the probe passes on the first call; nothing of the old hot parts is lost by
the machine check; a reader retells each compressed rule without the old text, a critic compares
it with the old text whole, and a loss goes back into the hot part.

- **Steps:**
    1. The probe passes every line and the meaning check finds no loss
       Check: `[ "$(node docs/tasks/RT-3427-long-rules-fit-2/meaning-check.mjs bad7711d8 observability task-delivery-loop doc-style-human platform-access epic-flow mockups queue-audit task-flow-owner task-flow | tail -1)" = 0 ] && bash docs/tasks/RT-3427-long-rules-fit-2/gate-probe.sh "$PWD" docs/tasks/RT-3427-long-rules-fit-2/gate-probe-paths.txt | grep -c ' pass ' | tr -d ' '` → = 43
    2. The blind retelling and the critic find no loss in each of the nine rules
       Check: `[ "$(grep -c '^- loss:' docs/tasks/RT-3427-long-rules-fit-2/retell.md)" = 0 ] && grep -c '^- rule: .* — losses 0$' docs/tasks/RT-3427-long-rules-fit-2/retell.md | tr -d ' '` → = 9
- **Readiness sign:** the probe prints «pass» for all 43 lines; `retell.md` names nine rules with
  no loss.
- **Verified by:** the probe, the meaning check and `retell.md`.

## What this work does not do

- Не снимает отказы «вместе» на правке хода работы, разбора и плана папки задачи и на командах с
  телом PR и карточки (`gh pr create`, `gh pr edit`, `gh issue create`, `task:new`): их наборы
  правил больше 10 000 знаков даже при нуле знаков у сжимаемых правил. Это выдача правил частями
  в `hooks/skill-gate.sh` или правка карты — решение владельца; находка рядом с планом эпика.
- Не делит `observability` на два правила: держит его до 4 800 знаков.
- Не поднимает предел хоста и не меняет карту проверки правил.
- Не сжимает правила, которые уже меньше 3 000 знаков (`doc-style`, `git-workflow`,
  `task-flow-plan` и другие).
- Не выпускает пакет и не судит метрику до слияния эпика в `main`: проверка читает разложенные
  правила своей копии.
