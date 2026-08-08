import { animate, keyframes, state, style, transition, trigger } from '@angular/animations';
import { Component, inject, Signal, ChangeDetectionStrategy } from '@angular/core';

import { IRtActionBar } from '../../action-bar-config.interface';
import { RtActionBarService } from '../../rt-action-bar.service';
import { RtuiActionBarComponent } from '../bar/rtui-action-bar.component';

const BEM_BLOCK: string = 'rtui-action-bar-container';

@Component({
    selector: 'rtui-action-bar-container',
    host: { class: BEM_BLOCK },
    templateUrl: 'rtui-action-bar-container.component.html',
    styleUrls: ['rtui-action-bar-container.component.scss'],
    imports: [RtuiActionBarComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [
        trigger('barState', [
            state('opened', style({ transform: 'translateY(0)' })),
            transition('void => *', [
                animate(
                    300,
                    keyframes([
                        style({ opacity: 0, transform: 'translateY(100%)', offset: 0 }),
                        style({ opacity: 1, transform: 'translateY(-15px)', offset: 0.3 }),
                        style({ opacity: 1, transform: 'translateY(0)', offset: 1.0 }),
                    ])
                ),
            ]),
            transition('* => void', [
                animate(
                    300,
                    keyframes([
                        style({ opacity: 1, transform: 'translateY(0)', offset: 0 }),
                        style({ opacity: 1, transform: 'translateY(-15px)', offset: 0.7 }),
                        style({ opacity: 0, transform: 'translateY(100%)', offset: 1.0 }),
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
