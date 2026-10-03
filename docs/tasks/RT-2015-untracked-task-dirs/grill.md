# Grill

## The owner request

> Взять RT-2015, Взять RT-2041

Ответ на ревизию доски 3 октября 2026 года. Задачу RT-2015 владелец открыл раньше; её тело
описывает дефект и что считать сделанным.

## What the tree already has

- `tools/check-board.mjs` (пакет: `checks/check-board.github.mjs`) обходит папки задач через
  `taskDirs` и называет папку закрытой задачи. Индекс git он не спрашивает.
- `tools/board-task-dirs.mjs` (пакет: `checks/board-task-dirs.github.mjs`) распознаёт номер в имени
  папки и обходит папки.
- `tools/task-new.mjs` копирует образец в `docs/tasks/<ветка>/` при каждом заведении задачи.
- Описание `docs/specs/agent-kit/work/queue-check/` перечисляет, что видит проверка очереди работ.
- Тест `projects/agent-kit/tests/checks-board-folders.test.sh` уже строит дерево-фикстуру с git.

## What the rules already say

Правило `task-flow`: папка задачи попадает в ветку коммитом; вне истории законен только черновик
без номера.

## Questions and answers

**Что делать с тем, что `task:new` кладёт папку всегда?**
«Класть, только проверять».

## Decisions

- **`task:new` не меняется** — так ответил владелец. Отклонено: не создавать папку без черновика и
  флаг `--take`.
- **Отказ стоит в `check-board`, рядом с проверкой черновиков** — он читает только диск и работает
  без сети.

## What is left unclear

- Нет.
