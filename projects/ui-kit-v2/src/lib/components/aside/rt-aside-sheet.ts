import { computed, InjectionToken, Signal, signal, WritableSignal } from '@angular/core';

import { defer, Observable, Subject, take } from 'rxjs';

import { ERtAsideUnsavedOutcome } from './unsaved-dialog/rt-aside-unsaved.logic';

/**
 * Чем шторку панели просят закрыться: нажатие по полосе над шторкой и свайп вниз — `backdrop`,
 * Escape — `escape`, «×» шапки — `dismiss`.
 */
export type TRtAsideSheetGesture = 'backdrop' | 'escape' | 'dismiss';

/**
 * Вопрос перед закрытием шторки: о несохранённых правках записи (`edits`, слова панели) или о
 * неприменённых отборах (`apply`, слова шторки кита).
 */
export type TRtAsideSheetQuestion = 'edits' | 'apply';

/** Просьба шторки закрыться: жест и, у «×», дорога стрелки шапки, которой панель закрывается. */
export interface IRtAsideSheetCloseRequest {
    readonly gesture: TRtAsideSheetGesture;
    readonly road: (() => void) | null;
}

/**
 * Вид одного открытия панели на телефоне: шторка во всю высоту вместо выезда сбоку.
 *
 * Вид выбирает тот, кто открывает панель, — служба кита или правая панель `rt-container`, — по
 * окну в миг открытия, и держит его до закрытия: окно, перешедшее порог при открытой панели, вид
 * не меняет. Рамка панели, её шапка и подвал читают вид и рисуются шторкой; просьбы шторки
 * закрыться уходят обратно открывшему — он решает, закрыть ли панель, и при несохранённом
 * спрашивает вопросом шторки внизу экрана (`ask()`).
 */
export class RtAsideSheet {
    readonly #active: WritableSignal<boolean> = signal<boolean>(false);
    readonly #shown: WritableSignal<boolean> = signal<boolean>(false);
    readonly #gesturesSource: Subject<IRtAsideSheetCloseRequest> = new Subject<IRtAsideSheetCloseRequest>();
    readonly #asksSource: Subject<void> = new Subject<void>();
    readonly #answersSource: Subject<ERtAsideUnsavedOutcome> = new Subject<ERtAsideUnsavedOutcome>();
    readonly #screen: WritableSignal<Signal<boolean> | null> = signal<Signal<boolean> | null>(null);
    readonly #headers: WritableSignal<number> = signal<number>(0);

    /** Панель рисуется шторкой: решено при открытии. */
    public readonly active: Signal<boolean> = this.#active.asReadonly();

    /**
     * Шторка панели открыта из другой шторки — она второй экран той же шторки: шапка панели рисует
     * слева шеврон «назад» вместо «×».
     */
    public readonly nested: Signal<boolean> = computed((): boolean => this.#screen()?.() ?? false);

    /**
     * У панели есть шапка кита: главной кнопке подвала есть куда встать в шторке. Без шапки кнопка
     * остаётся в подвале.
     */
    public readonly hasHeader: Signal<boolean> = computed((): boolean => this.#headers() > 0);

    /** Шторка поднята; снятый признак опускает её вниз. */
    public readonly shown: Signal<boolean> = this.#shown.asReadonly();

    /** О чём спрашивает шторка перед закрытием; по нему она берёт слова вопроса. */
    public readonly question: WritableSignal<TRtAsideSheetQuestion> = signal<TRtAsideSheetQuestion>('edits');

    /** Вид, выбранный при открытии панели. */
    public activate(active: boolean): void {
        this.#active.set(active);
    }

    /** Признак второго экрана берётся у шторки, которой нарисована панель. */
    public followScreen(nested: Signal<boolean>): void {
        this.#screen.set(nested);
    }

    /** Шапка панели встала; отданная функция снимает её. */
    public addHeader(): () => void {
        this.#headers.update((count: number): number => count + 1);

        return (): void => this.#headers.update((count: number): number => count - 1);
    }

    /** Поднять шторку или опустить её. */
    public show(shown: boolean): void {
        this.#shown.set(shown);
    }

    /** Шторку просят закрыть: полосой, свайпом, Escape или «×» с дорогой стрелки. */
    public requestClose(gesture: TRtAsideSheetGesture, road: (() => void) | null = null): void {
        this.#gesturesSource.next({ gesture, road });
    }

    /** Просьбы шторки закрыться; закрывать ли, решает открывший панель. */
    public closeRequests(): Observable<IRtAsideSheetCloseRequest> {
        return this.#gesturesSource.asObservable();
    }

    /**
     * Спросить внизу экрана, что сделать с несохранённым, и получить ответ. Шторка задаёт вопрос
     * один раз: просьба, пришедшая, пока он показан, получает тот же ответ.
     */
    public ask(): Observable<ERtAsideUnsavedOutcome> {
        return defer((): Observable<ERtAsideUnsavedOutcome> => {
            this.#asksSource.next();

            return this.#answersSource.pipe(take(1));
        });
    }

    /** Вопросы, которые надо показать: их слушает рамка панели со шторкой. */
    public asks(): Observable<void> {
        return this.#asksSource.asObservable();
    }

    /** Ответ человека на вопрос шторки. */
    public answer(outcome: ERtAsideUnsavedOutcome): void {
        this.#answersSource.next(outcome);
    }

    /** Ответы человека на вопросы шторки — ими живут, например, отборы полосы при отказе. */
    public answers(): Observable<ERtAsideUnsavedOutcome> {
        return this.#answersSource.asObservable();
    }
}

/**
 * Вид панели на телефоне. Его дают служба кита — в injector каждого открытия — и правая панель
 * `rt-container` — шаблону своего слота. Панель без него, стоящая в странице сама, шторкой не
 * становится.
 */
export const RT_ASIDE_SHEET: InjectionToken<RtAsideSheet | null> = new InjectionToken<RtAsideSheet | null>('RT_ASIDE_SHEET');
