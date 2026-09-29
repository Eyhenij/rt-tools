import {
    booleanAttribute,
    Directive,
    ElementRef,
    inject,
    InjectionToken,
    input,
    InputSignal,
    InputSignalWithTransform,
    OnInit,
} from '@angular/core';
import { BooleanInput } from '@angular/cdk/coercion';

import { PlatformService } from '@rt-tools/core';

/** Атрибут части строки, нажатие на которую до строки не доходит. */
export const RT_DATA_TABLE_STOP_ROW_CLICK_ATTRIBUTE: string = 'rt-data-table-stop-row-click';

/** Кому строка сообщает о нажатии и двойном нажатии — самой таблице. */
export interface IRtDataTableRowHost<ENTITY_TYPE> {
    onRowClick(row: ENTITY_TYPE, event: MouseEvent): void;
    onRowDoubleClick(row: ENTITY_TYPE): void;
}

export const RT_DATA_TABLE_ROW_HOST: InjectionToken<IRtDataTableRowHost<unknown>> = new InjectionToken<IRtDataTableRowHost<unknown>>(
    'RtDataTableRowHost'
);

/** Попало ли нажатие в часть строки, помеченную как не доходящую до строки. */
function isInsideStopNode(event: MouseEvent): boolean {
    return event.target instanceof Element && !!event.target.closest(`[${RT_DATA_TABLE_STOP_ROW_CLICK_ATTRIBUTE}]`);
}

/**
 * Помечает часть строки, нажатие на которую до строки не доходит, — картинку, кнопку приложения,
 * блок текста в своей ячейке.
 */
@Directive({
    selector: '[rtDataTableStopRowClick]',
})
export class RtDataTableStopRowClickDirective implements OnInit {
    readonly #platformService: PlatformService = inject(PlatformService);
    readonly #elementRef: ElementRef<HTMLElement> = inject(ElementRef<HTMLElement>);

    public ngOnInit(): void {
        if (this.#platformService.isPlatformBrowser) {
            this.#elementRef.nativeElement.setAttribute(RT_DATA_TABLE_STOP_ROW_CLICK_ATTRIBUTE, '');
        }
    }
}

/**
 * Нажатие и двойное нажатие строки — как в первом ките.
 *
 * О нажатии строка сообщает, когда кнопка опускается, а не когда отпускается, и любой кнопкой:
 * так было в первом ките, и так переносится. Двойное нажатие поэтому приходит после двух нажатий
 * строки.
 */
@Directive({
    selector: '[rtDataTableRowClick]',
    host: {
        '(mousedown)': 'onMouseDown($event)',
        '(dblclick)': 'onDoubleClick($event)',
    },
})
export class RtDataTableRowClickDirective<ENTITY_TYPE> {
    readonly #host: IRtDataTableRowHost<ENTITY_TYPE> = inject<IRtDataTableRowHost<ENTITY_TYPE>>(RT_DATA_TABLE_ROW_HOST);

    /** Запись строки. */
    public readonly entity: InputSignal<ENTITY_TYPE> = input.required<ENTITY_TYPE>({ alias: 'rtDataTableRowClick' });

    /** Строка сообщает о нажатиях. */
    public readonly isTableRowClickable: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(true, {
        transform: booleanAttribute,
    });

    public onMouseDown(event: MouseEvent): void {
        if (!this.isTableRowClickable() || isInsideStopNode(event)) {
            event.stopPropagation();
            return;
        }
        this.#host.onRowClick(this.entity(), event);
    }

    public onDoubleClick(event: MouseEvent): void {
        if (!this.isTableRowClickable() || isInsideStopNode(event)) {
            event.stopPropagation();
            return;
        }
        this.#host.onRowDoubleClick(this.entity());
    }
}
