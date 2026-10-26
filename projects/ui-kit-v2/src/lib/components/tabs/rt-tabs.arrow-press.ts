import { IRtTabs } from './rt-tabs.model';
import { rtTabsPageTarget, RtTabsScroller } from './rt-tabs.scroll';

/** Интервал тика прокрутки при зажатой стрелке (мс). */
const SCROLL_TICK_MS: number = 15;

/** Сколько держать стрелку, чтобы нажатие стало прокруткой по удержанию, а не шагом (мс). */
const HOLD_DELAY_MS: number = 300;

export type TRtTabsScrollDirection = 'before' | 'after';

/**
 * Нажатие на стрелку прокрутки полосы. Отпущенная до `HOLD_DELAY_MS` стрелка сдвигает полосу на
 * шаг `scrollStep`, удержанная дольше — прокручивает её непрерывно, пока не отпустят.
 */
export class RtTabsArrowPress {
    readonly #win: Window | null;

    readonly #scroller: RtTabsScroller;

    readonly #list: () => HTMLElement | undefined;

    readonly #step: () => IRtTabs.ScrollStep;

    /** Полоса сдвинулась: видимость стрелок пересчитывается. */
    readonly #moved: () => void;

    /** Хэндл интервала прокрутки по удержанию стрелки. */
    #scrollIntervalId: number | null = null;

    /** Хэндл ожидания, после которого нажатие на стрелку становится удержанием. */
    #holdTimeoutId: number | null = null;

    /** Стрелка, нажатая и ещё не отпущенная. */
    #pressed: TRtTabsScrollDirection | null = null;

    constructor(
        win: Window | null,
        scroller: RtTabsScroller,
        list: () => HTMLElement | undefined,
        step: () => IRtTabs.ScrollStep,
        moved: () => void
    ) {
        this.#win = win;
        this.#scroller = scroller;
        this.#list = list;
        this.#step = step;
        this.#moved = moved;
    }

    /** Стрелку нажали: через `HOLD_DELAY_MS` нажатие становится удержанием. */
    public down(direction: TRtTabsScrollDirection): void {
        if (this.#pressed !== null || !this.#win) {
            return;
        }

        this.#pressed = direction;
        this.#holdTimeoutId = this.#win.setTimeout((): void => {
            this.#holdTimeoutId = null;
            this.#scrollIntervalId =
                this.#win?.setInterval((): void => {
                    if (!this.#scroller.nudge(direction === 'before')) {
                        this.stop();
                    }
                    this.#moved();
                }, SCROLL_TICK_MS) ?? null;
        }, HOLD_DELAY_MS);
    }

    /** Стрелку отпустили: короткое нажатие — шаг `scrollStep`, после удержания — только стоп. */
    public up(): void {
        const direction: TRtTabsScrollDirection | null = this.#pressed;
        const shortPress: boolean = this.#holdTimeoutId !== null;
        const list: HTMLElement | undefined = this.#list();

        this.stop();

        if (direction !== null && shortPress && list) {
            this.#scroller.to(rtTabsPageTarget(list, this.#scroller.from(), direction === 'before', this.#step()));
            // Сразу — для прокрутки без движения; плавную ведут события прокрутки самой полосы.
            this.#moved();
        }
    }

    /** Снимает ожидание и интервал: указатель ушёл со стрелки или компонент разрушен с зажатой. */
    public stop(): void {
        this.#pressed = null;
        if (this.#win && this.#holdTimeoutId !== null) {
            this.#win.clearTimeout(this.#holdTimeoutId);
            this.#holdTimeoutId = null;
        }
        if (this.#win && this.#scrollIntervalId !== null) {
            this.#win.clearInterval(this.#scrollIntervalId);
            this.#scrollIntervalId = null;
        }
    }
}
