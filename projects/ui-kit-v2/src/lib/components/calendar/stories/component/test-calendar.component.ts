import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtCalendarComponent } from '../../rt-calendar.component';
import { IRtCalendar } from '../../rt-calendar.model';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-calendar',
    template: `
        <rt-calendar
            [months]="months"
            [weekdayLabels]="weekdayLabels"
            [canPrev]="canPrev"
            [canNext]="canNext"
            [prevAriaLabel]="prevAriaLabel"
            [nextAriaLabel]="nextAriaLabel"
            [sublabelsLoading]="sublabelsLoading" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtCalendarComponent,
    ],
})
export class TestRtCalendarComponent {
    public months: readonly IRtCalendar.Month[] = [];
    public weekdayLabels: readonly string[] = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'];
    public canPrev: boolean = false;
    public canNext: boolean = false;
    public prevAriaLabel: string = '';
    public nextAriaLabel: string = '';
    public sublabelsLoading: boolean = false;
}
