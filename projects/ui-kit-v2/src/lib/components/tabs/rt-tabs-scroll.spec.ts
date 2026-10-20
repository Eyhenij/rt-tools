import { ElementRef } from '@angular/core';

import { RtTabsScroller, rtTabsEasing, rtTabsIntoViewTarget, rtTabsPageTarget } from './rt-tabs.scroll';

/** Окно, у которого время и кадры идут руками, а свойства хоста заданы словарём. */
interface IFakeWindow {
    readonly win: Window;
    advance: (ms: number) => void;
}

function fakeWindow(props: Readonly<Record<string, string>>, reduced: boolean = false): IFakeWindow {
    let now: number = 0;
    let frames: ((time: number) => void)[] = [];
    const win: Partial<Window> = {
        getComputedStyle: (): CSSStyleDeclaration =>
            ({ getPropertyValue: (name: string): string => props[name] ?? '' }) as CSSStyleDeclaration,
        matchMedia: (query: string): MediaQueryList => ({ matches: reduced, media: query }) as MediaQueryList,
        performance: { now: (): number => now } as Performance,
        requestAnimationFrame: (callback: FrameRequestCallback): number => frames.push(callback),
        cancelAnimationFrame: (): void => {
            frames = [];
        },
    };

    return {
        win: win as Window,
        advance: (ms: number): void => {
            now += ms;
            const due: ((time: number) => void)[] = frames;
            frames = [];
            due.forEach((callback: (time: number) => void): void => callback(now));
        },
    };
}

/** Полоса шириной 404 точки со списком в 720, как в боковой панели ролей. */
function strip(scrollLeft: number = 0): HTMLElement {
    const list: HTMLElement = document.createElement('div');
    Object.defineProperty(list, 'scrollWidth', { configurable: true, value: 720 });
    Object.defineProperty(list, 'clientWidth', { configurable: true, value: 404 });
    Object.defineProperty(list, 'scrollLeft', { configurable: true, writable: true, value: scrollLeft });

    return list;
}

function tab(offsetLeft: number, offsetWidth: number): HTMLElement {
    const node: HTMLElement = document.createElement('button');
    Object.defineProperty(node, 'offsetLeft', { configurable: true, value: offsetLeft });
    Object.defineProperty(node, 'offsetWidth', { configurable: true, value: offsetWidth });

    return node;
}

function scroller(fake: IFakeWindow, list: HTMLElement): RtTabsScroller {
    return new RtTabsScroller(fake.win, document.createElement('div'), (): ElementRef<HTMLElement> => new ElementRef(list));
}

const MATERIAL: Readonly<Record<string, string>> = {
    '--rt-tabs-scroll-duration': '500ms',
    '--rt-tabs-scroll-easing': 'cubic-bezier(0.35, 0, 0.25, 1)',
};

describe('RtTabsScroller — плавная прокрутка полосы вкладок', (): void => {
    describe('SC-UKV-952 — стрелка сдвигает полосу плавно и на заданный шаг', (): void => {
        it('SC-UKV-952 — шаг «треть» сдвигает на треть видимой ширины, «страница» — на всю, не дальше края', (): void => {
            const list: HTMLElement = strip();

            expect(rtTabsPageTarget(list, 0, false, 'third')).toBeCloseTo(134.67, 2);
            expect(rtTabsPageTarget(list, 0, false, 'page')).toBe(316);
            expect(rtTabsPageTarget(list, 100, true, 'third')).toBe(0);
        });

        it('SC-UKV-952 — прокрутка идёт по кривой за свою длительность и встаёт точно в цель', (): void => {
            const fake: IFakeWindow = fakeWindow(MATERIAL);
            const list: HTMLElement = strip();

            scroller(fake, list).to(135);
            fake.advance(100);
            const early: number = list.scrollLeft;
            fake.advance(150);
            const middle: number = list.scrollLeft;
            fake.advance(300);

            expect(early).toBeGreaterThan(0);
            expect(early).toBeLessThan(middle);
            expect(middle).toBeLessThan(135);
            expect(list.scrollLeft).toBe(135);
        });

        it('SC-UKV-952 — следующее нажатие считается от цели идущей прокрутки, а не от середины пути', (): void => {
            const fake: IFakeWindow = fakeWindow(MATERIAL);
            const list: HTMLElement = strip();
            const run: RtTabsScroller = scroller(fake, list);

            run.to(rtTabsPageTarget(list, run.from(), false, 'third'));
            fake.advance(100);
            run.to(rtTabsPageTarget(list, run.from(), false, 'third'));
            fake.advance(600);

            expect(list.scrollLeft).toBeCloseTo(269.33, 2);
        });

        it('SC-UKV-952 — тик удержания останавливает плавную прокрутку и сдвигает сразу', (): void => {
            const fake: IFakeWindow = fakeWindow(MATERIAL);
            const list: HTMLElement = strip();
            const run: RtTabsScroller = scroller(fake, list);

            run.to(300);
            fake.advance(50);
            const before: number = list.scrollLeft;
            expect(run.nudge(false)).toBe(true);
            fake.advance(500);

            expect(list.scrollLeft).toBe(before + 12);
        });
    });

    describe('SC-UKV-953 — прокрутка к вкладке и выключение движения', (): void => {
        it('SC-UKV-953 — вкладка, скрытая с края, даёт цель прокрутки, видная целиком — нет', (): void => {
            const list: HTMLElement = strip(100);

            expect(rtTabsIntoViewTarget(list, tab(50, 80))).toBe(50);
            expect(rtTabsIntoViewTarget(list, tab(450, 100))).toBe(146);
            expect(rtTabsIntoViewTarget(list, tab(200, 100))).toBeNull();
        });

        it('SC-UKV-953 — нулевая длительность прокручивает сразу', (): void => {
            const fake: IFakeWindow = fakeWindow({ '--rt-tabs-scroll-duration': '0ms' });
            const list: HTMLElement = strip();

            scroller(fake, list).to(200);

            expect(list.scrollLeft).toBe(200);
        });

        it('SC-UKV-953 — prefers-reduced-motion прокручивает сразу', (): void => {
            const fake: IFakeWindow = fakeWindow(MATERIAL, true);
            const list: HTMLElement = strip();

            scroller(fake, list).to(200);

            expect(list.scrollLeft).toBe(200);
        });

        it('SC-UKV-953 — кривая CSS читается как функция: концы, именованные и cubic-bezier', (): void => {
            const material: (progress: number) => number = rtTabsEasing('cubic-bezier(0.35, 0, 0.25, 1)');

            expect(rtTabsEasing('linear')(0.3)).toBeCloseTo(0.3, 3);
            expect(rtTabsEasing('ease-out')(0)).toBe(0);
            expect(rtTabsEasing('ease-out')(1)).toBe(1);
            expect(rtTabsEasing('ease-out')(0.5)).toBeGreaterThan(0.5);
            expect(material(0.5)).toBeGreaterThan(0.5);
            expect(rtTabsEasing('чепуха')(0.5)).toBeCloseTo(rtTabsEasing('ease-out')(0.5), 6);
        });
    });
});
