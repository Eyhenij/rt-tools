import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtDialogComponent } from '../../rt-dialog.component';
import { IRtDialogSize } from '../../rt-dialog.component';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-dialog',
    template: `
        <rt-dialog [size]="size" [width]="width" [ariaLabel]="ariaLabel" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtDialogComponent,
    ],
})
export class TestRtDialogComponent {
    public size: IRtDialogSize = 'md';
    public width: string | null = null;
    public ariaLabel: string | null = null;
}
