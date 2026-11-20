import { ChangeDetectionStrategy, Component, Provider, WritableSignal, signal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FieldTree, FormField, form } from '@angular/forms/signals';

import { RT_KIT_LOCALE } from '../../i18n';
import { TRtInputWrite, createRtFixture, qa, setInputs } from '../../../testing/rt-kit-testing';
import { RtDateRangeComponent } from './rt-date-range.component';
import { IRtDateRange } from './rt-date-range.model';

/** Порядок дня в тексте зависит от локали — прибиваем её. */
const RU_LOCALE: Provider = { provide: RT_KIT_LOCALE, useValue: signal('ru') };

/**
 * Сигнальная форма типизирует границу поля диапазона типом его значения и пишет `undefined`, когда
 * границу не задала. Тип ниже не соберётся, если вход перестанет принимать любое из двух.
 */
const BOUNDS_TAKE_FORM_TYPES: [
    undefined extends TRtInputWrite<RtDateRangeComponent['min']> ? true : false,
    IRtDateRange.Value extends TRtInputWrite<RtDateRangeComponent['max']> ? true : false,
] = [true, true];

interface IReport {
    period: IRtDateRange.Value | null;
}

/** Поле диапазона под сигнальной формой, которая не задала границ. */
@Component({
    selector: 'rt-date-range-signal-host',
    template: '<rt-date-range [formField]="report.period" />',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtDateRangeComponent, FormField],
})
class DateRangeSignalHostComponent {
    public readonly model: WritableSignal<IReport> = signal<IReport>({ period: null });
    public readonly report: FieldTree<IReport> = form(this.model);
}

function range<T>(fixture: ComponentFixture<T>): RtDateRangeComponent {
    return fixture.debugElement.query(By.directive(RtDateRangeComponent)).componentInstance as RtDateRangeComponent;
}

function type<T>(fixture: ComponentFixture<T>, text: string): void {
    const node: HTMLInputElement = qa(fixture, 'date-range-control')?.nativeElement as HTMLInputElement;
    node.value = text;
    node.dispatchEvent(new Event('input'));
    fixture.detectChanges();
}

describe('RtDateRangeComponent под сигнальной формой', (): void => {
    it('SC-UKV-1583 — входы границ принимают undefined и диапазон', (): void => {
        expect(BOUNDS_TAKE_FORM_TYPES).toEqual([true, true]);
    });

    it('SC-UKV-1583 — поле без границ собирается, и набранный диапазон уходит в модель', (): void => {
        const fixture: ComponentFixture<DateRangeSignalHostComponent> = createRtFixture(
            DateRangeSignalHostComponent,
            {},
            {
                providers: [RU_LOCALE],
            }
        );

        type(fixture, '01.08.2026 — 15.08.2026');

        expect(fixture.componentInstance.model()).toEqual({ period: { start: '2026-08-01', end: '2026-08-15' } });
        expect(range(fixture).min()).toBeNull();
        expect(range(fixture).max()).toBeNull();
    });

    it('SC-UKV-1583 — undefined и диапазон на месте границы границы не задают, null и день — как раньше', (): void => {
        const fixture: ComponentFixture<RtDateRangeComponent> = createRtFixture(
            RtDateRangeComponent,
            { min: '2026-01-01' },
            {
                providers: [RU_LOCALE],
            }
        );
        expect(fixture.componentInstance.min()).toBe('2026-01-01');

        setInputs(fixture, { min: undefined, max: { start: '2026-01-01', end: '2026-01-31' } });
        expect(fixture.componentInstance.min()).toBeNull();
        expect(fixture.componentInstance.max()).toBeNull();

        setInputs(fixture, { min: null, max: '2026-12-31' });
        expect(fixture.componentInstance.min()).toBeNull();
        expect(fixture.componentInstance.max()).toBe('2026-12-31');
    });
});
