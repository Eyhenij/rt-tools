import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtCalendarComponent } from '../../rt-calendar.component';
import { ERtCalendarDayState, IRtCalendar } from '../../rt-calendar.model';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TCalendarMatrixPart = 'dayState' | 'range' | 'months' | 'nav' | 'sublabels' | 'edges' | 'presets' | 'themes';

const WEEKDAYS: readonly string[] = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

/** Собирает день с заданным состоянием. */
function day(dayOfMonth: number, state: ERtCalendarDayState, sublabel: string = '', disabled: boolean = false): IRtCalendar.Day {
    return { key: `d-${dayOfMonth}`, dayOfMonth, sublabel, state, disabled };
}

/** Собирает месяц из тридцати дней, раздавая состояния функцией. */
function month(key: string, label: string, leading: number, pick: (index: number) => IRtCalendar.Day): IRtCalendar.Month {
    return {
        key,
        label,
        leadingBlanks: Array.from({ length: leading }, (_: unknown, index: number): number => index),
        days: Array.from({ length: 30 }, (_: unknown, index: number): IRtCalendar.Day => pick(index)),
    };
}

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
                <app-story-row caption="Состояние дня" slotWidth="20rem" [items]="dayStateMonths" [itemLabel]="monthLabel">
                    <ng-template let-item>
                        <rt-calendar [months]="[item]" [weekdayLabels]="weekdays" />
                    </ng-template>
                </app-story-row>
            }

            @case ('range') {
                <app-story-row caption="Отрезок дат" slotWidth="20rem" [items]="rangeMonths" [itemLabel]="monthLabel">
                    <ng-template let-item>
                        <rt-calendar [months]="[item]" [weekdayLabels]="weekdays" />
                    </ng-template>
                </app-story-row>
            }

            @case ('months') {
                <app-story-row caption="Сколько месяцев показано" [items]="monthCounts" [itemLabel]="countLabel">
                    <ng-template let-count>
                        <rt-calendar [months]="threeMonths.slice(0, count)" [weekdayLabels]="weekdays" />
                    </ng-template>
                </app-story-row>
            }

            @case ('nav') {
                <app-story-row caption="Стрелки месяцев" slotWidth="20rem" [items]="navCases" [itemLabel]="navLabel">
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
            }

            @case ('sublabels') {
                <app-story-row caption="Подписи под числами" slotWidth="20rem" [items]="sublabelCases" [itemLabel]="sublabelLabel">
                    <ng-template let-value>
                        <rt-calendar [months]="[pricedMonth]" [weekdayLabels]="weekdays" [sublabelsLoading]="value" />
                    </ng-template>
                </app-story-row>
            }

            @case ('edges') {
                <app-story-row caption="Края" slotWidth="20rem" [items]="edgeMonths" [itemLabel]="monthLabel">
                    <ng-template let-item>
                        <rt-calendar [months]="item === null ? [] : [item]" [weekdayLabels]="weekdays" />
                    </ng-template>
                </app-story-row>
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
                <app-story-themes caption="Календарь в обеих темах">
                    <ng-template>
                        <div style="width: 20rem">
                            <rt-calendar [months]="[mixedMonth]" [weekdayLabels]="weekdays" />
                        </div>
                    </ng-template>
                </app-story-themes>
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

    public readonly weekdays: readonly string[] = WEEKDAYS;

    public readonly plainMonth: IRtCalendar.Month = month('plain', 'Март 2026', 2, (index: number): IRtCalendar.Day =>
        day(index + 1, ERtCalendarDayState.Free)
    );

    /** Состояния показаны целым месяцем: соседние дни различаются только рядом друг с другом. */
    public readonly mixedMonth: IRtCalendar.Month = month('mixed', 'Март 2026', 2, (index: number): IRtCalendar.Day => {
        const states: readonly ERtCalendarDayState[] = [
            ERtCalendarDayState.Past,
            ERtCalendarDayState.Free,
            ERtCalendarDayState.Busy,
            ERtCalendarDayState.Blocked,
        ];
        const state: ERtCalendarDayState = states[index % states.length];
        return day(index + 1, state, '', state === ERtCalendarDayState.Blocked);
    });

    public readonly dayStateMonths: readonly IRtCalendar.Month[] = [
        month('free', 'Всё свободно', 2, (index: number): IRtCalendar.Day => day(index + 1, ERtCalendarDayState.Free)),
        month('busy', 'Всё занято', 2, (index: number): IRtCalendar.Day => day(index + 1, ERtCalendarDayState.Busy)),
        month('past', 'Прошедшие дни', 2, (index: number): IRtCalendar.Day => day(index + 1, ERtCalendarDayState.Past)),
        month('mix', 'Вперемешку', 2, (index: number): IRtCalendar.Day => {
            const states: readonly ERtCalendarDayState[] = [
                ERtCalendarDayState.Past,
                ERtCalendarDayState.Free,
                ERtCalendarDayState.Busy,
                ERtCalendarDayState.Blocked,
            ];
            const state: ERtCalendarDayState = states[index % states.length];
            return day(index + 1, state, '', state === ERtCalendarDayState.Blocked);
        }),
    ];

    /** Начало, середина и конец отрезка вне самого отрезка не читаются — поэтому он показан целиком. */
    public readonly rangeMonths: readonly IRtCalendar.Month[] = [
        month('range', 'Отрезок 8–14', 2, (index: number): IRtCalendar.Day => {
            const dayOfMonth: number = index + 1;
            if (dayOfMonth === 8) {
                return day(dayOfMonth, ERtCalendarDayState.Start);
            }
            if (dayOfMonth === 14) {
                return day(dayOfMonth, ERtCalendarDayState.End);
            }
            if (dayOfMonth > 8 && dayOfMonth < 14) {
                return day(dayOfMonth, ERtCalendarDayState.InRange);
            }
            return day(dayOfMonth, ERtCalendarDayState.Free);
        }),
        month('one-day', 'Отрезок из одного дня', 2, (index: number): IRtCalendar.Day =>
            index + 1 === 8 ? day(8, ERtCalendarDayState.Start) : day(index + 1, ERtCalendarDayState.Free)
        ),
    ];

    public readonly pricedMonth: IRtCalendar.Month = month('priced', 'С ценами', 2, (index: number): IRtCalendar.Day =>
        day(index + 1, ERtCalendarDayState.Free, `${4 + (index % 3)} ₽`)
    );

    public readonly threeMonths: readonly IRtCalendar.Month[] = [
        month('m1', 'Март 2026', 2, (index: number): IRtCalendar.Day => day(index + 1, ERtCalendarDayState.Free)),
        month('m2', 'Апрель 2026', 5, (index: number): IRtCalendar.Day => day(index + 1, ERtCalendarDayState.Free)),
        month('m3', 'Май 2026', 0, (index: number): IRtCalendar.Day => day(index + 1, ERtCalendarDayState.Busy)),
    ];

    public readonly edgeMonths: readonly (IRtCalendar.Month | null)[] = [
        null,
        month('no-lead', 'Без пустых клеток', 0, (index: number): IRtCalendar.Day => day(index + 1, ERtCalendarDayState.Free)),
        month('six-lead', 'Шесть пустых клеток', 6, (index: number): IRtCalendar.Day => day(index + 1, ERtCalendarDayState.Free)),
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
