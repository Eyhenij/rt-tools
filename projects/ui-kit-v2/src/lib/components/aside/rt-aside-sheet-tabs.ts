/** Вкладка ряда `rt-tabs`: обёртка вкладки с её номером. */
const TAB_ITEM_SELECTOR: string = '[data-tabitem]';

/** Выбранная вкладка ряда. */
const SELECTED_SELECTOR: string = '[role="tab"][aria-selected="true"]';

/** Столько до края ряда прокрутка считается дошедшей до него. */
const EDGE_PX: number = 1;

/**
 * Ряд вкладок панели-шторки — карусель, как ряд чипов периода в шторке: вкладки стоят в одну
 * строку, ряд прокручивается вбок по кругу, выбранная вкладка встаёт по центру. Вид — одну строку и
 * затенение краёв на 32 — дают стили панели.
 *
 * Чипы периода ходят по кругу тремя повторами ряда. Вкладки повторить нельзя — у каждой своя роль
 * и своя связь с содержимым, — поэтому по кругу ходит порядок: выбранная вкладка ставится в середину
 * ряда, а остальные — по кругу от неё; ряд, дошедший до края, переставляет крайнюю вкладку на другой
 * край и сдвигает прокрутку на её ширину, и вид не меняется.
 */
export class RtAsideSheetTabs {
    #list: HTMLElement | null = null;
    #observer: MutationObserver | null = null;
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
        if (list === null) {
            return;
        }
        list.removeEventListener('scroll', this.#onScroll);
        this.#items(list).forEach((item: HTMLElement): void => {
            item.style.removeProperty('order');
        });
    }

    /** Выбранная вкладка — в середину ряда по порядку и по центру по прокрутке. */
    public center(): void {
        const list: HTMLElement | null = this.#list;
        if (list === null) {
            return;
        }
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

    #items(list: HTMLElement): HTMLElement[] {
        return Array.from(list.querySelectorAll<HTMLElement>(TAB_ITEM_SELECTOR)).filter(
            (item: HTMLElement): boolean => item.parentElement === list
        );
    }
}
