# Plan

**Task:** RT-2103 · **Branch:** RT-2103-cargo-rules-gaps
**Behaviour:** unchanged — правятся тексты правил пакета; владелец: «разбери все жалобы и предложения из приёмника»

## Task footprint

| What   | Where                                                                                   |
| ------ | --------------------------------------------------------------------------------------- |
| Rules  | `projects/agent-kit/assets/rules/browser-verification.md`                               |
| Rules  | `projects/agent-kit/assets/rules/git-workflow.azure.md`, `git-workflow.gitlab.md`       |
| Copies | `.claude/skills/browser-verification/SKILL.md` — установленная копия, кладётся командой |

## What counts as done

- В правиле проверки в браузере стоит статья о приёмке переноса вида: кадр своего экрана рядом с
  кадром образца; измерение, собранное автором под свою правку, не подтверждает.
- Варианты правила поставки для Azure и GitLab несут две статьи из варианта для GitHub: рабочее
  дерево опустошается до открытия PR; push в ветку с открытым PR ведёт к перечитыванию тела.
- Установленные копии совпадают с источником.

## Stages

### 1. Статья о приёмке вида

- **What is done:** в `browser-verification.md` после статьи об измерении до показа добавлена
  статья о приёмке переноса вида.
- **Readiness sign:** статья находится в источнике.
- **Verified by:** `grep -c 'next to the sample' projects/agent-kit/assets/rules/browser-verification.md` — печатает `1` (сейчас `0`).

### 2. Две статьи о поставке в вариантах Azure и GitLab

- **What is done:** статьи «The working tree is emptied before the PR opens» и «A push into a
  branch that has an open PR is followed by rereading its body» перенесены в оба варианта.
- **Readiness sign:** обе статьи стоят в обоих файлах.
- **Verified by:** `grep -c 'emptied before the PR opens\|followed by rereading its body' projects/agent-kit/assets/rules/git-workflow.azure.md projects/agent-kit/assets/rules/git-workflow.gitlab.md` — `2` для каждого файла (сейчас `0`).

### 3. Сборка и установка копий

- **What is done:** пакет собран, копии в `.claude/` положены командой.
- **Readiness sign:** проверка установки не находит расхождений.
- **Verified by:** `pnpm run agent-kit:check` — код выхода 0.

## What this work does not do

- Не заводит блокирующую проверку разрушительных команд гита — отдельная задача RT-…, следующая
  в цепочке ночи.
- Не ставит отметки `fixed` записям приёмника, которые закрывает: они чужие и закрываются
  издателем после слияния — строка об этом в списке к утру.
