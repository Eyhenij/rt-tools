import { Directive, TemplateRef } from '@angular/core';

import { rtSlotTemplate } from '@rt-tools/ui-kit-v2/core';

/**
 * Шаблон подсказки rt-field. Нужен, когда подсказке требуется разметка (`<strong>`, интерполяция
 * значений), которую плоский string-input `[hint]` передать не может: `<ng-template rtFieldHint>`.
 * Переданный шаблон рисуется вместо строкового `[hint]` и только пока зона подсказки её показывает:
 * под ошибкой без резерва содержимое подсказки не создаётся.
 */
@Directive({
    selector: '[rtFieldHint]',
})
export class RtFieldHintDirective {
    public readonly template: TemplateRef<unknown> | null = rtSlotTemplate('rt-field', 'rtFieldHint');
}
