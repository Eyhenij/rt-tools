import { join } from 'node:path';

import * as sass from 'sass';

import { RtAsideHeaderTitle, rtSheetTitleBetween } from './rt-aside-header-title';

/** Шапка шторки на 375 по утверждённому макету: ряд 351, «×» 40, зазор 8. */
const ROW: number = 351;
const CLOSE: number = 40;
const GAP: number = 8;
/** Справа «⋮» 32, зазор 8 и «Сохранить» 101. */
const ICON_AND_BUTTON: number = 32 + 8 + 101;
/** Справа только «Сохранить». */
const BUTTON: number = 101;

function rect(width: number): DOMRect {
    return { width, height: 0, left: 0, right: width, top: 0, bottom: 0, x: 0, y: 0 } as DOMRect;
}

/** Ширины текста заголовков одной строкой: их отдаёт мера текста браузера. */
const TEXT_WIDTHS: Map<Node, number> = new Map<Node, number>();

/** Мера текста браузера: в jsdom раскладки нет, ширину текста узла под мерой отдаёт подмена. */
function textRect(this: Range): DOMRect {
    return rect(TEXT_WIDTHS.get(this.startContainer) ?? 0);
}

/** Ряд шапки шторки с частями нужной ширины и заголовком нужной длины одной строкой. */
function row(end: number, title: number): HTMLElement {
    const header: HTMLElement = document.createElement('header');
    header.innerHTML = `
        <div class="rt-aside-header__start"></div>
        <div class="rt-aside-header__heading"><h2 class="rt-aside-header__title"><rt-skeleton-wrapper></rt-skeleton-wrapper></h2></div>
        <div class="rt-aside-header__actions"></div>`;
    header.style.columnGap = `${GAP}px`;
    jest.spyOn(header, 'getBoundingClientRect').mockReturnValue(rect(ROW));
    jest.spyOn(header.querySelector('.rt-aside-header__start') as HTMLElement, 'getBoundingClientRect').mockReturnValue(rect(CLOSE));
    jest.spyOn(header.querySelector('.rt-aside-header__actions') as HTMLElement, 'getBoundingClientRect').mockReturnValue(rect(end));
    const text: HTMLElement = header.querySelector('rt-skeleton-wrapper') as HTMLElement;
    TEXT_WIDTHS.set(text, title);
    // Колонка заголовка между кнопками тянется на всё место: её ширина не равна тексту.
    Object.defineProperty(text, 'scrollWidth', { value: 200 });
    document.body.appendChild(header);

    return header;
}

describe('Место заголовка в шапке шторки', (): void => {
    beforeEach((): void => {
        Object.defineProperty(Range.prototype, 'getBoundingClientRect', { value: textRect, configurable: true });
    });

    afterEach((): void => {
        Reflect.deleteProperty(Range.prototype, 'getBoundingClientRect');
        TEXT_WIDTHS.clear();
    });

    it('SC-UKV-1861 — заголовок, ставший короче, из места между кнопками возвращается в центр', (): void => {
        const answers: boolean[] = [];
        const fit: RtAsideHeaderTitle = new RtAsideHeaderTitle((between: boolean): number => answers.push(between));
        const header: HTMLElement = row(ICON_AND_BUTTON, 120);

        fit.attach(header);
        TEXT_WIDTHS.set(header.querySelector('rt-skeleton-wrapper') as HTMLElement, 40);
        fit.measure();

        expect(answers).toEqual([true, false]);
        fit.detach();
        header.remove();
    });

    it('SC-UKV-1861 — короткий заголовок влазит по центру шапки и стоит по её центру', (): void => {
        expect(rtSheetTitleBetween({ row: ROW, start: CLOSE, end: BUTTON, gap: GAP, title: 80 })).toBe(false);
        expect(rtSheetTitleBetween({ row: ROW, start: CLOSE, end: 0, gap: GAP, title: 200 })).toBe(false);
    });

    it('SC-UKV-1861 — заголовок, не влезающий по центру, встаёт между кнопками', (): void => {
        // По центру между «⋮ Сохранить» и симметричным местом слева остаётся 351 − 16 − 282 = 53.
        expect(rtSheetTitleBetween({ row: ROW, start: CLOSE, end: ICON_AND_BUTTON, gap: GAP, title: 54 })).toBe(true);
        expect(rtSheetTitleBetween({ row: ROW, start: CLOSE, end: ICON_AND_BUTTON, gap: GAP, title: 53 })).toBe(false);
    });

    it('SC-UKV-1861 — мера частей шапки ставит заголовок между кнопками и снимает это, когда он влазит', (): void => {
        const answers: boolean[] = [];
        const fit: RtAsideHeaderTitle = new RtAsideHeaderTitle((between: boolean): number => answers.push(between));
        const long: HTMLElement = row(ICON_AND_BUTTON, 120);
        const short: HTMLElement = row(BUTTON, 60);

        fit.attach(long);
        fit.attach(short);
        fit.attach(null);

        expect(answers).toEqual([true, false, false]);
        long.remove();
        short.remove();
    });

    it('SC-UKV-1861 — между кнопками заголовок берёт всё место между частями шапки, по центру с многоточием', (): void => {
        const css: string = sass.compile(join(__dirname, 'rt-aside-header.component.scss'), { style: 'expanded' }).css;
        const between: string = css.slice(css.indexOf('.rt-aside-header__content--title-between {'));

        expect(between.slice(0, between.indexOf('}'))).toContain('grid-template-columns: max-content minmax(0, 1fr) max-content');
        expect(css).toMatch(/\.rt-aside-header__content--sheet > \.rt-aside-header__start \{\s*justify-self: start/);
        expect(css).toMatch(/\.rt-aside-header__content--sheet > \.rt-aside-header__actions \{\s*justify-self: end/);
    });
});
