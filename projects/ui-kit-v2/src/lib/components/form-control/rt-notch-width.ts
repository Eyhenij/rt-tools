import { computed, effect, inject, signal, DestroyRef, ElementRef, Signal, WritableSignal } from '@angular/core';

/**
 * Внешняя ширина подписи на рамке, px, — по ней материальный набор вырезает разрыв в рамке поля,
 * как у поля Material. Ширину подписи стили сами не знают, поэтому её меряет наблюдатель размера.
 * Подпись появляется и пропадает вместе со входом — наблюдатель переезжает за ней.
 *
 * Зовётся в контексте внедрения: в инициализаторе поля компонента.
 */
export function rtNotchWidth(label: Signal<ElementRef<HTMLElement> | undefined>): Signal<number> {
    const measured: WritableSignal<number> = signal<number>(0);
    let watch: ResizeObserver | null = null;
    // Ширину пишет колбэк наблюдателя: замер приходит событием браузера, а не перерасчётом сигналов.
    const observe: (element: HTMLElement) => ResizeObserver = (element: HTMLElement): ResizeObserver => {
        // Внешний размер: поднятая подпись получает внутренние поля, и разрыв режется вместе с ними.
        const observer: ResizeObserver = new ResizeObserver((entries: ResizeObserverEntry[]): void =>
            measured.set(entries[0]?.borderBoxSize[0]?.inlineSize ?? element.offsetWidth)
        );
        observer.observe(element, { box: 'border-box' });
        return observer;
    };

    effect((): void => {
        const element: HTMLElement | undefined = label()?.nativeElement;
        watch?.disconnect();
        watch = element === undefined || typeof ResizeObserver === 'undefined' ? null : observe(element);
    });
    inject(DestroyRef).onDestroy((): void => watch?.disconnect());

    // Подписи нет — разрыв закрыт, иначе в рамке осталась бы пустая щель.
    return computed((): number => (label() === undefined ? 0 : measured()));
}
