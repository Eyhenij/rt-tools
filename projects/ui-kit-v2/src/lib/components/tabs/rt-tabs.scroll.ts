import { ElementRef } from '@angular/core';

import { IRtTabs } from './rt-tabs.model';
import { RT_TABS_REDUCED_MOTION, rtTabsDurationMs } from './rt-tabs.motion';

/** Кривая, которой читается непонятное значение. */
const EASE_OUT: readonly [number, number, number, number] = [0, 0, 0.58, 1];

/** Именованные кривые CSS в виде опорных точек `cubic-bezier`. */
const NAMED_EASINGS: ReadonlyMap<string, readonly [number, number, number, number]> = new Map<
    string,
    readonly [number, number, number, number]
>([
    ['linear', [0, 0, 1, 1]],
    ['ease', [0.25, 0.1, 0.25, 1]],
    ['ease-in', [0.42, 0, 1, 1]],
    ['ease-out', EASE_OUT],
    ['ease-in-out', [0.42, 0, 0.58, 1]],
]);

/** Шаг прокрутки полосы за один тик удержания стрелки (px). */
const HOLD_STEP: number = 12;

/** Доля видимой ширины полосы, на которую сдвигает одно нажатие на стрелку. */
const STEP_SHARE: Readonly<Record<IRtTabs.ScrollStep, number>> = { page: 1, third: 1 / 3 };

/** Точка кубической кривой Безье с концами 0 и 1 по одной оси. */
function bezierAt(t: number, p1: number, p2: number): number {
    const u: number = 1 - t;

    return 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t;
}

/**
 * Кривая CSS как функция доли времени в долю пути: `linear`, `ease`, `ease-in`, `ease-out`,
 * `ease-in-out` и `cubic-bezier(…)`. Непонятное значение читается как `ease-out`.
 */
export function rtTabsEasing(value: string): (progress: number) => number {
    const text: string = value.trim();
    const match: RegExpMatchArray | null = /^cubic-bezier\(([^)]*)\)$/.exec(text);
    const parsed: number[] = match ? match[1].split(',').map((part: string): number => parseFloat(part)) : [];
    const valid: boolean = parsed.length === 4 && parsed.every((point: number): boolean => Number.isFinite(point));
    const points: readonly number[] = valid ? parsed : (NAMED_EASINGS.get(text) ?? EASE_OUT);
    const [x1, y1, x2, y2]: readonly number[] = points;

    return (progress: number): number => {
        if (progress <= 0 || progress >= 1) {
            return Math.min(1, Math.max(0, progress));
        }

        // Доля времени — координата x на кривой: её параметр ищется делением отрезка пополам.
        let low: number = 0;
        let high: number = 1;
        for (let step: number = 0; step < 30; step++) {
            const mid: number = (low + high) / 2;
            if (bezierAt(mid, x1, x2) < progress) {
                low = mid;
            } else {
                high = mid;
            }
        }

        return bezierAt((low + high) / 2, y1, y2);
    };
}

/** Куда прокрутить полосу нажатием на стрелку: на долю видимой ширины от `from`, не дальше края. */
export function rtTabsPageTarget(list: HTMLElement, from: number, back: boolean, step: IRtTabs.ScrollStep): number {
    const max: number = Math.max(0, list.scrollWidth - list.clientWidth);
    const shift: number = list.clientWidth * STEP_SHARE[step];

    return Math.min(max, Math.max(0, from + (back ? -shift : shift)));
}

/** Куда прокрутить полосу, чтобы вкладка встала целиком; `null` — она уже видна целиком. */
export function rtTabsIntoViewTarget(list: HTMLElement, tab: HTMLElement): number | null {
    if (tab.offsetLeft < list.scrollLeft) {
        return tab.offsetLeft;
    }

    if (tab.offsetLeft + tab.offsetWidth > list.scrollLeft + list.clientWidth) {
        return tab.offsetLeft + tab.offsetWidth - list.clientWidth;
    }

    return null;
}

/**
 * Плавная прокрутка полосы вкладок. Двигается сама прокрутка, а не сдвиг содержимого: колесо,
 * касание и полоса прокрутки остаются у браузера. Длительность и кривая — свойства хоста
 * `--rt-tabs-scroll-duration` и `--rt-tabs-scroll-easing`; ноль или `prefers-reduced-motion` —
 * прокрутка сразу.
 */
export class RtTabsScroller {
    readonly #win: Window | null;

    readonly #host: HTMLElement;

    readonly #list: () => ElementRef<HTMLElement> | undefined;

    #frame: number | null = null;

    /** Куда едет идущая прокрутка: следующий шаг считается от неё, а не от середины пути. */
    #target: number | null = null;

    constructor(win: Window | null, host: HTMLElement, list: () => ElementRef<HTMLElement> | undefined) {
        this.#win = win;
        this.#host = host;
        this.#list = list;
    }

    /** Положение, от которого считать следующий шаг: цель идущей прокрутки или текущее. */
    public from(): number {
        return this.#target ?? this.#list()?.nativeElement.scrollLeft ?? 0;
    }

    /** Прокручивает полосу к `left`; новая прокрутка заменяет идущую. */
    public to(left: number): void {
        const list: HTMLElement | undefined = this.#list()?.nativeElement;
        const win: Window | null = this.#win;
        this.stop();

        if (!list || !win) {
            return;
        }

        const style: CSSStyleDeclaration = win.getComputedStyle(this.#host);
        const duration: number = win.matchMedia?.(RT_TABS_REDUCED_MOTION).matches
            ? 0
            : rtTabsDurationMs(style.getPropertyValue('--rt-tabs-scroll-duration'));
        const start: number = list.scrollLeft;

        if (duration <= 0 || start === left) {
            list.scrollLeft = left;
            return;
        }

        const ease: (progress: number) => number = rtTabsEasing(style.getPropertyValue('--rt-tabs-scroll-easing'));
        const startedAt: number = win.performance.now();
        this.#target = left;

        const tick: (now: number) => void = (now: number): void => {
            const progress: number = Math.min(1, (now - startedAt) / duration);
            list.scrollLeft = start + (left - start) * ease(progress);
            this.#frame = progress < 1 ? win.requestAnimationFrame(tick) : null;
            if (this.#frame === null) {
                this.#target = null;
            }
        };
        this.#frame = win.requestAnimationFrame(tick);
    }

    /**
     * Тик прокрутки удержанием стрелки: сдвиг на несколько точек без плавности, остановив идущую.
     * Отвечает, осталось ли куда ехать.
     */
    public nudge(back: boolean): boolean {
        this.stop();
        const list: HTMLElement | undefined = this.#list()?.nativeElement;

        if (!list) {
            return false;
        }

        const remaining: number = back ? list.scrollLeft : list.scrollWidth - list.scrollLeft - list.clientWidth;

        if (remaining > 0) {
            list.scrollLeft += (back ? -1 : 1) * Math.min(HOLD_STEP, remaining);
        }

        return remaining - HOLD_STEP > 0;
    }

    /** Останавливает идущую прокрутку там, где она есть. */
    public stop(): void {
        if (this.#frame !== null) {
            this.#win?.cancelAnimationFrame(this.#frame);
        }
        this.#frame = null;
        this.#target = null;
    }
}
