import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtTextareaComponent } from '../../rt-textarea.component';
import { IRtTextareaResize } from '../../rt-textarea.component';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-textarea',
    template: `
        <rt-textarea [placeholder]="placeholder" [readonly]="readonly" [rows]="rows" [resize]="resize" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtTextareaComponent,
    ],
})
export class TestRtTextareaComponent {
    public placeholder: string = 'Введите значение';
    public readonly: boolean = false;
    public rows: number = 3;
    public resize: IRtTextareaResize = 'vertical';
}
