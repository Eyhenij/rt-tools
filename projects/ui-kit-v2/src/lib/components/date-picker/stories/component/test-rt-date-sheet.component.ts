import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { STORY_TRIGGER_ATTRIBUTE } from '../../../../../showcase/story-overlay';
import { RtDateRangeComponent } from '../../../date-range/rt-date-range.component';
import { IRtDateRange } from '../../../date-range/rt-date-range.model';
import { RtFieldComponent } from '../../../field/rt-field.component';
import { RtDatePickerComponent } from '../../rt-date-picker.component';
import { IRtDatePicker } from '../../rt-date-picker.model';

/**
 * Поле даты, времени или периода в рамке телефона: его шторку открывает кнопка в конце поля.
 * Заголовок шторки — подпись `rt-field`. Узкий ответ даёт история подменой службы точек перехода.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-date-sheet',
    templateUrl: './test-rt-date-sheet.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // Angular
        FormsModule,

        // components
        RtDatePickerComponent,
        RtDateRangeComponent,
        RtFieldComponent,
    ],
})
export class TestRtDateSheetComponent {
    public readonly triggerAttribute: string = STORY_TRIGGER_ATTRIBUTE;

    /** Что за поле стоит в рамке: дата, время, дата со временем или период. */
    public kind: IRtDatePicker.Type | 'range' | 'midnight' = 'time';

    public time: string = '09:30';
    /** Поле времени без значения: его барабан начинает со стартового времени. */
    public empty: string = '';
    public moment: string = '2026-09-27T09:30';
    public range: IRtDateRange.Value = { start: '2026-09-21', end: '2026-09-27' };
}
