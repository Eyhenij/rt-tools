import { Directive, inject, TemplateRef } from '@angular/core';

import { IRtSheetTemplateContext } from './rt-bottom-sheet.model';

/**
 * Свой подвал нижней шторки. Шаблон встаёт в подвал вместо узлов с атрибутом `sheetFooter`; подвал
 * не прокручивается и держит отступ под вырез экрана.
 *
 * @example
 * ```html
 * <rt-bottom-sheet [open]="open()">
 *     <ng-template rtSheetFooter let-close>
 *         <button rtButton appearance="outlined" label="Сбросить"></button>
 *         <button rtButton label="Показать" (click)="close()"></button>
 *     </ng-template>
 * </rt-bottom-sheet>
 * ```
 */
@Directive({
    selector: 'ng-template[rtSheetFooter]',
})
export class RtSheetFooterDirective {
    public readonly template: TemplateRef<IRtSheetTemplateContext> = inject<TemplateRef<IRtSheetTemplateContext>>(TemplateRef);
}
