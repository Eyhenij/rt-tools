import { ComponentType, Overlay, OverlayConfig, OverlayRef, PositionStrategy } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { inject, Injectable, Injector, Renderer2, RendererFactory2, Signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { EMPTY, map, merge, mergeMap, Observable, Subject, takeUntil } from 'rxjs';

import { RtAsideRef } from './rt-aside-ref';
import { RT_ASIDE_DATA } from './rt-aside.tokens';

/**
 * Позиционирование side-sheet — у какого края viewport "приклеена" панель.
 */
export type IRtAsidePosition = 'right' | 'left';

/**
 * Конфигурация открытия side-sheet через `RtAsideService.open()`.
 */
export interface IRtAsideConfig<TData = unknown> {
    /** Данные, доступные внутри aside'а через `inject(RT_ASIDE_DATA)`. */
    data?: TData;

    /** Дополнительный CSS-класс для backdrop (поверх стандартного `rt-aside-backdrop`). */
    backdropClass?: string | string[];

    /** Дополнительный CSS-класс для panel-обёртки overlay (поверх `rt-aside-overlay`). */
    panelClass?: string | string[];

    /** Закрывать aside по клику на backdrop. По дефолту `true`. */
    closeOnBackdropClick?: boolean;

    /** Закрывать aside по ESC. По дефолту `true`. */
    closeOnEscape?: boolean;

    /** К какому краю viewport "приклеить" панель. По дефолту `"right"`. */
    position?: IRtAsidePosition;
}

/**
 * Контекст одного открытия aside'а — payload для per-open close-подписок в конструкторном
 * стриме. `asideRef` сужен до используемых handler'ами членов (`RtAsideRef<T>` инвариантен
 * по `T`, целиком в generic-agnostic контекст не влезает).
 */
interface IRtAsideOpenContext {
    overlayRef: OverlayRef;
    asideRef: {
        disableClose: Signal<boolean>;
        close: () => void;
    };
    closeOnBackdropClick: boolean;
    closeOnEscape: boolean;
}

/**
 * Программный API для открытия side-sheet поверх CDK Overlay.
 *
 * Архитектурно зеркалит `RtDialogService`, отличаясь только positionStrategy
 * (edge-anchored: `right('0')` / `left('0')` + `top('0')`) и slide-in анимацией,
 * которая триггерится через CSS-классы на overlay host (`Renderer2` инжектится
 * через `RendererFactory2`, потому что в service нет ComponentRef).
 *
 * Lifecycle:
 *  1. `overlay.create({ panelClass: [..., '--entering'] })` — host получает initial
 *     CSS-стейт (translateX(±100%)).
 *  2. `overlayRef.attach(portal)` — контент-компонент монтируется в host.
 *  3. На следующий paint (`requestAnimationFrame`) сервис снимает `--entering` и
 *     добавляет `--open` — CSS-transition сделает slide-in.
 *  4. На `ref.close(result)` ref добавляет `--leaving`, эмиттит result синхронно,
 *     deferred `dispose()` через 200ms (длительность анимации).
 *
 * Альтернатива rt-dialog — для длинных форм / мастеров / side-panels, где
 * центрированная модалка ощущается тесной. Не предназначено для подтверждений
 * или коротких диалогов (для этого — `RtDialogService`).
 *
 * @example
 * \`\`\`ts
 * private readonly asideService = inject(RtAsideService);
 *
 * openProfile(userId: number): void {
 *   const ref = this.asideService.open<GuestProfileAsideComponent, { userId: number }, void>(
 *     GuestProfileAsideComponent,
 *     { data: { userId }, position: "right" }
 *   );
 *   ref.afterClosed().subscribe(() => this.reloadList());
 * }
 *
 * // контент-компонент
 * @Component({ ... })
 * export class GuestProfileAsideComponent {
 *   readonly data = inject(RT_ASIDE_DATA) as { userId: number };
 *   readonly #ref = inject(RtAsideRef);
 *   close(): void { this.#ref.close(); }
 * }
 * \`\`\`
 */
@Injectable({ providedIn: 'root' })
export class RtAsideService {
    readonly #overlay: Overlay = inject(Overlay);
    readonly #injector: Injector = inject(Injector);
    // Renderer2 нужен для манипуляции CSS-классами на overlay.hostElement.
    // В service нет ComponentRef, поэтому Renderer2 берём через factory.
    readonly #renderer: Renderer2 = inject(RendererFactory2).createRenderer(null, null);

    readonly #openSource: Subject<IRtAsideOpenContext> = new Subject<IRtAsideOpenContext>();

    constructor() {
        // Per-open close-подписки (backdrop / ESC) живут в одном постоянном
        // конструкторном стриме: open() эмитит контекст открытия, mergeMap
        // подписывает event-стримы конкретного OverlayRef до его dispose
        // (`detachments()` терминирует внутренний поток). mergeMap, а не
        // switchMap — одновременно может быть открыто несколько aside'ов.
        //
        // Runtime-guard через asideRef.disableClose() — те же правила, что в
        // rt-dialog: ESC / backdrop НЕ закрывают overlay, если disableClose=true;
        // программный ref.close() гейтом не задет.
        this.#openSource
            .pipe(
                mergeMap((openContext: IRtAsideOpenContext): Observable<() => void> => {
                    const backdropClose$: Observable<() => void> = openContext.closeOnBackdropClick
                        ? openContext.overlayRef.backdropClick().pipe(
                              map((): (() => void) => (): void => {
                                  if (openContext.asideRef.disableClose()) {
                                      return;
                                  }
                                  openContext.asideRef.close();
                              })
                          )
                        : EMPTY;
                    const escapeClose$: Observable<() => void> = openContext.closeOnEscape
                        ? openContext.overlayRef.keydownEvents().pipe(
                              map((event: KeyboardEvent): (() => void) => (): void => {
                                  if (event.key !== 'Escape') {
                                      return;
                                  }
                                  event.preventDefault();
                                  if (openContext.asideRef.disableClose()) {
                                      return;
                                  }
                                  openContext.asideRef.close();
                              })
                          )
                        : EMPTY;
                    return merge(backdropClose$, escapeClose$).pipe(takeUntil(openContext.overlayRef.detachments()));
                }),
                takeUntilDestroyed()
            )
            .subscribe((handleCloseIntent: () => void): void => handleCloseIntent());
    }

    public open<TComponent, TData = unknown, TResult = unknown>(
        component: ComponentType<TComponent>,
        config?: IRtAsideConfig<TData>
    ): RtAsideRef<TResult> {
        const position: IRtAsidePosition = config?.position ?? 'right';
        const positionStrategy: PositionStrategy =
            position === 'right'
                ? this.#overlay.position().global().right('0').top('0')
                : this.#overlay.position().global().left('0').top('0');

        const panelClasses: string[] = ['rt-aside-overlay', `rt-aside-overlay--position-${position}`, 'rt-aside-overlay--entering'];

        const overlayConfig: OverlayConfig = {
            positionStrategy,
            scrollStrategy: this.#overlay.scrollStrategies.block(),
            hasBackdrop: true,
            backdropClass: config?.backdropClass ?? 'rt-aside-backdrop',
            panelClass: config?.panelClass !== undefined ? [...panelClasses, ...this.#toArray(config.panelClass)] : panelClasses,
            disposeOnNavigation: true,
        };

        const overlayRef: OverlayRef = this.#overlay.create(overlayConfig);
        const asideRef: RtAsideRef<TResult> = new RtAsideRef<TResult>(overlayRef, this.#renderer);

        // Сами close-подписки объявлены один раз в конструкторе — здесь только
        // эмит контекста открытия (см. #openSource-стрим).
        this.#openSource.next({
            overlayRef,
            asideRef,
            closeOnBackdropClick: config?.closeOnBackdropClick !== false,
            closeOnEscape: config?.closeOnEscape !== false,
        });

        const injector: Injector = Injector.create({
            parent: this.#injector,
            providers: [
                { provide: RtAsideRef, useValue: asideRef },
                { provide: RT_ASIDE_DATA, useValue: config?.data ?? null },
            ],
        });

        const portal: ComponentPortal<TComponent> = new ComponentPortal<TComponent>(component, null, injector);
        overlayRef.attach(portal);

        // Slide-in: на следующий paint снимаем --entering и добавляем --open.
        // CSS transition (см. rt-aside.component.scss) сделает анимацию.
        // Backdrop default hidden — toggle --visible одновременно со слайдом.
        requestAnimationFrame((): void => {
            this.#renderer.removeClass(overlayRef.overlayElement, 'rt-aside-overlay--entering');
            this.#renderer.addClass(overlayRef.overlayElement, 'rt-aside-overlay--open');
            const backdropEl: HTMLElement | null = overlayRef.backdropElement;
            if (backdropEl !== null) {
                this.#renderer.addClass(backdropEl, 'rt-aside-backdrop--visible');
            }
        });

        return asideRef;
    }

    /** Нормализует `string | string[]` к массиву (panelClass поддерживает оба формата). */
    #toArray(value: string | string[]): string[] {
        return Array.isArray(value) ? value : [value];
    }
}
