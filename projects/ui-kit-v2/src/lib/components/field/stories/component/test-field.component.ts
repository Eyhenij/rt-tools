import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtFieldComponent } from '../../rt-field.component';
import { IRtField } from '../../rt-field.model';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-field',
    template: `
        <rt-field
            [label]="label"
            [hint]="hint"
            [help]="help"
            [readonly]="readonly"
            [loading]="loading"
            [hideRequiredMark]="hideRequiredMark"
            [reserveHintSpace]="reserveHintSpace"
            [errors]="errors" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtFieldComponent,
    ],
})
export class TestRtFieldComponent {
    public label: string = 'Сохранить';
    public hint: string = 'Подсказка';
    public help: string = '';
    public readonly: boolean = false;
    public loading: boolean = false;
    public hideRequiredMark: boolean = false;
    public reserveHintSpace: boolean = false;
    public errors: IRtField.ErrorMessages = {};
}
