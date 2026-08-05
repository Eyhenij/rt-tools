import { INotification } from '../../platform';

export const RT_TOASTER_GAP_PX: number = 14;

export namespace IRtToaster {
    export type Position = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

    export type PositionY = 'top' | 'bottom';

    export type PositionX = 'left' | 'center' | 'right';

    export interface Toast {
        readonly id: number;
        readonly severity: INotification.Severity;
        readonly message: string;
        readonly description?: string;
        readonly meta?: string;
        readonly action?: INotification.Action;
        readonly secondaryAction?: INotification.Action;
        readonly filled?: boolean;
    }

    export interface Height {
        readonly toastId: number;
        readonly height: number;
    }
}
