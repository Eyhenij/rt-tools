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

        expect((fixture.nativeElement as HTMLElement).querySelectorAll('.rt-calendar__blank').length).toBe(2);
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

    it('пустой набор месяцев рисует пустую сетку', (): void => {
        const fixture: ComponentFixture<RtCalendarComponent> = setup({ months: [] });

        expect(qaAll(fixture, 'calendar-month').length).toBe(0);
        expect(qa(fixture, 'calendar-months')).not.toBeNull();
    });
});
