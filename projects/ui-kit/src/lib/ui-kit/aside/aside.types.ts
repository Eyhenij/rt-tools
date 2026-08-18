import { ComponentType, OverlayRef } from '@angular/cdk/overlay';
import { InjectionToken } from '@angular/core';

import { Subject } from 'rxjs';

export type TAsidePositions = 'left' | 'right';

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
