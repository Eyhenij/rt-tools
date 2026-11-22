import { inject, Directive, TemplateRef } from '@angular/core';

/**
 * Записи `rt-dynamic-list`: `<ng-template rtDynamicListContent>`. Создаются, только пока список не
 * грузится впервые, не упал и не пуст: в этих состояниях стоит их вид, а записи не строятся.
 */
@Directive({ selector: 'ng-template[rtDynamicListContent]' })
export class RtDynamicListContentDirective {
    public readonly template: TemplateRef<unknown> = inject<TemplateRef<unknown>>(TemplateRef);
}
