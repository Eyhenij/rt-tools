/** Ширины шапки шторки, по которым решается место заголовка. */
export interface IRtSheetTitleBox {
    /** Ширина ряда шапки. */
    readonly row: number;
    /** Ширина левой части — «×». */
    readonly start: number;
    /** Ширина правой части — значки и главная кнопка. */
    readonly end: number;
    /** Зазор между колонками ряда. */
    readonly gap: number;
    /** Ширина заголовка одной строкой, без обрезки. */
    readonly title: number;
}

/** Доля точки, которую дробные ширины браузера не считают нехваткой места. */
const ROUNDING_PX: number = 0.5;

/**
 * Ширина заголовка одной строкой — по самому тексту, а не по его колонке. Между кнопками колонка
 * заголовка тянется на всё место, и её ширина равна месту, а не тексту: по ней заголовок, ставший
 * короче, к центру бы не вернулся. Без мер текста браузера — ширина содержимого узла.
 */
function naturalWidth(node: HTMLElement | null): number {
    if (node === null) {
        return 0;
    }
    const range: Range = node.ownerDocument.createRange();
    range.selectNodeContents(node);

    return typeof range.getBoundingClientRect === 'function' ? range.getBoundingClientRect().width : node.scrollWidth;
}

/**
 * Заголовок не встаёт по центру шапки: место по центру между частями шапки — ряд без двух зазоров и
 * без двух больших частей — уже, чем заголовок одной строкой. Тогда он занимает всё место между
 * левой и правой частями.
 */
export function rtSheetTitleBetween(box: IRtSheetTitleBox): boolean {
    const centred: number = box.row - 2 * box.gap - 2 * Math.max(box.start, box.end);

    return box.title > centred + ROUNDING_PX;
}

/**
 * Место заголовка в шапке шторки: по центру шапки, если влазит, иначе между кнопками. Сетка сама не
 * знает, влезет ли заголовок, поэтому ширины частей шапки меряются и пересчитываются, когда любая
 * из них меняет размер.
 */
export class RtAsideHeaderTitle {
    #row: HTMLElement | null = null;
    #observer: ResizeObserver | null = null;
    readonly #onChange: (between: boolean) => void;

    constructor(onChange: (between: boolean) => void) {
        this.#onChange = onChange;
    }

    /** Следит за рядом шапки шторки; без ряда — отпускает прежний. */
    public attach(row: HTMLElement | null): void {
        if (row !== this.#row) {
            this.detach();
            this.#row = row;
            if (row !== null && typeof ResizeObserver !== 'undefined') {
                this.#observer = new ResizeObserver((): void => this.measure());
                this.#observer.observe(row);
                this.#parts(row).forEach((part: HTMLElement | null): void => {
                    if (part !== null) {
                        this.#observer?.observe(part);
                    }
                });
            }
        }
        this.measure();
    }

    public detach(): void {
        this.#observer?.disconnect();
        this.#observer = null;
        this.#row = null;
    }

    /** Меряет части шапки и сообщает место заголовка. */
    public measure(): void {
        const row: HTMLElement | null = this.#row;
        if (row === null) {
            this.#onChange(false);
            return;
        }
        const parts: [HTMLElement | null, HTMLElement | null, HTMLElement | null] = this.#parts(row);
        const view: Window | null = row.ownerDocument.defaultView;
        this.#onChange(
            rtSheetTitleBetween({
                row: row.getBoundingClientRect().width,
                start: parts[0]?.getBoundingClientRect().width ?? 0,
                end: parts[1]?.getBoundingClientRect().width ?? 0,
                gap: Number.parseFloat(view?.getComputedStyle(row).columnGap ?? '') || 0,
                title: naturalWidth(parts[2]),
            })
        );
    }

    /** Левая часть, правая часть и текст заголовка одной строкой. */
    #parts(row: HTMLElement): [HTMLElement | null, HTMLElement | null, HTMLElement | null] {
        return [
            row.querySelector<HTMLElement>(':scope > .rt-aside-header__start'),
            row.querySelector<HTMLElement>(':scope > .rt-aside-header__actions'),
            row.querySelector<HTMLElement>('.rt-aside-header__title > rt-skeleton-wrapper'),
        ];
    }
}
