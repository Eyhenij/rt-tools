import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtChartComponent } from '../../rt-chart.component';
import { IRtChart } from '../../rt-chart.model';
import { CHART_CASES } from './chart.fixture';

/**
 * Обёртка `rt-chart` для `Playground`: данные и высота — простые поля, к ним привязаны контролы.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-chart',
    templateUrl: './test-chart.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtChartComponent,
    ],
})
export class TestRtChartComponent {
    public data: IRtChart.TData = CHART_CASES[0].data;
    public height: string = '188px';
}
