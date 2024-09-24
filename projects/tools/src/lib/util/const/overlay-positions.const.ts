import { ConnectedPosition } from '@angular/cdk/overlay';

export const OVERLAY_POSITIONS: Readonly<ConnectedPosition[]> = Object.freeze([
    {
        originX: 'start',
        originY: 'bottom',
        overlayX: 'start',
        overlayY: 'top',
    },
    {
        originX: 'end',
        originY: 'bottom',
        overlayX: 'end',
        overlayY: 'top',
    },
    {
        originX: 'start',
        originY: 'bottom',
        overlayX: 'start',
        overlayY: 'top',
    },
    {
        originX: 'start',
        originY: 'top',
        overlayX: 'start',
        overlayY: 'bottom',
    },
]);
