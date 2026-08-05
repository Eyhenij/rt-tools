import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtMenuItemComponent } from '../../rt-menu-item.component';
import { IRtIcon } from '../../../icon/rt-icon.model';
import { IRtMenu } from '../../rt-menu.model';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-menu-item',
    template: `
        <rt-menu-item
            [icon]="icon"
            [label]="label"
            [danger]="danger"
            [disabled]="disabled"
            [confirmMessage]="confirmMessage"
            [confirmTitle]="confirmTitle"
            [confirmLabel]="confirmLabel"
            [confirmCancelLabel]="confirmCancelLabel"
            [confirmTone]="confirmTone" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtMenuItemComponent,
    ],
})
export class TestRtMenuItemComponent {
    public icon: IRtIcon.Name | null = null;
    public label: string = 'Сохранить';
    public danger: boolean = false;
    public disabled: boolean = false;
    public confirmMessage: string = '';
    public confirmTitle: string | null = null;
    public confirmLabel: string = 'Подтвердить';
    public confirmCancelLabel: string = '';
    public confirmTone: IRtMenu.ConfirmTone = 'danger';
}
