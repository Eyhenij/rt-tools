import {
    ChangeDetectionStrategy,
    Component,
    effect,
    ElementRef,
    inject,
    input,
    InputSignal,
    Signal,
    viewChild,
    ViewEncapsulation,
} from '@angular/core';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

import { IRtSheetConfirmAnswers, RT_SHEET_CONFIRM_ANSWERS } from './rt-bottom-sheet-confirm.answers';
import { IRtSheetConfirmLabels } from './rt-bottom-sheet.model';

/** Свой класс хоста; элементы вопроса — элементы блока шторки, у хоста стилей нет. */
const BEM_BLOCK: string = 'rt-bottom-sheet-confirm';

/**
 * Экран вопроса шторки перед закрытием с неприменённым выбором: две карточки листа действий
 * телефона. Классы — элементы блока `rt-bottom-sheet`, стили лежат рядом и приходят вместе с кодом
 * экрана, при первом вопросе. Ответ отдаётся шторке, решает она.
 */
@Component({
    selector: 'rt-bottom-sheet-confirm',
    templateUrl: './rt-bottom-sheet-confirm.component.html',
    styleUrl: './rt-bottom-sheet-confirm.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { class: BEM_BLOCK },
    imports: [
        // rt-tools
        BlockDirective,
        ElemDirective,
        ModDirective,
    ],
})
export class RtBottomSheetConfirmComponent {
    readonly #answers: IRtSheetConfirmAnswers = inject(RT_SHEET_CONFIRM_ANSWERS);

    /** Первый ответ вопроса: фокус встаёт на него, как только вопрос нарисован. */
    protected readonly confirmFirst: Signal<ElementRef<HTMLElement> | undefined> = viewChild<ElementRef<HTMLElement>>('confirmFirst');

    public readonly labels: InputSignal<IRtSheetConfirmLabels> = input.required<IRtSheetConfirmLabels>();
    public readonly titleId: InputSignal<string> = input.required<string>();

    constructor() {
        // Фокус встаёт на первый ответ: иначе он остаётся под вопросом, на кнопке закрытия, и
        // скринридер вопроса не объявляет. Вопрос стоит внизу экрана сам: страница не прокручивается.
        effect((): void => this.confirmFirst()?.nativeElement.focus({ preventScroll: true }));
    }

    protected onApply(): void {
        this.#answers.apply();
    }

    protected onDiscard(): void {
        this.#answers.discard();
    }

    protected onStay(): void {
        this.#answers.stay();
    }
}
