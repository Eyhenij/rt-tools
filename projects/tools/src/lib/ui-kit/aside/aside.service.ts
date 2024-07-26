import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal, ComponentType } from '@angular/cdk/portal';
import { ComponentRef, Injectable, Injector, inject } from '@angular/core';
import { Event, NavigationEnd, Router } from '@angular/router';

import { Observable, Subject, merge, of } from 'rxjs';
import { delay, filter, tap } from 'rxjs/operators';

import { ASIDE_REF, AsidePositions, AsideRef } from '../../util';
import { RtuiAsidePanelComponent } from './components/panel/aside-panel.component';

@Injectable()
export class RtAsideService {
    readonly #overlay: Overlay = inject(Overlay);
    readonly #router: Router = inject(Router);

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

    #createOverlay(position: AsidePositions): OverlayRef {
        const overlayConfig: OverlayConfig = this.#createOverlayConfig(position);
        return this.#overlay.create(overlayConfig);
    }

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
