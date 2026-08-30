import { ComponentPortal } from '@angular/cdk/portal';
import { PortalModule } from '@angular/cdk/portal';
import {
    ChangeDetectionStrategy,
    Component,
    Injector,
    Signal,
    ViewEncapsulation,
    WritableSignal,
    afterNextRender,
    inject,
    signal,
} from '@angular/core';

import { BlockDirective } from '@rt-tools/core';
import { ASIDE_REF, TAsidePositions, AsideRef } from '../../aside.types';

const BEM_BLOCK: string = 'rtui-aside-panel';

@Component({
    selector: 'rtui-aside-panel',
    host: {
        class: BEM_BLOCK,
        '[class.rtui-aside-panel--left]': "position === 'left'",
        '[class.rtui-aside-panel--right]': "position === 'right'",
        '[class.rtui-aside-panel--open]': 'opened()',
    },
    templateUrl: './aside-panel.component.html',
    styleUrls: ['./aside-panel.component.scss'],
    encapsulation: ViewEncapsulation.None,
    imports: [PortalModule, BlockDirective],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RtuiAsidePanelComponent {
    readonly #asideRef: AsideRef<object, object> = inject(ASIDE_REF);

    /**
     * Выехала ли шторка на своё место.
     *
     * Ложь стоит до первой отрисовки нарочно: переход считает путь от того, что браузер уже
     * нарисовал, и шторка, выставленная на место сразу, приехала бы без движения.
     */
    readonly #opened: WritableSignal<boolean> = signal(false);

    public readonly opened: Signal<boolean> = this.#opened.asReadonly();

    public portal: ComponentPortal<unknown> = this.#createPortal(this.#asideRef);
    public position: TAsidePositions = this.#asideRef.position;

    constructor() {
        afterNextRender(() => this.#opened.set(true));
    }

    public close(): void {
        this.#asideRef.close();
    }

    /**
     * Уход шторки за свою кромку.
     *
     * Ждать его конца компоненту нечем и не нужно: снимает шторку служба, и её отсчёт длиннее
     * времени ухода.
     */
    public startExitAnimation(): void {
        this.#opened.set(false);
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
