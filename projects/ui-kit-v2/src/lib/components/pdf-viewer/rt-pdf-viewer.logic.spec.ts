import {
    anchoredScrollTop,
    canZoomIn,
    canZoomOut,
    fitWidthPercent,
    initialZoom,
    nextZoomStep,
    pageBoxes,
    pagesToRender,
    visiblePageIndex,
    zoomPercentLabel,
} from './rt-pdf-viewer.logic';
import { IRtPdfViewer } from './rt-pdf-viewer.model';

/** Лист A4 в пунктах: при 100% он 794 CSS-пикселя в ширину. */
const A4: IRtPdfViewer.PageSize = { width: 595, height: 842 };

describe('nextZoomStep', () => {
    it('«+» ведёт на следующую ступень', () => {
        expect(nextZoomStep(100, 1)).toBe(125);
    });

    it('«−» ведёт на предыдущую ступень', () => {
        expect(nextZoomStep(100, -1)).toBe(75);
    });

    it('из масштаба между ступенями шаг идёт к ближайшей в нужную сторону', () => {
        expect(nextZoomStep(83, 1)).toBe(100);
        expect(nextZoomStep(83, -1)).toBe(75);
    });

    it('дробный остаток от деления ширин не перескакивает ступень', () => {
        expect(nextZoomStep(99.999, 1)).toBe(125);
    });

    it('за границы шаг не уходит', () => {
        expect(nextZoomStep(300, 1)).toBe(300);
        expect(nextZoomStep(50, -1)).toBe(50);
    });

    it('из масштаба ниже нижней границы «+» ведёт на неё', () => {
        expect(nextZoomStep(43, 1)).toBe(50);
    });
});

describe('canZoomIn и canZoomOut', () => {
    it('на верхней границе увеличивать некуда', () => {
        expect(canZoomIn(300)).toBe(false);
        expect(canZoomIn(200)).toBe(true);
    });

    it('на нижней границе уменьшать некуда', () => {
        expect(canZoomOut(50)).toBe(false);
        expect(canZoomOut(75)).toBe(true);
    });

    it('ниже нижней границы — «по ширине» на телефоне — уменьшать тоже некуда', () => {
        expect(canZoomOut(43)).toBe(false);
    });
});

describe('fitWidthPercent', () => {
    it('самая широкая страница встаёт во всю ширину', () => {
        expect(fitWidthPercent(794, [A4])).toBeCloseTo(100, 0);
        expect(fitWidthPercent(397, [A4])).toBeCloseTo(50, 0);
    });

    it('считается по самой широкой странице, а не по первой', () => {
        expect(fitWidthPercent(794, [A4, { width: 1190, height: 842 }])).toBeCloseTo(50, 0);
    });

    it('границами ступеней не зажат — иначе вернулась бы горизонтальная прокрутка', () => {
        expect(fitWidthPercent(343, [A4])).toBeLessThan(50);
    });

    it('без страниц и без места остаётся 100%', () => {
        expect(fitWidthPercent(800, [])).toBe(100);
        expect(fitWidthPercent(0, [A4])).toBe(100);
    });
});

describe('initialZoom', () => {
    it('широкий экран открывается в 100%', () => {
        expect(initialZoom(1440, 1408, [A4])).toEqual({ kind: 'percent', percent: 100 });
    });

    it('экран до 768 включительно открывается «по ширине»', () => {
        expect(initialZoom(768, 1000, [A4])).toEqual({ kind: 'fit' });
        expect(initialZoom(375, 343, [A4])).toEqual({ kind: 'fit' });
    });

    it('страница, которая в 100% не влезает, открывается «по ширине» и на широком экране', () => {
        expect(initialZoom(1000, 968, [{ width: 842, height: 595 }])).toEqual({ kind: 'fit' });
    });
});

describe('pageBoxes', () => {
    it('места под страницы считаются от масштаба в целых пикселях', () => {
        expect(pageBoxes([A4], 100)).toEqual([{ index: 0, width: 793, height: 1122 }]);
        expect(pageBoxes([A4], 50)).toEqual([{ index: 0, width: 396, height: 561 }]);
    });
});

describe('visiblePageIndex', () => {
    // Три страницы по 1000 с просветом 16
    const tops: number[] = [16, 1032, 2048];
    const heights: number[] = [1000, 1000, 1000];

    it('в начале документа видна первая', () => {
        expect(visiblePageIndex(tops, heights, 0, 800)).toBe(0);
    });

    it('видна та, что занимает больше высоты окна', () => {
        expect(visiblePageIndex(tops, heights, 700, 800)).toBe(1);
        expect(visiblePageIndex(tops, heights, 500, 800)).toBe(0);
    });

    it('в конце прокрутки — последняя, даже если она короче соседки', () => {
        expect(visiblePageIndex([16, 1032], [1000, 200], 500, 800)).toBe(1);
    });

    it('документ, видный целиком без прокрутки, стоит на первой', () => {
        expect(visiblePageIndex([16, 532], [500, 500], 0, 1200)).toBe(0);
    });

    it('без страниц — первая', () => {
        expect(visiblePageIndex([], [], 0, 800)).toBe(0);
    });
});

describe('pagesToRender', () => {
    const tops: number[] = Array.from({ length: 10 }, (_: unknown, i: number): number => 16 + i * 1016);
    const heights: number[] = Array.from({ length: 10 }, (): number => 1000);

    it('рисуются видимые и по одной соседней с каждой стороны', () => {
        expect(pagesToRender(tops, heights, 3100, 800)).toEqual([2, 3, 4]);
    });

    it('у края документа соседей с одной стороны нет', () => {
        expect(pagesToRender(tops, heights, 0, 800)).toEqual([0, 1]);
    });

    it('запас задаётся числом соседей', () => {
        expect(pagesToRender(tops, heights, 3100, 800, 3)).toEqual([0, 1, 2, 3, 4, 5, 6]);
    });

    it('дальние страницы не рисуются — каждая это холст в мегабайты', () => {
        expect(pagesToRender(tops, heights, 0, 800)).not.toContain(5);
    });
});

describe('anchoredScrollTop', () => {
    it('после увеличения на экране остаётся то же место той же страницы', () => {
        // Половина второй страницы: была 1000 высотой с верхом на 1016, стала 2000 с верхом на 2032
        expect(anchoredScrollTop(1016, 1000, 1516, 2032, 2000)).toBe(3032);
    });

    it('страница без высоты ставит прокрутку на её верх', () => {
        expect(anchoredScrollTop(0, 0, 100, 500, 1000)).toBe(500);
    });
});

describe('zoomPercentLabel', () => {
    it('масштаб подписывается целыми процентами', () => {
        expect(zoomPercentLabel(83.47)).toBe('83%');
        expect(zoomPercentLabel(100)).toBe('100%');
    });
});
