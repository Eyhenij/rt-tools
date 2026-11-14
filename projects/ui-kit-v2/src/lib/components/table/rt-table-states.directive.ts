import { Directive, inject, TemplateRef } from '@angular/core';

import { IRtLoadError } from '@rt-tools/ui-kit-v2/empty-state';

/**
 * Свой вид пустой таблицы: `<ng-template rtTableEmptyState>` встаёт вместо заглушки по умолчанию
 * целиком. Прежняя ссылка `#rtTableEmpty` работает и дальше; объявлены обе — побеждает директива.
 */
@Directive({
    selector: 'ng-template[rtTableEmptyState]',
})
export class RtTableEmptyStateDirective {
    public readonly templateRef: TemplateRef<void> = inject<TemplateRef<void>>(TemplateRef);
}

/**
 * Свой вид ошибки загрузки таблицы: `<ng-template rtTableError let-error let-retry="retry">`
 * встаёт вместо строк; в контексте текст ошибки и повтор загрузки.
 */
@Directive({
    selector: 'ng-template[rtTableError]',
})
export class RtTableErrorDirective {
    public readonly templateRef: TemplateRef<IRtLoadError.Context> = inject<TemplateRef<IRtLoadError.Context>>(TemplateRef);

    /** Type-guard: сужает контекст шаблона до текста ошибки и повтора. */
    public static ngTemplateContextGuard(
        _directive: RtTableErrorDirective,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars -- второй довод стража контекста шаблона стоит только в типе-предикате; убрать его нечем, подпись задаёт каркас
        context: unknown
    ): context is IRtLoadError.Context {
        return true;
    }
}
