import { IRtSheetKeyboardBox, rtSheetKeyboardBox, rtWatchSheetKeyboard } from './rt-bottom-sheet-keyboard';

/** Видимая область окна, какой её отдаёт браузер: высота, сдвиг и события смены. */
class FakeViewport extends EventTarget {
    public height: number = 812;
    public offsetTop: number = 0;
}

function fakeWindow(viewport: FakeViewport | null): Window {
    return { innerHeight: 812, visualViewport: viewport } as unknown as Window;
}

describe('Шторка — место над экранной клавиатурой', (): void => {
    it('SC-UKV-1764 — клавиатура открыта: место над ней — видимая область окна, с её сдвигом', (): void => {
        expect(rtSheetKeyboardBox(812, { height: 476, offsetTop: 40 })).toEqual({ top: 40, height: 476 });
    });

    it('SC-UKV-1764 — без клавиатуры места не считают: видимая область равна окну или ниже его на полосу браузера', (): void => {
        expect(rtSheetKeyboardBox(812, { height: 812, offsetTop: 0 })).toBeNull();
        expect(rtSheetKeyboardBox(812, { height: 760, offsetTop: 0 })).toBeNull();
        expect(rtSheetKeyboardBox(812, null)).toBeNull();
    });

    it('SC-UKV-1764 — слежение сообщает место при каждой смене видимой области и молчит после отписки', (): void => {
        const viewport: FakeViewport = new FakeViewport();
        const seen: (IRtSheetKeyboardBox | null)[] = [];
        const stop: () => void = rtWatchSheetKeyboard(fakeWindow(viewport), (box: IRtSheetKeyboardBox | null): void => {
            seen.push(box);
        });

        viewport.height = 476;
        viewport.dispatchEvent(new Event('resize'));
        viewport.offsetTop = 40;
        viewport.dispatchEvent(new Event('scroll'));
        stop();
        viewport.height = 812;
        viewport.dispatchEvent(new Event('resize'));

        expect(seen).toEqual([null, { top: 0, height: 476 }, { top: 40, height: 476 }]);
    });

    it('SC-UKV-1764 — окна нет или браузер видимую область не сообщает: следить не за чем', (): void => {
        const seen: unknown[] = [];

        rtWatchSheetKeyboard(null, (box: IRtSheetKeyboardBox | null): number => seen.push(box))();
        rtWatchSheetKeyboard(fakeWindow(null), (box: IRtSheetKeyboardBox | null): number => seen.push(box))();

        expect(seen).toEqual([]);
    });
});
