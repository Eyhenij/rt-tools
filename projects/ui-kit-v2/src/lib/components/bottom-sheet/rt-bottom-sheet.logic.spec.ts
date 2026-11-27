import { clampDragDelta, DRAG_DISMISS_THRESHOLD_PX, isTypingTarget, shouldDismissDrag } from './rt-bottom-sheet.logic';

describe('isTypingTarget', () => {
    function input(type: string, readOnly: boolean = false): HTMLInputElement {
        const node: HTMLInputElement = document.createElement('input');
        node.type = type;
        node.readOnly = readOnly;

        return node;
    }

    it('SC-UKV-1917 — печатают в текстовое поле, в поле поиска и в многострочное поле', () => {
        expect(isTypingTarget(input('text'))).toBe(true);
        expect(isTypingTarget(input('search'))).toBe(true);
        expect(isTypingTarget(input('number'))).toBe(true);
        expect(isTypingTarget(document.createElement('textarea'))).toBe(true);
    });

    it('SC-UKV-1917 — во флажок, радиокнопку, кнопку и поле только для чтения не печатают', () => {
        expect(isTypingTarget(input('checkbox'))).toBe(false);
        expect(isTypingTarget(input('radio'))).toBe(false);
        expect(isTypingTarget(input('text', true))).toBe(false);
        expect(isTypingTarget(document.createElement('button'))).toBe(false);
        expect(isTypingTarget(null)).toBe(false);
    });
});

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
