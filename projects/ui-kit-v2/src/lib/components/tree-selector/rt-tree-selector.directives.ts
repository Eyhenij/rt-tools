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

/**
 * Свой вид пустого выбора: `<ng-template rtTreeSelectorEmpty let-term>` встаёт вместо строки «Ничего
 * не найдено», а внутреннему дереву уходит вместо «Нет вариантов». Данные местные, поэтому ошибки
 * загрузки нет. В контексте — строка поиска.
 */
@Directive({ selector: 'ng-template[rtTreeSelectorEmpty]' })
export class RtTreeSelectorEmptyDirective {
    public readonly templateRef: TemplateRef<{ $implicit: string }> = inject<TemplateRef<{ $implicit: string }>>(TemplateRef);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- второй довод стража контекста шаблона стоит только в типе-предикате; убрать его нечем, подпись задаёт каркас
    public static ngTemplateContextGuard(_directive: RtTreeSelectorEmptyDirective, context: unknown): context is { $implicit: string } {
        return true;
    }
}
