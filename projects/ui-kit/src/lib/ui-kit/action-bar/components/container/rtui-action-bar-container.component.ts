/* eslint-disable sonarjs/deprecation -- @angular/animations объявлен устаревшим целиком; переезд на переходы средствами стилей идёт задачей RT-843 */
import { animate, keyframes, state, style, transition, trigger } from '@angular/animations';
import { Component, inject, Signal, ChangeDetectionStrategy } from '@angular/core';

import { IRtActionBar } from '../../action-bar-config.interface';
import { RtActionBarService } from '../../rt-action-bar.service';
import { RtuiActionBarComponent } from '../bar/rtui-action-bar.component';

const BEM_BLOCK: string = 'rtui-action-bar-container';

/** Конечное положение панели действий: она стоит на своём месте. */
const AT_REST: string = 'translateY(0)';

/** Начальное и конечное положение: панель убрана за нижнюю кромку экрана. */
const BELOW_SCREEN: string = 'translateY(100%)';

/** Проскок выше места: он и делает выезд живым, а не равномерным. */
const OVERSHOT: string = 'translateY(-15px)';

@Component({
    selector: 'rtui-action-bar-container',
    host: { class: BEM_BLOCK },
    templateUrl: 'rtui-action-bar-container.component.html',
    styleUrls: ['rtui-action-bar-container.component.scss'],
    imports: [RtuiActionBarComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [
        trigger('barState', [
            state('opened', style({ transform: AT_REST })),
            transition('void => *', [
                animate(
                    300,
                    keyframes([
                        style({ opacity: 0, transform: BELOW_SCREEN, offset: 0 }),
                        style({ opacity: 1, transform: OVERSHOT, offset: 0.3 }),
                        style({ opacity: 1, transform: AT_REST, offset: 1.0 }),
                    ])
                ),
            ]),
            transition('* => void', [
                animate(
                    300,
                    keyframes([
                        style({ opacity: 1, transform: AT_REST, offset: 0 }),
                        style({ opacity: 1, transform: OVERSHOT, offset: 0.7 }),
                        style({ opacity: 0, transform: BELOW_SCREEN, offset: 1.0 }),
                    ])
                ),
            ]),
        ]),
    ],
})
export class RtuiActionBarContainerComponent {
    readonly #actionBarService: RtActionBarService = inject(RtActionBarService);

    public readonly config: Signal<IRtActionBar.Config> = this.#actionBarService.config;

    public closeBar(): void {
        this.#actionBarService.closeActionBar();
    }
}
