import { isTooltipTextCut } from './rt-tooltip.logic';

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
