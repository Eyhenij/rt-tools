/**
 * Пространство имён SVG: корень файла значка и символ спрайта принадлежат ему. Тип — сама строка:
 * по ней `createElementNS` отдаёт элемент SVG, а не общий `Element`.
 */
type TSvgNamespace = 'http://www.w3.org/2000/svg';
export const SVG_NS: TSvgNamespace = 'http://www.w3.org/2000/svg';

/** Узлы, которым в рисунке значка нечего делать: они исполняют код или несут чужую разметку. */
const RT_ICON_FOREIGN_NODES: string = 'script, foreignObject, iframe, object, embed';

/** Атрибуты ссылки, по которым `javascript:` исполнился бы как код. */
const RT_ICON_LINK_ATTRIBUTES: readonly string[] = ['href', 'xlink:href'];

/**
 * Чистит разобранный рисунок значка на месте: убирает исполняемые и чужие узлы, обработчики
 * событий `on*` и ссылки со схемой `javascript:`. Остаются фигуры, группы, градиенты и их
 * атрибуты — всё, чем значок рисуется.
 */
export function rtIconCleanDrawing(root: Element): void {
    root.querySelectorAll(RT_ICON_FOREIGN_NODES).forEach((node: Element): void => node.remove());
    for (const element of [root, ...Array.from(root.querySelectorAll('*'))]) {
        for (const attribute of Array.from(element.attributes)) {
            const name: string = attribute.name.toLowerCase();
            const scripted: boolean = RT_ICON_LINK_ATTRIBUTES.includes(name) && /^\s*javascript:/i.test(attribute.value);
            if (name.startsWith('on') || scripted) {
                element.removeAttribute(attribute.name);
            }
        }
    }
}
