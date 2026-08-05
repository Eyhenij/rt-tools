import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtToasterComponent } from '../../rt-toaster.component';
import { IRtToaster } from '../../rt-toaster.model';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-toaster',
    template: `
        <rt-toaster [position]="position" [duration]="duration" [visibleToasts]="visibleToasts" [expand]="expand" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtToasterComponent,
    ],
})
export class TestRtToasterComponent {
    public position: IRtToaster.Position = 'bottom-right';
    public duration: number = 4000;
    public visibleToasts: number = 3;
    public expand: boolean = false;
}
