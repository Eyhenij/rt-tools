import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtIconButtonComponent } from '../../rt-icon-button.component';
import { IRtIcon } from '../../../icon/rt-icon.model';
import { IRtIconButton } from '../../rt-icon-button.model';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-icon-button',
    template: `
        <rt-icon-button
            [icon]="icon"
            [ariaLabel]="ariaLabel"
            [variant]="variant"
            [iconColor]="iconColor"
            [size]="size"
            [iconSize]="iconSize"
            [shape]="shape"
            [type]="type"
            [tooltip]="tooltip"
            [tabIndex]="tabIndex"
            [loading]="loading"
            [disabled]="disabled"
            [active]="active"
            [indicator]="indicator" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtIconButtonComponent,
    ],
})
export class TestRtIconButtonComponent {
    public icon: IRtIcon.Name = 'alarm-clock';
    public ariaLabel: string = '';
    public variant: IRtIconButton.Variant = 'ghost';
    public iconColor: IRtIcon.Color = 'current';
    public size: IRtIconButton.Size = 'md';
    public iconSize: IRtIcon.Size | null = null;
    public shape: IRtIconButton.Shape = 'square';
    public type: IRtIconButton.Type = 'button';
    public tooltip: string = '';
    public tabIndex: number = 0;
    public loading: boolean = false;
    public disabled: boolean = false;
    public active: boolean = false;
    public indicator: boolean = false;
}
