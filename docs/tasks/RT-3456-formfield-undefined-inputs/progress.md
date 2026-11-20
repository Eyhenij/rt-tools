# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 1 of 4 — Спек
- **Done:** задача, ветка, разбор, план; проба `ngc` воспроизвела семь TS2322
- **Next step:** правило и сценарии в спеке
- **Uncommitted:** папка задачи, строка назначения копии
- **Waiting for the owner:** нет
- **PR:** not open yet

## Steps

- [>] 1.1 Правило и сценарии `SC-UKV-1541`…`SC-UKV-1544` в спеке сигнальных форм
- [ ] 2.1 Тип записи `min`, `max` у `rt-date-picker` и `rt-input-number`, `minLength` у `rt-autocomplete`
- [ ] 2.2 Тип записи `min`, `max` у `rt-date-range` со значением диапазона
- [ ] 2.3 Спеки четырёх контролов с `form(model)` и `[formField]`
- [ ] 3.1 Проба `ngc` со `strictTemplates` на хосте из семи контролов
- [ ] 3.2 Сборка пакета и витрина
- [ ] 4.1 Первый круг ревью и правки
- [ ] 4.2 Второй круг ревью и правки
- [ ] 4.3 Набор перед отправкой, отправка, PR в `main`
- [ ] 4.4 Слияние после зелёного прогона
- [ ] 4.5 Выпуск патч-версии и сверка с npm

## Decisions along the way

## Sessions

### 2026-11-20

- Проба `ngc` со `strictTemplates` до правки: семь TS2322 — `rt-date-picker` 2, `rt-date-range` 2,
  `rt-input-number` 2, `rt-autocomplete` 1; `rt-input`, `rt-select`, `rt-textarea` чистые.
