import { Directive, inject, TemplateRef } from '@angular/core';

import { IRtLoadError } from '@rt-tools/ui-kit-v2/empty-state';

/**
 * Свой вид ошибки загрузки сведений: `<ng-template rtWorkspaceDetailsError let-error let-retry="retry">`
 * встаёт вместо вида по умолчанию; в контексте текст ошибки и повтор загрузки.
 */
@Directive({
    selector: 'ng-template[rtWorkspaceDetailsError]',
})
export class RtWorkspaceDetailsErrorDirective {
    public readonly templateRef: TemplateRef<IRtLoadError.Context> = inject<TemplateRef<IRtLoadError.Context>>(TemplateRef);

    /** Type-guard: сужает контекст шаблона до текста ошибки и повтора. */
    public static ngTemplateContextGuard(
        _directive: RtWorkspaceDetailsErrorDirective,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars -- второй довод стража контекста шаблона стоит только в типе-предикате; убрать его нечем, подпись задаёт каркас
        context: unknown
    ): context is IRtLoadError.Context {
        return true;
    }
}
