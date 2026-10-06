import { inject, Directive, TemplateRef } from '@angular/core';

/**
 * Свои контролы приложения в строке селектора — после «Развернуть всё» и «Свернуть всё». Так в
 * строку встаёт, например, выбор группировки.
 */
@Directive({ selector: 'ng-template[rtTreeSelectorControls]' })
export class RtTreeSelectorControlsDirective {
    public readonly templateRef: TemplateRef<unknown> = inject<TemplateRef<unknown>>(TemplateRef);
}
