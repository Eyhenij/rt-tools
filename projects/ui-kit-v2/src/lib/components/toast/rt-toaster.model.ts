import { InjectionToken } from '@angular/core';

import { INotification } from '../../platform';

import { IRtIcon } from '../icon/rt-icon.model';

export const RT_TOASTER_GAP_PX: number = 14;

/**
 * Значки severity у тоста. Приложение подменяет карту целиком — например, на имена
 * Material, — а тост со своим `icon` берёт свой значок мимо карты.
 */
export const RT_TOAST_SEVERITY_ICONS: InjectionToken<Readonly<Record<INotification.Severity, IRtIcon.Name>>> = new InjectionToken<
    Readonly<Record<INotification.Severity, IRtIcon.Name>>
>('RT_TOAST_SEVERITY_ICONS', {
    providedIn: 'root',
    factory: (): Readonly<Record<INotification.Severity, IRtIcon.Name>> => ({
        info: 'info-circle',
        success: 'check-circle',
        warning: 'exclamation-circle',
        danger: 'times-circle',
    }),
});

export namespace IRtToaster {
    export type Position = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

    export type PositionY = 'top' | 'bottom';

    export type PositionX = 'left' | 'center' | 'right';

    /** `stack` копит тосты стопкой; `replace` — новый тост уводит прежние. */
    export type Mode = 'stack' | 'replace';

    export interface Toast {
        readonly id: number;
        readonly severity: INotification.Severity;
        readonly message: string;
        readonly description?: string;
        readonly meta?: string;
        readonly action?: INotification.Action;
        readonly secondaryAction?: INotification.Action;
        readonly filled?: boolean;
        readonly duration?: number | null;
        readonly progress?: boolean;
        readonly icon?: IRtIcon.Name | null;
        /** Тост вытеснен новым в режиме `replace` и уходит своей анимацией. */
        readonly replaced?: boolean;
    }

    export interface Height {
        readonly toastId: number;
        readonly height: number;
    }
}
