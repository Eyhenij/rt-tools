# Одобрения

- **Без вида:** «Подтверждаю, вид не меняется»

Относится к `projects/ui-kit-v2/src/lib/components/icon/rt-icon.registry.ts` и
`projects/ui-kit-v2/src/lib/components/data-table/cell/rt-data-table-cell.component.ts`: реестр
значков разбирает файл SVG и чистит его вместо записи `innerHTML`, ячейка таблицы привязывает стиль
значка строкой без доверия очистителя.
