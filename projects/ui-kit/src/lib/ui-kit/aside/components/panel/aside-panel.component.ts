import { animate, state, style, transition, trigger } from '@angular/animations';
import { ComponentPortal } from '@angular/cdk/portal';
import { PortalModule } from '@angular/cdk/portal';
import { Component, HostBinding, inject, Injector, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';

import { BlockDirective } from '@rt-tools/core';
import { ASIDE_REF, AsidePositions, AsideRef } from '../../aside.types';

const BEM_BLOCK: string = 'rtui-aside-panel';

@Component({
    selector: 'rtui-aside-panel',
    host: { class: BEM_BLOCK },
    templateUrl: './aside-panel.component.html',
    styleUrls: ['./aside-panel.component.scss'],
    encapsulation: ViewEncapsulation.None,
    imports: [PortalModule, BlockDirective],
    changeDetection: ChangeDetectionStrategy.Eager,
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
    readonly #asideRef: AsideRef<object, object> = inject(ASIDE_REF);

    @HostBinding('@aside') protected _state: string = `enter-${this.#asideRef.position}`;

    public portal: ComponentPortal<unknown> = this.#createPortal(this.#asideRef);
    public position: AsidePositions = this.#asideRef.position;

    public close(): void {
        this.#asideRef.close();
    }

    public startExitAnimation(): void {
        this._state = `exit-${this.#asideRef.position}`;
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
