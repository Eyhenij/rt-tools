import { RtAsideSheetTabs, rtWrapStep, rtWrapTarget } from './rt-aside-sheet-tabs';

/** Ряд вкладок с раскладкой по порядку: в jsdom раскладки нет, место вкладки считает подмена. */
interface ITabsRow {
    readonly list: HTMLElement;
    readonly items: HTMLElement[];
    scrollLeft: number;
}

function rect(left: number, width: number): DOMRect {
    return { left, width, right: left + width, top: 0, bottom: 0, height: 0, x: left, y: 0 } as DOMRect;
}

/** Ряд из вкладок одной ширины в окне `client`; выбрана вкладка `selected`. */
function tabsRow(count: number, width: number, client: number, selected: number): ITabsRow {
    const list: HTMLElement = document.createElement('div');
    const items: HTMLElement[] = Array.from({ length: count }, (_: unknown, at: number): HTMLElement => {
        const item: HTMLElement = document.createElement('div');
        item.dataset['tabitem'] = String(at);
        item.innerHTML = `<button role="tab" aria-selected="${at === selected}"></button>`;
        list.appendChild(item);

        return item;
    });
    const row: ITabsRow = { list, items, scrollLeft: 0 };
    const room: number = count * width - client;
    Object.defineProperty(list, 'clientWidth', { get: (): number => client });
    Object.defineProperty(list, 'scrollWidth', { get: (): number => count * width });
    Object.defineProperty(list, 'scrollLeft', {
        get: (): number => row.scrollLeft,
        set: (value: number): void => {
            row.scrollLeft = Math.min(Math.max(value, 0), room);
        },
    });
    jest.spyOn(list, 'getBoundingClientRect').mockReturnValue(rect(0, client));
    items.forEach((item: HTMLElement): void => {
        const place: () => number = (): number => Number(item.style.order || item.dataset['tabitem']) * width - row.scrollLeft;
        jest.spyOn(item, 'getBoundingClientRect').mockImplementation((): DOMRect => rect(place(), width));
        Object.defineProperty(item, 'offsetWidth', { get: (): number => width });
    });
    document.body.appendChild(list);

    return row;
}

function selectedLeft(row: ITabsRow): number {
    return row.items.find((item: HTMLElement): boolean => item.querySelector('[aria-selected="true"]') !== null)?.getBoundingClientRect()
        .left as number;
}

describe('Ряд вкладок шторки панели — перестановка у края', (): void => {
    afterEach((): void => {
        document.body.innerHTML = '';
    });

    it('SC-UKV-1832 — край ряда ставит перестановку: левый — вперёд, правый — назад, середина — никакой', (): void => {
        expect(rtWrapStep({ left: 0, client: 263, scroll: 353 })).toBe(1);
        expect(rtWrapStep({ left: 90, client: 263, scroll: 353 })).toBe(-1);
        expect(rtWrapStep({ left: 40, client: 263, scroll: 353 })).toBe(0);
    });

    it('SC-UKV-1832 — прокрутка держит выбранную вкладку на месте, пока лежит в запасе прокрутки ряда', (): void => {
        expect(rtWrapTarget({ left: 0, client: 300, scroll: 500 }, 100)).toBe(100);
        // Запас 90 меньше ширины вкладки 117,7: удержать её нельзя, и прыжка на 28 быть не должно.
        expect(rtWrapTarget({ left: 0, client: 263.1, scroll: 353.1 }, 117.7)).toBeNull();
    });

    it('SC-UKV-1832 — ряд у левого края переставляет крайнюю вкладку, а выбранная остаётся на месте', (): void => {
        const row: ITabsRow = tabsRow(5, 100, 300, 2);
        const tabs: RtAsideSheetTabs = new RtAsideSheetTabs();
        tabs.attach(row.list);
        row.scrollLeft = 0;
        const before: number = selectedLeft(row);

        row.list.dispatchEvent(new Event('scroll'));

        expect(row.scrollLeft).toBe(100);
        expect(selectedLeft(row)).toBe(before);
        tabs.detach();
    });

    it('SC-UKV-1832 — запас прокрутки меньше вкладки: ряд стоит у края, выбранная вкладка не прыгает', (): void => {
        const row: ITabsRow = tabsRow(3, 117.7, 263.1, 1);
        const tabs: RtAsideSheetTabs = new RtAsideSheetTabs();
        tabs.attach(row.list);
        row.scrollLeft = 0;
        const orders: string[] = row.items.map((item: HTMLElement): string => item.style.order);
        const before: number = selectedLeft(row);

        row.list.dispatchEvent(new Event('scroll'));

        expect(row.scrollLeft).toBe(0);
        expect(selectedLeft(row)).toBe(before);
        expect(row.items.map((item: HTMLElement): string => item.style.order)).toEqual(orders);
        tabs.detach();
    });
});
