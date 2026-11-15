import { Directive, inject, TemplateRef } from '@angular/core';

import { IRtLoadError } from '@rt-tools/ui-kit-v2/empty-state';

/**
 * Свой вид пустого списка: `<ng-template rtBarListEmpty>` встаёт вместо заглушки по умолчанию
 * целиком — когда строк нет.
 */
@Directive({
    selector: 'ng-template[rtBarListEmpty]',
})
export class RtBarListEmptyDirective {
    public readonly templateRef: TemplateRef<void> = inject<TemplateRef<void>>(TemplateRef);
}

/**
 * Свой вид ошибки загрузки списка: `<ng-template rtBarListError let-error let-retry="retry">`
 * встаёт вместо строк; в контексте текст ошибки и повтор загрузки.
 */
@Directive({
    selector: 'ng-template[rtBarListError]',
})
export class RtBarListErrorDirective {
    public readonly templateRef: TemplateRef<IRtLoadError.Context> = inject<TemplateRef<IRtLoadError.Context>>(TemplateRef);

    /** Type-guard: сужает контекст шаблона до текста ошибки и повтора. */
    public static ngTemplateContextGuard(
        _directive: RtBarListErrorDirective,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars -- второй довод стража контекста шаблона стоит только в типе-предикате; убрать его нечем, подпись задаёт каркас
        context: unknown
    ): context is IRtLoadError.Context {
        return true;
    }
}
