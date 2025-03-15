import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal, ComponentType } from '@angular/cdk/portal';
import { ComponentRef, inject, Injectable, Injector } from '@angular/core';
import { Event, NavigationEnd, Router } from '@angular/router';
import { merge, Observable, of, Subject } from 'rxjs';
import { delay, filter, tap } from 'rxjs/operators';

import { ASIDE_REF, AsidePositions, AsideRef } from '../../util';
import { RtuiAsidePanelComponent } from './components/panel/aside-panel.component';

@Injectable()
export class RtAsideService {
    readonly #overlay: Overlay = inject(Overlay);
    readonly #router: Router = inject(Router);

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
    public Open<COMPONENT = null, DATA = null, ANSWER = null>(
        component: ComponentType<COMPONENT>,
        position: AsidePositions,
        data: DATA
    ): Observable<ANSWER | null> {
        const answer: Subject<ANSWER | null> = new Subject<ANSWER | null>();
        const overlayRef: OverlayRef = this.#createOverlay(position);
        const asideRef: AsideRef<DATA, ANSWER> = new AsideRef<DATA, ANSWER>(answer, overlayRef, component, position, data);
        const portal: ComponentPortal<RtuiAsidePanelComponent> = this.#createPortal(asideRef);
        const componentRef: ComponentRef<RtuiAsidePanelComponent> = overlayRef.attach(portal);

        merge(
            overlayRef.backdropClick(),
            overlayRef.keydownEvents().pipe(filter((keyEvent: KeyboardEvent): boolean => keyEvent.key === 'Escape')),
            this.#router.events.pipe(filter((e: Event): boolean => e instanceof NavigationEnd)),
            answer.pipe(delay(10))
        )
            .pipe(
                tap((): void => {
                    componentRef.instance.startExitAnimation();
                    overlayRef.detach();
                    answer.complete();
                }),
                delay(300)
            )
            .subscribe(() => {
                overlayRef.dispose();
            });

        return answer ? answer.asObservable() : of(null);
    }

    /**
     * Creates an `OverlayConfig` object to configure the overlay's position, scroll behavior, and backdrop.
     *
     * @param position - The position (left or right) where the aside panel should appear.
     *
     * @returns An `OverlayConfig` object with the specified settings.
     */
    #createOverlayConfig(position: AsidePositions): OverlayConfig {
        const config: Partial<OverlayConfig> = {
            width: 'auto',
            scrollStrategy: this.#overlay.scrollStrategies.block(),
            positionStrategy: this.#overlay.position().global().left(),
            hasBackdrop: true,
        };

        if (position === 'left') {
            config.positionStrategy = this.#overlay.position().global().left();
        } else if (position === 'right') {
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
    #createOverlay(position: AsidePositions): OverlayRef {
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
