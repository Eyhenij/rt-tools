import { RtTabsFollow } from './rt-tabs.follow';
import { IRtTabs } from './rt-tabs.model';
import { rtTabsRestShown, RtTabsScroller, rtTabsTabTarget } from './rt-tabs.scroll';

/** Что показу вкладки нужно от полосы: чтение состояния и приёмник видимости стрелок. */
export interface IRtTabsRevealDeps {
    readonly scroller: RtTabsScroller;
    readonly follow: RtTabsFollow;
    readonly list: () => HTMLElement | undefined;
    readonly selectedId: () => IRtTabs.Id | null;
    readonly moreMode: () => boolean;
    readonly horizontal: () => boolean;
    readonly overlayArrows: () => boolean;
    readonly shown: (shown: IRtTabs.RestShown) => void;
}

/** Показ выбранной вкладки в полосе: прокрутка к ней и видимость стрелок прокрутки по краям. */
export class RtTabsReveal {
    readonly #deps: IRtTabsRevealDeps;

    /** Вкладка, к которой полоса прокручена последней: второй прокрутки к ней не нужно. */
    #scrolledId: IRtTabs.Id | null = null;

    constructor(deps: IRtTabsRevealDeps) {
        this.#deps = deps;
    }

    /** Видны ли стрелки: только у горизонтальной полосы вне режима «Ещё». */
    public updateRest(): void {
        const list: HTMLElement | undefined = this.#deps.list();
        const shown: IRtTabs.RestShown =
            list && this.#deps.horizontal() && !this.#deps.moreMode() ? rtTabsRestShown(list) : { before: false, after: false };

        this.#deps.shown(shown);
    }

    /** `again` — вкладки сменили размер: та же вкладка встаёт на место ещё раз. */
    public toSelected(again: boolean = false): void {
        const id: IRtTabs.Id | null = this.#deps.selectedId();

        if (id !== null && (again || id !== this.#scrolledId)) {
            this.#deps.follow.follow();
            this.intoView(id);
        }
    }

    /**
     * Ставит вкладку в полосу целиком. Стрелки поверх полосы закрывают её края, поэтому вкладка
     * отступает от края на ширину стрелки. Первая прокрутка — сразу: открытая страница не едет.
     */
    public intoView(id: IRtTabs.Id): void {
        const list: HTMLElement | undefined = this.#deps.list();
        const target: number | null | undefined =
            list && !this.#deps.moreMode() ? rtTabsTabTarget(list, id, this.#deps.overlayArrows()) : undefined;

        if (target === undefined) {
            return;
        }

        const first: boolean = this.#scrolledId === null;
        this.#scrolledId = id;

        this.#deps.scroller.place(target, first);

        // Сразу — для прокрутки без движения; плавную ведут события прокрутки самой полосы.
        this.updateRest();
    }
}
