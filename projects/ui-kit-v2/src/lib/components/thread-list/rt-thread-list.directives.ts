import { Directive, inject, input, InputSignal, TemplateRef } from '@angular/core';

import { IRtThreadList } from './rt-thread-list.model';

/**
 * Помечает `<ng-template>` содержимого строки списка. Входом `[rtThreadListRow]`
 * потребитель передаёт свой массив строк — из него выводится тип `TRow`, поэтому
 * `let-row` в темплейте типизируется строго (context-guard ниже это подтверждает).
 */
@Directive({
    selector: 'ng-template[rtThreadListRow]',
})
export class RtThreadListRowDirective<TRow extends IRtThreadList.Row> {
    public readonly templateRef: TemplateRef<IRtThreadList.RowContext<TRow>> =
        inject<TemplateRef<IRtThreadList.RowContext<TRow>>>(TemplateRef);

    public readonly rows: InputSignal<readonly TRow[]> = input<readonly TRow[]>([], {
        alias: 'rtThreadListRow',
    });

    public static ngTemplateContextGuard<TRow extends IRtThreadList.Row>(
        _directive: RtThreadListRowDirective<TRow>,
        context: unknown
    ): context is IRtThreadList.RowContext<TRow> {
        return true;
    }
}

/**
 * Помечает `<ng-template>` с фильтрами — его содержимое рендерится в поповере,
 * который открывает иконка-фильтр в шапке списка.
 */
@Directive({
    selector: 'ng-template[rtThreadListFilters]',
})
export class RtThreadListFiltersDirective {
    public readonly templateRef: TemplateRef<unknown> = inject<TemplateRef<unknown>>(TemplateRef);
}

/**
 * Помечает `<ng-template>` с кастомным контролом поиска. Когда потребитель его
 * проецирует, шапка списка рендерит его содержимое вместо встроенного `rt-input`
 * — так воркспейс подставляет свой автокомплит по каталогу вместо текстового
 * поиска, не ломая generic-природу списка.
 */
@Directive({
    selector: 'ng-template[rtThreadListSearch]',
})
export class RtThreadListSearchDirective {
    public readonly templateRef: TemplateRef<unknown> = inject<TemplateRef<unknown>>(TemplateRef);
}
