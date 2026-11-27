import { ComponentRef, ErrorHandler, Injector, Type, ViewContainerRef } from '@angular/core';

import type { RtBottomSheetConfirmComponent } from './confirm/rt-bottom-sheet-confirm.component';
import { IRtSheetConfirmAnswers, RT_SHEET_CONFIRM_ANSWERS } from './rt-bottom-sheet-confirm.answers';
import { rtLoadedSheetConfirm, rtLoadSheetConfirm } from './rt-bottom-sheet-confirm.loader';
import { IRtSheetConfirmLabels } from './rt-bottom-sheet.model';

/**
 * Место экрана вопроса в шторке: ставит экран, пока вопрос показан, и убирает, когда снят. Код
 * пришёл — экран встаёт сразу; нет — после его прихода, если вопрос к тому времени не сняли.
 */
export class RtSheetConfirmPlace {
    readonly #errors: ErrorHandler;
    readonly #injector: Injector;
    readonly #answers: IRtSheetConfirmAnswers;
    #ref: ComponentRef<RtBottomSheetConfirmComponent> | null = null;
    /** Слова показанного вопроса; `null` — вопрос снят. */
    #labels: IRtSheetConfirmLabels | null = null;
    /** Шторка ещё жива: пришедший после её конца код экран не ставит. */
    #alive: boolean = true;
    /** Место уже ждёт код вопроса. */
    #waiting: boolean = false;

    constructor(errors: ErrorHandler, parent: Injector, answers: IRtSheetConfirmAnswers) {
        this.#errors = errors;
        this.#answers = answers;
        this.#injector = Injector.create({ providers: [{ provide: RT_SHEET_CONFIRM_ANSWERS, useValue: answers }], parent });
    }

    /** Код экрана заранее: шторка, которая может спросить, берёт его, как только открыта. */
    public prefetch(): void {
        // Сбой заранее не называется: вопрос пробует загрузку снова и называет сбой сам, один раз.
        rtLoadSheetConfirm().catch((): void => undefined);
    }

    public sync(slot: ViewContainerRef | undefined, labels: IRtSheetConfirmLabels | null, titleId: string): void {
        this.#labels = labels;
        if (slot === undefined || labels === null) {
            slot?.clear();
            this.#ref = null;

            return;
        }
        if (this.#ref !== null) {
            this.#ref.setInput('labels', labels);

            return;
        }
        const loaded: Type<RtBottomSheetConfirmComponent> | null = rtLoadedSheetConfirm();
        if (loaded !== null) {
            this.#draw(slot, loaded, labels, titleId);

            return;
        }
        if (!this.#waiting) {
            this.#wait(slot, titleId);
        }
    }

    /** Шторка ушла: экран убирается, а код, пришедший позже, его уже не ставит. */
    public destroy(): void {
        this.#alive = false;
        this.#labels = null;
        this.#ref?.destroy();
        this.#ref = null;
    }

    /** Одно ожидание на место: повторный вопрос до прихода кода не множит ни экраны, ни ответы на сбой. */
    #wait(slot: ViewContainerRef, titleId: string): void {
        this.#waiting = true;
        rtLoadSheetConfirm().then(
            (type: Type<RtBottomSheetConfirmComponent>): void => {
                this.#waiting = false;
                if (this.#alive && this.#labels !== null && this.#ref === null) {
                    this.#draw(slot, type, this.#labels, titleId);
                }
            },
            (error: unknown): void => {
                this.#waiting = false;
                this.#errors.handleError(error);
                // Без кода вопроса шторка не стоит закрытой для касаний: вопрос снимается, правка остаётся.
                if (this.#alive && this.#labels !== null) {
                    this.#labels = null;
                    this.#answers.stay();
                }
            }
        );
    }

    #draw(slot: ViewContainerRef, type: Type<RtBottomSheetConfirmComponent>, labels: IRtSheetConfirmLabels, titleId: string): void {
        const ref: ComponentRef<RtBottomSheetConfirmComponent> = slot.createComponent(type, { injector: this.#injector });
        ref.setInput('labels', labels);
        ref.setInput('titleId', titleId);
        this.#ref = ref;
        ref.changeDetectorRef.detectChanges();
    }
}
