import { DebugElement, LOCALE_ID } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture, el, qa, qaAll, textOf } from '../../../testing/rt-kit-testing';
import { RtDatePanelComponent } from './rt-date-panel.component';

interface IPanel {
    fixture: ComponentFixture<RtDatePanelComponent>;
    picked: string[];
    closed: jest.Mock;
}

function setup(inputs: Readonly<Record<string, unknown>>): IPanel {
    const fixture: ComponentFixture<RtDatePanelComponent> = createRtFixture(RtDatePanelComponent, inputs, {
        providers: [{ provide: LOCALE_ID, useValue: 'ru' }],
    });
    const picked: string[] = [];
    const closed: jest.Mock = jest.fn();
    fixture.componentInstance.picked.subscribe((value: string): void => {
        picked.push(value);
    });
    fixture.componentInstance.closed.subscribe(closed);
    return { fixture, picked, closed };
}

function press(fixture: ComponentFixture<RtDatePanelComponent>, target: DebugElement | null): void {
    (target?.nativeElement as HTMLElement).click();
    fixture.detectChanges();
}

function day(fixture: ComponentFixture<RtDatePanelComponent>, iso: string): DebugElement | null {
    return el(fixture, `[qa-dataid="calendar-day"][data-iso="${iso}"]`);
}

function iconButton(fixture: ComponentFixture<RtDatePanelComponent>, id: string): DebugElement | null {
    return el(fixture, `[qa-dataid="${id}"] [qa-dataid="icon-button-control"]`);
}

function cell(fixture: ComponentFixture<RtDatePanelComponent>, id: string, label: string): DebugElement | undefined {
    return qaAll(fixture, id).find((node: DebugElement): boolean => textOf(node) === label);
}

function pressedLabels(fixture: ComponentFixture<RtDatePanelComponent>, id: string): string[] {
    return qaAll(fixture, id)
        .filter((node: DebugElement): boolean => node.nativeElement.getAttribute('aria-pressed') === 'true')
        .map((node: DebugElement): string => textOf(node));
}

describe('RtDatePanelComponent', (): void => {
    beforeEach((): void => {
        jest.useFakeTimers({ now: new Date(2026, 8, 29, 10, 37), doNotFake: ['queueMicrotask', 'requestAnimationFrame'] });
    });

    afterEach((): void => {
        jest.useRealTimers();
    });

    it('SC-UKV-421 — the month pages, and its title opens a choice of month and year', (): void => {
        const { fixture }: IPanel = setup({ type: 'date', value: '2026-09-15' });
        expect(textOf(qa(fixture, 'calendar-month-title'))).toBe('Сентябрь 2026');

        press(fixture, iconButton(fixture, 'calendar-next-month'));
        expect(textOf(qa(fixture, 'calendar-month-title'))).toBe('Октябрь 2026');

        press(fixture, qa(fixture, 'calendar-month-title'));
        expect(qa(fixture, 'date-panel-calendar')).toBeNull();
        expect(textOf(qa(fixture, 'date-panel-year'))).toBe('2026');
        expect(qaAll(fixture, 'date-panel-month').length).toBe(12);

        press(fixture, iconButton(fixture, 'date-panel-next-year'));
        expect(textOf(qa(fixture, 'date-panel-year'))).toBe('2027');
        press(fixture, el(fixture, '[qa-dataid="date-panel-month"][data-key="2027-03"]'));

        expect(textOf(qa(fixture, 'calendar-month-title'))).toBe('Март 2027');
    });

    it('SC-UKV-423 — a day click chooses and closes; «Today» chooses today', (): void => {
        const { fixture, picked, closed }: IPanel = setup({ type: 'date', value: '2026-09-15' });

        press(fixture, day(fixture, '2026-09-20'));
        expect(picked).toEqual(['2026-09-20']);
        expect(closed).toHaveBeenCalledTimes(1);

        press(fixture, qa(fixture, 'date-panel-today'));
        expect(picked).toEqual(['2026-09-20', '2026-09-29']);
        expect(qa(fixture, 'date-panel-now')).toBeNull();
    });

    it('SC-UKV-423 — «Today» is switched off when today lies outside the bounds', (): void => {
        const { fixture, picked }: IPanel = setup({ type: 'date', value: '', max: '2026-09-01' });
        const today: HTMLButtonElement = qa(fixture, 'date-panel-today')?.nativeElement as HTMLButtonElement;

        expect(today.disabled).toBe(true);
        today.click();
        expect(picked).toEqual([]);
    });

    it('SC-UKV-424 — the time columns follow the step, and the value changes only at «Done»', (): void => {
        const { fixture, picked, closed }: IPanel = setup({ type: 'time', value: '', minuteStep: 15 });
        expect(qa(fixture, 'date-panel-calendar')).toBeNull();
        expect(qaAll(fixture, 'date-panel-minute').map((node: DebugElement): string => textOf(node))).toEqual(['00', '15', '30', '45']);
        expect((qa(fixture, 'date-panel-done')?.nativeElement as HTMLButtonElement).disabled).toBe(true);

        press(fixture, cell(fixture, 'date-panel-hour', '14') ?? null);
        press(fixture, cell(fixture, 'date-panel-minute', '45') ?? null);
        expect(picked).toEqual([]);
        expect(pressedLabels(fixture, 'date-panel-hour')).toEqual(['14']);

        press(fixture, qa(fixture, 'date-panel-done'));
        expect(picked).toEqual(['14:45']);
        expect(closed).toHaveBeenCalledTimes(1);
    });

    it('SC-UKV-424 — «Now» sets the current time rounded down to the step', (): void => {
        const { fixture, picked }: IPanel = setup({ type: 'time', value: '08:00', minuteStep: 15 });

        press(fixture, qa(fixture, 'date-panel-now'));

        expect(pressedLabels(fixture, 'date-panel-hour')).toEqual(['10']);
        expect(pressedLabels(fixture, 'date-panel-minute')).toEqual(['30']);
        expect(picked).toEqual([]);
    });

    it('SC-UKV-425 — a date with time applies only by «Apply»', (): void => {
        const { fixture, picked }: IPanel = setup({ type: 'datetime-local', value: '2026-09-15T09:00' });
        expect(qa(fixture, 'date-panel-calendar')).not.toBeNull();
        expect(qa(fixture, 'date-panel-time')).not.toBeNull();
        expect(qa(fixture, 'date-panel-tabs')).toBeNull();

        press(fixture, day(fixture, '2026-09-20'));
        press(fixture, cell(fixture, 'date-panel-hour', '14') ?? null);
        expect(picked).toEqual([]);
        expect(day(fixture, '2026-09-20')?.nativeElement.getAttribute('data-state')).toBe('chosen');

        press(fixture, qa(fixture, 'date-panel-apply'));
        expect(picked).toEqual(['2026-09-20T14:00']);
    });

    it('SC-UKV-425 — a new panel starts from the value, not from the dropped draft', (): void => {
        const first: IPanel = setup({ type: 'datetime-local', value: '2026-09-15T09:00' });
        press(first.fixture, day(first.fixture, '2026-09-20'));
        first.fixture.destroy();

        const second: IPanel = setup({ type: 'datetime-local', value: '2026-09-15T09:00' });

        expect(day(second.fixture, '2026-09-15')?.nativeElement.getAttribute('data-state')).toBe('chosen');
        expect(day(second.fixture, '2026-09-20')?.nativeElement.getAttribute('data-state')).toBe('free');
    });

    it('SC-UKV-426 — a draft past the bounds cannot be applied', (): void => {
        const { fixture, picked }: IPanel = setup({ type: 'time', value: '', min: '09:00', max: '18:00', minuteStep: 30 });

        expect((cell(fixture, 'date-panel-hour', '08')?.nativeElement as HTMLButtonElement).disabled).toBe(true);
        press(fixture, cell(fixture, 'date-panel-hour', '17') ?? null);
        press(fixture, cell(fixture, 'date-panel-minute', '30') ?? null);
        expect((qa(fixture, 'date-panel-done')?.nativeElement as HTMLButtonElement).disabled).toBe(false);

        // Час 18 оставляет минуту 30: черновик 18:30 лежит за границей.
        press(fixture, cell(fixture, 'date-panel-hour', '18') ?? null);
        expect((cell(fixture, 'date-panel-minute', '30')?.nativeElement as HTMLButtonElement).disabled).toBe(true);
        expect((qa(fixture, 'date-panel-done')?.nativeElement as HTMLButtonElement).disabled).toBe(true);
        expect(picked).toEqual([]);
    });

    it('SC-UKV-427 — a grid key moves the focus day across months', (): void => {
        const { fixture }: IPanel = setup({ type: 'date', value: '2026-09-29' });

        (day(fixture, '2026-09-29')?.nativeElement as HTMLElement).dispatchEvent(
            new KeyboardEvent('keydown', { key: 'ArrowDown', cancelable: true })
        );
        fixture.detectChanges();

        expect(textOf(qa(fixture, 'calendar-month-title'))).toBe('Октябрь 2026');
        expect(day(fixture, '2026-10-06')?.nativeElement.getAttribute('tabindex')).toBe('0');
    });

    it('SC-UKV-428 — the sheet layout switches a date with time between the month and the columns', (): void => {
        const { fixture }: IPanel = setup({ type: 'datetime-local', value: '2026-09-15T09:00', sheet: true });
        expect(fixture.nativeElement.classList).toContain('rt-date-panel--sheet');
        expect(qa(fixture, 'date-panel-calendar')).not.toBeNull();
        expect(qa(fixture, 'date-panel-time')).toBeNull();

        press(fixture, qaAll(fixture, 'toggle-button-group-option')[1]);

        expect(qa(fixture, 'date-panel-calendar')).toBeNull();
        expect(qa(fixture, 'date-panel-time')).not.toBeNull();
    });

    it('SC-UKV-429 — the weekday names follow the locale of the application', (): void => {
        const { fixture }: IPanel = setup({ type: 'date', value: '2026-09-15' });

        expect(textOf(qaAll(fixture, 'calendar-weekday')[0])).toBe('пн');
    });
});
