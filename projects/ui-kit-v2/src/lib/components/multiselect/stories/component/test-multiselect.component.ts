import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtMultiselectComponent } from '../../rt-multiselect.component';
import { IRtSelect } from '../../../select/rt-select.model';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-multiselect',
    template: `
        <rt-multiselect [options]="options" [placeholder]="placeholder" [maxChips]="maxChips" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtMultiselectComponent,
    ],
})
export class TestRtMultiselectComponent {
    public options: ReadonlyArray<IRtSelect.Option<string>> = [];
    public placeholder: string = 'Введите значение';
    public maxChips: number = 3;
}
