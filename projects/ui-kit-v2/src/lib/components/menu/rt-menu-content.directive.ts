import { inject, Directive, TemplateRef } from '@angular/core';

/**
 * Пункты `rt-menu`: `<ng-template rtMenuContent>`. Создаются, пока панель открыта, и уходят с её
 * закрытием: закрытое меню не держит ни одного пункта.
 */
@Directive({ selector: 'ng-template[rtMenuContent]' })
export class RtMenuContentDirective {
    public readonly template: TemplateRef<unknown> = inject<TemplateRef<unknown>>(TemplateRef);
}
