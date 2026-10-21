import { BreakpointObserver, BreakpointState, Breakpoints } from '@angular/cdk/layout';
import { Injectable, Signal, WritableSignal, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { Observable, map } from 'rxjs';

import { WINDOW } from '@rt-tools/core';

/** Порог узкого вида — тот же, что у `$rt-bp-lg` в стилях кита. */
export const RT_NARROW_WIDTH: number = 1080;

const NARROW_VIEWPORT_QUERY: string = `(max-width: ${RT_NARROW_WIDTH}px)`;

/**
 * Узок ли вид. Ширина места страницы решает, когда место объявлено; без него решает окно.
 */
export function rtNarrowByWidth(placeWidth: number | null, viewportNarrow: boolean): boolean {
    return placeWidth === null ? viewportNarrow : placeWidth <= RT_NARROW_WIDTH;
}

/**
 * Обёртка над CDK `BreakpointObserver` — публикует reactive signals для
 * mobile/tablet/desktop матчей. `toSignal()` обёртывает CDK Observable в Signal
 * с `initialValue` для CSR-safe рендера.
 *
 * Узкий вид считается от ширины места страницы: его объявляет `rt-container`, и рядом с
 * боковой панелью место уже окна. Без объявленного места вид считается от окна.
 */
@Injectable({ providedIn: 'root' })
export class BreakpointsService {
    readonly #observer: BreakpointObserver = inject(BreakpointObserver);
    readonly #window: Window & typeof globalThis = inject(WINDOW) as Window & typeof globalThis;

    /** Объявленные места в порядке объявления: отвечает последнее. */
    readonly #places: HTMLElement[] = [];

    readonly #placeWidth: WritableSignal<number | null> = signal<number | null>(null);

    #resizeObserver: ResizeObserver | null = null;

    public readonly mobile: Signal<boolean> = toSignal(this.#match([Breakpoints.HandsetPortrait, Breakpoints.HandsetLandscape]), {
        initialValue: false,
    });

    public readonly tablet: Signal<boolean> = toSignal(this.#match([Breakpoints.TabletPortrait, Breakpoints.TabletLandscape]), {
        initialValue: false,
    });

    public readonly desktop: Signal<boolean> = toSignal(this.#match([Breakpoints.WebPortrait, Breakpoints.WebLandscape]), {
        initialValue: true,
    });

    /**
     * Узкое окно (≤1080px). Его читает то, что открывается поверх экрана и занимает окно:
     * выбор между всплывающим окном и листом снизу, подсказки списка в окне выбора.
     * `initialValue: false` — на SSR/CSR до первого matchMedia рендерим desktop-вариант.
     */
    public readonly viewportNarrow: Signal<boolean> = toSignal(this.#match([NARROW_VIEWPORT_QUERY]), {
        initialValue: false,
    });

    /**
     * Узкий вид (≤1080px) — единый порог для компонентов, которые на узком месте подменяют
     * развёрнутый контрол на компактный (напр. `rt-filter-control`: сегменты → `rt-select`).
     * Считается от ширины места страницы, без места — от окна.
     */
    public readonly narrow: Signal<boolean> = computed((): boolean => rtNarrowByWidth(this.#placeWidth(), this.viewportNarrow()));

    /**
     * Объявляет узел местом страницы и возвращает снятие. Без `ResizeObserver` (сервер
     * отрисовки) место не объявляется, и вид считается от окна.
     */
    public registerPlace(element: HTMLElement): () => void {
        if (!('ResizeObserver' in this.#window)) {
            return (): void => undefined;
        }
        const resizeObserver: ResizeObserver = this.#resizeObserver ?? new this.#window.ResizeObserver((): void => this.#measure());
        this.#resizeObserver = resizeObserver;
        this.#places.push(element);
        resizeObserver.observe(element);
        this.#measure();

        return (): void => {
            const index: number = this.#places.indexOf(element);
            if (index === -1) {
                return;
            }
            this.#places.splice(index, 1);
            this.#resizeObserver?.unobserve(element);
            this.#measure();
        };
    }

    #measure(): void {
        const place: HTMLElement | undefined = this.#places.at(-1);
        this.#placeWidth.set(place ? place.getBoundingClientRect().width : null);
    }

    #match(queries: string[]): Observable<boolean> {
        return this.#observer.observe(queries).pipe(map((state: BreakpointState): boolean => state.matches));
    }
}
