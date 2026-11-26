import { ComponentRef, ErrorHandler, Injector, Type, ViewContainerRef } from '@angular/core';

import type { RtBottomSheetConfirmComponent } from './rt-bottom-sheet-confirm.component';
import { IRtSheetConfirmAnswers, IRtSheetConfirmLabels, RT_SHEET_CONFIRM_ANSWERS } from './rt-bottom-sheet.model';

/** Код экрана вопроса шторки: пришедший класс и обещание, которое его ждёт. */
interface ISheetConfirmCode {
    type: Type<RtBottomSheetConfirmComponent> | null;
    loading: Promise<Type<RtBottomSheetConfirmComponent>> | null;
}

const confirmCode: ISheetConfirmCode = { type: null, loading: null };

/**
 * Подгружает код экрана вопроса ленивым `import()`: вопрос нужен немногим шторкам, а весил бы
 * каждый старт приложения. Вызовы до прихода кода делят одно обещание; сбой загрузки его снимает,
 * и следующий вызов пробует снова.
 */
export function rtLoadSheetConfirm(): Promise<Type<RtBottomSheetConfirmComponent>> {
    confirmCode.loading ??= import('./rt-bottom-sheet-confirm.component').then(
        (code: typeof import('./rt-bottom-sheet-confirm.component')): Type<RtBottomSheetConfirmComponent> => {
            confirmCode.type = code.RtBottomSheetConfirmComponent;

            return confirmCode.type;
        },
        (error: unknown): never => {
            confirmCode.loading = null;
            throw error;
        }
    );

    return confirmCode.loading;
}

/** Подгружает код экрана вопроса заранее: так его ждут тесты и приложение, которому вопрос нужен сразу. */
export async function rtPreloadSheetConfirm(): Promise<void> {
    await rtLoadSheetConfirm();
}

/**
 * Место экрана вопроса в шторке: ставит экран, пока вопрос показан, и убирает, когда снят. Код
 * пришёл — экран встаёт сразу; нет — после его прихода, если вопрос к тому времени не сняли.
 */
export class RtSheetConfirmPlace {
    readonly #errors: ErrorHandler;
    readonly #injector: Injector;
    #ref: ComponentRef<RtBottomSheetConfirmComponent> | null = null;
    /** Слова показанного вопроса; `null` — вопрос снят. */
    #labels: IRtSheetConfirmLabels | null = null;

    constructor(errors: ErrorHandler, parent: Injector, answers: IRtSheetConfirmAnswers) {
        this.#errors = errors;
        this.#injector = Injector.create({ providers: [{ provide: RT_SHEET_CONFIRM_ANSWERS, useValue: answers }], parent });
    }

    /** Код экрана заранее: шторка, которая может спросить, берёт его, как только открыта. */
    public prefetch(): void {
        rtLoadSheetConfirm().catch((error: unknown): void => this.#errors.handleError(error));
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
        if (confirmCode.type !== null) {
            this.#draw(slot, confirmCode.type, labels, titleId);

            return;
        }
        rtLoadSheetConfirm().then(
            (type: Type<RtBottomSheetConfirmComponent>): void => {
                if (this.#labels !== null && this.#ref === null) {
                    this.#draw(slot, type, this.#labels, titleId);
                }
            },
            (error: unknown): void => this.#errors.handleError(error)
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
