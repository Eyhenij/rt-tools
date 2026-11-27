import { InjectionToken } from '@angular/core';

/**
 * Ответы на вопрос шторки: экран вопроса зовёт их, решает шторка. Файл внутренний — в точке входа
 * кита его нет, и приложение не подменяет ответы своим поставщиком.
 */
export interface IRtSheetConfirmAnswers {
    readonly apply: () => void;
    readonly discard: () => void;
    readonly stay: () => void;
}

/** Ответы шторки для её экрана вопроса: шторка кладёт их в инжектор, когда ставит экран. */
export const RT_SHEET_CONFIRM_ANSWERS: InjectionToken<IRtSheetConfirmAnswers> = new InjectionToken<IRtSheetConfirmAnswers>(
    'RT_SHEET_CONFIRM_ANSWERS'
);
