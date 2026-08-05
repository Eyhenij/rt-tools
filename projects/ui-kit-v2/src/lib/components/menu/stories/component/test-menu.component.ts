import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtMenuComponent } from '../../rt-menu.component';
import { IRtIcon } from '../../../icon/rt-icon.model';
import { IRtMenu } from '../../rt-menu.model';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-menu',
    template: `
        <rt-menu [icon]="icon" [ariaLabel]="ariaLabel" [align]="align" [disabled]="disabled" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtMenuComponent,
    ],
})
export class TestRtMenuComponent {
    public icon: IRtIcon.Name = 'ellipsis-h';
    public ariaLabel: string = '';
    public align: IRtMenu.Align = 'end';
    public disabled: boolean = false;
}
