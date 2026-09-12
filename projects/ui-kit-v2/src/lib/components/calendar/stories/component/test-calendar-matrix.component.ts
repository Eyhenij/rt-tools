import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtCalendarComponent } from '../../rt-calendar.component';
import { ERtCalendarDayState, IRtCalendar } from '../../rt-calendar.model';
import { CALENDAR_WEEKDAYS, calendarDay, calendarMonth } from './calendar.fixture';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TCalendarMatrixPart = 'dayState' | 'range' | 'months' | 'nav' | 'sublabels' | 'edges' | 'presets' | 'themes';

/**
 * Матрицы состояний `rt-calendar` для витрины.
 *
 * **Календарь ничего не считает.** Раскладку месяца готовит потребитель: сколько пустых клеток
 * в начале, какие дни заняты, что писать под числом, какие недоступны. Поэтому осью значений
 * служит состояние дня, а показывать его надо целым месяцем: состояния соседних дней
 * различаются только рядом, а `start`, `in-range` и `end` вне отрезка вообще не читаются.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-calendar-matrix',
    template: `
        @switch (part) {
            @case ('dayState') {
                <app-story-presets caption="Состояние дня в обоих наборах">
                    <ng-template>
                        <app-story-row slotWidth="20rem" [items]="dayStateMonths" [itemLabel]="monthLabel">
                            <ng-template let-item>
                                <rt-calendar [months]="[item]" [weekdayLabels]="weekdays" />
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('range') {
                <app-story-presets caption="Отрезок дат в обоих наборах">
                    <ng-template>
                        <app-story-row slotWidth="20rem" [items]="rangeMonths" [itemLabel]="monthLabel">
                            <ng-template let-item>
                                <rt-calendar [months]="[item]" [weekdayLabels]="weekdays" />
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('months') {
                <app-story-presets caption="Сколько месяцев показано в обоих наборах">
                    <ng-template>
                        <app-story-row [items]="monthCounts" [itemLabel]="countLabel">
                            <ng-template let-count>
                                <rt-calendar [months]="threeMonths.slice(0, count)" [weekdayLabels]="weekdays" />
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('nav') {
                <app-story-presets caption="Стрелки месяцев в обоих наборах">
                    <ng-template>
                        <app-story-row slotWidth="20rem" [items]="navCases" [itemLabel]="navLabel">
                            <ng-template let-item>
                                <rt-calendar
                                    prevAriaLabel="Предыдущий месяц"
                                    nextAriaLabel="Следующий месяц"
                                    [months]="[plainMonth]"
                                    [weekdayLabels]="weekdays"
                                    [canPrev]="item.prev"
                                    [canNext]="item.next" />
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('sublabels') {
                <app-story-presets caption="Подписи под числами в обоих наборах">
                    <ng-template>
                        <app-story-row slotWidth="20rem" [items]="sublabelCases" [itemLabel]="sublabelLabel">
                            <ng-template let-value>
                                <rt-calendar [months]="[pricedMonth]" [weekdayLabels]="weekdays" [sublabelsLoading]="value" />
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('edges') {
                <app-story-presets caption="Края в обоих наборах">
                    <ng-template>
                        <app-story-row slotWidth="20rem" [items]="edgeMonths" [itemLabel]="monthLabel">
                            <ng-template let-item>
                                <rt-calendar [months]="item === null ? [] : [item]" [weekdayLabels]="weekdays" />
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('presets') {
                <app-story-presets caption="Календарь в обоих наборах">
                    <ng-template>
                        <div style="width: 20rem">
                            <rt-calendar [months]="[mixedMonth]" [weekdayLabels]="weekdays" />
                        </div>
                    </ng-template>
                </app-story-presets>
            }

            @case ('themes') {
                <app-story-presets caption="Календарь в обеих темах в обоих наборах">
                    <ng-template>
                        <app-story-themes>
                            <ng-template>
                                <div style="width: 20rem">
                                    <rt-calendar [months]="[mixedMonth]" [weekdayLabels]="weekdays" />
                                </div>
                            </ng-template>
                        </app-story-themes>
                    </ng-template>
                </app-story-presets>
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtCalendarComponent,

        // showcase
        StoryPresetsComponent,
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtCalendarMatrixComponent {
    public part: TCalendarMatrixPart = 'dayState';

    public readonly weekdays: readonly string[] = CALENDAR_WEEKDAYS;

    public readonly plainMonth: IRtCalendar.Month = calendarMonth('plain', 'Март 2026', 2, (index: number): IRtCalendar.Day =>
        calendarDay(index + 1, ERtCalendarDayState.Free)
    );

    /** Состояния показаны целым месяцем: соседние дни различаются только рядом друг с другом. */
    public readonly mixedMonth: IRtCalendar.Month = calendarMonth('mixed', 'Март 2026', 2, (index: number): IRtCalendar.Day => {
        const states: readonly ERtCalendarDayState[] = [
            ERtCalendarDayState.Past,
            ERtCalendarDayState.Free,
            ERtCalendarDayState.Busy,
            ERtCalendarDayState.Blocked,
        ];
        const state: ERtCalendarDayState = states[index % states.length];
        return calendarDay(index + 1, state, '', state === ERtCalendarDayState.Blocked);
    });

    public readonly dayStateMonths: readonly IRtCalendar.Month[] = [
        calendarMonth('free', 'Всё свободно', 2, (index: number): IRtCalendar.Day => calendarDay(index + 1, ERtCalendarDayState.Free)),
        calendarMonth('busy', 'Всё занято', 2, (index: number): IRtCalendar.Day => calendarDay(index + 1, ERtCalendarDayState.Busy)),
        calendarMonth('past', 'Прошедшие дни', 2, (index: number): IRtCalendar.Day => calendarDay(index + 1, ERtCalendarDayState.Past)),
        calendarMonth('mix', 'Вперемешку', 2, (index: number): IRtCalendar.Day => {
            const states: readonly ERtCalendarDayState[] = [
                ERtCalendarDayState.Past,
                ERtCalendarDayState.Free,
                ERtCalendarDayState.Busy,
                ERtCalendarDayState.Blocked,
            ];
            const state: ERtCalendarDayState = states[index % states.length];
            return calendarDay(index + 1, state, '', state === ERtCalendarDayState.Blocked);
        }),
    ];

    /** Начало, середина и конец отрезка вне самого отрезка не читаются — поэтому он показан целиком. */
    public readonly rangeMonths: readonly IRtCalendar.Month[] = [
        calendarMonth('range', 'Отрезок 8–14', 2, (index: number): IRtCalendar.Day => {
            const dayOfMonth: number = index + 1;
            if (dayOfMonth === 8) {
                return calendarDay(dayOfMonth, ERtCalendarDayState.Start);
            }
            if (dayOfMonth === 14) {
                return calendarDay(dayOfMonth, ERtCalendarDayState.End);
            }
            if (dayOfMonth > 8 && dayOfMonth < 14) {
                return calendarDay(dayOfMonth, ERtCalendarDayState.InRange);
            }
            return calendarDay(dayOfMonth, ERtCalendarDayState.Free);
        }),
        calendarMonth('one-day', 'Отрезок из одного дня', 2, (index: number): IRtCalendar.Day =>
            index + 1 === 8 ? calendarDay(8, ERtCalendarDayState.Start) : calendarDay(index + 1, ERtCalendarDayState.Free)
        ),
    ];

    public readonly pricedMonth: IRtCalendar.Month = calendarMonth('priced', 'С ценами', 2, (index: number): IRtCalendar.Day =>
        calendarDay(index + 1, ERtCalendarDayState.Free, `${4 + (index % 3)} ₽`)
    );

    public readonly threeMonths: readonly IRtCalendar.Month[] = [
        calendarMonth('m1', 'Март 2026', 2, (index: number): IRtCalendar.Day => calendarDay(index + 1, ERtCalendarDayState.Free)),
        calendarMonth('m2', 'Апрель 2026', 5, (index: number): IRtCalendar.Day => calendarDay(index + 1, ERtCalendarDayState.Free)),
        calendarMonth('m3', 'Май 2026', 0, (index: number): IRtCalendar.Day => calendarDay(index + 1, ERtCalendarDayState.Busy)),
    ];

    public readonly edgeMonths: readonly (IRtCalendar.Month | null)[] = [
        null,
        calendarMonth('no-lead', 'Без пустых клеток', 0, (index: number): IRtCalendar.Day =>
            calendarDay(index + 1, ERtCalendarDayState.Free)
        ),
        calendarMonth('six-lead', 'Шесть пустых клеток', 6, (index: number): IRtCalendar.Day =>
            calendarDay(index + 1, ERtCalendarDayState.Free)
        ),
        {
            key: 'empty-days',
            label: 'Месяц без дней',
            leadingBlanks: [],
            days: [],
        },
    ];

    public readonly monthCounts: readonly number[] = [1, 2, 3];
    public readonly navCases: readonly { prev: boolean; next: boolean }[] = [
        { prev: true, next: true },
        { prev: false, next: true },
        { prev: true, next: false },
        { prev: false, next: false },
    ];
    public readonly sublabelCases: readonly boolean[] = [false, true];

    public readonly monthLabel: (value: IRtCalendar.Month | null) => string = (value: IRtCalendar.Month | null): string =>
        value === null ? 'ни одного месяца' : value.label;

    public readonly countLabel: (value: number) => string = (value: number): string => `${value} мес.`;

    public readonly navLabel: (value: { prev: boolean; next: boolean }) => string = (value: { prev: boolean; next: boolean }): string => {
        if (value.prev && value.next) {
            return 'обе стрелки';
        }

        if (value.prev) {
            return 'только назад';
        }

        return value.next ? 'только вперёд' : 'обе выключены';
    };

    public readonly sublabelLabel: (value: boolean) => string = (value: boolean): string =>
        value ? 'подписи грузятся' : 'подписи на месте';
}
