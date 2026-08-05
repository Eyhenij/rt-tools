import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtAsideSectionComponent } from '../../rt-aside-section.component';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-aside-section',
    template: `
        <rt-aside-section [heading]="heading" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtAsideSectionComponent,
    ],
})
export class TestRtAsideSectionComponent {
    public heading: string | null = 'Заголовок';
}
