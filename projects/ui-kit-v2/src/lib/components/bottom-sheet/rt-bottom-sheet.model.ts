import { InjectionToken, Signal } from '@angular/core';

/**
 * Что получает свой шаблон шапки или подвала шторки: просьбу закрыть, просьбу применить и признак
 * второго экрана. Первую зовёт своя кнопка закрытия; шторка с неприменённым выбором на неё сначала
 * спрашивает, как и на свою кнопку «×». Вторую зовёт своя кнопка действия: наружу уходит то же
 * событие, что по ответу «Применить», и шторка остаётся открытой, пока хозяин её не закроет.
 * `nested` — шторка открыта из другой шторки: своя шапка рисует слева шеврон «назад» вместо «×», и
 * он зовёт ту же просьбу закрыть.
 */
export interface IRtSheetTemplateContext {
    readonly $implicit: () => void;
    readonly close: () => void;
    readonly apply: () => void;
    readonly nested: Signal<boolean>;
}

/**
 * Чем шторку просят закрыть: нажатием по подложке, свайпом вниз, Escape или кнопкой закрытия — «×»
 * шапки или своей кнопкой шаблона.
 */
export type TRtSheetCloseReason = 'backdrop' | 'swipe' | 'escape' | 'close';

/**
 * Слова вопроса перед закрытием, когда у шторки свой вопрос, а не про неприменённый выбор: заголовок,
 * пояснение и три ответа в порядке шторки — согласие первым, затем отказ, затем «остаться».
 */
export interface IRtSheetConfirmLabels {
    readonly title: string;
    readonly message: string;
    readonly apply: string;
    readonly discard: string;
    readonly stay: string;
}

/** Ответы на вопрос шторки: экран вопроса зовёт их, решает шторка. */
export interface IRtSheetConfirmAnswers {
    readonly apply: () => void;
    readonly discard: () => void;
    readonly stay: () => void;
}

/** Ответы шторки для её экрана вопроса: шторка кладёт их в инжектор, когда ставит экран. */
export const RT_SHEET_CONFIRM_ANSWERS: InjectionToken<IRtSheetConfirmAnswers> = new InjectionToken<IRtSheetConfirmAnswers>(
    'RT_SHEET_CONFIRM_ANSWERS'
);
