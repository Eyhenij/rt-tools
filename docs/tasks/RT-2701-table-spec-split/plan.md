# План — RT-2701: описание таблицы второго кита делится

**Behaviour:** unchanged — правила и сценарии переезжают дословно; код кита не трогается.

## След задачи

- `docs/specs/ui-kit-v2/table-full-port/spec.md`, `implementation.md`, `scenarios.md`
- `docs/specs/ui-kit-v2/table-selection/spec.md`, `implementation.md`, `scenarios.md`
- `docs/plans/cargo-shell-edits-prose.md` — строка задачи в составе эпика

## Этапы

### 1. Разделение

- 1.1 Правила, привязки и сценарии выбора строк в новом описании
- 1.2 Родительское описание ссылается на новое

Готово, когда `node tools/check-file-size.mjs` без превышений и `npm run check:specs` зелёный.

### 2. Сдача

- 2.1 Строка задачи в плане эпика, проверки перед push
- 2.2 Папка задачи разобрана, PR в ветку эпика
