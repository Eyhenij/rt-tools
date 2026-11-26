import { Type } from '@angular/core';

import type { RtBottomSheetConfirmComponent } from './confirm/rt-bottom-sheet-confirm.component';

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
    confirmCode.loading ??= import('./confirm/rt-bottom-sheet-confirm.component').then(
        (code: typeof import('./confirm/rt-bottom-sheet-confirm.component')): Type<RtBottomSheetConfirmComponent> => {
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

/** Пришедший код экрана вопроса; `null` — ещё не пришёл. */
export function rtLoadedSheetConfirm(): Type<RtBottomSheetConfirmComponent> | null {
    return confirmCode.type;
}

/** Подгружает код экрана вопроса заранее: так его ждут тесты и приложение, которому вопрос нужен сразу. */
export async function rtPreloadSheetConfirm(): Promise<void> {
    await rtLoadSheetConfirm();
}
