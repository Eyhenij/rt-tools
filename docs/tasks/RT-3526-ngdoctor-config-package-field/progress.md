# Progress

## Where we stand

- **State:** `разбор-кончился`
- **Stage:** 1 of 1 — Поле angularDoctor судится как файл настройки
- **Done:** план одобрен словом «Одобряю plan.md RT-3526»; plan-red: 1.1 → 0, 1.2 → red; шаги
  совпали: 1.1 → 5, 1.2 → 3; набор `check-ngdoctor` 85 ok в обеих локалях
- **Next step:** живая проверка на копии дерева, затем первый круг ревью
- **Uncommitted:** нет
- **PR:** not open yet

## Steps

- [x] 1.1 Проверка судит поле angularDoctor корневого package.json; сценарии называют каждый случай
- [x] 1.2 Шапка проверки называет второе место настройки, проверка зелёная на дереве, наборы проверок дерева зелёные

## Live check

Копия дерева без `node_modules`, `dist`, `.git`, со ссылкой на `node_modules` дерева, настоящий
инструмент 0.3.0, в корневой `package.json` копии вписано поле `angularDoctor`,
`node tools/check-ngdoctor.mjs` без флагов:

- `{"rules":{"angular-doctor/inner-html":"off"}}` — код 1, «package.json#angularDoctor holds
  «rules»: only reportPath is allowed»;
- `false` — код 1, «package.json#angularDoctor is not an object: false»;
- `{"reportPath":"tmp/angular-doctor-report.md"}` — код 0, «score 94.75, 1300 findings of 11 rules
  — equal to the threshold».

Без флага судится настоящий корневой `package.json`.

## Decisions along the way

## Sessions

### 23.11.2026

- Задача взята по слову владельца «Да, завести обе». Вопрос владельцу о поле был лишним — ответ
  стоял в карточке; разбор инцидента отправлен в приёмник.
