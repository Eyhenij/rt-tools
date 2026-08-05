import { Directive } from '@angular/core';

/**
 * Маркер проецируемого hint'а для rt-field. Нужен, когда подсказке требуется
 * разметка (`<strong>`, интерполяция значений), которую плоский string-input
 * `[hint]` передать не может. Если проецируемый hint присутствует — rt-field
 * рендерит его вместо строкового `[hint]` (тот остаётся fallback'ом).
 */
@Directive({
    selector: '[rtFieldHint]',
})
export class RtFieldHintDirective {}
