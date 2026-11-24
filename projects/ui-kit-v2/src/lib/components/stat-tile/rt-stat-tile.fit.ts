import { DOCUMENT } from '@angular/common';
import { computed, effect, inject, signal, DestroyRef, ElementRef, Signal, WritableSignal } from '@angular/core';

/** Шаг размера значения компактной плитки: 24 px, затем 20, затем 18. */
export enum ERtStatTileValueFit {
    Full = 'full',
    Smaller = 'smaller',
    Smallest = 'smallest',
}

/** Шаги по порядку и токен шкалы, который даёт размер каждого. */
const FIT_STEPS: readonly (readonly [ERtStatTileValueFit, string])[] = [
    [ERtStatTileValueFit.Full, '--rt-text-2xl'],
    [ERtStatTileValueFit.Smaller, '--rt-text-xl'],
    [ERtStatTileValueFit.Smallest, '--rt-text-lg'],
];

/** Доля пикселя, на которую измеренная ширина может превысить место: браузер и холст округляют по-разному. */
const ROUNDING: number = 0.5;

/**
 * Номер первого шага, на котором значение входит в строку. Ширина текста растёт вместе с размером
 * шрифта, поэтому ширина на шаге — это ширина при первом размере, умноженная на долю шага. Не
 * входит и на последнем — берётся последний, и единица переносится на следующую строку.
 */
export function rtStatTileFitStep(width: number, sizes: readonly number[], room: number): number {
    const base: number = sizes[0] ?? 0;

    if (base <= 0 || room <= 0) {
        return 0;
    }
    const step: number = sizes.findIndex((size: number): boolean => (width * size) / base <= room + ROUNDING);

    return step < 0 ? sizes.length - 1 : step;
}

/**
 * Шаг размера значения компактной плитки. Значение меряется шрифтом первого шага на холсте, место —
 * шириной ряда значения: строка значения сама сжимается по тексту и места не знает. Пересчёт идёт
 * при смене текста, ширины ряда и после загрузки шрифтов: до неё холст меряет запасным шрифтом.
 *
 * Зовётся в контексте внедрения: в инициализаторе поля компонента.
 */
export function rtStatTileValueFit(
    row: Signal<ElementRef<HTMLElement> | undefined>,
    text: () => string,
    active: () => boolean
): Signal<ERtStatTileValueFit> {
    const document: Document = inject(DOCUMENT);
    const room: WritableSignal<number> = signal<number>(0);
    const fonts: WritableSignal<number> = signal<number>(0);
    const view: (Window & typeof globalThis) | null = document.defaultView;
    const fontsChanged: () => void = (): void => fonts.update((count: number): number => count + 1);
    let watch: ResizeObserver | null = null;
    let canvas: CanvasRenderingContext2D | null = null;
    // Ширину ряда пишет колбэк наблюдателя: замер приходит событием браузера.
    const observe: (element: HTMLElement, host: Window & typeof globalThis) => ResizeObserver = (
        element: HTMLElement,
        host: Window & typeof globalThis
    ): ResizeObserver => {
        const observer: ResizeObserver = new host.ResizeObserver((entries: ResizeObserverEntry[]): void =>
            room.set(entries[0]?.contentBoxSize[0]?.inlineSize ?? element.clientWidth)
        );
        observer.observe(element);
        return observer;
    };

    document.fonts?.addEventListener('loadingdone', fontsChanged);
    void document.fonts?.ready.then(fontsChanged);

    effect((): void => {
        const element: HTMLElement | undefined = row()?.nativeElement;

        watch?.disconnect();
        watch = element === undefined || view === null || typeof view.ResizeObserver === 'undefined' ? null : observe(element, view);
    });

    // Ступень выводится из текста, ширины ряда и загруженных шрифтов: это расчёт, а не запись.
    const fit: Signal<ERtStatTileValueFit> = computed((): ERtStatTileValueFit => {
        const element: HTMLElement | undefined = row()?.nativeElement;
        const value: string = text();
        const width: number = room();

        fonts();
        if (!active() || element === undefined || view === null || width <= 0) {
            return ERtStatTileValueFit.Full;
        }
        canvas ??= document.createElement('canvas').getContext('2d');
        if (canvas === null) {
            return ERtStatTileValueFit.Full;
        }
        const style: CSSStyleDeclaration = view.getComputedStyle(element);
        const sizes: number[] = FIT_STEPS.map(([, token]: readonly [ERtStatTileValueFit, string]): number =>
            Number.parseFloat(style.getPropertyValue(token))
        );

        canvas.font = `${style.fontWeight} ${sizes[0]}px ${style.fontFamily}`;
        const step: number = rtStatTileFitStep(canvas.measureText(value).width, sizes, width);

        return FIT_STEPS[step]?.[0] ?? ERtStatTileValueFit.Full;
    });

    inject(DestroyRef).onDestroy((): void => {
        watch?.disconnect();
        document.fonts?.removeEventListener('loadingdone', fontsChanged);
    });

    return fit;
}
