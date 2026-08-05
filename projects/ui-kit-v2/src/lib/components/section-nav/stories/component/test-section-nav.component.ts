import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtSectionNavComponent } from '../../rt-section-nav.component';
import { IRtSectionNav } from '../../rt-section-nav.model';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-section-nav',
    template: `
        <rt-section-nav [items]="items" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtSectionNavComponent,
    ],
})
export class TestRtSectionNavComponent {
    public items: readonly IRtSectionNav.Item[] = [];
}
