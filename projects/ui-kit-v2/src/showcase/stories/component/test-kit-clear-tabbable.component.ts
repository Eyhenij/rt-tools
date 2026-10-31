import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { RtAutocompleteComponent } from '../../../lib/components/autocomplete/rt-autocomplete.component';
import { RtDatePickerComponent } from '../../../lib/components/date-picker/rt-date-picker.component';
import { RtDateRangeComponent } from '../../../lib/components/date-range/rt-date-range.component';
import { IRtDateRange } from '../../../lib/components/date-range/rt-date-range.model';
import { RtInputNumberComponent } from '../../../lib/components/input-number/rt-input-number.component';
import { RtInputComponent } from '../../../lib/components/input/rt-input.component';
import { StoryPresetsComponent } from '../../story-presets.component';

/**
 * Демонстрационная обёртка для витрины: крестик очистки в обходе по Tab от умолчания кита.
 *
 * История поднята с настройками `{ formControl: { clearTabbable: true } }` — их объявляет декоратор
 * самой истории. Пять полей о Tab молчат и берут место крестика из настроек; их крестик показан в
 * фокусе, куда Tab из поля теперь и приходит. Шестое говорит `clearTabbable="false"` и перебивает
 * настройки: Tab идёт мимо, крестик в покое.
 *
 * Фокус нарисован признаком состояния, а не настоящим: в статичном кадре фокус бывает у одного узла,
 * а показать его нужно у пяти сразу.
 *
 * В пакет обёртка не уезжает: `tsconfig.lib.json` исключает `src/showcase/**`.
 */
@Component({
    selector: 'app-kit-clear-tabbable',
    templateUrl: './test-kit-clear-tabbable.component.html',
    styleUrl: './test-kit-clear-tabbable.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // angular
        ReactiveFormsModule,

        // components
        RtAutocompleteComponent,
        RtDatePickerComponent,
        RtDateRangeComponent,
        RtInputComponent,
        RtInputNumberComponent,
        StoryPresetsComponent,
    ],
})
export class TestRtKitClearTabbableComponent {
    public readonly cities: string[] = ['Москва', 'Казань'];
    public readonly text: FormControl<string | null> = new FormControl<string | null>('Анна');
    public readonly city: FormControl<string | null> = new FormControl<string | null>('Москва');
    public readonly amount: FormControl<number | null> = new FormControl<number | null>(1250);
    public readonly day: FormControl<string | null> = new FormControl<string | null>('2026-10-29');
    public readonly range: FormControl<IRtDateRange.Value | null> = new FormControl<IRtDateRange.Value | null>({
        start: '2026-10-01',
        end: '2026-10-29',
    });
    public readonly offText: FormControl<string | null> = new FormControl<string | null>('Анна');
}
