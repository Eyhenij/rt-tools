# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 3 of 4 — Живая проверка
- **Done:** спек, входы четырёх контролов, четыре спеки; проба `ngc` — ноль ошибок
- **Next step:** сборка пакета, затем первый круг ревью
- **Uncommitted:** правка входов, спеки, спек сигнальных форм, CONTEXT.md четырёх контролов
- **Waiting for the owner:** нет
- **PR:** not open yet

## Steps

- [x] 1.1 Правило и сценарии `SC-UKV-1541`…`SC-UKV-1544` в спеке сигнальных форм
- [x] 2.1 Тип записи `min`, `max` у `rt-date-picker` и `rt-input-number`, `minLength` у `rt-autocomplete`
- [x] 2.2 Тип записи `min`, `max` у `rt-date-range` со значением диапазона
- [x] 2.3 Спеки четырёх контролов с `form(model)` и `[formField]`
- [x] 3.1 Проба `ngc` со `strictTemplates` на хосте из семи контролов
- [>] 3.2 Сборка пакета и витрина
- [ ] 4.1 Первый круг ревью и правки
- [ ] 4.2 Второй круг ревью и правки
- [ ] 4.3 Набор перед отправкой, отправка, PR в `main`
- [ ] 4.4 Слияние после зелёного прогона
- [ ] 4.5 Выпуск патч-версии и сверка с npm

## Decisions along the way

- **Сценарии получили номера `SC-UKV-1582`…`SC-UKV-1585`, а не `1541`…`1544`.** Свободный номер
  выдаёт `pnpm run spec:next-id SC-UKV`, и `1541`…`1581` уже заняты. Affected stage of the plan: 1.
- **Общий преобразователь границы лежит в `form-control`, тип записи входа — в обвязке спек.**
  `rtBoundOrNull` и `rtDayBoundOrNull` нужны трём контролам, `TRtInputWrite` — четырём спекам.
  Affected stage of the plan: 2.
- **Nx в этой копии падал на плагине webpack.** Причина — не сгенерирован клиент хранилища;
  `pnpm run prisma:generate` вылечил. Affected stage of the plan: 3.

## Sessions

### 2026-11-20

- Проба `ngc` со `strictTemplates` до правки: семь TS2322 — `rt-date-picker` 2, `rt-date-range` 2,
  `rt-input-number` 2, `rt-autocomplete` 1; `rt-input`, `rt-select`, `rt-textarea` чистые.
- После правки: ноль ошибок; прямые `[min]="null"`, строка и число собираются, число на месте
  границы дня по-прежнему даёт TS2322.
- Утверждения о типе в спеках на коде из `main` дают те же семь TS2322, на правке — ноль.
- Спеки сигнальных форм: 5 файлов, 19 тестов зелёные. Аудит спек: выход 0.
