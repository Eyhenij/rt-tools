import { dataListScrollbarStandard } from './rt-data-list-scrollbar.logic';

describe('dataListScrollbarStandard', (): void => {
    it('обе полосы видны — таблица остаётся с тихой полосой основы кита', (): void => {
        expect(dataListScrollbarStandard(true, true)).toEqual({ width: null, color: null });
    });

    it('обе полосы скрыты — стандартное свойство прячет их в любом браузере', (): void => {
        expect(dataListScrollbarStandard(false, false)).toEqual({ width: 'none', color: null });
    });

    it('скрыта одна полоса — стандартные свойства сброшены, и размер оси задаёт ::-webkit-scrollbar', (): void => {
        expect([dataListScrollbarStandard(false, true), dataListScrollbarStandard(true, false)]).toEqual([
            { width: 'auto', color: 'auto' },
            { width: 'auto', color: 'auto' },
        ]);
    });
});
