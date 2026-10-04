# Grill

## The owner request

> Обе (Recommended)

Ответ на две правки, которые предложила проверка закрытой RT-2015 по правилам.

## What the tree already has

- `.claude/skills/task-flow/implementation.md` — строка привязки статьи «The task folder goes into
  the branch by a commit» называет только проверку правки.
- `projects/agent-kit/assets/patterns/git-workflow-commit.github.md` — образец заведения задачи и
  ветки; о задаче закрытого эпика в нём ничего нет.

## What the rules already say

`spec-driven-rule`: статья, которую держат несколько мест, называет их все.

## Questions and answers

**Какие из двух правок применить?**
«Обе (Recommended)».

## Decisions

- **Справка task-flow правится на месте** — у файла нет шапки установки, он принадлежит дереву.
- **Абзац о закрытом эпике — в ресурс пакета** — строку эпика в теле задачи и проверку, которая её
  читает, поставляет пакет.

## What is left unclear

- Нет.
