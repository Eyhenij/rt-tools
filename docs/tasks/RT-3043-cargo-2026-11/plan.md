# Plan

**Task:** RT-3043 · **Branch:** RT-3043-cargo-2026-11
**Behaviour:** unchanged — меняется только номер сценария в заголовке теста; слово владельца: «делай эпик с грузами приёмника дальше»

## Points

- **A:** `node tools/check-specs.mjs` красный на вершине `main`.
- **This task reaches:** ветка эпика проходит набор и уходит на сервер.
- **Sign:** `node tools/check-specs.mjs` без расхождений.
- **Milestone G of the epic:** все задачи влиты, ветка эпика влита в main, записи этого дерева стоят
  в «fixed».

## Stages

### 1. Номер сценария

- **Steps:**
    1. Сценарий и заголовок теста получают SC-AUTH-104
- **Readiness sign:** номер занят один раз.
- **Verified by:** `node tools/check-specs.mjs` — строки о занятом номере нет.
