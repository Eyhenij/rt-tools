import { Renderer2 } from '@angular/core';

import { RtAsideSheet } from '@rt-tools/ui-kit-v2/aside';
import { listenTransitionEnd } from '@rt-tools/ui-kit-v2/drawer';

/** Состояния коробки оверлея правой панели: их переключают каркас и шторка телефона. */
export const RT_OVERLAY_OPEN_CLASS: string = 'rt-aside-overlay--open';
export const RT_OVERLAY_ENTERING_CLASS: string = 'rt-aside-overlay--entering';
export const RT_OVERLAY_LEAVING_CLASS: string = 'rt-aside-overlay--leaving';

/** Коробка оверлея под шторкой телефона: во всё окно и без сдвига. */
const OVERLAY_SHEET_CLASS: string = 'rt-aside-overlay--sheet';

/** Панель шторки кита: по её переходу видно, что шторка поднялась или опустилась. */
const SHEET_PANEL_SELECTOR: string = '[qa-dataid="bottom-sheet-panel"]';

/**
 * Правая панель каркаса шторкой телефона: выбор вида при открытии, подъём и спуск шторки и коробка
 * оверлея под ней. Вид выбирается окном при открытии и держится до следующего открытия: переход к
 * другой записи в открытой панели — не открытие, а закрытая шторка остаётся шторкой, пока панель
 * не откроют снова.
 */
export class RtContainerSheetDriver {
    readonly #sheet: RtAsideSheet;
    readonly #renderer: Renderer2;
    readonly #window: Window | null;

    constructor(sheet: RtAsideSheet, renderer: Renderer2, win: Window | null) {
        this.#sheet = sheet;
        this.#renderer = renderer;
        this.#window = win;
    }

    /** Вид открытия: закрытая панель выбирает его по окну, открытая держит прежний. */
    public choose(opening: boolean, phone: boolean): boolean {
        if (opening) {
            this.#sheet.activate(phone);
        }

        return this.#sheet.active();
    }

    /**
     * Шторка в оверлее: коробка во всё окно без сдвига и без своей подложки — затемнение и
     * блокировку прокрутки держит сама шторка, и держит всегда, с подложкой каркаса или без неё.
     */
    public openOverlay(overlayElement: HTMLElement, onOpened: () => void): void {
        this.#renderer.removeClass(overlayElement, RT_OVERLAY_ENTERING_CLASS);
        this.#renderer.removeClass(overlayElement, RT_OVERLAY_LEAVING_CLASS);
        this.#renderer.addClass(overlayElement, OVERLAY_SHEET_CLASS);
        requestAnimationFrame((): void => {
            this.#renderer.addClass(overlayElement, RT_OVERLAY_OPEN_CLASS);
            this.raise(overlayElement, onOpened);
        });
    }

    /**
     * Коробка оверлея пересоздана, пока шторка поднята: новая коробка сразу встаёт открытой коробкой
     * шторки. Шторка уже стоит на месте, и поднимать её второй раз не нужно.
     */
    public keepOverlay(overlayElement: HTMLElement): void {
        this.#renderer.removeClass(overlayElement, RT_OVERLAY_ENTERING_CLASS);
        this.#renderer.removeClass(overlayElement, RT_OVERLAY_LEAVING_CLASS);
        this.#renderer.addClass(overlayElement, OVERLAY_SHEET_CLASS);
        this.#renderer.addClass(overlayElement, RT_OVERLAY_OPEN_CLASS);
    }

    /** Закрытая шторка в оверлее: коробка в закрытом положении панели сбоку, из него выедет панель. */
    public closeOverlay(overlayElement: HTMLElement): void {
        this.#renderer.removeClass(overlayElement, RT_OVERLAY_OPEN_CLASS);
        this.#renderer.addClass(overlayElement, RT_OVERLAY_LEAVING_CLASS);
    }

    /** Панель сбоку на широком окне: коробка снова сдвигается с панелью. */
    public leaveOverlay(overlayElement: HTMLElement): void {
        this.#renderer.removeClass(overlayElement, OVERLAY_SHEET_CLASS);
    }

    /** Шторка поднимается снизу; `onOpened` — когда она встала на место. */
    public raise(place: HTMLElement | null, onOpened: () => void): void {
        this.#sheet.show(true);
        this.#afterTransition(place, onOpened);
    }

    /** Шторка опускается вниз; `done` — когда она ушла. */
    public lower(place: HTMLElement | null, done: () => void): void {
        this.#sheet.show(false);
        this.#afterTransition(place, done);
    }

    #afterTransition(place: HTMLElement | null, callback: () => void): void {
        const panel: HTMLElement | null = place?.querySelector<HTMLElement>(SHEET_PANEL_SELECTOR) ?? null;

        if (panel === null) {
            callback();
            return;
        }
        listenTransitionEnd(this.#window, panel, 'transform', callback);
    }
}
