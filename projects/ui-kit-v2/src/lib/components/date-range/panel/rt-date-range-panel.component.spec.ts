import { signal, DebugElement } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { RT_KIT_LOCALE } from '../../../i18n';
import { createRtFixture, el, qa, qaAll, textOf } from '../../../../testing/rt-kit-testing';
import { IRtDateRange } from '../rt-date-range.model';
import { RtDateRangePanelComponent } from './rt-date-range-panel.component';

interface IPanel {
    fixture: ComponentFixture<RtDateRangePanelComponent>;
    picked: IRtDateRange.Value[];
    closed: jest.Mock;
}

function setup(inputs: Readonly<Record<string, unknown>> = {}): IPanel {
    const fixture: ComponentFixture<RtDateRangePanelComponent> = createRtFixture(RtDateRangePanelComponent, inputs, {
        providers: [{ provide: RT_KIT_LOCALE, useValue: signal('ru') }],
    });
    const picked: IRtDateRange.Value[] = [];
    const closed: jest.Mock = jest.fn();
    fixture.componentInstance.picked.subscribe((value: IRtDateRange.Value): void => {
        picked.push(value);
    });
    fixture.componentInstance.closed.subscribe(closed);
    return { fixture, picked, closed };
}

function press(fixture: ComponentFixture<RtDateRangePanelComponent>, target: DebugElement | null | undefined): void {
    (target?.nativeElement as HTMLElement).click();
    fixture.detectChanges();
}

function day(fixture: ComponentFixture<RtDateRangePanelComponent>, iso: string): DebugElement | null {
    return el(fixture, `[qa-dataid="calendar-day"][data-iso="${iso}"]`);
}

function stateOf(fixture: ComponentFixture<RtDateRangePanelComponent>, iso: string): string | null {
    return (day(fixture, iso)?.nativeElement as HTMLElement).getAttribute('data-state');
}

function preset(fixture: ComponentFixture<RtDateRangePanelComponent>, name: string): DebugElement | null {
    return el(fixture, `[qa-dataid="date-range-preset"][data-preset="${name}"]`);
}

function nav(fixture: ComponentFixture<RtDateRangePanelComponent>, id: string): HTMLButtonElement {
    return el(fixture, `[qa-dataid="${id}"] [qa-dataid="icon-button-control"]`)?.nativeElement as HTMLButtonElement;
}

function apply(fixture: ComponentFixture<RtDateRangePanelComponent>): HTMLButtonElement {
    return qa(fixture, 'date-range-apply')?.nativeElement as HTMLButtonElement;
}

function titles(fixture: ComponentFixture<RtDateRangePanelComponent>): string[] {
    return qaAll(fixture, 'calendar-month-title').map((node: DebugElement): string => textOf(node));
}

describe('RtDateRangePanelComponent', (): void => {
    beforeEach((): void => {
        jest.useFakeTimers({ now: new Date(2026, 8, 30, 10, 37), doNotFake: ['queueMicrotask', 'requestAnimationFrame'] });
    });

    afterEach((): void => {
        jest.useRealTimers();
    });

    it('SC-UKV-471 — два месяца рядом листаются вместе', (): void => {
        const { fixture }: IPanel = setup({ value: { start: '2026-10-12', end: '2026-10-15' } });
        expect(titles(fixture)).toEqual(['Октябрь 2026', 'Ноябрь 2026']);

        nav(fixture, 'calendar-next-month').click();
        fixture.detectChanges();

        expect(titles(fixture)).toEqual(['Ноябрь 2026', 'Декабрь 2026']);
    });

    it('SC-UKV-472 — первый клик — начало, наведение показывает будущий диапазон, второй клик — конец', (): void => {
        const { fixture }: IPanel = setup();

        press(fixture, day(fixture, '2026-10-12'));
        expect(stateOf(fixture, '2026-10-12')).toBe('chosen');

        day(fixture, '2026-10-19')?.nativeElement.dispatchEvent(new MouseEvent('mouseenter'));
        fixture.detectChanges();
        expect(stateOf(fixture, '2026-10-13')).toBe('in-range');
        expect(stateOf(fixture, '2026-10-19')).toBe('in-range');

        press(fixture, day(fixture, '2026-10-15'));
        expect(stateOf(fixture, '2026-10-12')).toBe('start');
        expect(stateOf(fixture, '2026-10-15')).toBe('end');
        expect(stateOf(fixture, '2026-10-19')).toBe('free');
    });

    it('SC-UKV-472 — второй клик раньше начала ставит дни по порядку, клик после готового диапазона начинает новый', (): void => {
        const { fixture }: IPanel = setup();

        press(fixture, day(fixture, '2026-10-15'));
        press(fixture, day(fixture, '2026-10-12'));
        expect(stateOf(fixture, '2026-10-12')).toBe('start');
        expect(stateOf(fixture, '2026-10-15')).toBe('end');

        press(fixture, day(fixture, '2026-10-20'));
        expect(stateOf(fixture, '2026-10-20')).toBe('chosen');
        expect(stateOf(fixture, '2026-10-12')).toBe('free');
    });

    it('SC-UKV-473 — вариант заполняет черновик и отмечен выбранным, не лежащий в границах выключен', (): void => {
        const { fixture }: IPanel = setup({ min: '2026-09-01' });

        press(fixture, preset(fixture, 'last-7'));

        expect(stateOf(fixture, '2026-09-24')).toBe('start');
        expect(stateOf(fixture, '2026-09-30')).toBe('end');
        expect((preset(fixture, 'last-7')?.nativeElement as HTMLElement).getAttribute('aria-pressed')).toBe('true');
        expect((preset(fixture, 'last-month')?.nativeElement as HTMLButtonElement).disabled).toBe(true);
    });

    it('SC-UKV-474 — итог просит конец, затем называет даты и дни; «Применить» записывает и закрывает', (): void => {
        const { fixture, picked, closed }: IPanel = setup();
        expect(textOf(qa(fixture, 'date-range-summary'))).toBe('Pick the start date');

        press(fixture, day(fixture, '2026-10-12'));
        expect(textOf(qa(fixture, 'date-range-summary'))).toBe('Pick the end date');
        expect(apply(fixture).disabled).toBe(true);

        press(fixture, day(fixture, '2026-10-15'));
        expect(textOf(qa(fixture, 'date-range-summary'))).toBe('12–15 октября · 4 days');
        expect(apply(fixture).disabled).toBe(false);

        press(fixture, qa(fixture, 'date-range-apply'));
        expect(picked).toEqual([{ start: '2026-10-12', end: '2026-10-15' }]);
        expect(closed).toHaveBeenCalledTimes(1);
    });

    it('SC-UKV-474 — «Сбросить» очищает черновик, значение не трогает', (): void => {
        const { fixture, picked }: IPanel = setup({ value: { start: '2026-10-12', end: '2026-10-15' } });

        press(fixture, qa(fixture, 'date-range-reset'));

        expect(stateOf(fixture, '2026-10-12')).toBe('free');
        expect(apply(fixture).disabled).toBe(true);
        expect(picked).toEqual([]);
    });

    it('SC-UKV-475 — дни за границами выключены, листание упирается в месяц границы', (): void => {
        const { fixture }: IPanel = setup({ value: { start: '2026-10-12', end: '2026-10-15' }, min: '2026-10-05', max: '2026-11-20' });

        expect((day(fixture, '2026-10-04')?.nativeElement as HTMLButtonElement).disabled).toBe(true);
        expect((day(fixture, '2026-11-21')?.nativeElement as HTMLButtonElement).disabled).toBe(true);
        expect(nav(fixture, 'calendar-prev-month').disabled).toBe(true);
        expect(nav(fixture, 'calendar-next-month').disabled).toBe(true);
    });

    it('SC-UKV-476 — стрелка переводит день, листая месяцы, а выбор дня с клавиатуры ставит начало и конец', (): void => {
        const { fixture }: IPanel = setup({ value: { start: '2026-11-25', end: '2026-11-25' } });

        (day(fixture, '2026-11-25')?.nativeElement as HTMLElement).dispatchEvent(
            new KeyboardEvent('keydown', { key: 'ArrowDown', cancelable: true })
        );
        fixture.detectChanges();

        expect(titles(fixture)).toEqual(['Ноябрь 2026', 'Декабрь 2026']);
        expect(day(fixture, '2026-12-02')?.nativeElement.getAttribute('tabindex')).toBe('0');

        // Enter на кнопке дня браузер превращает в клик — выбор идёт тем же путём.
        press(fixture, day(fixture, '2026-11-25'));
        press(fixture, day(fixture, '2026-12-02'));
        expect(stateOf(fixture, '2026-11-25')).toBe('start');
        expect(stateOf(fixture, '2026-12-02')).toBe('end');
    });

    it('в шторке один месяц, варианты стоят строкой сверху, итог — только число дней', (): void => {
        const { fixture }: IPanel = setup({ sheet: true, value: { start: '2026-09-24', end: '2026-09-30' } });

        expect(titles(fixture)).toEqual(['Сентябрь 2026']);
        expect(textOf(qa(fixture, 'date-range-title'))).toBe('Period');
        expect(textOf(qa(fixture, 'date-range-summary'))).toBe('7 days');
    });
});
