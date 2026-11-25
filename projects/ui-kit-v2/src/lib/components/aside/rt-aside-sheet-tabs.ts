/** Вкладка ряда `rt-tabs`: обёртка вкладки с её номером. */
const TAB_ITEM_SELECTOR: string = '[data-tabitem]';

/** Выбранная вкладка ряда. */
const SELECTED_SELECTOR: string = '[role="tab"][aria-selected="true"]';

/** Столько до края ряда прокрутка считается дошедшей до него. */
const EDGE_PX: number = 1;

/** Ряд не влазит в шторку: стили панели затеняют его края. */
const RT_ASIDE_TABS_OVERFLOW_CLASS: string = 'rt-aside__tabs--overflow';

/**
 * Ряд вкладок панели-шторки — карусель, как ряд чипов периода в шторке, когда вкладки не влазят:
 * ряд прокручивается вбок по кругу, выбранная вкладка встаёт по центру, края затенены на 32. Ряд,
 * который влазит, стоит в порядке разметки и без затенения. Одну строку дают стили панели.
 *
 * Чипы периода ходят по кругу тремя повторами ряда. Вкладки повторить нельзя — у каждой своя роль
 * и своя связь с содержимым, — поэтому по кругу ходит порядок: выбранная вкладка ставится в середину
 * ряда, а остальные — по кругу от неё; ряд, дошедший до края, переставляет крайнюю вкладку на другой
 * край и сдвигает прокрутку на её ширину, и вид не меняется.
 */
export class RtAsideSheetTabs {
    #list: HTMLElement | null = null;
    #observer: MutationObserver | null = null;
    #resizeObserver: ResizeObserver | null = null;
    readonly #onScroll: () => void = (): void => this.#wrap();

    /** Ведёт ряд по кругу; другой ряд — бросает прежний. Без ряда — отпускает. */
    public attach(list: HTMLElement | null): void {
        if (list === this.#list) {
            return;
        }
        this.detach();
        if (list === null) {
            return;
        }
        this.#list = list;
        list.addEventListener('scroll', this.#onScroll);
        const view: (Window & typeof globalThis) | null = list.ownerDocument.defaultView;
        if (view !== null && 'MutationObserver' in view) {
            this.#observer = new view.MutationObserver((): void => this.center());
            this.#observer.observe(list, { subtree: true, attributes: true, attributeFilter: ['aria-selected'] });
        }
        // Шторка сменила ширину — ряд мог начать или перестать влезать.
        if (typeof ResizeObserver !== 'undefined') {
            this.#resizeObserver = new ResizeObserver((): void => this.center());
            this.#resizeObserver.observe(list);
        }
        this.center();
        // Подписи вкладок меняют ширину, когда догружается шрифт: ряд, отцентрованный по шрифту замены,
        // уводил выбранную вкладку на десяток точек вбок. После загрузки шрифтов ряд центруется снова.
        const doc: Document = list.ownerDocument;
        if ('fonts' in doc) {
            void doc.fonts.ready.then((): void => {
                if (this.#list === list) {
                    this.center();
                }
            });
        }
    }

    /** Отпускает ряд: вкладки возвращаются в порядок разметки. */
    public detach(): void {
        const list: HTMLElement | null = this.#list;
        this.#list = null;
        this.#observer?.disconnect();
        this.#observer = null;
        this.#resizeObserver?.disconnect();
        this.#resizeObserver = null;
        if (list === null) {
            return;
        }
        list.removeEventListener('scroll', this.#onScroll);
        this.#unwind(list);
    }

    /**
     * Выбранная вкладка — в середину ряда по порядку и по центру по прокрутке, когда ряд не влазит.
     * Ряд, который влазит, стоит в порядке разметки.
     */
    public center(): void {
        const list: HTMLElement | null = this.#list;
        if (list === null) {
            return;
        }
        // Ширина ряда от порядка не зависит: прежняя перестановка на неё не влияет.
        if (list.scrollWidth <= list.clientWidth) {
            this.#unwind(list);
            return;
        }
        list.classList.add(RT_ASIDE_TABS_OVERFLOW_CLASS);
        const items: HTMLElement[] = this.#items(list);
        const selected: number = items.findIndex((item: HTMLElement): boolean => item.querySelector(SELECTED_SELECTOR) !== null);
        if (items.length === 0 || selected < 0) {
            return;
        }
        const middle: number = Math.floor(items.length / 2);
        items.forEach((item: HTMLElement, at: number): void => {
            item.style.order = String((at - selected + middle + items.length) % items.length);
        });
        // Середина по прямоугольникам, а не по `offset*`: те округлены до пикселя, и выбранная вкладка
        // вставала на полпикселя мимо середины ряда.
        const chosen: DOMRect = items[selected].getBoundingClientRect();
        const row: DOMRect = list.getBoundingClientRect();
        list.scrollLeft += chosen.left + chosen.width / 2 - (row.left + list.clientLeft + list.clientWidth / 2);
    }

    /** Ряд дошёл до края: крайняя вкладка переходит на другой край, прокрутка сдвигается на её ширину. */
    #wrap(): void {
        const list: HTMLElement | null = this.#list;
        if (list === null || list.scrollWidth <= list.clientWidth) {
            return;
        }
        const items: HTMLElement[] = this.#items(list);
        if (list.scrollLeft <= EDGE_PX) {
            list.scrollLeft += this.#shift(items, 1)?.offsetWidth ?? 0;
            return;
        }
        if (list.scrollLeft + list.clientWidth >= list.scrollWidth - EDGE_PX) {
            list.scrollLeft -= this.#shift(items, -1)?.offsetWidth ?? 0;
        }
    }

    /** Сдвигает порядок по кругу и возвращает вкладку, перешедшую на другой край. */
    #shift(items: HTMLElement[], step: number): HTMLElement | undefined {
        const count: number = items.length;
        let moved: HTMLElement | undefined;
        items.forEach((item: HTMLElement): void => {
            const order: number = (Number(item.style.order) + step + count) % count;
            item.style.order = String(order);
            if ((step > 0 && order === 0) || (step < 0 && order === count - 1)) {
                moved = item;
            }
        });

        return moved;
    }

    /** Ряд без карусели: вкладки в порядке разметки, края не затенены. */
    #unwind(list: HTMLElement): void {
        list.classList.remove(RT_ASIDE_TABS_OVERFLOW_CLASS);
        this.#items(list).forEach((item: HTMLElement): void => {
            item.style.removeProperty('order');
        });
    }

    #items(list: HTMLElement): HTMLElement[] {
        return Array.from(list.querySelectorAll<HTMLElement>(TAB_ITEM_SELECTOR)).filter(
            (item: HTMLElement): boolean => item.parentElement === list
        );
    }
}
