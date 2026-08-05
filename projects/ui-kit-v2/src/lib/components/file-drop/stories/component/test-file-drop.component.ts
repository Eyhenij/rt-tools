import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtFileDropComponent } from '../../rt-file-drop.component';
import { IRtFileDrop } from '../../rt-file-drop.model';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-file-drop',
    template: `
        <rt-file-drop [disabled]="disabled" [overlayLabel]="overlayLabel" [zones]="zones" [accept]="accept" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtFileDropComponent,
    ],
})
export class TestRtFileDropComponent {
    public disabled: boolean = false;
    public overlayLabel: string = '';
    public zones: readonly IRtFileDrop.Zone[] = [];
    public accept: string = '';
}
