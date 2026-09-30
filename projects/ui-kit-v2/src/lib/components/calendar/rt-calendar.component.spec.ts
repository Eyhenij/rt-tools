import { DebugElement } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture, el, hostClasses, qa, qaAll, textOf } from '../../../testing/rt-kit-testing';
import { ERtCalendarDayState, IRtCalendar } from './rt-calendar.model';
import { RtCalendarComponent } from './rt-calendar.component';

function day(dayOfMonth: number, patch: Partial<IRtCalendar.Day> = {}): IRtCalendar.Day {
    return {
        key: `2026-03-${String(dayOfMonth).padStart(2, '0')}`,
        dayOfMonth,
        sublabel: '12 000 ₽',
        state: ERtCalendarDayState.Free,
        disabled: false,
        ...patch,
    };
}

const MONTHS: ReadonlyArray<IRtCalendar.Month> = [
    {
        key: '2026-03',
        label: 'Март 2026',
        leadingBlanks: [0, 1],
        days: [day(1), day(2, { disabled: true, state: ERtCalendarDayState.Past })],
    },
];

const WEEKDAYS: ReadonlyArray<string> = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

function setup(inputs: Readonly<Record<string, unknown>> = {}): ComponentFixture<RtCalendarComponent> {
    return createRtFixture(RtCalendarComponent, { months: MONTHS, weekdayLabels: WEEKDAYS, ...inputs });
}

function days(fixture: ComponentFixture<RtCalendarComponent>): HTMLButtonElement[] {
    return qaAll(fixture, 'calendar-day').map((node: DebugElement): HTMLButtonElement => node.nativeElement as HTMLButtonElement);
}

function navButton(fixture: ComponentFixture<RtCalendarComponent>, id: string): HTMLButtonElement {
    return el(fixture, `[qa-dataid="${id}"] [qa-dataid="icon-button-control"]`)?.nativeElement as HTMLButtonElement;
}

describe('RtCalendarComponent', (): void => {
    it('несёт свой BEM-блок', (): void => {
        expect(hostClasses(setup())).toContain('rt-calendar');
    });

    it('месяцы и дни рисуются по переданной модели — календарь их не считает', (): void => {
        // Раскладку месяца (сколько пустых клеток в начале, какие дни заняты)
        // готовит потребитель: компонент только показывает готовое.
        const fixture: ComponentFixture<RtCalendarComponent> = setup();

        expect(textOf(qa(fixture, 'calendar-month-title'))).toBe('Март 2026');
        expect(days(fixture).length).toBe(2);
        expect(qaAll(fixture, 'calendar-weekday').map((node: DebugElement): string => textOf(node))).toEqual(WEEKDAYS);
    });

    it('пустые клетки начала месяца рисуются отдельно от дней', (): void => {
        const fixture: ComponentFixture<RtCalendarComponent> = setup();

        expect(qaAll(fixture, 'calendar-blank').length).toBe(2);
    });

    describe('день', (): void => {
        it('несёт свою дату и состояние атрибутами данных', (): void => {
            const fixture: ComponentFixture<RtCalendarComponent> = setup();

            expect(days(fixture)[0].getAttribute('data-iso')).toBe('2026-03-01');
            expect(days(fixture)[1].getAttribute('data-state')).toBe('past');
        });

        it('подпись под числом рисуется, когда задана', (): void => {
            expect(textOf(qa(setup(), 'calendar-day-price'))).toBe('12 000 ₽');
        });

        it('во время загрузки подписи подменяются заглушками', (): void => {
            const fixture: ComponentFixture<RtCalendarComponent> = setup({ sublabelsLoading: true });

            expect(qaAll(fixture, 'calendar-day-price-skeleton').length).toBe(2);
            expect(qa(fixture, 'calendar-day-price')).toBeNull();
        });

        it('день без подписи её и не рисует', (): void => {
            const fixture: ComponentFixture<RtCalendarComponent> = setup({
                months: [{ ...MONTHS[0], days: [day(1, { sublabel: '' })] }],
            });

            expect(qa(fixture, 'calendar-day-price')).toBeNull();
        });

        it('клик отдаёт целый день наружу', (): void => {
            const fixture: ComponentFixture<RtCalendarComponent> = setup();
            const picked: IRtCalendar.Day[] = [];
            fixture.componentInstance.dayClick.subscribe((value: IRtCalendar.Day): void => {
                picked.push(value);
            });

            days(fixture)[0].click();
            fixture.detectChanges();

            expect(picked[0].key).toBe('2026-03-01');
        });

        it('недоступный день не выбирается', (): void => {
            const fixture: ComponentFixture<RtCalendarComponent> = setup();
            const picked: jest.Mock = jest.fn();
            fixture.componentInstance.dayClick.subscribe(picked);

            expect(days(fixture)[1].disabled).toBe(true);
            days(fixture)[1].dispatchEvent(new MouseEvent('click', { bubbles: true }));
            fixture.detectChanges();

            expect(picked).not.toHaveBeenCalled();
        });
    });

    it('SC-UKV-472 — наведение отдаёт день наружу, уход с месяцев — пусто, выключенный день молчит', (): void => {
        const fixture: ComponentFixture<RtCalendarComponent> = setup();
        const hovered: (string | null)[] = [];
        fixture.componentInstance.dayHover.subscribe((value: IRtCalendar.Day | null): void => {
            hovered.push(value?.key ?? null);
        });

        days(fixture)[0].dispatchEvent(new MouseEvent('mouseenter'));
        days(fixture)[1].dispatchEvent(new MouseEvent('mouseenter'));
        qa(fixture, 'calendar-months')?.nativeElement.dispatchEvent(new MouseEvent('mouseleave'));

        expect(hovered).toEqual(['2026-03-01', null]);
    });

    describe('переключение месяцев', (): void => {
        it('без разрешения стрелки отключены', (): void => {
            const fixture: ComponentFixture<RtCalendarComponent> = setup();

            expect(navButton(fixture, 'calendar-prev-month').disabled).toBe(true);
            expect(navButton(fixture, 'calendar-next-month').disabled).toBe(true);
        });

        it('разрешение включает нужную стрелку', (): void => {
            const fixture: ComponentFixture<RtCalendarComponent> = setup({ canNext: true });

            expect(navButton(fixture, 'calendar-next-month').disabled).toBe(false);
            expect(navButton(fixture, 'calendar-prev-month').disabled).toBe(true);
        });

        it('нажатие просит показать соседний месяц', (): void => {
            const fixture: ComponentFixture<RtCalendarComponent> = setup({ canNext: true });
            const nexts: jest.Mock = jest.fn();
            fixture.componentInstance.nextMonth.subscribe(nexts);

            navButton(fixture, 'calendar-next-month').click();
            fixture.detectChanges();

            expect(nexts).toHaveBeenCalledTimes(1);
        });

        it('подписи стрелок задаёт приложение — своих слов у календаря здесь нет', (): void => {
            const fixture: ComponentFixture<RtCalendarComponent> = setup({ prevAriaLabel: 'Предыдущий месяц' });

            expect(navButton(fixture, 'calendar-prev-month').getAttribute('aria-label')).toBe('Предыдущий месяц');
        });
    });

    describe('одиночный выбор и сетка', (): void => {
        const SINGLE: ReadonlyArray<IRtCalendar.Month> = [
            {
                key: '2026-03',
                label: 'Март 2026',
                leadingBlanks: [],
                days: [
                    day(1, { sublabel: '' }),
                    day(2, { sublabel: '', today: true }),
                    day(3, { sublabel: '', state: ERtCalendarDayState.Chosen }),
                ],
            },
        ];

        it('SC-UKV-422 — сегодняшний день обведён, выбранный залит, и оба знака видны по атрибутам', (): void => {
            const fixture: ComponentFixture<RtCalendarComponent> = setup({ months: SINGLE });
            const [first, today, chosen]: HTMLButtonElement[] = days(fixture);

            expect(today.hasAttribute('data-today')).toBe(true);
            expect(today.getAttribute('aria-current')).toBe('date');
            expect(first.hasAttribute('data-today')).toBe(false);
            expect(chosen.getAttribute('data-state')).toBe('chosen');
            expect(chosen.getAttribute('aria-pressed')).toBe('true');
            expect(first.getAttribute('aria-pressed')).toBeNull();
        });

        it('без режима сетки каждый день обходится Tab, а стрелки не перехватываются', (): void => {
            const fixture: ComponentFixture<RtCalendarComponent> = setup({ months: SINGLE });
            const keys: jest.Mock = jest.fn();
            fixture.componentInstance.gridKey.subscribe(keys);
            const event: KeyboardEvent = new KeyboardEvent('keydown', { key: 'ArrowRight', cancelable: true });

            days(fixture)[0].dispatchEvent(event);

            expect(days(fixture).map((button: HTMLButtonElement): string | null => button.getAttribute('tabindex'))).toEqual([
                null,
                null,
                null,
            ]);
            expect(keys).not.toHaveBeenCalled();
            expect(event.defaultPrevented).toBe(false);
        });

        it('SC-UKV-427 — в режиме сетки в обходе Tab один день, клавиша уходит наружу, фокус встаёт на activeKey', async (): Promise<void> => {
            const fixture: ComponentFixture<RtCalendarComponent> = setup({ months: SINGLE, grid: true });
            document.body.appendChild(fixture.nativeElement as HTMLElement);
            const keys: IRtCalendar.GridKey[] = [];
            fixture.componentInstance.gridKey.subscribe((value: IRtCalendar.GridKey): void => {
                keys.push(value);
            });

            // Выбранный день важнее сегодняшнего.
            expect(days(fixture).map((button: HTMLButtonElement): string | null => button.getAttribute('tabindex'))).toEqual([
                '-1',
                '-1',
                '0',
            ]);

            const event: KeyboardEvent = new KeyboardEvent('keydown', { key: 'ArrowLeft', cancelable: true });
            days(fixture)[2].dispatchEvent(event);
            expect(event.defaultPrevented).toBe(true);
            expect(keys[0].key).toBe('ArrowLeft');
            expect(keys[0].day.key).toBe('2026-03-03');

            fixture.componentRef.setInput('activeKey', '2026-03-02');
            fixture.detectChanges();
            await fixture.whenStable();

            expect(days(fixture)[1].getAttribute('tabindex')).toBe('0');
            expect(document.activeElement).toBe(days(fixture)[1]);
            (fixture.nativeElement as HTMLElement).remove();
        });

        it('SC-UKV-421 — заголовок-кнопка отдаёт свой месяц наружу', (): void => {
            const fixture: ComponentFixture<RtCalendarComponent> = setup({ months: SINGLE, titleAction: true });
            const titles: IRtCalendar.Month[] = [];
            fixture.componentInstance.titleClick.subscribe((value: IRtCalendar.Month): void => {
                titles.push(value);
            });

            const title: HTMLElement = qa(fixture, 'calendar-month-title')?.nativeElement as HTMLElement;
            expect(title.tagName).toBe('BUTTON');
            title.click();

            expect(titles.map((month: IRtCalendar.Month): string => month.key)).toEqual(['2026-03']);
        });
    });

    it('headerTitle ставит заголовок первого месяца в шапку между стрелками', (): void => {
        const fixture: ComponentFixture<RtCalendarComponent> = setup({ headerTitle: true });

        expect(el(fixture, '[qa-dataid="calendar-month"] [qa-dataid="calendar-month-title"]')).toBeNull();
        expect(textOf(el(fixture, '.rt-calendar__header [qa-dataid="calendar-month-title"]'))).toBe('Март 2026');
    });

    it('пустой набор месяцев рисует пустую сетку', (): void => {
        const fixture: ComponentFixture<RtCalendarComponent> = setup({ months: [] });

        expect(qaAll(fixture, 'calendar-month').length).toBe(0);
        expect(qa(fixture, 'calendar-months')).not.toBeNull();
    });
});
