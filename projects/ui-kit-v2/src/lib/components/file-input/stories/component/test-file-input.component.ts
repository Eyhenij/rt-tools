import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtFileInputComponent } from '../../rt-file-input.component';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-file-input',
    template: `
        <rt-file-input [multiple]="multiple" [accept]="accept" [directory]="directory" [buttonLabel]="buttonLabel" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtFileInputComponent,
    ],
})
export class TestRtFileInputComponent {
    public multiple: boolean = false;
    public accept: string | null = null;
    public directory: boolean = false;
    public buttonLabel: string = '';
}
