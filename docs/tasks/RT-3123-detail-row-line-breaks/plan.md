# Plan

**Task:** RT-3123 · **Branch:** RT-3123-detail-row-line-breaks
**Behaviour:** changes — значение `rt-detail-row` сохраняет переносы. Правка кита, порядок одобрений задаёт правило `kit-approval`.

## Footprint

- **Code:** `projects/ui-kit-v2/src/lib/components/detail-list/rt-detail-row.component.scss`
- **Stories:** история `Multiline` в матрице перечня, эталон `molecules-data-detaillist--multiline.png`
- **Docs:** `CONTEXT.md`, `Overview.mdx` компонента

## Not included

- Подъём версии пакета в приложении.

## Stages

1. **Правка и показ.** `white-space: pre-line`, история, замер на 1440, 768, 375, наложение на кадр.
   Сделано до заведения задачи, числа в `approvals.md`.
2. **Поставка.** После слова владельца о витрине: коммит, набор перед пушем, PR, выпуск.
