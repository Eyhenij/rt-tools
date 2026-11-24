/**
 * Пространство имён SVG: корень файла значка и символ спрайта принадлежат ему. Тип — сама строка:
 * по ней `createElementNS` отдаёт элемент SVG, а не общий `Element`.
 */
type TSvgNamespace = 'http://www.w3.org/2000/svg';
export const SVG_NS: TSvgNamespace = 'http://www.w3.org/2000/svg';

/**
 * Узлы SVG, которым в рисунке значка нечего делать: они исполняют код, несут чужую разметку, тянут
 * картинку с чужого адреса, меняют атрибуты анимацией или стилем достают до всей страницы — стиль
 * рисунка в спрайте ложится на неё.
 */
const RT_ICON_FOREIGN_NODES: string = 'script, foreignObject, image, style, set, animate, animateMotion, animateTransform';

/** Код последнего знака, который разбор адреса выкидывает: пробел и управляющие знаки до него. */
const RT_ICON_ADDRESS_NOISE_LAST: number = 0x20;

/** Значение без пробелов и управляющих знаков: так его видит разбор адреса, и `java\tscript:` — схема. */
function rtIconAddressOf(value: string): string {
    return Array.from(value)
        .filter((sign: string): boolean => sign.charCodeAt(0) > RT_ICON_ADDRESS_NOISE_LAST)
        .join('');
}

/**
 * Чистит разобранный рисунок значка на месте: убирает исполняемые и чужие узлы, обработчики
 * событий `on*` и любые значения со схемой `javascript:`, в том числе разбитой пробелами. Остаются фигуры, группы, градиенты и их
 * атрибуты — всё, чем значок рисуется.
 */
export function rtIconCleanDrawing(root: Element): void {
    // HTML внутри `desc` и `title` разбирается в узлы HTML, а не SVG: `meta`, `link`, `base` и любой
    // другой такой узел уходит целиком, по пространству имён, а не по списку имён
    Array.from(root.querySelectorAll('*'))
        .filter((node: Element): boolean => node.namespaceURI !== SVG_NS)
        .forEach((node: Element): void => node.remove());
    root.querySelectorAll(RT_ICON_FOREIGN_NODES).forEach((node: Element): void => node.remove());
    for (const element of [root, ...Array.from(root.querySelectorAll('*'))]) {
        for (const attribute of Array.from(element.attributes)) {
            const name: string = attribute.name.toLowerCase();
            const scripted: boolean = /^javascript:/i.test(rtIconAddressOf(attribute.value));
            if (name.startsWith('on') || scripted) {
                element.removeAttribute(attribute.name);
            }
        }
    }
}
