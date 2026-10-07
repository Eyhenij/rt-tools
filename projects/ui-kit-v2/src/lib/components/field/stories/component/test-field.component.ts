import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { RtInputComponent } from '../../../input/rt-input.component';

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
            [required]="required"
            [hideRequiredMark]="hideRequiredMark"
            [reserveHintSpace]="reserveHintSpace"
            [errors]="errors">
            <rt-input [(ngModel)]="value" />
        </rt-field>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtFieldComponent,
        RtInputComponent,
        // modules
        FormsModule,
    ],
})
export class TestRtFieldComponent {
    public label: string = 'Сохранить';
    public hint: string = 'Подсказка';
    public help: string = '';
    public readonly: boolean = false;
    public loading: boolean = false;
    /** Шаблонная форма валидатора не кладёт: обязательность объявляет само поле. */
    public required: boolean = false;
    public value: string = '';
    public hideRequiredMark: boolean = false;
    public reserveHintSpace: boolean = false;
    public errors: IRtField.ErrorMessages = {};
}
