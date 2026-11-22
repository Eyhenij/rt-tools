import { inject, Directive, TemplateRef } from '@angular/core';

/**
 * Значение `rt-info-item`: `<ng-template rtInfoItemContent>`. Создаётся, только пока пункт не
 * грузится: в загрузке на месте значения стоит заглушка, а значение не строится.
 */
@Directive({ selector: 'ng-template[rtInfoItemContent]' })
export class RtInfoItemContentDirective {
    public readonly template: TemplateRef<unknown> = inject<TemplateRef<unknown>>(TemplateRef);
}
