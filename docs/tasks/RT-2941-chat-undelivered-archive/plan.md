# Plan

**Task:** RT-2941 · **Branch:** RT-2941-chat-undelivered-archive
**Behaviour:** unchanged — правится только текст записи архива, код не трогается

After it is written this file is not edited. A stage revision goes to `progress.md` as a decision
along the way.

## Task footprint

| What   | Where                                      |
| ------ | ------------------------------------------ |
| Запись | `docs/archive/RT-2938-chat-undelivered.md` |
| Rules  | `.claude/skills/archive-record/`           |

## What counts as done

- Пункт про Figma в записи RT-2938 описывает сделанное, и PR с правкой открыт.

## Stages

### 1. Правка записи

- **Steps:**
    1. Переписать пункт про Figma в записи RT-2938
    2. Разобрать папку задачи в запись архива
- **Readiness sign:** в записи нет слов «не собран»
- **Verified by:** `grep -c "не собран" docs/archive/RT-2938-chat-undelivered.md` — выводит 0

## What this work does not do

- Не правит Figma и код `rt-chat`.
