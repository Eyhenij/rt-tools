import { Directive, input, InputSignal, TemplateRef } from '@angular/core';

/** Шаблоны пользовательских ячеек списка: они уезжают в его таблицу. */
@Directive({
    selector: '[rtDataListCustomCells]',
})
export class RtDataListCustomCellsDirective<ENTITY_TYPE> {
    public readonly cellsTemplates: InputSignal<{
        [K in keyof ENTITY_TYPE]?: TemplateRef<{ $implicit: ENTITY_TYPE }>;
    }> = input.required({ alias: 'rtDataListCustomCells' });
}

/** Пункты меню строки списка. */
@Directive({
    selector: '[rtDataListRowActions]',
})
export class RtDataListRowActionsDirective {}

/** Действия строки рядом с кнопкой меню. */
@Directive({
    selector: '[rtDataListAdditionalRowActions]',
})
export class RtDataListAdditionalRowActionsDirective {}
