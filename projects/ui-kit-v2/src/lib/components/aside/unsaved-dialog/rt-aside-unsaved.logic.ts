import { Signal } from '@angular/core';

/** Что делает панель, когда её просят закрыться. */
export enum ERtAsideCloseIntent {
    /** Ничего: идёт запись, и закрытие посреди неё потеряло бы её результат. */
    Ignore = 'ignore',
    /** Закрыться сразу: терять нечего. */
    Close = 'close',
    /** Спросить, что сделать с несохранёнными правками. */
    Ask = 'ask',
}

/** Исход окна с несохранёнными правками. */
export enum ERtAsideUnsavedOutcome {
    /** Закрыть без сохранения. */
    Discard = 'discard',
    /** Закрыть с сохранением. */
    Save = 'save',
    /** Остаться в панели. */
    Stay = 'stay',
}

/**
 * Гард закрытия, который панель ставит на себя: признак нетронутости формы и
 * запись, которую зовёт исход «закрыть с сохранением».
 */
export interface IRtAsideUnsavedGuard {
    pristine: Signal<boolean>;
    save: () => void;
}

/** Состояние панели на момент намерения закрыть её. */
export interface IRtAsideCloseState {
    submitting: boolean;
    guarded: boolean;
    pristine: boolean;
}

/**
 * Решение по намерению закрыть панель. Одно на все четыре пути закрытия: кнопку
 * в шапке, кнопку в футере, нажатие мимо панели и клавишу Esc — иначе Esc обошёл
 * бы то, что ловит кнопка.
 */
export function resolveCloseIntent(state: IRtAsideCloseState): ERtAsideCloseIntent {
    if (state.submitting) {
        return ERtAsideCloseIntent.Ignore;
    }

    return state.guarded && !state.pristine ? ERtAsideCloseIntent.Ask : ERtAsideCloseIntent.Close;
}
