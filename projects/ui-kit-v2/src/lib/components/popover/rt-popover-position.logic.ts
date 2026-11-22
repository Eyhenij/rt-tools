import { ConnectedPosition, OverlaySizeConfig } from '@angular/cdk/overlay';

import { IRtPopover } from './rt-popover.model';

/** Два места панели по умолчанию: под host'ом и, если там тесно, над ним, с общим выравниванием по краю. */
export function rtPopoverDefaultPositions(align: 'start' | 'end', offsetX: number, offsetY: number): ConnectedPosition[] {
    return [
        { offsetX, offsetY, originX: align, originY: 'bottom', overlayX: align, overlayY: 'top' },
        { offsetX, originX: align, originY: 'top', overlayX: align, overlayY: 'bottom', offsetY: -offsetY },
    ];
}

/** Размер панели по режиму ширины: по триггеру, не уже триггера или по содержимому. */
export function rtPopoverSizeByWidth(width: IRtPopover.Width, hostWidth: number): OverlaySizeConfig {
    const sizeByWidth: Record<IRtPopover.Width, OverlaySizeConfig> = {
        trigger: { width: hostWidth },
        'trigger-min': { minWidth: hostWidth },
        auto: {},
    };
    return sizeByWidth[width];
}
