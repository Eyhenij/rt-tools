import { ConnectedPosition } from '@angular/cdk/overlay';

import { isTooltipTextCut, tooltipPositions } from './rt-tooltip.logic';

describe('isTooltipTextCut', (): void => {
    it('текст шире коробки — обрезан', (): void => {
        expect(isTooltipTextCut({ clientWidth: 120, scrollWidth: 184 })).toBe(true);
    });

    it('текст ровно по коробке — не обрезан', (): void => {
        expect(isTooltipTextCut({ clientWidth: 120, scrollWidth: 120 })).toBe(false);
    });

    it('текст уже коробки — не обрезан', (): void => {
        expect(isTooltipTextCut({ clientWidth: 120, scrollWidth: 64 })).toBe(false);
    });
});

describe('tooltipPositions', (): void => {
    const sides: (positions: ConnectedPosition[]) => string[] = (positions: ConnectedPosition[]): string[] =>
        positions.map(
            (position: ConnectedPosition): string => `${position.originX}/${position.originY}→${position.overlayX}/${position.overlayY}`
        );

    it('SC-UKV-570 — слева: подсказка концом к началу host’а, по центру высоты, с зазором', (): void => {
        const [first]: ConnectedPosition[] = tooltipPositions('left');

        expect(first).toEqual({ originX: 'start', originY: 'center', overlayX: 'end', overlayY: 'center', offsetX: -6 });
    });

    it('SC-UKV-570 — справа: подсказка началом к концу host’а', (): void => {
        const [first]: ConnectedPosition[] = tooltipPositions('right');

        expect(first).toEqual({ originX: 'end', originY: 'center', overlayX: 'start', overlayY: 'center', offsetX: 6 });
    });

    it('SC-UKV-571 — боковая не поместилась: противоположная сторона, затем верх и низ', (): void => {
        expect(sides(tooltipPositions('left'))).toEqual([
            'start/center→end/center',
            'end/center→start/center',
            'center/top→center/bottom',
            'center/bottom→center/top',
        ]);
    });

    it('SC-UKV-571 — верх и низ по-прежнему меняются только между собой', (): void => {
        expect(sides(tooltipPositions('top'))).toEqual(['center/top→center/bottom', 'center/bottom→center/top']);
        expect(sides(tooltipPositions('bottom'))).toEqual(['center/bottom→center/top', 'center/top→center/bottom']);
    });

    it('позиции — свежие объекты: правка одной не трогает следующий вызов', (): void => {
        tooltipPositions('top')[0].offsetY = 99;

        expect(tooltipPositions('top')[0].offsetY).toBe(-6);
    });
});
