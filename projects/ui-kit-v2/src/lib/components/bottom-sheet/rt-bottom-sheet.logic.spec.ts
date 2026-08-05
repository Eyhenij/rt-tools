import { clampDragDelta, DRAG_DISMISS_THRESHOLD_PX, shouldDismissDrag } from './rt-bottom-sheet.logic';

describe('clampDragDelta', () => {
    it('не даёт тянуть sheet вверх (отрицательная дельта обнуляется)', () => {
        expect(clampDragDelta(-40)).toBe(0);
        expect(clampDragDelta(0)).toBe(0);
        expect(clampDragDelta(120)).toBe(120);
    });
});

describe('shouldDismissDrag', () => {
    it('закрывает sheet только после порога свайпа', () => {
        expect(shouldDismissDrag(DRAG_DISMISS_THRESHOLD_PX)).toBe(false);
        expect(shouldDismissDrag(DRAG_DISMISS_THRESHOLD_PX + 1)).toBe(true);
        expect(shouldDismissDrag(0)).toBe(false);
    });
});
