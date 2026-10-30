import { IRtPdfViewer } from './rt-pdf-viewer.model';

/**
 * Чистая логика просмотрщика документа: шаги масштаба, начальный масштаб, номер видимой страницы и
 * то, какие страницы стоит держать нарисованными.
 */

/** Ступени масштаба в процентах. Кнопки «−» и «+» ходят только по ним. */
export const RT_PDF_ZOOM_STEPS: readonly number[] = [50, 75, 100, 125, 150, 200, 300];

export const RT_PDF_ZOOM_MIN: number = RT_PDF_ZOOM_STEPS[0];

export const RT_PDF_ZOOM_MAX: number = RT_PDF_ZOOM_STEPS[RT_PDF_ZOOM_STEPS.length - 1];

/**
 * Сколько CSS-пикселей в пункте документа. Пункт — 1/72 дюйма, CSS-пиксель — 1/96: при 100%
 * страница A4 на экране той же ширины, что на бумаге.
 */
export const RT_PDF_CSS_UNITS: number = 96 / 72;

/** Ширина окна, до которой документ открывается «по ширине» при любом размере страницы. */
export const RT_PDF_NARROW_WIDTH: number = 768;

/** Запас на дробную часть: 99.999% от деления ширин — это всё ещё 100%. */
const EPSILON: number = 0.01;

/**
 * Следующая ступень масштаба. Шаг идёт от того, что на экране сейчас: из «по ширине» в 83% кнопка
 * «+» ведёт на 100%, а «−» — на 75%, а не на ступень, соседнюю с последней выбранной руками.
 */
export function nextZoomStep(current: number, direction: 1 | -1): number {
    if (direction > 0) {
        return RT_PDF_ZOOM_STEPS.find((step: number): boolean => step > current + EPSILON) ?? RT_PDF_ZOOM_MAX;
    }

    return [...RT_PDF_ZOOM_STEPS].reverse().find((step: number): boolean => step < current - EPSILON) ?? RT_PDF_ZOOM_MIN;
}

/** Есть ли куда увеличивать: на верхней границе кнопка «+» выключена. */
export function canZoomIn(current: number): boolean {
    return current < RT_PDF_ZOOM_MAX - EPSILON;
}

/** Есть ли куда уменьшать: на нижней границе кнопка «−» выключена. */
export function canZoomOut(current: number): boolean {
    return current > RT_PDF_ZOOM_MIN + EPSILON;
}

/**
 * Масштаб «по ширине» в процентах: самая широкая страница занимает всё место столбца.
 *
 * Границами ступеней он не зажат. На телефоне страница A4 «по ширине» — около 45%, и зажать её до
 * 50% значило бы вернуть горизонтальную прокрутку, ради которой режим и существует.
 */
export function fitWidthPercent(availableWidth: number, pages: readonly IRtPdfViewer.PageSize[]): number {
    const widest: number = Math.max(0, ...pages.map((page: IRtPdfViewer.PageSize): number => page.width));
    if (widest <= 0 || availableWidth <= 0) {
        return 100;
    }

    return (availableWidth / (widest * RT_PDF_CSS_UNITS)) * 100;
}

/**
 * С какого масштаба открыть документ. Узкий экран и страница, которая в 100% не влезает, —
 * «по ширине»: иначе человек сначала видит обрезанный край листа. Остальные — в 100%.
 */
export function initialZoom(viewportWidth: number, availableWidth: number, pages: readonly IRtPdfViewer.PageSize[]): IRtPdfViewer.Zoom {
    const widest: number = Math.max(0, ...pages.map((page: IRtPdfViewer.PageSize): number => page.width));
    if (viewportWidth <= RT_PDF_NARROW_WIDTH || widest * RT_PDF_CSS_UNITS > availableWidth) {
        return { kind: 'fit' };
    }

    return { kind: 'percent', percent: 100 };
}

/** Места под страницы на экране: от размера в пунктах и масштаба, в целых пикселях. */
export function pageBoxes(pages: readonly IRtPdfViewer.PageSize[], percent: number): IRtPdfViewer.PageBox[] {
    const scale: number = (percent / 100) * RT_PDF_CSS_UNITS;

    return pages.map((page: IRtPdfViewer.PageSize, index: number): IRtPdfViewer.PageBox => ({
        index,
        width: Math.floor(page.width * scale),
        height: Math.floor(page.height * scale),
    }));
}

/**
 * Номер страницы, которая видна сейчас, — с нуля. Это та, что занимает больше всего высоты окна;
 * при прокрутке до конца — последняя, даже если она короче соседки: иначе счётчик никогда не
 * показал бы «M / M» у документа с маленькой последней страницей. Документ, который виден целиком
 * без прокрутки, стоит на первой: до конца его никто не прокручивал.
 */
export function visiblePageIndex(tops: readonly number[], heights: readonly number[], scrollTop: number, viewportHeight: number): number {
    const total: number = Math.min(tops.length, heights.length);
    if (total === 0) {
        return 0;
    }

    const contentBottom: number = tops[total - 1] + heights[total - 1];
    if (scrollTop > 0 && scrollTop + viewportHeight >= contentBottom - 1) {
        return total - 1;
    }

    let best: number = 0;
    let bestArea: number = -1;
    for (let index: number = 0; index < total; index++) {
        const visible: number = Math.min(tops[index] + heights[index], scrollTop + viewportHeight) - Math.max(tops[index], scrollTop);
        if (visible > bestArea) {
            best = index;
            bestArea = visible;
        }
    }

    return best;
}

/**
 * Страницы, которые стоит нарисовать: видимые и по `overscan` соседних с каждой стороны. Документ
 * в сотню страниц разом не рисуется — каждая страница это холст в мегабайты памяти.
 */
export function pagesToRender(
    tops: readonly number[],
    heights: readonly number[],
    scrollTop: number,
    viewportHeight: number,
    overscan: number = 1
): number[] {
    const total: number = Math.min(tops.length, heights.length);
    const visible: number[] = [];
    for (let index: number = 0; index < total; index++) {
        if (tops[index] < scrollTop + viewportHeight && tops[index] + heights[index] > scrollTop) {
            visible.push(index);
        }
    }
    if (visible.length === 0) {
        return [];
    }

    const first: number = Math.max(0, visible[0] - overscan);
    const last: number = Math.min(total - 1, visible[visible.length - 1] + overscan);

    return Array.from({ length: last - first + 1 }, (_: unknown, offset: number): number => first + offset);
}

/**
 * Куда прокрутить после смены масштаба, чтобы на экране осталось то же место той же страницы.
 * Без этого увеличение уводило бы человека на несколько страниц вниз от того, что он читал.
 */
export function anchoredScrollTop(oldTop: number, oldHeight: number, oldScrollTop: number, newTop: number, newHeight: number): number {
    if (oldHeight <= 0) {
        return newTop;
    }
    const ratio: number = (oldScrollTop - oldTop) / oldHeight;

    return Math.max(0, newTop + ratio * newHeight);
}

/** Подпись масштаба для плашки в процентах: «83%», а не «83.47%». */
export function zoomPercentLabel(percent: number): string {
    return `${Math.round(percent)}%`;
}
