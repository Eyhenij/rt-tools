import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtCopyCellComponent } from '../../rt-copy-cell.component';
import { IRtIconButton } from '../../../../icon-button/rt-icon-button.model';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-copy-cell',
    template: `
        <rt-copy-cell [value]="value" [variant]="variant" [revealOnHover]="revealOnHover" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtCopyCellComponent,
    ],
})
export class TestRtCopyCellComponent {
    public value: string | number | null = null;
    public variant: IRtIconButton.Variant = 'ghost';
    public revealOnHover: boolean = true;
}
