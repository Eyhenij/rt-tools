import { Directive, inject, TemplateRef } from '@angular/core';

import { IRtToggleButtonGroup } from './rt-toggle-button-group.model';

/**
 * Маркер своей разметки сегмента — того, что рисуется внутри кнопки на месте значка и подписи.
 *
 * Кнопка остаётся киту: нажатие, подсветка, недоступность, фокус и связь с формой. Потребитель даёт
 * только содержимое — например картинку-превью раскладки — и получает опцию и признак, нажат ли
 * сегмент.
 *
 * @example
 * ```html
 * <rt-toggle-button-group [options]="layouts" formControlName="layout">
 *     <ng-template rtToggleButtonOption let-option let-active="active">
 *         <img [src]="option.value + '.svg'" [alt]="option.label" />
 *     </ng-template>
 * </rt-toggle-button-group>
 * ```
 */
@Directive({
    selector: '[rtToggleButtonOption]',
})
export class RtToggleButtonOptionDirective<T = string> {
    public readonly templateRef: TemplateRef<IRtToggleButtonGroup.OptionContext<T>> =
        inject<TemplateRef<IRtToggleButtonGroup.OptionContext<T>>>(TemplateRef);
}
