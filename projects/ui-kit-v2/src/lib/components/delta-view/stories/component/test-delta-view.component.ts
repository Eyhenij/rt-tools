import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtDeltaViewComponent } from '../../rt-delta-view.component';
import { IQuillDelta } from '../../../../util/quill-delta.model';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-delta-view',
    template: `
        <rt-delta-view [delta]="delta" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtDeltaViewComponent,
    ],
})
export class TestRtDeltaViewComponent {
    public delta: IQuillDelta | null = null;
}
