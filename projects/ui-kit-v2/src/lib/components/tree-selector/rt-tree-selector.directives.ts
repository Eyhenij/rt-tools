import { inject, Directive, TemplateRef } from '@angular/core';

/**
 * Свои контролы приложения в строке селектора — после «Развернуть всё» и «Свернуть всё». Так в
 * строку встаёт, например, выбор группировки.
 */
@Directive({ selector: 'ng-template[rtTreeSelectorControls]' })
export class RtTreeSelectorControlsDirective {
    public readonly templateRef: TemplateRef<unknown> = inject<TemplateRef<unknown>>(TemplateRef);
}

/**
 * Разметка приложения сразу под полем поиска — между полем и строкой контролов. Так под поиском
 * встаёт, например, выбор области поиска или подсказка.
 */
@Directive({ selector: 'ng-template[rtTreeSelectorUnderSearch]' })
export class RtTreeSelectorUnderSearchDirective {
    public readonly templateRef: TemplateRef<unknown> = inject<TemplateRef<unknown>>(TemplateRef);
}
