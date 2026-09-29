import { Directive, inject, TemplateRef } from '@angular/core';

import { IRtDataTable } from './rt-data-table.model';

/** Что получает шаблон значка: имя, колонку и — в ячейке — запись строки. */
export interface IRtDataTableIconContext<T = Record<string, unknown>> {
    /** Имя значка из описания колонки — то, что там написало приложение. */
    $implicit: string;
    column: IRtDataTable.Column<T>;
    /** Запись строки; в шапке её нет. */
    row: T | null;
}

/**
 * Шаблон значка, который приложение отдаёт таблице.
 *
 * Когда он дан, значки шапки и ячеек, названные в описании колонок, рисует он, а перечень
 * соответствий кита не спрашивается. Это выход для имени, которому в наборе кита нет пары.
 *
 * ```html
 * <rt-data-table ...>
 *     <ng-template rtDataTableIcon let-name let-row="row">
 *         <rt-icon [name]="iconOf(name)" />
 *     </ng-template>
 * </rt-data-table>
 * ```
 */
@Directive({
    selector: 'ng-template[rtDataTableIcon]',
    exportAs: 'rtDataTableIcon',
})
export class RtDataTableIconDirective<T = Record<string, unknown>> {
    public readonly template: TemplateRef<IRtDataTableIconContext<T>> = inject<TemplateRef<IRtDataTableIconContext<T>>>(TemplateRef);

    public static ngTemplateContextGuard<T>(
        _directive: RtDataTableIconDirective<T>,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars -- второй довод стража контекста шаблона стоит только в типе-предикате; убрать его нечем, подпись задаёт каркас
        context: unknown
    ): context is IRtDataTableIconContext<T> {
        return true;
    }
}
