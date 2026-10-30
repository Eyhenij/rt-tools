/**
 * Следит за размерами вкладок полосы. Вкладки стали шире или уже — например, у них появились
 * счётчики после загрузки данных — и полоса снова встаёт к выбранной вкладке. Человек сам прокрутил
 * полосу колесом, касанием или стрелкой — полоса больше не следит, пока не выберут вкладку.
 */
export class RtTabsFollow {
    /** Размеры вкладок изменились, а человек полосу не трогал. */
    readonly #resized: () => void;

    #observer: ResizeObserver | null = null;

    #list: HTMLElement | null = null;

    /** Полосу прокрутили рукой: смена размеров её больше не двигает. */
    #manual: boolean = false;

    readonly #onManual: () => void = (): void => this.manual();

    constructor(resized: () => void) {
        this.#resized = resized;
    }

    /** Наблюдает полосу и все её `count` вкладок заново: зовётся, когда сменился набор вкладок. */
    public watch(list: HTMLElement | undefined, count: number): void {
        // Окно без наблюдателя — серверная отрисовка и старые движки: полоса просто не следит.
        if (typeof ResizeObserver === 'undefined' || !list || !count) {
            return;
        }

        if (this.#list !== list) {
            this.#unlisten();
            list.addEventListener('wheel', this.#onManual, { passive: true });
            list.addEventListener('touchstart', this.#onManual, { passive: true });
            this.#list = list;
        }

        this.#observer ??= new ResizeObserver((): void => {
            if (!this.#manual) {
                this.#resized();
            }
        });
        const observer: ResizeObserver = this.#observer;
        observer.disconnect();
        observer.observe(list);
        list.querySelectorAll<HTMLElement>('[data-tabitem]').forEach((item: HTMLElement): void => observer.observe(item));
    }

    public manual(): void {
        this.#manual = true;
    }

    /** Выбрали вкладку: полоса снова следит за ней. */
    public follow(): void {
        this.#manual = false;
    }

    public stop(): void {
        this.#observer?.disconnect();
        this.#unlisten();
    }

    #unlisten(): void {
        this.#list?.removeEventListener('wheel', this.#onManual);
        this.#list?.removeEventListener('touchstart', this.#onManual);
        this.#list = null;
    }
}
