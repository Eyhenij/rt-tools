import { Directive, inject, TemplateRef } from '@angular/core';

import { IRtSheetTemplateContext } from './rt-bottom-sheet.model';

/**
 * Своя шапка нижней шторки. Шаблон встаёт на место всей строки шапки — кнопки закрытия, заголовка
 * и действия справа; ручка над ней остаётся. Без директивы шторка рисует свою шапку.
 *
 * @example
 * ```html
 * <rt-bottom-sheet [open]="open()">
 *     <ng-template rtSheetHeader let-close>
 *         <button rtButton appearance="text" label="Назад" (click)="close()"></button>
 *         <h2>Отборы</h2>
 *     </ng-template>
 * </rt-bottom-sheet>
 * ```
 */
@Directive({
    selector: 'ng-template[rtSheetHeader]',
})
export class RtSheetHeaderDirective {
    public readonly template: TemplateRef<IRtSheetTemplateContext> = inject<TemplateRef<IRtSheetTemplateContext>>(TemplateRef);
}
