import { ChangeDetectionStrategy, Component } from '@angular/core';

import { IRtSelect } from '../../../select/rt-select.model';
import { RtMultiselectComponent } from '../../rt-multiselect.component';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-multiselect',
    template: `
        <rt-multiselect ariaLabel="Города" [options]="options" [placeholder]="placeholder" [maxChips]="maxChips" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtMultiselectComponent,
    ],
})
export class TestRtMultiselectComponent {
    /**
     * Набор опций — правдоподобный, а не пустой: с пустым история рисовала строку «нет
     * вариантов», то есть показывала отсутствие компонента вместо компонента.
     */
    public options: ReadonlyArray<IRtSelect.Option<string>> = [
        { label: 'Москва', value: 'msk' },
        { label: 'Санкт-Петербург', value: 'spb' },
        { label: 'Новосибирск', value: 'nsk' },
        { label: 'Казань', value: 'kzn' },
        { label: 'Владивосток', value: 'vvo', disabled: true },
    ];
    public placeholder: string = 'Выберите города';
    public maxChips: number = 3;
}
