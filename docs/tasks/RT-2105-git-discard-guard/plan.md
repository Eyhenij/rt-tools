# Plan

**Task:** RT-2105 · **Branch:** RT-2105-git-discard-guard
**Behaviour:** unchanged — правится пакет правил: новая проверка, тесты, статья; владелец: «разбери все жалобы и предложения из приёмника»

## Task footprint

| What   | Where                                                                                   |
| ------ | --------------------------------------------------------------------------------------- |
| Hook   | `projects/agent-kit/assets/hooks/git-guard-discard.sh`                                  |
| Tests  | `projects/agent-kit/tests/git-guard-discard.test.sh`                                    |
| Rules  | `projects/agent-kit/assets/rules/git-workflow.github.md`, `.azure.md`, `.gitlab.md`     |
| Copies | `.claude/hooks/git-guard-discard.sh`, `.claude/skills/git-workflow/SKILL.md` — командой |

## What counts as done

- `git reset --hard`, `git checkout -- <путь>`, `git restore <путь>` и `git clean -f` при непустом
  рабочем дереве отбиваются с перечнем файлов; на чистом дереве проходят; с `# discard: <причина>`
  проходят; `--soft` и чтение истории не трогаются.
- Статья в трёх вариантах правила поставки: снятие коммита — `--soft`; `--hard` только ради
  выброса правок, названных поимённо до вызова.
- Копии положены командой; проверки хуков зелёные.

## Stages

### 1. Проверка и её тесты

- **What is done:** написан `git-guard-discard.sh` по образцу `git-guard-main.sh` и набор
  сценариев к нему.
- **Readiness sign:** набор проверки зелёный.
- **Verified by:** `bash projects/agent-kit/tests/git-guard-discard.test.sh` — 0 FAIL.

### 2. Статья правила в трёх вариантах

- **What is done:** статья добавлена в `git-workflow.github.md`, `.azure.md`, `.gitlab.md`.
- **Readiness sign:** статья стоит в каждом файле.
- **Verified by:** `grep -c 'is not taken to drop a commit' projects/agent-kit/assets/rules/git-workflow.*.md` — 1 в каждом (сейчас 0).

### 3. Сборка, установка копий, проверки хуков

- **What is done:** пакет собран, копии положены, проверки хуков прогнаны.
- **Readiness sign:** ни одна не отказывает.
- **Verified by:** `pnpm run agent-kit:check && node tools/check-hooks.mjs && node tools/check-hook-scope.mjs` — код выхода 0.

## What this work does not do

- Не судит `git stash` и `git branch -D`: запись их не называет.
- Не ставит записи `fixed` — после слияния, утром.
