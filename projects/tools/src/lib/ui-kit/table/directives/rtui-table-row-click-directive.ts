import { Directive, inject, input, InputSignal, InputSignalWithTransform, HostListener, booleanAttribute } from '@angular/core';
import { BooleanInput } from '@angular/cdk/coercion';

import { IRtuiTable, RTUI_TABLE_COMPONENT_TOKEN, RTUI_TABLE_STOP_ROW_CLICK_ATTRIBUTE } from '../util';

@Directive({
    selector: '[rtuiTableRowClickDirective]',
})
export class RtuiTableRowClickDirective<
    ENTITY_TYPE extends Record<string, unknown>,
    SORT_PROPERTY extends Extract<keyof ENTITY_TYPE, string>,
    KEY extends Extract<keyof ENTITY_TYPE, string>,
> {
    readonly #tableComponent: IRtuiTable<ENTITY_TYPE, SORT_PROPERTY, KEY> = inject(RTUI_TABLE_COMPONENT_TOKEN) as IRtuiTable<
        ENTITY_TYPE,
        SORT_PROPERTY,
        KEY
    >;

    /** Row entity */
    public readonly entity: InputSignal<ENTITY_TYPE> = input.required({
        alias: 'rtuiTableRowClickDirective',
    });

    /** Enabled flag */
    public isTableRowClickable: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(true, {
        transform: booleanAttribute,
    });

    @HostListener('mousedown', ['$event'])
    public onMouseDown(event: MouseEvent): void {
        if (!this.isTableRowClickable() || (event.target as HTMLElement).closest(`[${RTUI_TABLE_STOP_ROW_CLICK_ATTRIBUTE}]`)) {
            event.stopPropagation();
            return;
        }
        this.#tableComponent.onRowClick(this.entity(), event);
    }

    @HostListener('dblclick', ['$event'])
    public onDoubleClick(event: MouseEvent): void {
        if (!this.isTableRowClickable() || (event.target as HTMLElement).closest(`[${RTUI_TABLE_STOP_ROW_CLICK_ATTRIBUTE}]`)) {
            event.stopPropagation();
            return;
        }
        this.#tableComponent.onRowDoubleClick(this.entity());
    }
}
