import { initialAccordionOpen, toggleAccordionItem } from './rt-accordion.logic';

describe('rt-accordion.logic', (): void => {
    it('SC-UKV-398 — нажатие раскрывает свёрнутый пункт и не трогает раскрытые', (): void => {
        expect([...toggleAccordionItem(new Set([0]), 2)].sort()).toEqual([0, 2]);
    });

    it('SC-UKV-399 — нажатие сворачивает раскрытый пункт', (): void => {
        expect([...toggleAccordionItem(new Set([0, 2]), 0)]).toEqual([2]);
    });

    it('SC-UKV-396 — при входе раскрыт пункт из входа', (): void => {
        expect([...initialAccordionOpen(2, 5)]).toEqual([2]);
    });

    it('SC-UKV-397 — номер вне списка и пустой вход не раскрывают ничего', (): void => {
        expect(initialAccordionOpen(5, 5).size).toBe(0);
        expect(initialAccordionOpen(-1, 5).size).toBe(0);
        expect(initialAccordionOpen(null, 5).size).toBe(0);
    });
});
