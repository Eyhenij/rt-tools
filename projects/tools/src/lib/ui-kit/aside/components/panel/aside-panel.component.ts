import { animate, state, style, transition, trigger } from '@angular/animations';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { ComponentPortal } from '@angular/cdk/portal';
import { PortalModule } from '@angular/cdk/portal';
import { AsyncPipe } from '@angular/common';
import { Component, HostBinding, Inject, Injector, ViewEncapsulation } from '@angular/core';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ASIDE_REF, AsidePositions, AsideRef } from '../../../../util';

@Component({
    standalone: true,
    selector: 'rtui-aside-panel',
    templateUrl: './aside-panel.component.html',
    styleUrls: ['./aside-panel.component.scss'],
    encapsulation: ViewEncapsulation.None,
    imports: [AsyncPipe, PortalModule],
    animations: [
        trigger('aside', [
            state('enter-left', style({ transform: 'none' })),
            transition('* => enter-left', [
                style({ transform: 'translateX(-100%)' }),
                animate('200ms ease-in', style({ transform: 'translateX(0%)' })),
            ]),
            transition('enter-left => *', animate('200ms ease-in', style({ transform: 'translateX(-100%)' }))),
            state('enter-right', style({ transform: 'none' })),
            transition('* => enter-right', [
                style({ transform: 'translateX(100%)' }),
                animate('200ms ease-in', style({ transform: 'translateX(0%)' })),
            ]),
            transition('enter-right => *', animate('200ms ease-in', style({ transform: 'translateX(100%)' }))),
        ]),
    ],
})
export class RtuiAsidePanelComponent {
    @HostBinding('@aside') private _state: string = `enter-${this.asideRef.position}`;

    public portal: ComponentPortal<unknown>;
    public position: AsidePositions;
    public isSmall$: Observable<boolean>;

    constructor(
        @Inject(ASIDE_REF) private readonly asideRef: AsideRef<object, object>,
        private readonly breakpointObserver: BreakpointObserver
    ) {
        this.portal = this.#createPortal(asideRef);
        this.position = this.asideRef.position;
        this.isSmall$ = this.breakpointObserver.observe(['(max-width: 1023px)']).pipe(map((result: BreakpointState) => result.matches));
    }

    public close(): void {
        this.asideRef.close();
    }

    public startExitAnimation(): void {
        this._state = `exit-${this.asideRef.position}`;
    }

    #createPortal<D, R>(asideRef: AsideRef<D, R>): ComponentPortal<unknown> {
        const injector: Injector = Injector.create({
            providers: [
                {
                    provide: ASIDE_REF,
                    useValue: asideRef,
                },
            ],
        });

        return new ComponentPortal(asideRef.component, null, injector);
    }
}
