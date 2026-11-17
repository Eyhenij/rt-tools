import { ChangeDetectionStrategy, Component } from '@angular/core';
import type { EChartsCoreOption } from 'echarts/core';

import { RtChartComponent } from '../../rt-chart.component';
import { CHART_CASES } from './chart.fixture';

/**
 * Обёртка `rt-chart` для `Playground`: опция и высота — простые поля, к ним привязаны контролы.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-chart',
    template: `
        <div style="width: 28rem">
            <rt-chart [option]="option" [height]="height" />
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtChartComponent,
    ],
})
export class TestRtChartComponent {
    public option: EChartsCoreOption = CHART_CASES[0].option ?? {};
    public height: string = '320px';
}
