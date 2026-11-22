import { inject, Directive, TemplateRef } from '@angular/core';

/**
 * Сумма `rt-money-row`: `<ng-template rtMoneyRowContent>`. Создаётся, только пока строка не
 * грузится: в загрузке на месте суммы стоит заглушка, а сумма не строится.
 */
@Directive({ selector: 'ng-template[rtMoneyRowContent]' })
export class RtMoneyRowContentDirective {
    public readonly template: TemplateRef<unknown> = inject<TemplateRef<unknown>>(TemplateRef);
}
