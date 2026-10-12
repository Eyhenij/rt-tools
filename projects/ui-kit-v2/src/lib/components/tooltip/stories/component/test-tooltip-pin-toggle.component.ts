import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    input,
    InputSignalWithTransform,
    signal,
    WritableSignal,
} from '@angular/core';

import { RtIconButtonComponent } from '../../../icon-button/rt-icon-button.component';

/**
 * Переключатель «закрепить / открепить» со своим состоянием для истории `KeepOnClick`: у каждого
 * экземпляра пары наборов оно своё, иначе клик по одной половине переключал бы и вторую.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-tooltip-pin-toggle',
    templateUrl: './test-tooltip-pin-toggle.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtIconButtonComponent],
})
export class TestRtTooltipPinToggleComponent {
    protected readonly pinned: WritableSignal<boolean> = signal<boolean>(false);

    public readonly hideOnClick: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(true, {
        transform: booleanAttribute,
    });
}
