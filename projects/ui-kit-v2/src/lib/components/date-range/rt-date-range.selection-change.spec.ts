import { signal, ChangeDetectionStrategy, Component, Provider, WritableSignal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FieldTree, FormField, form } from '@angular/forms/signals';

import { RT_KIT_LOCALE } from '../../i18n';
import { createRtFixture, el, qa } from '../../../testing/rt-kit-testing';
import { RtDateRangeComponent } from './rt-date-range.component';
import { IRtDateRange } from './rt-date-range.model';

/** Порядок даты в тексте зависит от локали — прибиваем её. */
const RU_LOCALE: Provider = { provide: RT_KIT_LOCALE, useValue: signal('ru') };

/** Поле под реактивной формой: событие сравнивается с тем, что получила форма. */
@Component({
    selector: 'rt-date-range-selection-host',
    template: `
        <rt-date-range min="2026-01-01" max="2026-12-31" [formControl]="control" (selectionChange)="events.push($event)" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtDateRangeComponent, ReactiveFormsModule],
})
class DateRangeSelectionHostComponent {
    public readonly control: FormControl<IRtDateRange.Value | null> = new FormControl<IRtDateRange.Value | null>(null);
    public readonly events: Array<IRtDateRange.Value | null> = [];
}

interface IReport {
    period: IRtDateRange.Value | null;
}

/** Поле под сигнальной формой: модель задаётся снаружи, как её задаёт хранилище. */
@Component({
    selector: 'rt-date-range-selection-signal-host',
    template: '<rt-date-range [formField]="report.period" (selectionChange)="events.push($event)" />',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtDateRangeComponent, FormField],
})
class DateRangeSelectionSignalHostComponent {
    public readonly model: WritableSignal<IReport> = signal<IReport>({ period: null });
    public readonly report: FieldTree<IReport> = form(this.model);
    public readonly events: Array<IRtDateRange.Value | null> = [];
}

const PERIOD: IRtDateRange.Value = { start: '2026-10-12', end: '2026-10-15' };

function setupHost(): ComponentFixture<DateRangeSelectionHostComponent> {
    return createRtFixture(DateRangeSelectionHostComponent, {}, { providers: [RU_LOCALE] });
}

function type<T>(fixture: ComponentFixture<T>, text: string): void {
    const node: HTMLInputElement = qa(fixture, 'date-range-control')?.nativeElement as HTMLInputElement;
    node.value = text;
    node.dispatchEvent(new Event('input'));
    fixture.detectChanges();
}

function clearButton<T>(fixture: ComponentFixture<T>): HTMLButtonElement | null {
    return (el(fixture, '[qa-dataid="date-range-clear"] [qa-dataid="icon-button-control"]')?.nativeElement as HTMLButtonElement) ?? null;
}

function popup(): HTMLElement | null {
    return document.querySelector('[qa-dataid="date-range-popup"]');
}

function popupDay(iso: string): HTMLButtonElement {
    return popup()?.querySelector(`[data-iso="${iso}"]`) as HTMLButtonElement;
}

describe('RtDateRangeComponent — selectionChange', (): void => {
    it('SC-UKV-1706 — writeValue из формы события не даёт', (): void => {
        const fixture: ComponentFixture<DateRangeSelectionHostComponent> = setupHost();

        fixture.componentInstance.control.setValue(PERIOD);
        fixture.detectChanges();

        expect(fixture.componentInstance.events).toEqual([]);
    });

    it('SC-UKV-1706 — набранный диапазон даёт событие с тем же значением, что получила форма', (): void => {
        const fixture: ComponentFixture<DateRangeSelectionHostComponent> = setupHost();

        type(fixture, '01.08.2026 — 15.08.2026');

        expect(fixture.componentInstance.events).toEqual([{ start: '2026-08-01', end: '2026-08-15' }]);
        expect(fixture.componentInstance.events[0]).toEqual(fixture.componentInstance.control.value);
    });

    it('SC-UKV-1706 — нечитаемый текст события не даёт, стёртый текст даёт null', (): void => {
        const fixture: ComponentFixture<DateRangeSelectionHostComponent> = setupHost();
        fixture.componentInstance.control.setValue(PERIOD);
        fixture.detectChanges();

        type(fixture, 'не диапазон');
        expect(fixture.componentInstance.events).toEqual([]);

        type(fixture, '');
        expect(fixture.componentInstance.events).toEqual([null]);
        expect(fixture.componentInstance.control.value).toBeNull();
    });

    it('SC-UKV-1706 — крестик даёт null — то же, что ушло в форму', (): void => {
        const fixture: ComponentFixture<DateRangeSelectionHostComponent> = setupHost();
        fixture.componentInstance.control.setValue(PERIOD);
        fixture.detectChanges();

        clearButton(fixture)?.click();
        fixture.detectChanges();

        expect(fixture.componentInstance.events).toEqual([null]);
        expect(fixture.componentInstance.control.value).toBeNull();
    });

    it('SC-UKV-1706 — отключённое поле на очистку события не даёт', (): void => {
        const fixture: ComponentFixture<DateRangeSelectionHostComponent> = setupHost();
        fixture.componentInstance.control.setValue(PERIOD);
        fixture.componentInstance.control.disable();
        fixture.detectChanges();

        const range: RtDateRangeComponent = fixture.debugElement.children[0].componentInstance as RtDateRangeComponent;
        (range as unknown as { clear: () => void }).clear();
        fixture.detectChanges();

        expect(fixture.componentInstance.events).toEqual([]);
        expect(fixture.componentInstance.control.value).toEqual(PERIOD);
    });

    it('SC-UKV-1706 — обработчик события, вернувший форме прежнее значение, видит его в поле', (): void => {
        const fixture: ComponentFixture<DateRangeSelectionHostComponent> = setupHost();
        fixture.componentInstance.control.setValue(PERIOD);
        fixture.detectChanges();
        const range: RtDateRangeComponent = fixture.debugElement.children[0].componentInstance as RtDateRangeComponent;
        range.selectionChange.subscribe((): void => fixture.componentInstance.control.setValue(PERIOD));

        type(fixture, '01.08.2026 — 15.08.2026');

        expect(fixture.componentInstance.control.value).toEqual(PERIOD);
        expect((qa(fixture, 'date-range-control')?.nativeElement as HTMLInputElement).value).toBe('12.10.2026 — 15.10.2026');
    });

    it('SC-UKV-1706 — подписчик формы, вернувший прежнее значение, видит его в поле', (): void => {
        const fixture: ComponentFixture<DateRangeSelectionHostComponent> = setupHost();
        fixture.componentInstance.control.setValue(PERIOD);
        fixture.detectChanges();
        fixture.componentInstance.control.valueChanges.subscribe((value: IRtDateRange.Value | null): void => {
            if (value !== PERIOD) {
                fixture.componentInstance.control.setValue(PERIOD);
            }
        });

        type(fixture, '01.08.2026 — 15.08.2026');

        expect(fixture.componentInstance.control.value).toEqual(PERIOD);
        expect((qa(fixture, 'date-range-control')?.nativeElement as HTMLInputElement).value).toBe('12.10.2026 — 15.10.2026');
    });

    it('SC-UKV-1706 — значение формы с тем же текстом недонабранное не стирает', (): void => {
        const fixture: ComponentFixture<DateRangeSelectionHostComponent> = setupHost();
        fixture.componentInstance.control.setValue(PERIOD);
        fixture.detectChanges();

        type(fixture, '12.10.2026 — 1');
        fixture.componentInstance.control.setValue({ ...PERIOD });
        fixture.detectChanges();

        expect((qa(fixture, 'date-range-control')?.nativeElement as HTMLInputElement).value).toBe('12.10.2026 — 1');
        expect(fixture.componentInstance.events).toEqual([]);
    });

    describe('панель', (): void => {
        beforeEach((): void => {
            jest.useFakeTimers({ now: new Date(2026, 8, 30, 10, 37), doNotFake: ['queueMicrotask', 'requestAnimationFrame'] });
        });

        afterEach((): void => {
            popup()?.closest('.cdk-overlay-container')?.replaceChildren();
            jest.useRealTimers();
        });

        it('SC-UKV-1706 — диапазон из панели даёт одно событие с тем же значением, что получила форма', (): void => {
            const fixture: ComponentFixture<DateRangeSelectionHostComponent> = setupHost();
            (el(fixture, '[qa-dataid="date-range-open"] [qa-dataid="icon-button-control"]')?.nativeElement as HTMLButtonElement).click();
            fixture.detectChanges();

            popupDay('2026-10-12').click();
            fixture.detectChanges();
            popupDay('2026-10-15').click();
            fixture.detectChanges();
            (popup()?.querySelector('[qa-dataid="date-range-apply"]') as HTMLButtonElement).click();
            fixture.detectChanges();

            expect(fixture.componentInstance.events).toEqual([PERIOD]);
            expect(fixture.componentInstance.control.value).toEqual(PERIOD);
        });
    });

    it('SC-UKV-1706 — модель сигнальной формы, заданная снаружи, события не даёт, набор — даёт', (): void => {
        const fixture: ComponentFixture<DateRangeSelectionSignalHostComponent> = createRtFixture(
            DateRangeSelectionSignalHostComponent,
            {},
            { providers: [RU_LOCALE] }
        );

        fixture.componentInstance.model.set({ period: PERIOD });
        fixture.detectChanges();
        expect(fixture.componentInstance.events).toEqual([]);

        type(fixture, '01.08.2026 — 15.08.2026');
        expect(fixture.componentInstance.events).toEqual([{ start: '2026-08-01', end: '2026-08-15' }]);
        expect(fixture.componentInstance.model().period).toEqual(fixture.componentInstance.events[0]);
    });
});
