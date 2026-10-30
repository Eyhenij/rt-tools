import { effect, inject, signal, untracked, DestroyRef, ElementRef, Signal, WritableSignal } from '@angular/core';

/**
 * Внешняя ширина подписи на рамке, px, — по ней материальный набор вырезает разрыв в рамке поля,
 * как у поля Material. Ширину подписи стили сами не знают, поэтому её меряет наблюдатель размера.
 * Подпись появляется и пропадает вместе со входом — наблюдатель переезжает за ней.
 *
 * Зовётся в контексте внедрения: в инициализаторе поля компонента.
 */
export function rtNotchWidth(label: Signal<ElementRef<HTMLElement> | undefined>): Signal<number> {
    const width: WritableSignal<number> = signal<number>(0);
    let watch: ResizeObserver | null = null;

    effect((): void => {
        const element: HTMLElement | undefined = label()?.nativeElement;
        watch?.disconnect();
        watch = null;
        if (element === undefined) {
            // Подписи больше нет: разрыв закрывается, иначе в рамке осталась бы пустая щель.
            untracked((): void => width.set(0));
            return;
        }
        if (typeof ResizeObserver === 'undefined') {
            return;
        }
        // Внешний размер: поднятая подпись получает внутренние поля, и разрыв режется вместе с ними.
        watch = new ResizeObserver((entries: ResizeObserverEntry[]): void =>
            width.set(entries[0]?.borderBoxSize[0]?.inlineSize ?? element.offsetWidth)
        );
        watch.observe(element, { box: 'border-box' });
    });
    inject(DestroyRef).onDestroy((): void => watch?.disconnect());

    return width.asReadonly();
}
