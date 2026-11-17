# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 3 of 4 — Одобрения
- **Done:** вход `live`, плашка в ленте с `role="status"`, спеки 21 и 11, типы, тексты, `check:specs` и проверка обзоров зелёные
- **Next step:** кадр Figma без изменения вида, вопрос владельцу об одобрении
- **Uncommitted:** нет
- **Waiting for the owner:** нет
- **PR:** not open yet

## Steps

- [x] 1.1 Вход `live` у `rt-message` и роль из него в шаблоне
- [x] 1.2 `live="status"` у плашки `notice` в блоках ответа
- [x] 1.3 Спеки SC-UKV-1329 (`rt-message`) и SC-UKV-1330 (плашка в ленте)
- [x] 2.1 Правило и сценарии в спеке ai-chat, привязки в `implementation.md`
- [x] 2.2 Вход `live` в Overview и CONTEXT `rt-message`
- [>] 3.1 Кадр Figma: вид не меняется, роль подписана; одобрение владельца
- [ ] 3.2 Витрина и сверка чисел; одобрение владельца
- [ ] 4.1 Папка задачи разобрана в архив, набор, PR в ветку эпика

## Decisions along the way

- **Сценарий один, SC-UKV-1329 — плашка в ленте.** У `rt-message` нет своего спека, его тесты идут без номеров; вход `live` проверен тестом `rt-message` без номера. Номер SC-UKV-1330 не занят. Affected stage of the plan: 1.

## Sessions

### 2026-11-17

- Задача заведена по находке ревью RT-3334, черновик правки готов.
