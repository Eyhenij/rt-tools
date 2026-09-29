import { Directive, inject, TemplateRef } from '@angular/core';

import { IRtSelect } from './rt-select.model';

/**
 * Маркер своей разметки указателя — того, что человек нажимает, чтобы открыть список.
 *
 * Поведение указателя остаётся киту: открытие панели, её ширина, приметы доступности,
 * отключённость, клавиши и закрытие висят на кнопке. Потребитель даёт только то, что рисуется
 * внутри неё, и получает три значения обстановки: открыт ли список, что выбрано, отключён ли выбор.
 *
 * Один маркер на обе семьи выбора: они отличаются только разметкой внутри кнопки, и два маркера
 * разошлись бы на первой же правке.
 *
 * @example
 * ```html
 * <rt-select [options]="options">
 *     <ng-template rtSelectTrigger let-state>
 *         <rt-tag [value]="state.label" [icon]="state.isOpen ? 'chevron-up' : 'chevron-down'" />
 *     </ng-template>
 * </rt-select>
 * ```
 */
@Directive({
    selector: '[rtSelectTrigger]',
})
export class RtSelectTriggerDirective<TValue = unknown> {
    public readonly templateRef: TemplateRef<IRtSelect.TriggerContext<TValue>> =
        inject<TemplateRef<IRtSelect.TriggerContext<TValue>>>(TemplateRef);
}
