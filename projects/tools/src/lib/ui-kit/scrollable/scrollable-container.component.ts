import { ChangeDetectionStrategy, Component } from '@angular/core';

import { BlockDirective, ElemDirective } from '../../bem';

@Component({
    standalone: true,
    selector: 'rtui-scrollable',
    templateUrl: './scrollable-container.component.html',
    styleUrls: ['./scrollable-container.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [BlockDirective, ElemDirective],
})
export class RtuiScrollableContainerComponent {}
