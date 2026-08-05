import { Directive, inject, input, InputSignal, TemplateRef } from '@angular/core';

/**
 * Контекст шаблона `[rtTableRowActions]`: `$implicit` — строка таблицы.
 */
export interface IRtTableRowActionsContext<TRow> {
    $implicit: TRow;
}

/**
 * Захватывает `<ng-template rtTableRowActions let-row>` — содержимое «…»-меню
 * действий строки. `rt-table` (`[showRowActions]`) рендерит этот шаблон в конце
 * каждой строки внутри `rt-menu`, прокидывая строку через `$implicit`.
 *
 * Тип `let-row` выводится из `[rtTableRowActionsRowType]` (передаётся тот же
 * массив, что в `dataSource`) — type-carrier, как `*ngFor` выводит тип из
 * `ngForOf`. В рантайме значение не используется.
 *
 * @example
 * ```html
 * <rt-table #t="rtTable" [columns]="cols" [showRowActions]="true" [dataSource]="rows" ...>
 *     ...колонки...
 *     <ng-template rtTableRowActions [rtTableRowActionsRowType]="rows" let-row>
 *         <rt-menu-item icon="ico-edit" label="Редактировать" (selected)="edit(row)" />
 *     </ng-template>
 *     <tr cdk-header-row *cdkHeaderRowDef="t.displayedColumns()"></tr>
 *     <tr cdk-row *cdkRowDef="let row; columns: t.displayedColumns()"></tr>
 * </rt-table>
 * ```
 */
@Directive({
    selector: 'ng-template[rtTableRowActions]',
})
export class RtTableRowActionsDirective<TRow = unknown> {
    public readonly template: TemplateRef<IRtTableRowActionsContext<TRow>> =
        inject<TemplateRef<IRtTableRowActionsContext<TRow>>>(TemplateRef);

    /**
     * Type-carrier для вывода `TRow`: биндят тот же массив, что в `dataSource`.
     * Значение в рантайме не читается — служит только подсказкой типизации для
     * `let-row` (через `ngTemplateContextGuard`). Имя совпадает с binding'ом —
     * без alias, чтобы не триггерить `no-input-rename`.
     */
    public readonly rtTableRowActionsRowType: InputSignal<readonly TRow[]> = input<readonly TRow[]>([]);

    /** Type-guard: сужает контекст шаблона до строки таблицы при проверке шаблонов. */
    public static ngTemplateContextGuard<TRow>(
        _directive: RtTableRowActionsDirective<TRow>,
        context: unknown
    ): context is IRtTableRowActionsContext<TRow> {
        return true;
    }
}
