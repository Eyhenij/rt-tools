import { inject, Directive, TemplateRef } from '@angular/core';

/**
 * Своё содержимое `rt-icon-button`: `<ng-template rtIconButtonContent>`. Создаётся, только пока у
 * кнопки нет ни значка, ни глифа и она не грузится: иначе на его месте стоит значок или вращение.
 */
@Directive({ selector: 'ng-template[rtIconButtonContent]' })
export class RtIconButtonContentDirective {
    public readonly template: TemplateRef<unknown> = inject<TemplateRef<unknown>>(TemplateRef);
}
