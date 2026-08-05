import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtIconComponent } from '../../rt-icon.component';
import { IRtIcon } from '../../rt-icon.model';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-icon',
    template: `
        <rt-icon [name]="name" [size]="size" [color]="color" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtIconComponent,
    ],
})
export class TestRtIconComponent {
    public name: IRtIcon.Name = 'alarm-clock';
    public size: IRtIcon.Size = 'md';
    public color: IRtIcon.Color = 'current';
}
