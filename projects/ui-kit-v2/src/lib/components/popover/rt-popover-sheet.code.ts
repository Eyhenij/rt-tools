import type { RtPopoverSheetComponent } from './rt-popover-sheet.component';

/**
 * Состояние загрузки кода листа: одно на приложение. Обещание сбрасывается при ошибке, чтобы следующее
 * открытие пробовало снова; готовый класс позволяет следующим открытиям не ждать.
 */
export const sheetCodeState: {
    loading: Promise<typeof RtPopoverSheetComponent> | null;
    loaded: typeof RtPopoverSheetComponent | null;
} = { loading: null, loaded: null };

/** Забывает загруженный код: нужно спекам, которым открытие «до прихода кода» проверяется заново. */
export function forgetSheetCode(): void {
    sheetCodeState.loading = null;
    sheetCodeState.loaded = null;
}
