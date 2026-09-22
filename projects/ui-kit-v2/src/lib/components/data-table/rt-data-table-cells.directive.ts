import { Directive, input, InputSignal, TemplateRef } from '@angular/core';

/** Что получает шаблон приложения, рисующий строку целиком или её часть. */
export interface IRtDataTableRowContext<ENTITY_TYPE> {
    $implicit: ENTITY_TYPE;
}

/**
 * Шаблоны пользовательских ячеек: имя свойства колонки — шаблон её ячейки.
 *
 * Колонку типа «custom» таблица рисует этим шаблоном и готовой ячейки не берёт.
 */
@Directive({
    selector: '[rtDataTableCustomCells]',
})
export class RtDataTableCustomCellsDirective<ENTITY_TYPE> {
    public readonly cellsTemplates: InputSignal<{
        [K in keyof ENTITY_TYPE]?: TemplateRef<IRtDataTableRowContext<ENTITY_TYPE>>;
    }> = input.required({ alias: 'rtDataTableCustomCells' });

    public getTemplateByPropName(propName: keyof ENTITY_TYPE): TemplateRef<IRtDataTableRowContext<ENTITY_TYPE>> | null {
        return this.cellsTemplates()[propName] ?? null;
    }
}

/** Пункты меню строки: шаблон раскрывается в панели меню кита. */
@Directive({
    selector: '[rtDataTableRowActions]',
})
export class RtDataTableRowActionsDirective {}

/** Действия строки рядом с кнопкой меню: шаблон рисуется в полосе действий. */
@Directive({
    selector: '[rtDataTableAdditionalRowActions]',
})
export class RtDataTableAdditionalRowActionsDirective {}
