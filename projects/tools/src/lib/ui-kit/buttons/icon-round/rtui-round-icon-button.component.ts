import { ChangeDetectionStrategy, Component, input, InputSignal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

import { BlockDirective, ElemDirective } from '../../../bem';

@Component({
    selector: 'rtui-round-icon-button',
    templateUrl: './rtui-round-icon-button.component.html',
    styleUrls: ['./rtui-round-icon-button.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        MatIcon,

        // bem
        BlockDirective,
        ElemDirective,
    ],
})
export class RtuiRoundIconButtonComponent {
    public icon: InputSignal<string> = input.required<string>();
}
