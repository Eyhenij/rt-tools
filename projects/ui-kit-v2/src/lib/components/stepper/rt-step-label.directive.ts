import { Directive, inject, TemplateRef } from '@angular/core';

import { IRtStepper } from './rt-stepper.model';

/**
 * Шаблон подписи шага в вертикальном списке: разметка вместо строки `label`, например выделенное
 * слово. Обстановка — сам шаг и его номер с нуля.
 *
 * @example
 * ```html
 * <rt-stepper orientation="vertical" [steps]="steps" [currentIndex]="-1">
 *     <ng-template rtStepLabel let-step let-index="index">
 *         @if (index === 3) { Войдите под логином <strong>LOGIN</strong> } @else { {{ step.label }} }
 *     </ng-template>
 * </rt-stepper>
 * ```
 */
@Directive({
    selector: 'ng-template[rtStepLabel]',
})
export class RtStepLabelDirective {
    public readonly template: TemplateRef<IRtStepper.LabelContext> = inject<TemplateRef<IRtStepper.LabelContext>>(TemplateRef);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- второй довод стража контекста шаблона стоит только в типе-предикате; убрать его нечем, подпись задаёт каркас
    public static ngTemplateContextGuard(_directive: RtStepLabelDirective, context: unknown): context is IRtStepper.LabelContext {
        return true;
    }
}
