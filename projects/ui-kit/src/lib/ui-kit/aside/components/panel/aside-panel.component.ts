/* eslint-disable sonarjs/deprecation -- @angular/animations объявлен устаревшим целиком; переезд на переходы средствами стилей идёт задачей RT-843 */
import { animate, state, style, transition, trigger } from '@angular/animations';
import { ComponentPortal } from '@angular/cdk/portal';
import { PortalModule } from '@angular/cdk/portal';
import { ChangeDetectorRef, Component, HostBinding, inject, Injector, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';

import { BlockDirective } from '@rt-tools/core';
import { ASIDE_REF, TAsidePositions, AsideRef } from '../../aside.types';

const BEM_BLOCK: string = 'rtui-aside-panel';

/** Время и кривая выезда шторки — одни на обе стороны. */
const SLIDE_TIMING: string = '200ms ease-in';

/** Шторка убрана за левую кромку экрана. */
const OFF_SCREEN_LEFT: string = 'translateX(-100%)';

/** Шторка убрана за правую кромку экрана. */
const OFF_SCREEN_RIGHT: string = 'translateX(100%)';

/** Шторка на своём месте. */
const ON_SCREEN: string = 'translateX(0%)';

@Component({
    selector: 'rtui-aside-panel',
    host: { class: BEM_BLOCK },
    templateUrl: './aside-panel.component.html',
    styleUrls: ['./aside-panel.component.scss'],
    encapsulation: ViewEncapsulation.None,
    imports: [PortalModule, BlockDirective],
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [
        trigger('aside', [
            state('enter-left', style({ transform: 'none' })),
            transition('* => enter-left', [style({ transform: OFF_SCREEN_LEFT }), animate(SLIDE_TIMING, style({ transform: ON_SCREEN }))]),
            transition('enter-left => *', animate(SLIDE_TIMING, style({ transform: OFF_SCREEN_LEFT }))),
            state('enter-right', style({ transform: 'none' })),
            transition('* => enter-right', [
                style({ transform: OFF_SCREEN_RIGHT }),
                animate(SLIDE_TIMING, style({ transform: ON_SCREEN })),
            ]),
            transition('enter-right => *', animate(SLIDE_TIMING, style({ transform: OFF_SCREEN_RIGHT }))),
        ]),
    ],
})
export class RtuiAsidePanelComponent {
    readonly #asideRef: AsideRef<object, object> = inject(ASIDE_REF);
    readonly #changeDetectorRef: ChangeDetectorRef = inject(ChangeDetectorRef);

    @HostBinding('@aside') protected _state: string = `enter-${this.#asideRef.position}`;

    public portal: ComponentPortal<unknown> = this.#createPortal(this.#asideRef);
    public position: TAsidePositions = this.#asideRef.position;

    public close(): void {
        this.#asideRef.close();
    }

    public startExitAnimation(): void {
        this._state = `exit-${this.#asideRef.position}`;
        this.#changeDetectorRef.markForCheck();
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
