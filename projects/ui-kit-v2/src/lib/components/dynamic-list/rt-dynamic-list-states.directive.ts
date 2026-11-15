import { Directive, inject, TemplateRef } from '@angular/core';

import { IRtLoadError } from '@rt-tools/ui-kit-v2/empty-state';

/**
 * Свой вид пустого списка: `<ng-template rtDynamicListEmpty>` встаёт вместо заглушки по умолчанию
 * целиком — и у пустого раздела, и у пустого ответа под отбором.
 */
@Directive({
    selector: 'ng-template[rtDynamicListEmpty]',
})
export class RtDynamicListEmptyDirective {
    public readonly templateRef: TemplateRef<void> = inject<TemplateRef<void>>(TemplateRef);
}

/**
 * Свой вид ошибки загрузки списка: `<ng-template rtDynamicListError let-error let-retry="retry">`
 * встаёт вместо записей; в контексте текст ошибки и повтор загрузки.
 */
@Directive({
    selector: 'ng-template[rtDynamicListError]',
})
export class RtDynamicListErrorDirective {
    public readonly templateRef: TemplateRef<IRtLoadError.Context> = inject<TemplateRef<IRtLoadError.Context>>(TemplateRef);

    /** Type-guard: сужает контекст шаблона до текста ошибки и повтора. */
    public static ngTemplateContextGuard(
        _directive: RtDynamicListErrorDirective,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars -- второй довод стража контекста шаблона стоит только в типе-предикате; убрать его нечем, подпись задаёт каркас
        context: unknown
    ): context is IRtLoadError.Context {
        return true;
    }
}
