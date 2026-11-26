# Grill

## The owner request

> я закрыл пр, работай дальше

Сказано после передачи 26.11, где названо, что отправку ветки эпика RT-3624 держат два файла
длиннее предела после слияния main. Задача эпика заведена по правилу `git-workflow`: починка после
слияния идёт в ветке задачи от вершины эпика.

## What the tree already has

- `node tools/check-file-size.mjs`: `.claude/skills/task-delivery-loop-run/SKILL.md` — 333 строки при
  пределе текста 330; `projects/agent-kit/tests/task-flow-script-steps.test.sh` — 503 при пределе
  кода 500.
- Набор `task-flow-script-steps.test.sh` подключается из `task-flow-script.test.sh`, как и
  `task-flow-script-merge.test.sh`, у которого есть заголовок для отдельного запуска.
- В правиле цикла абзацы о подписи коммита и о показе витрины разбиты короткими строками.

## What the rules already say

Предел не обходится списком исключений: файл делится (`check-file-size` это говорит). Правило у
предела сворачивает довод или делится (`doc-style`).

**Tasks of the grill:** 1

## Questions and answers

Вопросов нет: что делать, называет отказ проверки.

## Decisions

- **Набор делится на два файла:** блоки перемера `step --done --pr` — SC-AK-1739 и пять случаев SC-AK-1794 — уходят в `task-flow-script-recheck.test.sh`.
  Отвергнуто: склеивать строки сценариев — это обход предела.
- **Правило теряет разбитые строки, а не статью.** Отвергнуто: выносить раздел в холодную часть —
  больше правки, чем три строки.

## What is left unclear

Ничего.
