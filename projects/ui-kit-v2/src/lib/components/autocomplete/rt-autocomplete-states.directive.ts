import { Directive, inject, TemplateRef } from '@angular/core';

import { IRtLoadError } from '@rt-tools/ui-kit-v2/empty-state';

/**
 * Свой вид пустого результата: `<ng-template rtAutocompleteEmpty let-query>` встаёт в панель вместо
 * строки «ничего не найдено». Сильнее входов `emptyTemplate` и `emptyText`; в контексте — набранная
 * строка.
 */
@Directive({
    selector: 'ng-template[rtAutocompleteEmpty]',
})
export class RtAutocompleteEmptyDirective {
    public readonly templateRef: TemplateRef<{ $implicit: string }> = inject<TemplateRef<{ $implicit: string }>>(TemplateRef);

    /** Type-guard: сужает контекст шаблона до набранной строки. */
    public static ngTemplateContextGuard(
        _directive: RtAutocompleteEmptyDirective,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars -- второй довод стража контекста шаблона стоит только в типе-предикате; убрать его нечем, подпись задаёт каркас
        context: unknown
    ): context is { $implicit: string } {
        return true;
    }
}

/**
 * Свой вид ошибки загрузки подсказок: `<ng-template rtAutocompleteError let-error let-retry="retry">`
 * встаёт в панель вместо вариантов; в контексте текст ошибки и повтор загрузки.
 */
@Directive({
    selector: 'ng-template[rtAutocompleteError]',
})
export class RtAutocompleteErrorDirective {
    public readonly templateRef: TemplateRef<IRtLoadError.Context> = inject<TemplateRef<IRtLoadError.Context>>(TemplateRef);

    /** Type-guard: сужает контекст шаблона до текста ошибки и повтора. */
    public static ngTemplateContextGuard(
        _directive: RtAutocompleteErrorDirective,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars -- второй довод стража контекста шаблона стоит только в типе-предикате; убрать его нечем, подпись задаёт каркас
        context: unknown
    ): context is IRtLoadError.Context {
        return true;
    }
}
