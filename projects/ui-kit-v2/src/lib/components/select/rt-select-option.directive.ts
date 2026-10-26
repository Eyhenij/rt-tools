import { Directive, inject, TemplateRef } from '@angular/core';

import { IRtSelect } from './rt-select.model';

/**
 * Маркер своей разметки строки списка — того, что рисуется на месте подписи пункта.
 *
 * Строка остаётся киту: выбор, подсветка, клавиши, стрелка ветки дерева и галочка выбранного. Потребитель
 * даёт только то, что стоит на месте подписи, — например цветную метку перед текстом, — и получает опцию
 * и признак, выбрана ли она. Тем же шаблоном поле рисует выбранное значение — метка из списка не
 * пропадает после выбора.
 *
 * @example
 * ```html
 * <rt-select [options]="colors">
 *     <ng-template rtSelectOption let-option let-selected="selected">
 *         <span class="dot" [style.background]="option.value"></span>{{ option.label }}
 *     </ng-template>
 * </rt-select>
 * ```
 */
@Directive({
    selector: '[rtSelectOption]',
})
export class RtSelectOptionDirective<TValue = unknown> {
    public readonly templateRef: TemplateRef<IRtSelect.OptionContext<TValue>> =
        inject<TemplateRef<IRtSelect.OptionContext<TValue>>>(TemplateRef);
}
