import {
    booleanAttribute,
    Directive,
    effect,
    ElementRef,
    inject,
    input,
    InputSignal,
    InputSignalWithTransform,
    OnDestroy,
    output,
    OutputEmitterRef,
} from '@angular/core';

import { WINDOW } from '@rt-tools/core';

/**
 * Триггер бесконечной прокрутки. Вешается на элемент-«маяк» в конце списка;
 * когда маяк приближается к области видимости — эмитит `(loadMore)`, чтобы
 * потребитель догрузил следующую страницу и ДОБАВИЛ её к уже показанным
 * сущностям (а не перезаписал).
 *
 * Использует `IntersectionObserver`, поэтому не зависит от того, какой предок
 * владеет вертикальным скроллом: контент скроллится в `.rt-container__content`
 * shell'а, а не в самом feature-компоненте, и браузер сам клипует маяк
 * скроллящими предками при расчёте пересечения.
 *
 * `rootMargin` расширяет нижнюю кромку корня, чтобы триггерить догрузку
 * ЗАРАНЕЕ (по умолчанию за половину вьюпорта до низа) — страница успевает
 * подгрузиться прежде, чем пользователь упрётся в конец списка. Пока идёт
 * запрос или страниц больше нет, потребитель ставит `[disabled]="true"` —
 * наблюдение приостанавливается.
 */
@Directive({
    selector: '[rtInfiniteScroll]',
})
export class RtInfiniteScrollDirective implements OnDestroy {
    readonly #host: ElementRef<HTMLElement> = inject(ElementRef);
    // Конструкторы вроде IntersectionObserver объявлены на globalThis, а не на
    // интерфейсе Window — токен отдаёт тот же объект, тип лишь уточняется.
    readonly #window: Window & typeof globalThis = inject(WINDOW) as Window & typeof globalThis;

    #observer: IntersectionObserver | null = null;

    /** Пауза наблюдения: `true`, пока идёт догрузка или страниц больше нет. */
    public readonly disabled: InputSignalWithTransform<boolean, boolean | string> = input<boolean, boolean | string>(false, {
        transform: booleanAttribute,
    });

    /**
     * Запас корня снизу — за сколько до низа триггерить догрузку. CSS-формат
     * `rootMargin` (px или %). Default `50%` — половина вьюпорта заранее.
     */
    public readonly rootMargin: InputSignal<string> = input<string>('50%');

    public readonly loadMore: OutputEmitterRef<void> = output<void>();

    constructor() {
        effect((): void => {
            // Читаем оба сигнала, чтобы effect пересоздавал наблюдатель при их
            // смене. После завершения догрузки (disabled false-edge) нужен
            // свежий observe: IntersectionObserver не шлёт повторный колбэк,
            // если пересечение с прошлого раза не менялось.
            const disabled: boolean = this.disabled();
            const rootMargin: string = this.rootMargin();
            this.#disconnect();
            if (!disabled) {
                this.#observe(rootMargin);
            }
        });
    }

    public ngOnDestroy(): void {
        this.#disconnect();
    }

    #observe(rootMargin: string): void {
        const view: Window & typeof globalThis = this.#window;
        if (typeof view.IntersectionObserver === 'undefined') {
            return;
        }
        this.#observer = new view.IntersectionObserver(
            (entries: IntersectionObserverEntry[]): void => {
                const reached: boolean = entries.some((entry: IntersectionObserverEntry): boolean => entry.isIntersecting);
                if (reached) {
                    this.loadMore.emit();
                }
            },
            { root: null, threshold: 0, rootMargin }
        );
        this.#observer.observe(this.#host.nativeElement);
    }

    #disconnect(): void {
        this.#observer?.disconnect();
        this.#observer = null;
    }
}
