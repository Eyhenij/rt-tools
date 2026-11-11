import { afterRenderEffect, computed, inject, signal, DestroyRef, ElementRef, Signal, WritableSignal } from '@angular/core';

import { RtTabDirective } from './rt-tab.directive';
import { IRtTabs } from './rt-tabs.model';
import { rtTabsFitRow } from './rt-tabs.more';

/** Сколько вкладок по умолчанию стоит в ряду режима «Ещё». */
export const RT_TABS_MORE_LIMIT: number = 10;

const EMPTY_LAYOUT: IRtTabs.MoreLayout = { row: [], more: [] };

/** Модификатор полосы на время замера: растянутые вкладки сжимаются до своего содержимого. */
export const RT_TABS_MEASURE_CLASS: string = 'rt-tabs__tab-list--measure';

function sameLayout(a: IRtTabs.MoreLayout, b: IRtTabs.MoreLayout): boolean {
    return a.row.join() === b.row.join() && a.more.join() === b.more.join();
}

/**
 * Ряд вкладок в режиме «Ещё»: замеряет полосу, отдаёт решение чистой функции и держит раскладку.
 * Вкладка из меню остаётся в разметке, только скрытая: её ширину ряд читает при каждом пересчёте.
 */
export class RtTabsMoreRow {
    readonly #win: Window | null;

    readonly #list: Signal<ElementRef<HTMLElement> | undefined>;

    readonly #deps: IRtTabs.MoreRowDeps<RtTabDirective>;

    readonly #layout: WritableSignal<IRtTabs.MoreLayout> = signal<IRtTabs.MoreLayout>(EMPTY_LAYOUT, { equal: sameLayout });

    #watch: ResizeObserver | null = null;

    /** Вкладки меню. */
    public readonly ids: Signal<ReadonlySet<IRtTabs.Id>> = computed(
        (): ReadonlySet<IRtTabs.Id> => new Set<IRtTabs.Id>(this.#layout().more)
    );

    /** Место вкладки в ряду: порядок показа расходится с порядком объявления. */
    public readonly order: Signal<ReadonlyMap<IRtTabs.Id, number>> = computed(
        (): ReadonlyMap<IRtTabs.Id, number> =>
            new Map<IRtTabs.Id, number>(this.#layout().row.map((id: IRtTabs.Id, index: number): [IRtTabs.Id, number] => [id, index]))
    );

    /** Вкладки меню в порядке объявления. */
    public readonly moreTabs: Signal<readonly RtTabDirective[]> = computed((): readonly RtTabDirective[] =>
        this.#deps.visible().filter((tab: RtTabDirective): boolean => this.ids().has(tab.id()))
    );

    /** Вкладки ряда в порядке показа: по ним ходят клавиши, и за ними едет полоса выбранной. */
    public readonly rowTabs: Signal<readonly RtTabDirective[]> = computed((): readonly RtTabDirective[] => {
        const order: ReadonlyMap<IRtTabs.Id, number> = this.order();
        return this.#deps
            .visible()
            .filter((tab: RtTabDirective): boolean => !this.ids().has(tab.id()))
            .sort((a: RtTabDirective, b: RtTabDirective): number => (order.get(a.id()) ?? 0) - (order.get(b.id()) ?? 0));
    });

    constructor(win: Window | null, list: Signal<ElementRef<HTMLElement> | undefined>, deps: IRtTabs.MoreRowDeps<RtTabDirective>) {
        this.#win = win;
        this.#list = list;
        this.#deps = deps;

        // Наблюдение ставится заново только на новый набор вкладок: каждое новое наблюдение даёт
        // стартовый замер, а смена выбора и лимита пересчитывает ряд без него.
        afterRenderEffect((): void => {
            deps.visible();
            deps.enabled();
            this.#watchSizes();
        });

        afterRenderEffect((): void => {
            deps.visible();
            deps.selectedId();
            deps.enabled();
            deps.limit();
            this.#measure();
        });

        inject(DestroyRef).onDestroy((): void => this.#watch?.disconnect());
    }

    #watchSizes(): void {
        const list: HTMLElement | undefined = this.#list()?.nativeElement;
        this.#watch?.disconnect();
        this.#watch = null;
        if (!this.#deps.enabled() || !list || !this.#win || !('ResizeObserver' in this.#win)) {
            return;
        }
        const watch: ResizeObserver = new ResizeObserver((): void => this.#measure());
        watch.observe(list);
        Array.from(list.children).forEach((node: Element): void => watch.observe(node));
        this.#watch = watch;
    }

    #measure(): void {
        const list: HTMLElement | undefined = this.#list()?.nativeElement;
        if (!this.#deps.enabled() || !list || !this.#win) {
            this.#layout.set(EMPTY_LAYOUT);
            return;
        }
        const style: CSSStyleDeclaration = this.#win.getComputedStyle(list);
        const padding: number = (parseFloat(style.paddingInlineStart) || 0) + (parseFloat(style.paddingInlineEnd) || 0);
        const available: number = list.getBoundingClientRect().width - padding;
        if (available <= 0) {
            return;
        }
        // Растянутая вкладка меряется по содержимому: с растяжкой ряд всегда заполнен целиком, и
        // ушедшая в меню вкладка не вернулась бы в него на широком окне. Класс снимается до отрисовки.
        list.classList.add(RT_TABS_MEASURE_CLASS);
        const slots: IRtTabs.MoreSlot[] = this.#deps.visible().map((tab: RtTabDirective): IRtTabs.MoreSlot => ({
            id: tab.id(),
            pinned: tab.pinned(),
            width: list.querySelector<HTMLElement>(`[data-tabitem="${tab.id()}"]`)?.getBoundingClientRect().width ?? 0,
        }));
        list.classList.remove(RT_TABS_MEASURE_CLASS);
        this.#layout.set(
            rtTabsFitRow({
                slots,
                available,
                selectedId: this.#deps.selectedId(),
                limit: this.#deps.limit(),
                moreWidth: list.querySelector<HTMLElement>('.rt-tabs-more')?.getBoundingClientRect().width ?? 0,
            })
        );
    }
}
