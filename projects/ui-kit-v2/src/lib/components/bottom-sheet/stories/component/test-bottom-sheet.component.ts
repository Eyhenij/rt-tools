import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtBottomSheetComponent } from '../../rt-bottom-sheet.component';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-bottom-sheet',
    template: `
        <rt-bottom-sheet [open]="open" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtBottomSheetComponent,
    ],
})
export class TestRtBottomSheetComponent {
    public open: boolean = false;
}
