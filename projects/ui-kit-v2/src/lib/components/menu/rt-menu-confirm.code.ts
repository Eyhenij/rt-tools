import type { Type } from '@angular/core';

import type { RtMenuConfirmDialogComponent } from './rt-menu-confirm-dialog.component';

/**
 * Состояние загрузки кода диалога подтверждения. Код приходит отдельным куском при первом
 * подтверждении; пока он идёт, `loading` держит обещание, а когда пришёл, `loaded` отдаёт класс
 * сразу. Состояние лежит в модуле: все пункты меню на странице грузят кусок один раз.
 */
export const confirmDialogCodeState: {
    loading: Promise<Type<RtMenuConfirmDialogComponent>> | null;
    loaded: Type<RtMenuConfirmDialogComponent> | null;
} = { loading: null, loaded: null };

/** Забывает загруженный код: нужно спекам, которые проверяют путь «код ещё не пришёл». */
export function forgetConfirmDialogCode(): void {
    confirmDialogCodeState.loading = null;
    confirmDialogCodeState.loaded = null;
}
