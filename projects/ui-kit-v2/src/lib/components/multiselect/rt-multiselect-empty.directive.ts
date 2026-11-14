import { Directive, inject, TemplateRef } from '@angular/core';

/**
 * Свой вид пустого списка вариантов: `<ng-template rtMultiselectEmpty>` встаёт в панель вместо строки
 * «Нет вариантов». Данные выбора местные, поэтому ошибки загрузки у него нет. В контексте — строка
 * поиска; у выбора без поиска она пустая.
 */
@Directive({
    selector: 'ng-template[rtMultiselectEmpty]',
})
export class RtMultiselectEmptyDirective {
    public readonly templateRef: TemplateRef<{ $implicit: string }> = inject<TemplateRef<{ $implicit: string }>>(TemplateRef);

    /** Type-guard: сужает контекст шаблона до строки поиска. */
    public static ngTemplateContextGuard(
        _directive: RtMultiselectEmptyDirective,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars -- второй довод стража контекста шаблона стоит только в типе-предикате; убрать его нечем, подпись задаёт каркас
        context: unknown
    ): context is { $implicit: string } {
        return true;
    }
}
