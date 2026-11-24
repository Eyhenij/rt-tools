import { InjectionToken, Signal, signal, WritableSignal } from '@angular/core';

import { Observable, Subject } from 'rxjs';

/**
 * Жест, которым шторка панели просит закрыться: нажатие по полосе над шторкой и свайп вниз —
 * `backdrop`, Escape — `escape`. «×» сюда не приходит: он идёт дорогой стрелки шапки.
 */
export type TRtAsideSheetGesture = 'backdrop' | 'escape';

/**
 * Вид одного открытия панели на телефоне: шторка во всю высоту вместо выезда сбоку.
 *
 * Вид выбирает тот, кто открывает панель, — служба кита или правая панель `rt-container`, — по
 * окну в миг открытия, и держит его до закрытия: окно, перешедшее порог при открытой панели, вид
 * не меняет. Рамка панели, её шапка и подвал читают вид и рисуются шторкой; просьбы шторки
 * закрыться уходят обратно открывшему — он решает, закрыть ли панель.
 */
export class RtAsideSheet {
    readonly #active: WritableSignal<boolean> = signal<boolean>(false);
    readonly #shown: WritableSignal<boolean> = signal<boolean>(false);
    readonly #gesturesSource: Subject<TRtAsideSheetGesture> = new Subject<TRtAsideSheetGesture>();

    /** Панель рисуется шторкой: решено при открытии. */
    public readonly active: Signal<boolean> = this.#active.asReadonly();

    /** Шторка поднята; снятый признак опускает её вниз. */
    public readonly shown: Signal<boolean> = this.#shown.asReadonly();

    /** Вид, выбранный при открытии панели. */
    public activate(active: boolean): void {
        this.#active.set(active);
    }

    /** Поднять шторку или опустить её. */
    public show(shown: boolean): void {
        this.#shown.set(shown);
    }

    /** Шторку просят закрыть жестом: полосой, свайпом или Escape. */
    public requestClose(gesture: TRtAsideSheetGesture): void {
        this.#gesturesSource.next(gesture);
    }

    /** Просьбы шторки закрыться; закрывать или нет, решает открывший панель. */
    public closeRequests(): Observable<TRtAsideSheetGesture> {
        return this.#gesturesSource.asObservable();
    }
}

/**
 * Вид панели на телефоне. Его дают служба кита — в injector каждого открытия — и правая панель
 * `rt-container` — шаблону своего слота. Панель без него, стоящая в странице сама, шторкой не
 * становится.
 */
export const RT_ASIDE_SHEET: InjectionToken<RtAsideSheet | null> = new InjectionToken<RtAsideSheet | null>('RT_ASIDE_SHEET');
