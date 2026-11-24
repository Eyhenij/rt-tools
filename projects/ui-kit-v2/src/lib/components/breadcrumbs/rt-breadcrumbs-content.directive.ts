import { inject, Directive, TemplateRef } from '@angular/core';

/**
 * Своё содержимое `rt-breadcrumbs` после заголовка: `<ng-template rtBreadcrumbsContent>`. Создаётся
 * только в виде заголовка с текущей страницей: в строчном виде его места нет, и оно не строится.
 */
@Directive({ selector: 'ng-template[rtBreadcrumbsContent]' })
export class RtBreadcrumbsContentDirective {
    public readonly template: TemplateRef<unknown> = inject<TemplateRef<unknown>>(TemplateRef);
}
