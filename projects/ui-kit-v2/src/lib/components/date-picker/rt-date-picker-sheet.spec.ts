import { signal, Provider } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { RT_KIT_LOCALE } from '../../i18n';
import { BreakpointsService } from '../../platform';
import { createRtFixture, el, qa, textOf } from '../../../testing/rt-kit-testing';
import { RtDatePickerComponent } from './rt-date-picker.component';
import { IRtDatePicker } from './rt-date-picker.model';

const RU_LOCALE: Provider = { provide: RT_KIT_LOCALE, useValue: signal('ru') };

/** Подмена наблюдателя ширины: сам он в тестовой среде ничего не измеряет. */
class NarrowBreakpointsService {
    public readonly viewportNarrow: () => boolean = (): boolean => true;
    public readonly phone: () => boolean = (): boolean => true;
}

type TFixture = ComponentFixture<RtDatePickerComponent>;

/** Сколько барабан ждёт без прокрутки, прежде чем счесть значение выбранным, — с запасом. */
const SETTLE_MS: number = 200;
/** Высота строки барабана в окружении без раскладки. */
const ROW_PX: number = 40;
const HOURS: number = 24;

function settle(fixture: TFixture): void {
    fixture.detectChanges();
    fixture.detectChanges();
}

/** Поле на узком экране с открытой шторкой. */
function openSheet(type: IRtDatePicker.Type, value: string): TFixture {
    const fixture: TFixture = createRtFixture(
        RtDatePickerComponent,
        { type },
        { providers: [RU_LOCALE, { provide: BreakpointsService, useClass: NarrowBreakpointsService }] }
    );
    fixture.componentInstance.writeValue(value);
    (el(fixture, '[qa-dataid="date-picker-open"] [qa-dataid="icon-button-control"]')?.nativeElement as HTMLButtonElement).click();
    settle(fixture);

    return fixture;
}

function node(fixture: TFixture, id: string): HTMLElement | null {
    return (qa(fixture, id)?.nativeElement as HTMLElement | undefined) ?? null;
}

function press(fixture: TFixture, id: string): void {
    const found: HTMLElement = node(fixture, id) as HTMLElement;
    (found.querySelector('button') ?? found).click();
    settle(fixture);
}

/** Прокручивает барабан к значению с этим номером и ждёт, пока он остановится. */
function spin(fixture: TFixture, id: string, index: number): void {
    const column: HTMLElement = node(fixture, id) as HTMLElement;
    column.scrollTop = index * ROW_PX;
    column.dispatchEvent(new Event('scroll'));
    jest.advanceTimersByTime(SETTLE_MS);
    settle(fixture);
}

/** Значение поля, каким его видит человек: текст в поле. */
function written(fixture: TFixture): string {
    return (node(fixture, 'date-picker-control') as HTMLInputElement).value;
}

function sheetOpen(fixture: TFixture): boolean {
    return (node(fixture, 'date-picker-sheet') as HTMLElement).classList.contains('rt-bottom-sheet--open');
}

describe('RtDatePickerComponent — шторка: действие в шапке, барабан времени, вопрос перед закрытием', (): void => {
    beforeEach((): void => {
        jest.useFakeTimers();
    });

    afterEach((): void => {
        jest.useRealTimers();
    });

    it('SC-UKV-1760 — у времени «Готово» стоит в шапке шторки, в подвале панели остаётся «Сейчас»', (): void => {
        const fixture: TFixture = openSheet('time', '09:30');

        expect(textOf(qa(fixture, 'date-picker-sheet-apply'))).toBe('Done');
        expect(node(fixture, 'date-panel-done')).toBeNull();
        expect(node(fixture, 'date-panel-now')).not.toBeNull();
    });

    it('SC-UKV-1760 — у даты со временем в шапке «Применить», у даты без времени кнопки в шапке нет', (): void => {
        const withTime: TFixture = openSheet('datetime-local', '2026-09-27T09:30');
        expect(textOf(qa(withTime, 'date-picker-sheet-apply'))).toBe('Apply');
        expect(node(withTime, 'date-panel-apply')).toBeNull();

        const dateOnly: TFixture = openSheet('date', '2026-09-27');
        expect(node(dateOnly, 'date-picker-sheet-apply')).toBeNull();
    });

    it('SC-UKV-1762 — выбран час, остановившийся под полосой барабана; кнопка в шапке пишет значение и закрывает', (): void => {
        const fixture: TFixture = openSheet('time', '09:30');

        spin(fixture, 'date-panel-hours', 11);
        press(fixture, 'date-picker-sheet-apply');

        expect(written(fixture)).toBe('11:30');
        expect(sheetOpen(fixture)).toBe(false);
    });

    it('SC-UKV-1762 — час за границей барабан не принимает: значение остаётся прежним', (): void => {
        const fixture: TFixture = createRtFixture(
            RtDatePickerComponent,
            { type: 'time', max: '10:00' },
            { providers: [RU_LOCALE, { provide: BreakpointsService, useClass: NarrowBreakpointsService }] }
        );
        fixture.componentInstance.writeValue('09:30');
        (el(fixture, '[qa-dataid="date-picker-open"] [qa-dataid="icon-button-control"]')?.nativeElement as HTMLButtonElement).click();
        settle(fixture);

        spin(fixture, 'date-panel-hours', 15);
        press(fixture, 'date-picker-sheet-apply');

        expect(written(fixture)).toBe('09:30');
    });

    it('SC-UKV-1761 — шторка с изменённым и не применённым временем перед закрытием спрашивает; «Применить» пишет значение', (): void => {
        const fixture: TFixture = openSheet('time', '09:30');
        spin(fixture, 'date-panel-minutes', 0);

        press(fixture, 'bottom-sheet-close');

        expect(node(fixture, 'bottom-sheet-confirm')).not.toBeNull();
        expect(sheetOpen(fixture)).toBe(true);

        press(fixture, 'bottom-sheet-confirm-apply');

        expect(written(fixture)).toBe('09:00');
        expect(sheetOpen(fixture)).toBe(false);
    });

    it('SC-UKV-1761 — «Не применять» закрывает шторку и значения не меняет; без изменений шторка закрывается сразу', (): void => {
        const changed: TFixture = openSheet('time', '09:30');
        spin(changed, 'date-panel-minutes', 0);
        press(changed, 'bottom-sheet-close');
        press(changed, 'bottom-sheet-confirm-discard');

        expect(written(changed)).toBe('09:30');
        expect(sheetOpen(changed)).toBe(false);

        const untouched: TFixture = openSheet('time', '09:30');
        press(untouched, 'bottom-sheet-close');

        expect(node(untouched, 'bottom-sheet-confirm')).toBeNull();
        expect(sheetOpen(untouched)).toBe(false);
    });

    it('SC-UKV-1768 — барабан крутится по кругу: за 23 идёт 00, и остановившись, колонка встаёт в домашний круг', (): void => {
        const fixture: TFixture = openSheet('time', '23:30');
        const column: HTMLElement = node(fixture, 'date-panel-hours') as HTMLElement;
        const home: number = column.children.length / 2 - HOURS / 2;

        expect(column.children.length).toBeGreaterThan(HOURS);

        spin(fixture, 'date-panel-hours', home + HOURS);

        expect(column.scrollTop).toBe(home * ROW_PX);
        expect(column.querySelector('[aria-pressed="true"]')?.textContent?.trim()).toBe('00');
        expect(column.querySelectorAll('[qa-dataid="date-panel-hour"]')).toHaveLength(HOURS);

        press(fixture, 'date-picker-sheet-apply');
        expect(written(fixture)).toBe('00:30');
    });

    it('SC-UKV-1769 — у поля без значения барабан начинает с текущего времени; оно одно вопроса не вызывает, «Готово» его пишет', (): void => {
        jest.setSystemTime(new Date(2026, 8, 27, 14, 37));
        const fixture: TFixture = openSheet('time', '');

        expect(node(fixture, 'date-panel-hours')?.querySelector('[aria-pressed="true"]')?.textContent?.trim()).toBe('14');
        expect(node(fixture, 'date-panel-minutes')?.querySelector('[aria-pressed="true"]')?.textContent?.trim()).toBe('35');

        press(fixture, 'bottom-sheet-close');
        expect(node(fixture, 'bottom-sheet-confirm')).toBeNull();
        expect(written(fixture)).toBe('');

        const again: TFixture = openSheet('time', '');
        press(again, 'date-picker-sheet-apply');
        expect(written(again)).toBe('14:35');
    });

    it('SC-UKV-1769 — со входом `timeStart="midnight"` барабан начинает с 00:00', (): void => {
        jest.setSystemTime(new Date(2026, 8, 27, 14, 37));
        const fixture: TFixture = createRtFixture(
            RtDatePickerComponent,
            { type: 'time', timeStart: 'midnight' },
            { providers: [RU_LOCALE, { provide: BreakpointsService, useClass: NarrowBreakpointsService }] }
        );
        (el(fixture, '[qa-dataid="date-picker-open"] [qa-dataid="icon-button-control"]')?.nativeElement as HTMLButtonElement).click();
        settle(fixture);

        expect(node(fixture, 'date-panel-hours')?.querySelector('[aria-pressed="true"]')?.textContent?.trim()).toBe('00');
        expect(node(fixture, 'date-panel-minutes')?.querySelector('[aria-pressed="true"]')?.textContent?.trim()).toBe('00');
    });
});
