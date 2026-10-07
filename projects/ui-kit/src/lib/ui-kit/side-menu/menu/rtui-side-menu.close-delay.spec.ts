import { enterPanel, hoverFirstItem, hoverItem, installFontsStub, ISetup, leavePanel, menu, setup, subItems } from './side-menu.harness';

const DELAY: number = 500;

function openWithDelay(): ISetup {
    const result: ISetup = setup();

    result.host.closeDelay.set(DELAY);
    result.fixture.detectChanges();
    hoverFirstItem(result.fixture);

    return result;
}

beforeAll(installFontsStub);

describe('RtuiSideMenuComponent — задержка закрытия подменю', () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    it('SC-UK-144 — уход указателя закрывает подменю только по истечении задержки', () => {
        const { fixture }: ISetup = openWithDelay();

        expect(subItems(fixture).length).toBe(2);

        leavePanel(fixture);
        jest.advanceTimersByTime(DELAY - 1);
        fixture.detectChanges();

        expect(subItems(fixture).length).toBe(2);

        jest.advanceTimersByTime(1);
        fixture.detectChanges();

        expect(subItems(fixture).length).toBe(0);
    });

    it('SC-UK-145 — возврат на панель до истечения задержки оставляет подменю', () => {
        const { fixture }: ISetup = openWithDelay();

        leavePanel(fixture);
        jest.advanceTimersByTime(DELAY / 2);
        enterPanel(fixture);
        jest.advanceTimersByTime(DELAY);
        fixture.detectChanges();

        expect(subItems(fixture).length).toBe(2);
    });

    it('SC-UK-146 — пункт полосы без разделов закрывает через задержку, пункт с разделами оставляет', () => {
        const { fixture }: ISetup = openWithDelay();

        hoverItem(fixture, 1);
        jest.advanceTimersByTime(DELAY / 2);
        hoverItem(fixture, 0);
        jest.advanceTimersByTime(DELAY);
        fixture.detectChanges();

        expect(subItems(fixture).length).toBe(2);

        hoverItem(fixture, 1);

        expect(subItems(fixture).length).toBe(2);

        jest.advanceTimersByTime(DELAY);
        fixture.detectChanges();

        expect(subItems(fixture).length).toBe(0);
    });

    it('SC-UK-147 — нажатие на подложку закрывает сразу, и бежавший таймер ничего не делает потом', () => {
        const { fixture }: ISetup = openWithDelay();

        leavePanel(fixture);
        menu(fixture).closeSubMenu();
        fixture.detectChanges();

        expect(subItems(fixture).length).toBe(0);

        hoverFirstItem(fixture);
        jest.advanceTimersByTime(DELAY);
        fixture.detectChanges();

        expect(subItems(fixture).length).toBe(2);
    });
});
