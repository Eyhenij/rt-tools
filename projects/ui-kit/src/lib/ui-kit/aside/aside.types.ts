import { ComponentType, OverlayRef } from '@angular/cdk/overlay';
import { InjectionToken } from '@angular/core';

import { Subject } from 'rxjs';

export type TAsidePositions = 'left' | 'right';

/**
 * Чем шторке позволено закрываться. Клавиша по умолчанию не закрывает: её жмут, чтобы снять
 * подсказку или выйти из поля, а закрывалась вся панель вместе с введённым.
 */
export interface IAsideConfig {
    /** Закрывать ли шторку клавишей Esc. По умолчанию — нет. */
    readonly closeOnEscape?: boolean;
    /** Закрывать ли шторку кликом по подложке. По умолчанию — да. */
    readonly closeOnBackdropClick?: boolean;
}

export class AsideRef<DATA, ANSWER> {
    constructor(
        private answer: Subject<ANSWER | null>,
        public overlayRef: OverlayRef,
        public component: ComponentType<unknown>,
        public position: TAsidePositions,
        public data: DATA
    ) {}

    public close(answer?: ANSWER): void {
        this.answer.next(answer ?? null);
    }
}

export const ASIDE_REF: InjectionToken<AsideRef<object, object>> = new InjectionToken<AsideRef<object, object>>('ASIDE_REF');
