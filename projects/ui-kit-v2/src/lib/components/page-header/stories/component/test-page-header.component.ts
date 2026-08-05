import { ChangeDetectionStrategy, Component, TemplateRef } from '@angular/core';

import { RtPageHeaderComponent } from '../../rt-page-header.component';
import { IRtPageHeader } from '../../rt-page-header.model';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-page-header',
    template: `
        <rt-page-header [items]="items" [user]="user" [userTitle]="userTitle" [userMenu]="userMenu" [ariaLabel]="ariaLabel" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtPageHeaderComponent,
    ],
})
export class TestRtPageHeaderComponent {
    public items: ReadonlyArray<IRtPageHeader.Item> = [];
    public user: IRtPageHeader.User | null = null;
    public userTitle: string = '';
    public userMenu: TemplateRef<unknown> | null = null;
    public ariaLabel: string = '';
}
