import { Directive, inject, input, InputSignal, TemplateRef } from '@angular/core';

/**
 * Контекст шаблона `[rtTableCard]`: `$implicit` — строка таблицы.
 */
export interface IRtTableCardContext<TRow> {
    $implicit: TRow;
}

/**
 * Захватывает `<ng-template rtTableCard let-row>` — кастомную разметку карточки
 * строки для мобильного (узкого) режима `rt-table`. Когда задан, rt-table на
 * узком экране (≤1080px) рендерит эту разметку в `<article>` вместо
 * авто-карточки «label: value» по колонкам.
 *
 * Escape-hatch для страниц, которым нужна rich-карточка (составной primary-блок,
 * теги, произвольная раскладка), а не построчный список полей.
 *
 * @example
 * ```html
 * <rt-table #t="rtTable" [dataSource]="rows" ...>
 *     ...колонки...
 *     <ng-template rtTableCard [rtTableCardRowType]="rows" let-row>
 *         <div class="my-card-head">{{ row.login }}</div>
 *     </ng-template>
 *     <tr cdk-row *cdkRowDef="let row; columns: t.displayedColumns()"></tr>
 * </rt-table>
 * ```
 */
@Directive({
    selector: 'ng-template[rtTableCard]',
})
export class RtTableCardDirective<TRow = unknown> {
    public readonly template: TemplateRef<IRtTableCardContext<TRow>> = inject<TemplateRef<IRtTableCardContext<TRow>>>(TemplateRef);

    /**
     * Type-carrier для вывода `TRow`: биндят тот же массив, что в `dataSource`.
     * Значение в рантайме не читается — служит только подсказкой типизации для
     * `let-row` (через `ngTemplateContextGuard`).
     */
    public readonly rtTableCardRowType: InputSignal<readonly TRow[]> = input<readonly TRow[]>([]);

    /** Type-guard: сужает контекст шаблона до строки таблицы при проверке шаблонов. */
    public static ngTemplateContextGuard<TRow>(
        _directive: RtTableCardDirective<TRow>,
        context: unknown
    ): context is IRtTableCardContext<TRow> {
        return true;
    }
}
