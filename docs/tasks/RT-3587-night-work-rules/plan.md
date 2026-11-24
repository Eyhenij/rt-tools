# Plan

**Task:** RT-3587 · **Branch:** RT-3587-night-work-rules
**Behaviour:** unchanged — слово владельца 24.11.2026: «исправь все что нашел»; правка правил и защит, приложения не меняются

## Points

- **A:** закон, правило, образец и команда ночной работы запрещают отправку, PR и слияние, которые
  владелец разрешил сам; закон доставки требует слова о каждом PR; защита конца хода и защита
  согласий кита ночью открывают окно владельцу.
- **This task reaches:** владелец, уходя, называет, что можно сделать ночью, и ни один текст не
  спорит с ним; ночь не встаёт ни на меню, ни на окне защиты.
- **Sign:** сценарии защиты конца хода и защиты согласий кита ночью дают умолчание вместо окна, а
  днём после ночи — окно; `pnpm run agent-kit:hooks` и `bash tools/tests/run.sh` зелёные.
- **Milestone G of the epic:** RT-3597 — ночью защиты дают умолчание вместо окна.
- **Metric:** нет: исправление того, что ночью сломалось.

## Task footprint

| What             | Where                                                                                                        |
| ---------------- | ------------------------------------------------------------------------------------------------------------ |
| Laws             | `projects/agent-kit/assets/laws/autonomous-work.md`, `projects/agent-kit/assets/laws/delivery.md`            |
| Rules            | `projects/agent-kit/assets/rules/autonomous-work.md`, `.claude/skills/autonomous-work/implementation.md`     |
| Rules            | `projects/agent-kit/assets/patterns/autonomous-work-run.md`, `projects/agent-kit/assets/commands/night.md`   |
| Specs (правится) | `docs/specs/agent-kit/turn-guards/flow-script/exit/`                                                         |
| Code (правится)  | `projects/agent-kit/assets/checks/flow-verdict.mjs`, `projects/agent-kit/assets/checks/task-flow-script.mjs` |
| Code (правится)  | `.claude/hooks/kit-approval-guard.sh`                                                                        |
| Tests            | `projects/agent-kit/tests/turn-exit-guard.test.sh`, `tools/tests/kit-approval-guard.test.sh`                 |

## What counts as done

- Закон, правило, образец и команда допускают действие, которое владелец назвал, а старые запреты
  без исключения из них ушли.
- Закон доставки признаёт заранее сказанное слово владельца о классе слияний.
- Правило называет репетицию ночных вызовов, прерванный вызов, ход без обещания, приказ «сам» не
  как одобрение и ночной разбор.
- `/night` пишет границу машинной строкой; защита конца хода и защита согласий кита читают её и
  ночью дают умолчание, а днём после ночи — окно; сценарии ловят оба случая.

## Stages

### 1. Тексты ночной работы

- **Steps:**
    1. Закон ночной работы допускает действие, которое владелец назвал
       Check: `grep -c "unless the owner named it" projects/agent-kit/assets/laws/autonomous-work.md` → >= 1
    2. Закон доставки признаёт заранее сказанное слово о классе слияний
       Check: `grep -c "named in advance" projects/agent-kit/assets/laws/delivery.md` → >= 1
    3. Правило снимает запрет без исключения
       Check: `grep -c "Nothing goes outside during the night\.\*\*" projects/agent-kit/assets/rules/autonomous-work.md` → = 0
    4. Правило не откладывает PR на утро
       Check: `grep -c "the PR is opened in the morning" projects/agent-kit/assets/rules/autonomous-work.md` → = 0
    5. Правило не откладывает внешний шаг отказа на утро без разрешения
       Check: `grep -c "not carried out at night" projects/agent-kit/assets/rules/autonomous-work.md` → = 0
    6. Правило называет исключение для названного владельцем
       Check: `grep -c "except what the owner named" projects/agent-kit/assets/rules/autonomous-work.md` → >= 1
    7. Правило называет репетицию вызовов до ухода владельца
       Check: `grep -c "permission prompt" projects/agent-kit/assets/rules/autonomous-work.md` → >= 1
    8. Правило называет прерванный вызов и ход без обещания
       Check: `grep -c "cancels that call, not the session" projects/agent-kit/assets/rules/autonomous-work.md` → >= 1
    9. Правило: приказ работать самому — не одобрение
       Check: `grep -c "is not an approval" projects/agent-kit/assets/rules/autonomous-work.md` → >= 1
    10. Правило называет ночной разбор промаха
        Check: `grep -c "incident analysis" projects/agent-kit/assets/rules/autonomous-work.md` → >= 1
    11. Образец снимает запрет и строку «ждёт PR»
        Check: `grep -c "Nothing goes outside during the night: no" projects/agent-kit/assets/patterns/autonomous-work-run.md` → = 0
    12. Образец допускает названное владельцем
        Check: `grep -c "unless the owner named it" projects/agent-kit/assets/patterns/autonomous-work-run.md` → >= 1
    13. Команда ночи не обещает, что ничего не уйдёт наружу
        Check: `grep -c "does not merge and does not open requests" projects/agent-kit/assets/commands/night.md` → = 0
    14. Команда ночи пишет разрешение и границу в голову списка
        Check: `grep -c "Автономно до:" projects/agent-kit/assets/commands/night.md` → >= 1
- **Readiness sign:** ни один из четырёх текстов не запрещает названное владельцем.
- **Verified by:** `grep -c "nothing goes outside during the night" projects/agent-kit/assets/commands/night.md` — 0;
  `grep -c "Разрешено:" projects/agent-kit/assets/commands/night.md` — не меньше 1.

### 2. Защиты ночью

- **Steps:**
    1. Вердикт защиты конца хода ночью даёт умолчание вместо меню
       Check: `grep -c "An autonomous session does not ask the owner" projects/agent-kit/assets/checks/flow-verdict.mjs` → >= 1
    2. Сценарий: граница впереди даёт умолчание, прошедшая — меню
       Check: `grep -c "night boundary ahead gives a default" projects/agent-kit/tests/turn-exit-guard.test.sh` → >= 1
    3. Защита согласий кита ночью отказывает вместо окна
       Check: `grep -c "Автономно до" .claude/hooks/kit-approval-guard.sh` → >= 1
    4. Сценарии защиты согласий кита: ночь и день
       Check: `grep -c "night refuses instead of the window" tools/tests/kit-approval-guard.test.sh` → >= 1
    5. Правила и защита разложены в дерево
       Check: `grep -c "unless the owner named it" docs/constitution/autonomous-work.md` → >= 1
- **Readiness sign:** набор хуков и набор сценариев дерева зелёные, разложенное сходится с пакетом.
- **Verified by:** `pnpm run agent-kit:hooks` — «ВСЕ НАБОРЫ ЗЕЛЁНЫЕ»; `bash tools/tests/kit-approval-guard.test.sh`
  без FAIL; `pnpm run agent-kit:check`.

## What this work does not do

- Форму вызова PR машинным аккаунтом не меняет: защита доставки узнаёт автора по подстановке
  токена. Правило разрешения на неё ставит владелец до ухода — статья шага 1.7.
- Статьи прочих правил по находкам ревью — RT-3588 и RT-3589.
