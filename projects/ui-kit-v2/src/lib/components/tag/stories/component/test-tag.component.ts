import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtTagComponent } from '../../rt-tag.component';
import { IRtTag } from '../../rt-tag.model';
import { IRtIcon } from '../../../icon/rt-icon.model';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-tag',
    template: `
        <rt-tag
            [value]="value"
            [severity]="severity"
            [shape]="shape"
            [appearance]="appearance"
            [radius]="radius"
            [icon]="icon"
            [iconEnd]="iconEnd"
            [closable]="closable" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtTagComponent,
    ],
})
export class TestRtTagComponent {
    public value: string = 'Значение';
    public severity: IRtTag.Severity = 'neutral';
    public shape: IRtTag.Shape = 'pill';
    public appearance: IRtTag.Appearance = 'solid';
    public radius: IRtTag.Radius | null = null;
    public icon: IRtIcon.Name | null = null;
    public iconEnd: IRtIcon.Name | null = null;
    public closable: boolean = false;
}
