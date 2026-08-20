# Привязка — задержка показа спиннера

| Утверждение                                           | Где исполняется                |
| ----------------------------------------------------- | ------------------------------ |
| Спиннер ждёт задержку и только потом становится виден | `spinner.component.ts:visible` |
| Умолчание задержки — ноль                             | `spinner.component.ts:delay`   |
| Задержка отсчитывается от вставки спиннера            | `spinner.component.ts:visible` |
| Снятый до срока спиннер счётчик за собой убирает      | `spinner.component.ts:visible` |
| Задержка живёт в самом спиннере                       | `spinner.component.ts:delay`   |

Пути от каталога компонента: `projects/ui-kit/src/lib/ui-kit/spinner/`.

| Сценарий   | Тест                        |
| ---------- | --------------------------- |
| `SC-UK-05` | `spinner.component.spec.ts` |
| `SC-UK-06` | `spinner.component.spec.ts` |
| `SC-UK-07` | `spinner.component.spec.ts` |
| `SC-UK-08` | `spinner.component.spec.ts` |
