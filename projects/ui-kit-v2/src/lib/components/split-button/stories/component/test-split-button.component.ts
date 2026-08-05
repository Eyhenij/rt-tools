import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtSplitButtonComponent } from '../../rt-split-button.component';
import { IRtSplitButton } from '../../rt-split-button.model';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-split-button',
    template: `
        <rt-split-button
            [label]="label"
            [menuItems]="menuItems"
            [theme]="theme"
            [size]="size"
            [menuAriaLabel]="menuAriaLabel"
            [loading]="loading"
            [disabled]="disabled" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtSplitButtonComponent,
    ],
})
export class TestRtSplitButtonComponent {
    public label: string = 'Сохранить';
    public menuItems: readonly IRtSplitButton.MenuItem[] = [];
    public theme: IRtSplitButton.Theme = 'primary';
    public size: IRtSplitButton.Size = 'md';
    public menuAriaLabel: string = '';
    public loading: boolean = false;
    public disabled: boolean = false;
}
