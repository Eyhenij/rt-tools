import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtToolbarLeftDirective } from '../../rt-toolbar.component';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-toolbar-left',
    template: `
        <div rtToolbarLeft [dense]="dense"></div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtToolbarLeftDirective,
    ],
})
export class TestRtToolbarLeftComponent {
    public dense: boolean = false;
}
