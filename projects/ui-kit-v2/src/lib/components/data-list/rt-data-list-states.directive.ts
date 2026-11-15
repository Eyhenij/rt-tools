import { Directive, inject, TemplateRef } from '@angular/core';

import { IRtLoadError } from '@rt-tools/ui-kit-v2/empty-state';

/**
 * Свой вид пустого списка: `<ng-template rtDataListEmpty>` встаёт вместо заглушки по умолчанию
 * целиком, когда нет ни строк, ни условий отбора.
 */
@Directive({
    selector: 'ng-template[rtDataListEmpty]',
})
export class RtDataListEmptyDirective {
    public readonly templateRef: TemplateRef<void> = inject<TemplateRef<void>>(TemplateRef);
}

/**
 * Свой вид ошибки загрузки списка: `<ng-template rtDataListError let-error let-retry="retry">`
 * встаёт вместо строк; в контексте текст ошибки и повтор загрузки.
 */
@Directive({
    selector: 'ng-template[rtDataListError]',
})
export class RtDataListErrorDirective {
    public readonly templateRef: TemplateRef<IRtLoadError.Context> = inject<TemplateRef<IRtLoadError.Context>>(TemplateRef);

    /** Type-guard: сужает контекст шаблона до текста ошибки и повтора. */
    public static ngTemplateContextGuard(
        _directive: RtDataListErrorDirective,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars -- второй довод стража контекста шаблона стоит только в типе-предикате; убрать его нечем, подпись задаёт каркас
        context: unknown
    ): context is IRtLoadError.Context {
        return true;
    }
}
