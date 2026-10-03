# Grill

## The owner request

> Взять RT-2015, Взять RT-2041

Ответ на ревизию доски 3 октября 2026 года. Тело задачи: отказ набора по двусмысленному имени
написан и ниоткуда не вызывается.

## What the tree already has

- `projects/agent-kit/src/lib/integrity.ts:ambiguousNames` находит ресурсы одного рода с
  одинаковым последним звеном имени. Вызывается только из `integrity.spec.ts`.
- Описание `docs/specs/agent-kit/layout/` держит правило «Two resources of one kind with the same
  last link of the name are a refusal of the set», а его привязка помечена «Не исполняется».
- `sync.ts:planSync` уже собирает отказ по ресурсу без вида под выбор дерева (`gaps`), а
  `commands.ts` печатает его и отбивает установку файлов целиком.

## What the rules already say

Правило `spec-driven`: привязка не ведёт в код, который никто не зовёт, и тест вызовом не считается.

## Questions and answers

**Как довести задачу: отказ в sync, предупреждение в doctor или признать тест проверкой?**
«Отказ в sync и sync --check».

## Decisions

- **Отказ по образцу `gaps`** — тот же путь от плана установки до строки отказа. Отклонены:
  предупреждение в `doctor` (установка проходит молча), признание теста вызовом (против статьи
  правила).

## What is left unclear

- Нет.
