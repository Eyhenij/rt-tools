import { InjectionToken, Type } from '@angular/core';

import { INotification, NotificationRef } from '@rt-tools/ui-kit-v2/core';

import { IRtIcon } from '@rt-tools/ui-kit-v2/core';

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

/** Данные своего компонента тоста — то, что приложение передало в `openFromComponent`. */
export const RT_TOAST_DATA: InjectionToken<unknown> = new InjectionToken<unknown>('RT_TOAST_DATA');

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
        readonly onDismiss?: (reason: INotification.DismissReason) => void;
        /** Тост вытеснен новым в режиме `replace` и уходит своей анимацией. */
        readonly replaced?: boolean;
        readonly progressValue?: number | null;
        readonly details?: string;
        readonly component?: Type<unknown>;
        readonly data?: unknown;
        /** Ручка тоста: тост сообщает ей, почему ушёл. */
        readonly ref?: NotificationRef;
        /** Приложение закрыло тост ручкой: он уходит своей анимацией, как вытесненный. */
        readonly dismissRequested?: boolean;
    }

    /** Изменение показанного тоста от его ручки. */
    export interface Change {
        readonly toastId: number;
        readonly patch: INotification.Update & Pick<Toast, 'dismissRequested'>;
    }

    export interface Height {
        readonly toastId: number;
        readonly height: number;
    }
}
