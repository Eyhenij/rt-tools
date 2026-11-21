import { ChangeDetectionStrategy, Component, Provider, WritableSignal, signal, ɵINPUT_SIGNAL_BRAND_WRITE_TYPE } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FieldTree, FormField, form } from '@angular/forms/signals';

import { RT_KIT_LOCALE } from '../../i18n';
import { createRtFixture, qa, setInputs } from '../../../testing/rt-kit-testing';
import { RtDatePickerComponent } from './rt-date-picker.component';

/** Порядок дня в тексте зависит от локали — прибиваем её. */
const RU_LOCALE: Provider = { provide: RT_KIT_LOCALE, useValue: signal('ru') };

/** Что вход принимает на запись — тип, который проверяет шаблон потребителя; Jest шаблон не типизирует. */
type TInputWrite<TInput> = TInput extends { [ɵINPUT_SIGNAL_BRAND_WRITE_TYPE]: infer TWrite } ? TWrite : never;

/**
 * Сигнальная форма пишет в `min`, `max` `undefined`, когда границу не задала. Тип ниже не
 * соберётся, если вход перестанет это принимать: его ловит проверка типов спек.
 */
const BOUNDS_TAKE_UNDEFINED: [
    undefined extends TInputWrite<RtDatePickerComponent['min']> ? true : false,
    undefined extends TInputWrite<RtDatePickerComponent['max']> ? true : false,
] = [true, true];

interface IVisit {
    day: string;
}

/** Поле дня под сигнальной формой, которая не задала границ. */
@Component({
    selector: 'rt-date-picker-signal-host',
    template: '<rt-date-picker [formField]="visit.day" />',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtDatePickerComponent, FormField],
})
class DatePickerSignalHostComponent {
    public readonly model: WritableSignal<IVisit> = signal<IVisit>({ day: '' });
    public readonly visit: FieldTree<IVisit> = form(this.model);
}

function picker<T>(fixture: ComponentFixture<T>): RtDatePickerComponent {
    return fixture.debugElement.query(By.directive(RtDatePickerComponent)).componentInstance as RtDatePickerComponent;
}

function type<T>(fixture: ComponentFixture<T>, text: string): void {
    const node: HTMLInputElement = qa(fixture, 'date-picker-control')?.nativeElement as HTMLInputElement;
    node.value = text;
    node.dispatchEvent(new Event('input'));
    fixture.detectChanges();
}

describe('RtDatePickerComponent под сигнальной формой', (): void => {
    it('SC-UKV-1582 — входы границ принимают undefined', (): void => {
        expect(BOUNDS_TAKE_UNDEFINED).toEqual([true, true]);
    });

    it('SC-UKV-1582 — поле без границ собирается, и набранный день уходит в модель', (): void => {
        const fixture: ComponentFixture<DatePickerSignalHostComponent> = createRtFixture(
            DatePickerSignalHostComponent,
            {},
            {
                providers: [RU_LOCALE],
            }
        );

        type(fixture, '15.03.2026');

        expect(fixture.componentInstance.model()).toEqual({ day: '2026-03-15' });
        expect(picker(fixture).min()).toBeNull();
        expect(picker(fixture).max()).toBeNull();
    });

    it('SC-UKV-1582 — граница undefined читается как её отсутствие, null и день — как раньше', (): void => {
        const fixture: ComponentFixture<RtDatePickerComponent> = createRtFixture(
            RtDatePickerComponent,
            { min: '2026-01-01' },
            {
                providers: [RU_LOCALE],
            }
        );
        expect(fixture.componentInstance.min()).toBe('2026-01-01');

        setInputs(fixture, { min: undefined, max: null });

        expect(fixture.componentInstance.min()).toBeNull();
        expect(fixture.componentInstance.max()).toBeNull();
    });
});
