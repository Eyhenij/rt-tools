import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal, ComponentType } from '@angular/cdk/portal';
import { ComponentRef, DestroyRef, inject, Injectable, Injector } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Event, NavigationEnd, Router } from '@angular/router';
import { EMPTY, merge, Observable, of, Subject } from 'rxjs';
import { delay, filter, mergeAll, take, tap } from 'rxjs/operators';

import { ASIDE_REF, IAsideConfig, TAsidePositions, AsideRef } from './aside.types';
import { RtuiAsidePanelComponent } from './components/panel/aside-panel.component';

@Injectable()
export class RtAsideService {
    readonly #overlay: Overlay = inject(Overlay);
    readonly #router: Router = inject(Router);
    readonly #destroyRef: DestroyRef = inject(DestroyRef);

    /** Источник открытий: метод толкает сюда поток закрытия новой панели, и больше ничего. */
    readonly #closesSource: Subject<Observable<unknown>> = new Subject<Observable<unknown>>();

    /** Открытые сейчас панели: по гибели того, кто службу выдал, снимать нужно каждую. */
    readonly #open: Set<OverlayRef> = new Set<OverlayRef>();

    /**
     * Закрытие каждой открытой панели объявлено один раз, а не заводится вызовом открытия.
     *
     * Потоки сливаются, а не сменяют друг друга: панели живут порознь, и оборванный поток
     * предыдущей оставил бы её на экране — снять её после этого нечем.
     */
    constructor() {
        this.#closesSource.pipe(mergeAll(), takeUntilDestroyed(this.#destroyRef)).subscribe();
        this.#destroyRef.onDestroy((): void => this.#closeOpened());
    }

    /**
     * Opens an aside panel with a specified component, position, and data.
     *
     * @template COMPONENT - The type of the component to display in the aside panel.
     * @template DATA - The type of the data to pass to the component.
     * @template ANSWER - The type of the response expected from the aside panel.
     *
     * @param component - The component to render inside the aside panel.
     * @param position - The position (left or right) where the aside panel should appear.
     * @param data - The data to pass to the component in the aside panel.
     *
     * @returns An observable that emits the response from the aside panel when it is closed.
     */
    public open<COMPONENT = null, DATA = null, ANSWER = null>(
        component: ComponentType<COMPONENT>,
        position: TAsidePositions,
        data: DATA,
        config: IAsideConfig = {}
    ): Observable<ANSWER | null> {
        const answer: Subject<ANSWER | null> = new Subject<ANSWER | null>();
        const overlayRef: OverlayRef = this.#createOverlay(position);
        const asideRef: AsideRef<DATA, ANSWER> = new AsideRef<DATA, ANSWER>(answer, overlayRef, component, position, data);
        const portal: ComponentPortal<RtuiAsidePanelComponent> = this.#createPortal(asideRef);
        const componentRef: ComponentRef<RtuiAsidePanelComponent> = overlayRef.attach(portal);

        this.#open.add(overlayRef);
        this.#closesSource.next(this.#closeOnFirstEvent(overlayRef, componentRef, answer, config));

        return answer ? answer.asObservable() : of(null);
    }

    /**
     * Закрытие одной панели по первому же из её событий.
     *
     * `take(1)` обрывает поток: слитые в него горячие источники — маршрутизатор, подложка,
     * нажатия — иначе держали бы подписку живой и после того, как панель снята.
     */
    #closeOnFirstEvent<ANSWER>(
        overlayRef: OverlayRef,
        componentRef: ComponentRef<RtuiAsidePanelComponent>,
        answer: Subject<ANSWER | null>,
        config: IAsideConfig
    ): Observable<unknown> {
        return merge(
            this.#closesOf(overlayRef, config),
            this.#router.events.pipe(filter((e: Event): boolean => e instanceof NavigationEnd)),
            answer.pipe(delay(10))
        ).pipe(
            take(1),
            tap((): void => {
                this.#open.delete(overlayRef);
                componentRef.instance.startExitAnimation();
                overlayRef.detach();
                answer.complete();
            }),
            delay(300),
            tap((): void => {
                overlayRef.dispose();
            })
        );
    }

    /**
     * Снятие всех открытых панелей по гибели того, кто службу выдал.
     *
     * Службу кладут в компонент экрана, и маршрутизатор гасит компонент раньше, чем издаёт смену
     * маршрута: подписка на закрытия рвётся вместе с ним, событие приходит некому, а панель с
     * подложкой остаётся поверх нового экрана — ни подложка, ни клавиша, ни кнопка внутри уже не
     * работают. Здесь панель снимается прямо гибелью владельца, не дожидаясь события.
     *
     * Без выхода анимацией: содержимое панели гибнет вместе с тем, кто её открыл, и показывать
     * выход уже нечем.
     */
    #closeOpened(): void {
        for (const overlayRef of this.#open) {
            overlayRef.detach();
            overlayRef.dispose();
        }

        this.#open.clear();
    }

    /**
     * Источники закрытия, которые потребитель разрешил настройкой открытия.
     *
     * Запрещённый источник не подписывается вовсе: подписка, которая приходит и ничего не
     * делает, читается работающей и оживает при первой правке рядом.
     */
    #closesOf(overlayRef: OverlayRef, config: IAsideConfig): Observable<unknown> {
        const backdrop$: Observable<MouseEvent> = config.closeOnBackdropClick === false ? EMPTY : overlayRef.backdropClick();
        const escape$: Observable<KeyboardEvent> = config.closeOnEscape
            ? overlayRef.keydownEvents().pipe(filter((keyEvent: KeyboardEvent): boolean => keyEvent.key === 'Escape'))
            : EMPTY;

        return merge(backdrop$, escape$);
    }

    /**
     * Creates an `OverlayConfig` object to configure the overlay's position, scroll behavior, and backdrop.
     *
     * @param position - The position (left or right) where the aside panel should appear.
     *
     * @returns An `OverlayConfig` object with the specified settings.
     */
    #createOverlayConfig(position: TAsidePositions): OverlayConfig {
        const config: Partial<OverlayConfig> = {
            width: 'auto',
            scrollStrategy: this.#overlay.scrollStrategies.block(),
            positionStrategy: this.#overlay.position().global().left(),
            hasBackdrop: true,
        };

        if (position === 'right') {
            config.positionStrategy = this.#overlay.position().global().right();
        }

        return new OverlayConfig(config);
    }

    /**
     * Creates and returns an `OverlayRef` object that represents the overlay to be displayed.
     *
     * @param position - The position (left or right) where the aside panel should appear.
     *
     * @returns An `OverlayRef` object that manages the overlay's lifecycle.
     */
    #createOverlay(position: TAsidePositions): OverlayRef {
        const overlayConfig: OverlayConfig = this.#createOverlayConfig(position);
        return this.#overlay.create(overlayConfig);
    }

    /**
     * Creates a `ComponentPortal` for the `RtuiAsidePanelComponent`, injecting the `AsideRef` instance.
     *
     * @template D - The type of data passed to the aside component.
     * @template R - The type of the response expected from the aside component.
     *
     * @param asideRef - The `AsideRef` instance containing the data and component for the aside panel.
     *
     * @returns A `ComponentPortal` that can be attached to an overlay.
     */
    #createPortal<D, R>(asideRef: AsideRef<D, R>): ComponentPortal<RtuiAsidePanelComponent> {
        const injector: Injector = Injector.create({
            providers: [
                {
                    provide: ASIDE_REF,
                    useValue: asideRef,
                },
            ],
        });

        return new ComponentPortal(RtuiAsidePanelComponent, null, injector);
    }
}
