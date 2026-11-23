# Plan

**Task:** RT-3535 · **Branch:** RT-3535-plan-approval-one-voice
**Spec:** `docs/specs/agent-kit/turn-guards/flow-script/`
**Behaviour:** changes

## Points

- **A:** одобрение плана из окна с двумя вопросами не засчитывается проверкой метки, набранное
  «одобряю» не засчитывается совсем, отказы велят переписать план или переспросить, а переспрос
  судья вопросов держит как повтор — сессия другого дерева трижды просила владельца вписать фразу.
- **This task reaches:** владелец одобряет план один раз — в меню любым вопросом окна или словами
  в чате, в любом регистре, — и работа идёт дальше без повторной просьбы.
- **Sign:** наборы `flow-approval.test.sh`, `task-flow-script-steps.test.sh` и
  `flow-step-guard.test.sh` зелёные на случаях SC-AK-1870…1875; за 7 дней после выпуска 0.40.0 (`npm view @rt-tools/agent-kit version`) в приёмнике нет
  новых разборов «одобрение не засчитано».
- **Milestone G of the epic:** вне эпика — приказ владельца 23.11 разобрать приёмник малыми
  выпусками.
- **Metric:** нет: сломано засчитывание одобрения плана.

## Task footprint

| What  | Where |
| ----- | ----- |
| Specs | `docs/specs/agent-kit/turn-guards/flow-script/` |
| Laws  | `docs/constitution/work-conduct.md` |
| Rules (правится) | `projects/agent-kit/assets/rules/task-flow.md`, `projects/agent-kit/assets/defaults/turn-map.md` |
| Code (правится) | `projects/agent-kit/assets/task-flow/source/`, `projects/agent-kit/assets/task-flow/flow.js`, `projects/agent-kit/assets/checks/flow-plan.mjs`, `projects/agent-kit/assets/checks/flow-guard.mjs`, `projects/agent-kit/assets/hooks/facts-flow.sh`, `tools/task-flow/`, `tools/flow-plan.mjs`, `tools/flow-guard.mjs` |
| Tests | `projects/agent-kit/tests/` |

## What counts as done

- Ответ «Одобряю …» на второй вопрос окна засчитывается и `plan-red`, и проверкой метки.
- Набранное «одобряю план RT-N» и ответ меню «…, Одобряю RT-N и RT-M» засчитываются для RT-N.
- «Одобряю plan.md RT-7» не одобряет RT-12, «XRT-12» не одобряет RT-12; «не одобряю», «потом
  одобряю», цитата «Одобряю» и «Одобряю макет» на вопрос о макете план не одобряют.
- Отказ `plan-red` называет и меню, и набранное сообщение; отказ гарда работы и действие состояния
  «задача-взята» велят запустить `plan-red`, а не переспросить владельца.
- Утверждения спека движка говорят об одобрении так же, как код.

## Stages

### 1. Одно правило одобрения

- **Steps:**
    1. Правило `approvalOf` в owner.mjs и его набор
       Check: `bash projects/agent-kit/tests/flow-approval.test.sh 2>&1 | tail -1` → /^flow-approval: ([2-9]\d) ok, 0 провалов$/
    2. plan-red судит по правилу и называет оба вида ответа
       Check: `VERBOSE=1 bash projects/agent-kit/tests/task-flow-script-steps.test.sh 2>&1 | grep -c 'ok .*SC-AK-1873'` → >= 2
    3. Проверка метки судит по правилу
       Check: `VERBOSE=1 bash projects/agent-kit/tests/flow-step-guard.test.sh 2>&1 | grep -c 'ok .*SC-AK-1874'` → >= 2
    4. Отказ гарда работы велит запустить plan-red
       Check: `VERBOSE=1 bash projects/agent-kit/tests/flow-step-guard.test.sh 2>&1 | grep -c 'ok .*SC-AK-1875'` → >= 1
    5. Действие состояния задача-взята называет plan-red
       Check: `grep -c 'plan-red' projects/agent-kit/assets/task-flow/flow.js` → >= 1
- **Readiness sign:** три набора зелёные на новых случаях, отказы называют `plan-red`.
- **Verified by:** `bash projects/agent-kit/tests/flow-approval.test.sh` — последняя строка «0 провалов».

### 2. Тексты и раскладка

- **Steps:**
    1. Утверждения спека движка
       Check: `grep -c 'begins with «Одобряю»' docs/specs/agent-kit/turn-guards/flow-script/spec.md || true` → = 0
    2. Сценарии в спеке движка
       Check: `grep -c 'SC-AK-1870' docs/specs/agent-kit/turn-guards/flow-script/scenarios.md` → >= 1
    3. Раскладка в дерево
       Check: `grep -c 'approvalOf' tools/task-flow/source/owner.mjs` → >= 1
- **Readiness sign:** спек называет новые сценарии, разложенная копия совпадает с пакетом.
- **Verified by:** `node tools/check-specs.mjs` — без отказов.

## What this work does not do

- Правило задержки ask-judge не меняется: исключение в нём ослабило бы проверку.
- Гард макетов другого дерева и глагол «делай» — не проверка этого пакета.
- Требование гарда конца хода о меню «отложить» и «стоп» не меняется: после правки одобрение
  засчитывается, и меню не нужно.
- Измеритель выхода 5 не печатает причину отказа: он отвечает «да» или «нет», и причину называют
  отказ гарда и действие состояния.
- Выпуск 0.40.0 и закрытие записей приёмника — шаги цикла приёмника после трёх задач, не этой
  ветки.
