import { ChangeDetectionStrategy, Component } from '@angular/core';

import { IRtIcon } from '../../../icon/rt-icon.model';
import { RtSelectComponent } from '../../rt-select.component';
import { IRtSelect } from '../../rt-select.model';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-select',
    template: `
        <rt-select
            ariaLabel="Город"
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
    /**
     * Набор опций — правдоподобный, а не пустой: с пустым история рисовала строку «нет
     * вариантов», то есть показывала отсутствие компонента вместо компонента.
     */
    public options: ReadonlyArray<IRtSelect.Option<string>> = [
        { label: 'Москва', value: 'msk' },
        { label: 'Санкт-Петербург', value: 'spb' },
        { label: 'Новосибирск', value: 'nsk' },
        { label: 'Владивосток', value: 'vvo', disabled: true },
    ];
    public placeholder: string = 'Выберите город';
    public iconLeft: IRtIcon.Name | null = null;
    public filter: boolean = false;
    public filterPlaceholder: string = '';
}
