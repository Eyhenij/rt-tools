import { OverlayRef } from '@angular/cdk/overlay';
import { Renderer2, signal, WritableSignal } from '@angular/core';

import { Observable, Subject, take } from 'rxjs';

import { RtAsideSheet } from './rt-aside-sheet';

/** Длительность slide-out анимации; синхронизирована с `--rt-aside-animation-duration` в SCSS. */
const LEAVE_ANIMATION_DURATION_MS: number = 200;

/**
 * Жест закрытия, на который панель не закрылась: `Escape` или нажатие по подложке. Панель
 * отказывает в нём под `disableClose()` и когда жест выключен настройкой открытия.
 */
export type TRtAsideCloseRequest = 'escape' | 'backdrop';

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
 * Слой, снятый без `close()` — переходом по адресу (`disposeOnNavigation`) или уничтожением
 * хозяина, — тоже завершает `afterClosed()`: подписчик получает `undefined`.
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

    /**
     * Признак несохранённых правок, который ставит приложение, пока панель держит незаписанное.
     * На телефоне панель-шторка с ним перед закрытием жестом или «×» спрашивает внизу экрана:
     * сохранить и закрыть, закрыть без сохранения или остаться. Закрытие кодом через `close()`
     * признак не читает. От 481 точки признак ничего не меняет.
     */
    public readonly unsaved: WritableSignal<boolean> = signal(false);

    readonly #overlayRef: OverlayRef;
    readonly #renderer: Renderer2;
    readonly #afterClosedSource: Subject<T | undefined> = new Subject<T | undefined>();
    readonly #closeRequestsSource: Subject<TRtAsideCloseRequest>;
    readonly #saveRequestsSource: Subject<void> = new Subject<void>();
    /** Вид открытия на телефоне: шторку закрытие опускает вниз. Без него панель уезжает вбок. */
    readonly #sheet: RtAsideSheet | null;

    #isClosing: boolean = false;

    /**
     * `closeRequestsSource` наполняет служба: она слушает жесты и знает, отказала ли в них панель.
     * Хэндл только завершает поток вместе с панелью.
     */
    constructor(
        overlayRef: OverlayRef,
        renderer: Renderer2,
        closeRequestsSource: Subject<TRtAsideCloseRequest> = new Subject<TRtAsideCloseRequest>(),
        sheet: RtAsideSheet | null = null
    ) {
        this.#overlayRef = overlayRef;
        this.#renderer = renderer;
        this.#closeRequestsSource = closeRequestsSource;
        this.#sheet = sheet;
        this.#overlayRef
            .detachments()
            .pipe(take(1))
            .subscribe((): void => this.#finish(undefined));
    }

    /** Закрывает overlay со slide-out анимацией; эмиттит result в `afterClosed()` синхронно. */
    public close(result?: T): void {
        if (this.#isClosing) {
            return;
        }
        this.#isClosing = true;

        this.#renderer.removeClass(this.#overlayRef.overlayElement, 'rt-aside-overlay--open');
        this.#renderer.addClass(this.#overlayRef.overlayElement, 'rt-aside-overlay--leaving');
        // Шторка уезжает вниз за то же время, что панель вбок: её переход — `--rt-duration-base`.
        this.#sheet?.show(false);

        // Эмитим результат сразу — consumer не ждёт slide-out.
        this.#emit(result);

        // Дефер dispose'а на длительность анимации — overlay остаётся в DOM,
        // пока CSS-transition не отыграет slide-out.
        setTimeout((): void => {
            this.#overlayRef.dispose();
        }, LEAVE_ANIMATION_DURATION_MS);
    }

    /** Эмиттит один раз — результат `close(result)` или `undefined` при снятом слое — и завершается. */
    public afterClosed(): Observable<T | undefined> {
        return this.#afterClosedSource.asObservable();
    }

    /**
     * Жесты закрытия, в которых панель отказала: `Escape` и нажатие по подложке под
     * `disableClose()` или выключенные настройкой. Завершается вместе с панелью.
     */
    public closeRequests(): Observable<TRtAsideCloseRequest> {
        return this.#closeRequestsSource.asObservable();
    }

    /**
     * Человек ответил «Сохранить и закрыть» на вопрос шторки телефона. Панель остаётся открытой:
     * приложение записывает правки и закрывает её через `close()`, признак снимать не обязательно.
     * Завершается вместе с панелью.
     */
    public saveRequests(): Observable<void> {
        return this.#saveRequestsSource.asObservable();
    }

    /** Ответ «Сохранить и закрыть» на вопрос шторки: служба передаёт его приложению. */
    public requestSave(): void {
        if (!this.#isClosing) {
            this.#saveRequestsSource.next();
        }
    }

    /** Слой снят без `close()`: анимации играть не на чем, остаётся отдать результат. */
    #finish(result: T | undefined): void {
        if (this.#isClosing) {
            return;
        }
        this.#isClosing = true;
        this.#emit(result);
    }

    #emit(result: T | undefined): void {
        this.#sheet?.stopWatchingAside();
        this.#afterClosedSource.next(result);
        this.#afterClosedSource.complete();
        this.#closeRequestsSource.complete();
        this.#saveRequestsSource.complete();
    }
}
