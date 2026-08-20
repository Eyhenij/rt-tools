# Привязка — кнопка копирования у пустой ячейки

| Утверждение                                          | Где исполняется                                  |
| ---------------------------------------------------- | ------------------------------------------------ |
| Кнопка копирования не показывается у пустой ячейки   | `table-base-cell.component.ts:isCellEmpty`       |
| Пустым считается то же, что кит считает пустым везде | `table-base-cell.component.ts:isCellEmpty`       |
| Признак копируемости колонки остаётся на колонке     | `table-column.interface.ts:copyable`             |
| Ячейка со значением ведёт себя как раньше            | `table-base-cell.component.ts:onCopyToClipboard` |

Пути от каталога таблицы: `projects/ui-kit/src/lib/ui-kit/table/`.

| Сценарий   | Тест                                |
| ---------- | ----------------------------------- |
| `SC-UK-01` | `table-base-cell.component.spec.ts` |
| `SC-UK-02` | `table-base-cell.component.spec.ts` |
| `SC-UK-03` | `table-base-cell.component.spec.ts` |
| `SC-UK-04` | `table-base-cell.component.spec.ts` |
