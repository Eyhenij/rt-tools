import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtNightGridComponent } from '../../rt-night-grid.component';
import { IRtNightGrid } from '../../rt-night-grid.model';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-night-grid',
    template: `
        <rt-night-grid [cells]="cells" [ariaLabel]="ariaLabel" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtNightGridComponent,
    ],
})
export class TestRtNightGridComponent {
    public cells: ReadonlyArray<IRtNightGrid.Cell> = [];
    public ariaLabel: string = '';
}
