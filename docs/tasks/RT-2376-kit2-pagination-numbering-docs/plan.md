# План

**Task:** RT-2376 · **Branch:** RT-2376-kit2-pagination-numbering-docs
**Behaviour:** unchanged — правка описания для витрины, код кита не меняется; отказ ворот назвал её сам

## След задачи

| Что | Где                                                 |
| --- | --------------------------------------------------- |
| Код | `projects/ui-kit-v2/src/lib/components/pagination/` |
| Ход | `docs/tasks/RT-1870-one-kit/progress.md`            |

## Что считается сделанным

- Таблица «Входы» описания полосы страниц называет `numbering`; проверка входов по описаниям
  зелёная.
- Ход эпика записывает влитую RT-2374 и пересобранный пакет.

## Этапы

### 1. Описание входа

- **Steps:**
    1. Описать вход `numbering` в таблице «Входы»
    2. Записать ход эпика
- **Readiness sign:** `node tools/verify-ui-kit-v2-docs.cjs` без расхождений.
- **Verified by:** `node tools/verify-ui-kit-v2-docs.cjs`

### 2. PR

- **Steps:**
    1. Открыть PR в ветку эпика
- **Readiness sign:** ворота отправки пропускают ветку.
- **Verified by:** `git push` без отказа
