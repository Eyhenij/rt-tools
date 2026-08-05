import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtNotificationsBellComponent } from '../../rt-notifications-bell.component';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-notifications-bell',
    template: `
        <rt-notifications-bell [unread]="unread" [ariaLabel]="ariaLabel" [unreadLabel]="unreadLabel" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtNotificationsBellComponent,
    ],
})
export class TestRtNotificationsBellComponent {
    public unread: boolean = false;
    public ariaLabel: string = '';
    public unreadLabel: string = '';
}
