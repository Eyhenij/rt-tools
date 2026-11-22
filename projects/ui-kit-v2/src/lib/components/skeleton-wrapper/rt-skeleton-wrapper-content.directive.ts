import { inject, Directive, TemplateRef } from '@angular/core';

/**
 * Содержимое `rt-skeleton-wrapper`: `<ng-template rtSkeletonWrapperContent>`. Создаётся, только
 * пока обёртка не грузится: в загрузке стоит заглушка, а содержимое не строится.
 */
@Directive({ selector: 'ng-template[rtSkeletonWrapperContent]' })
export class RtSkeletonWrapperContentDirective {
    public readonly template: TemplateRef<unknown> = inject<TemplateRef<unknown>>(TemplateRef);
}
