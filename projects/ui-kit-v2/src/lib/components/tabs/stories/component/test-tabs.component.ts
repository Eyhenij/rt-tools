import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtTabsComponent } from '../../rt-tabs.component';
import { IRtTabs } from '../../rt-tabs.model';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-tabs',
    template: `
        <rt-tabs [activeId]="activeId" [direction]="direction" [stretch]="stretch" [contentScrollable]="contentScrollable" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtTabsComponent,
    ],
})
export class TestRtTabsComponent {
    public activeId: IRtTabs.Id | null = null;
    public direction: IRtTabs.Direction = 'horizontal';
    public stretch: boolean = false;
    public contentScrollable: boolean = true;
}
