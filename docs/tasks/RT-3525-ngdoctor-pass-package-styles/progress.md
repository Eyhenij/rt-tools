# Progress

## Where we stand

- **State:** `разбор-кончился`
- **Stage:** 1 of 1 — Проход по package.json и стилям
- **Done:** план одобрен словом «Одобряю plan.md RT-3525», plan-red: 1.1 → 1, 1.2 → 0; шаги
  совпали: 1.1 → 8, 1.2 → 1; набор `check-ngdoctor` 80 ok в обеих локалях
- **Next step:** первый круг ревью
- **Uncommitted:** нет
- **PR:** not open yet

## Steps

- [x] 1.1 Проход читает package.json и стили, как инструмент; сценарии называют каждую потерю и каждую границу
- [x] 1.2 Проверка Angular Doctor зелёная на дереве и считает 15 package.json, наборы проверок дерева зелёные

## Live check

Копия дерева без `node_modules`, `dist`, `.git`, со ссылкой на `node_modules` дерева, настоящий
инструмент 0.3.0, `node tools/check-ngdoctor.mjs`:

- чистая копия — код 0, «the pass read every file: 2694 files, 598 templates, oxlint 2290 files,
  15 package.json, 0 stylesheets», порог равен;
- `projects/utils/package.json` с правами 000 — код 1, «the pass cannot read
  projects/utils/package.json: EACCES»;
- тот же файл с текстом `{"name": ` — код 1, «projects/utils/package.json is not JSON:
  angular-doctor reads no finding from it».

## Decisions along the way

## Sessions

### 23.11.2026

- Задача заведена по слову владельца «Да, завести обе». Ответ на вопрос о потере — «Как читает
  инструмент». План прочли стратег и критик цели до одобрения: убраны чтение `tailwind.config.*`
  и корневой `package.json` как случай сценариев, добавлены границы `tailwindcss` 3 и `coverage/`.
