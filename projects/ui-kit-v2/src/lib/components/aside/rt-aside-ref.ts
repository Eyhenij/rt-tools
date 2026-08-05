import { OverlayRef } from '@angular/cdk/overlay';
import { Renderer2, signal, WritableSignal } from '@angular/core';

import { Observable, Subject } from 'rxjs';

/** Длительность slide-out анимации; синхронизирована с `--rt-aside-animation-duration` в SCSS. */
const LEAVE_ANIMATION_DURATION_MS: number = 200;

/**
 * Хэндл к программно открытой side-sheet (через `RtAsideService.open()`).
 *
 * Контент-компонент инжектит `RtAsideRef` и закрывает aside через `.close(result?)`.
 * Родитель ждёт результата через `.afterClosed()`.
 *
 * Generic `<T>` — тип результата `close(result)`. Дефолт `unknown` — если результат
 * не нужен, оставляй generic пустым.
 *
 * Lifecycle close():
 *  1. Race-guard `#isClosing` гарантирует один эмит даже при двойном вызове.
 *  2. Снимает `rt-aside-overlay--open` и ставит `rt-aside-overlay--leaving` на host —
 *     CSS-transition (200ms) играет slide-out.
 *  3. Эмиттит result в `afterClosed()` СРАЗУ (consumer не ждёт анимацию).
 *  4. Через `setTimeout(200ms)` зовёт `overlayRef.dispose()` — overlay убран после анимации.
 *
 * @example
 * \`\`\`ts
 * // в контент-компоненте
 * private readonly asideRef = inject(RtAsideRef<{ saved: boolean }>);
 * onSave(): void { this.asideRef.close({ saved: true }); }
 *
 * // в родителе
 * asideService.open(EditAsideComponent).afterClosed().subscribe(result => {...});
 * \`\`\`
 */
export class RtAsideRef<T = unknown> {
    /**
     * Runtime-флаг, блокирующий close() через ESC / backdrop click.
     *
     * Default `false`. Включай (`asideRef.disableClose.set(true)`) на время
     * in-flight submit'а, чтобы юзер не потерял введённые в форму данные.
     * Программный `close(result)` гейтом не задет — он всегда закрывает.
     */
    public readonly disableClose: WritableSignal<boolean> = signal(false);

    readonly #overlayRef: OverlayRef;
    readonly #renderer: Renderer2;
    readonly #afterClosedSource: Subject<T | undefined> = new Subject<T | undefined>();

    #isClosing: boolean = false;

    constructor(overlayRef: OverlayRef, renderer: Renderer2) {
        this.#overlayRef = overlayRef;
        this.#renderer = renderer;
    }

    /** Закрывает overlay со slide-out анимацией; эмиттит result в `afterClosed()` синхронно. */
    public close(result?: T): void {
        if (this.#isClosing) {
            return;
        }
        this.#isClosing = true;

        this.#renderer.removeClass(this.#overlayRef.overlayElement, 'rt-aside-overlay--open');
        this.#renderer.addClass(this.#overlayRef.overlayElement, 'rt-aside-overlay--leaving');

        // Эмитим результат сразу — consumer не ждёт slide-out.
        this.#afterClosedSource.next(result);
        this.#afterClosedSource.complete();

        // Дефер dispose'а на длительность анимации — overlay остаётся в DOM,
        // пока CSS-transition не отыграет slide-out.
        setTimeout((): void => {
            this.#overlayRef.dispose();
        }, LEAVE_ANIMATION_DURATION_MS);
    }

    /** Эмиттит один раз — результат `close(result)` — и завершается. */
    public afterClosed(): Observable<T | undefined> {
        return this.#afterClosedSource.asObservable();
    }
}
