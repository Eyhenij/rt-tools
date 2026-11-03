/** С какой стороны под закреплённой колонкой лежит прокрученное содержимое. */
export interface IRtTablePinnedEdges {
    /** Прокручено от начала: под колонкой, закреплённой у начала, есть скрытые колонки. */
    start: boolean;
    /** Прокручено не до конца: под колонкой, закреплённой у конца, есть скрытые колонки. */
    end: boolean;
}

/** Доля пикселя, которую дробная прокрутка оставляет на краю: меньше неё край считается достигнутым. */
const EDGE_TOLERANCE: number = 1;

/**
 * Скрытые края по положению прокрутки. При письме справа налево браузер отдаёт отрицательный
 * сдвиг, поэтому берётся его величина: «начало» — сторона, откуда прокрутка началась.
 */
export function hiddenEdges(scrollLeft: number, scrollWidth: number, clientWidth: number): IRtTablePinnedEdges {
    const offset: number = Math.abs(scrollLeft);

    return {
        start: offset > EDGE_TOLERANCE,
        end: offset + clientWidth < scrollWidth - EDGE_TOLERANCE,
    };
}

/**
 * Ближайший предок, который прокручивается вбок. Таблица сама не прокручивается: её прокручивает
 * контейнер потребителя, и тень у края зависит от его положения.
 */
export function horizontalScrollParentOf(element: Element, view: Window): HTMLElement | null {
    let node: HTMLElement | null = element.parentElement;

    while (node) {
        const overflowX: string = view.getComputedStyle(node).overflowX;
        if (overflowX === 'auto' || overflowX === 'scroll') {
            return node;
        }
        node = node.parentElement;
    }

    return null;
}

/**
 * Следит за прокруткой контейнера таблицы и за его размерами: тень у края нужна, пока под
 * закреплённой колонкой есть скрытое содержимое, а оно меняется и при прокрутке, и при смене
 * ширины окна или набора колонок.
 */
export class RtTablePinnedEdges {
    readonly #changed: (edges: IRtTablePinnedEdges) => void;

    #container: HTMLElement | null = null;

    #observer: ResizeObserver | null = null;

    /** Ширины контейнера меряются при запуске и при смене размеров, а не на каждой прокрутке. */
    #scrollWidth: number = 0;

    #clientWidth: number = 0;

    readonly #onScroll: () => void = (): void => this.#report();

    readonly #onResize: () => void = (): void => {
        this.#measure();
        this.#report();
    };

    constructor(changed: (edges: IRtTablePinnedEdges) => void) {
        this.#changed = changed;
    }

    /** Находит контейнер прокрутки над `table` и сообщает скрытые края сразу и после каждой перемены. */
    public watch(table: HTMLElement, view: Window): void {
        this.stop();

        const container: HTMLElement | null = horizontalScrollParentOf(table, view);
        if (!container) {
            return;
        }

        this.#container = container;
        // Окно без наблюдателя — старые движки: ширины меряются на каждой прокрутке, как раньше.
        const resizable: boolean = typeof ResizeObserver !== 'undefined';
        container.addEventListener('scroll', resizable ? this.#onScroll : this.#onResize, { passive: true });
        if (resizable) {
            this.#observer = new ResizeObserver(this.#onResize);
            this.#observer.observe(container);
            this.#observer.observe(table);
        }

        this.#onResize();
    }

    public stop(): void {
        this.#container?.removeEventListener('scroll', this.#onScroll);
        this.#container?.removeEventListener('scroll', this.#onResize);
        this.#observer?.disconnect();
        this.#container = null;
        this.#observer = null;
    }

    #measure(): void {
        const container: HTMLElement | null = this.#container;
        if (container) {
            this.#scrollWidth = container.scrollWidth;
            this.#clientWidth = container.clientWidth;
        }
    }

    #report(): void {
        const container: HTMLElement | null = this.#container;
        if (container) {
            this.#changed(hiddenEdges(container.scrollLeft, this.#scrollWidth, this.#clientWidth));
        }
    }
}
