import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtSelectComponent } from '../../rt-select.component';
import { IRtSelect } from '../../rt-select.model';
import { IRtIcon } from '../../../icon/rt-icon.model';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-select',
    template: `
        <rt-select
            [options]="options"
            [placeholder]="placeholder"
            [iconLeft]="iconLeft"
            [filter]="filter"
            [filterPlaceholder]="filterPlaceholder" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtSelectComponent,
    ],
})
export class TestRtSelectComponent {
    public options: ReadonlyArray<IRtSelect.Option<string>> = [];
    public placeholder: string = 'Введите значение';
    public iconLeft: IRtIcon.Name | null = null;
    public filter: boolean = false;
    public filterPlaceholder: string = '';
}
