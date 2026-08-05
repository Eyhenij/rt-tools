import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtToastComponent } from '../../rt-toast.component';
import { IRtToaster } from '../../rt-toaster.model';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-toast',
    template: `
        <rt-toast
            [toast]="toast"
            [index]="index"
            [totalToasts]="totalToasts"
            [heights]="heights"
            [expanded]="expanded"
            [expandByDefault]="expandByDefault"
            [interacting]="interacting"
            [position]="position"
            [visibleToasts]="visibleToasts"
            [duration]="duration" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtToastComponent,
    ],
})
export class TestRtToastComponent {
    public toast: IRtToaster.Toast = { id: 1, severity: 'info', message: 'Сообщение' };
    public index: number = 0;
    public totalToasts: number = 0;
    public heights: IRtToaster.Height[] = [];
    public expanded: boolean = false;
    public expandByDefault: boolean = false;
    public interacting: boolean = false;
    public position: IRtToaster.Position = 'bottom-right';
    public visibleToasts: number = 3;
    public duration: number = 4000;
}
