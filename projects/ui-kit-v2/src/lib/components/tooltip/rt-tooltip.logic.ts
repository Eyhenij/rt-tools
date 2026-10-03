import { ConnectedPosition } from '@angular/cdk/overlay';

import { IRtTooltip } from './rt-tooltip.model';

/** Зазор между подсказкой и host'ом. */
const TOOLTIP_GAP_PX: number = 6;

const POSITION_BY_PLACEMENT: Readonly<Record<IRtTooltip.Placement, ConnectedPosition>> = {
    top: { originX: 'center', originY: 'top', overlayX: 'center', overlayY: 'bottom', offsetY: -TOOLTIP_GAP_PX },
    bottom: { originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'top', offsetY: TOOLTIP_GAP_PX },
    left: { originX: 'start', originY: 'center', overlayX: 'end', overlayY: 'center', offsetX: -TOOLTIP_GAP_PX },
    right: { originX: 'end', originY: 'center', overlayX: 'start', overlayY: 'center', offsetX: TOOLTIP_GAP_PX },
};

const FALLBACKS: Readonly<Record<IRtTooltip.Placement, readonly IRtTooltip.Placement[]>> = {
    top: ['top', 'bottom'],
    bottom: ['bottom', 'top'],
    left: ['left', 'right', 'top', 'bottom'],
    right: ['right', 'left', 'top', 'bottom'],
};

/**
 * Позиции подсказки по порядку попыток: заданная сторона, противоположная, а у боковой ещё
 * верх и низ — на узком экране сбоку не помещается ни одна сторона, и подсказка, придвинутая
 * к краю, легла бы на сам host. Бока заданы логическими `start`/`end`: в письме справа налево
 * `left` встаёт справа — как и вся раскладка кита.
 */
export function tooltipPositions(placement: IRtTooltip.Placement): ConnectedPosition[] {
    return FALLBACKS[placement].map((side: IRtTooltip.Placement): ConnectedPosition => ({ ...POSITION_BY_PLACEMENT[side] }));
}

/** Размеры узла, по которым судят об обрезке: видимая ширина и ширина содержимого. */
export interface IRtTooltipBox {
    readonly clientWidth: number;
    readonly scrollWidth: number;
}

/**
 * Текст узла обрезан: содержимое шире видимой коробки. Высота не судится — узел с видимым
 * переполнением по высоте показывает всё, и его подсказка только повторяла бы текст.
 */
export function isTooltipTextCut(box: IRtTooltipBox): boolean {
    return box.scrollWidth > box.clientWidth;
}
