import { ConnectedPosition } from '@angular/cdk/overlay';

import { IRtIconButton } from '@rt-tools/ui-kit-v2/icon-button';
import { IRtTooltip } from '@rt-tools/ui-kit-v2/tooltip';
import { IRtSpeedMenu } from './rt-speed-menu.model';

const UP: ConnectedPosition = { originX: 'center', originY: 'top', overlayX: 'center', overlayY: 'bottom' };
const DOWN: ConnectedPosition = { originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'top' };
const START: ConnectedPosition = { originX: 'start', originY: 'center', overlayX: 'end', overlayY: 'center' };
const END: ConnectedPosition = { originX: 'end', originY: 'center', overlayX: 'start', overlayY: 'center' };

const POSITIONS: Record<IRtSpeedMenu.Direction, readonly ConnectedPosition[]> = {
    up: [UP, DOWN],
    down: [DOWN, UP],
    start: [START, END],
    end: [END, START],
};

const ACTION_SIZE: Record<IRtSpeedMenu.Size, IRtIconButton.Size> = {
    sm: 'xs',
    md: 'sm',
    lg: 'md',
    xl: 'lg',
};

/** Места панели вокруг кнопки: сторона направления, а у края экрана — противоположная. */
export function speedMenuPositions(direction: IRtSpeedMenu.Direction): readonly ConnectedPosition[] {
    return POSITIONS[direction];
}

/** Размер кнопок действий — на шаг меньше кнопки меню. */
export function speedMenuActionSize(size: IRtSpeedMenu.Size): IRtIconButton.Size {
    return ACTION_SIZE[size];
}

/** Подсказка столбца действий встаёт сбоку, подсказка ряда — сверху: иначе она закрывает соседа. */
export function speedMenuTooltipSide(direction: IRtSpeedMenu.Direction): IRtTooltip.Placement {
    return direction === 'up' || direction === 'down' ? 'left' : 'top';
}

/**
 * Куда клавиша переводит фокус среди доступных действий: стрелки идут по кругу, Home и End берут
 * крайние. `null` — клавиша не про переход.
 */
export function speedMenuNextIndex(key: string, current: number, count: number): number | null {
    if (count === 0) {
        return null;
    }

    switch (key) {
        case 'ArrowDown':
        case 'ArrowRight':
            return (current + 1) % count;
        case 'ArrowUp':
        case 'ArrowLeft':
            return (current - 1 + count) % count;
        case 'Home':
            return 0;
        case 'End':
            return count - 1;
        default:
            return null;
    }
}
