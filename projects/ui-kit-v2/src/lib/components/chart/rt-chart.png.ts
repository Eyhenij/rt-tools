import { IRtChartSize } from './rt-chart.scene';

/** Во сколько раз PNG плотнее экрана: снимок графика читается и на печати. */
const PNG_PIXEL_RATIO: number = 2;

/** Свойства фигуры и подписи, которые SVG вне страницы не возьмёт из токенов. */
const INLINED: readonly string[] = [
    'fill',
    'stroke',
    'stroke-width',
    'stroke-dasharray',
    'opacity',
    'font-family',
    'font-size',
    'font-weight',
];

/** Узлы графика, из которых собирается PNG. */
export interface IRtChartPngParts {
    readonly host: HTMLElement;
    readonly svg: SVGSVGElement;
    readonly legend: readonly HTMLElement[];
    /** Размер графика целиком, с легендой: в точках экрана. */
    readonly width: number;
    readonly height: number;
    /** Размер поля без легенды. */
    readonly plot: IRtChartSize;
    readonly background: string;
}

/** Копия SVG, где каждая фигура несёт готовые цвета: картинка вне страницы токенов не знает. */
function standaloneSvg(win: Window & typeof globalThis, svg: SVGSVGElement): string {
    const copy: SVGSVGElement = svg.cloneNode(true) as SVGSVGElement;
    const source: Element[] = Array.from(svg.querySelectorAll('path, text'));
    const target: Element[] = Array.from(copy.querySelectorAll('path, text'));

    source.forEach((node: Element, index: number): void => {
        const style: CSSStyleDeclaration = win.getComputedStyle(node);

        INLINED.forEach((name: string): void => target[index].setAttribute(name, style.getPropertyValue(name)));
    });
    copy.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

    return new win.XMLSerializer().serializeToString(copy);
}

function loadImage(doc: Document, svg: string): Promise<HTMLImageElement | null> {
    return new Promise((resolve: (image: HTMLImageElement | null) => void): void => {
        const image: HTMLImageElement = doc.createElement('img');

        image.onload = (): void => resolve(image);
        image.onerror = (): void => resolve(null);
        image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    });
}

/**
 * Пункт легенды или шкала плотности на холсте. Узел с текстом рисуется подписью в шрифте страницы,
 * пустой узел — плашкой своего цвета, плотности и скругления.
 */
function drawLegendItem(win: Window, context: CanvasRenderingContext2D, item: HTMLElement, origin: DOMRect): void {
    const leaves: Element[] = Array.from(item.querySelectorAll('*')).filter((node: Element): boolean => !node.firstElementChild);

    leaves.forEach((node: Element): void => {
        const box: DOMRect = node.getBoundingClientRect();
        const style: CSSStyleDeclaration = win.getComputedStyle(node);
        const text: string = node.textContent?.trim() ?? '';

        context.globalAlpha = Number(style.opacity) || 1;

        if (text) {
            context.fillStyle = style.color;
            context.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
            context.textBaseline = 'middle';
            context.fillText(text, box.left - origin.left, box.top - origin.top + box.height / 2);
        } else {
            context.fillStyle = style.backgroundColor;
            context.beginPath();
            context.roundRect(
                box.left - origin.left,
                box.top - origin.top,
                box.width,
                box.height,
                Number.parseFloat(style.borderTopLeftRadius) || 0
            );
            context.fill();
        }
    });
    context.globalAlpha = 1;
}

/**
 * Собирает PNG графика с подложкой его темы: поле из SVG и легенду под ним.
 *
 * Картинка рисуется на холст двойной плотности поверх заливки подложкой. Без заливки PNG прозрачен,
 * и тёмный график на белом фоне просмотрщика теряет подписи.
 */
export async function rtChartToPng(win: Window & typeof globalThis, parts: IRtChartPngParts): Promise<string | null> {
    const doc: Document = win.document;
    const origin: DOMRect = parts.host.getBoundingClientRect();
    const place: DOMRect = parts.svg.getBoundingClientRect();
    const image: HTMLImageElement | null = await loadImage(doc, standaloneSvg(win, parts.svg));
    const canvas: HTMLCanvasElement = doc.createElement('canvas');
    const context: CanvasRenderingContext2D | null = canvas.getContext('2d');

    if (!image || !context || parts.width <= 0) {
        return null;
    }

    canvas.width = Math.round(parts.width * PNG_PIXEL_RATIO);
    canvas.height = Math.round(parts.height * PNG_PIXEL_RATIO);
    context.scale(PNG_PIXEL_RATIO, PNG_PIXEL_RATIO);
    context.fillStyle = parts.background;
    context.fillRect(0, 0, parts.width, parts.height);
    context.drawImage(image, place.left - origin.left, place.top - origin.top, parts.plot.width, parts.plot.height);
    parts.legend.forEach((item: HTMLElement): void => drawLegendItem(win, context, item, origin));

    return canvas.toDataURL('image/png');
}
