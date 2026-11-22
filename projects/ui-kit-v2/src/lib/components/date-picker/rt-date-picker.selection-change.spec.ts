import { signal, ChangeDetectionStrategy, Component, Provider, WritableSignal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FieldTree, FormField, form } from '@angular/forms/signals';

import { RT_KIT_LOCALE } from '../../i18n';
import { createRtFixture, el, qa } from '../../../testing/rt-kit-testing';
import { RtDatePickerComponent } from './rt-date-picker.component';

/** Порядок даты в тексте зависит от локали — прибиваем её. */
const RU_LOCALE: Provider = { provide: RT_KIT_LOCALE, useValue: signal('ru') };

/** Поле под реактивной формой: событие сравнивается с тем, что получила форма. */
@Component({
    selector: 'rt-date-picker-selection-host',
    template: '<rt-date-picker [formControl]="control" (selectionChange)="events.push($event)" />',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtDatePickerComponent, ReactiveFormsModule],
})
class DatePickerSelectionHostComponent {
    public readonly control: FormControl<string | null> = new FormControl<string | null>('');
    public readonly events: string[] = [];
}

interface IVisit {
    day: string;
}

/** Поле под сигнальной формой: модель задаётся снаружи, как её задаёт хранилище. */
@Component({
    selector: 'rt-date-picker-selection-signal-host',
    template: '<rt-date-picker [formField]="visit.day" (selectionChange)="events.push($event)" />',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtDatePickerComponent, FormField],
})
class DatePickerSelectionSignalHostComponent {
    public readonly model: WritableSignal<IVisit> = signal<IVisit>({ day: '' });
    public readonly visit: FieldTree<IVisit> = form(this.model);
    public readonly events: string[] = [];
}

function setupHost(): ComponentFixture<DatePickerSelectionHostComponent> {
    return createRtFixture(DatePickerSelectionHostComponent, {}, { providers: [RU_LOCALE] });
}

function setValue(fixture: ComponentFixture<DatePickerSelectionHostComponent>, value: string): void {
    fixture.componentInstance.control.setValue(value);
    fixture.detectChanges();
}

function type<T>(fixture: ComponentFixture<T>, text: string): void {
    const node: HTMLInputElement = qa(fixture, 'date-picker-control')?.nativeElement as HTMLInputElement;
    node.value = text;
    node.dispatchEvent(new Event('input'));
    fixture.detectChanges();
}

function popup(): HTMLElement | null {
    return document.querySelector('[qa-dataid="date-picker-popup"]');
}

describe('RtDatePickerComponent — selectionChange', (): void => {
    it('SC-UKV-1708 — writeValue из формы события не даёт', (): void => {
        const fixture: ComponentFixture<DatePickerSelectionHostComponent> = setupHost();

        setValue(fixture, '2026-03-15');

        expect(fixture.componentInstance.events).toEqual([]);
    });

    it('SC-UKV-1708 — набранная дата даёт событие с той же строкой, что получила форма', (): void => {
        const fixture: ComponentFixture<DatePickerSelectionHostComponent> = setupHost();

        type(fixture, '15.03.2026');

        expect(fixture.componentInstance.events).toEqual(['2026-03-15']);
        expect(fixture.componentInstance.control.value).toBe('2026-03-15');
    });

    it('SC-UKV-1708 — нечитаемый текст события не даёт, стёртый текст даёт пустую строку', (): void => {
        const fixture: ComponentFixture<DatePickerSelectionHostComponent> = setupHost();
        setValue(fixture, '2026-03-15');

        type(fixture, 'не дата');
        expect(fixture.componentInstance.events).toEqual([]);

        type(fixture, '');
        expect(fixture.componentInstance.events).toEqual(['']);
        expect(fixture.componentInstance.control.value).toBe('');
    });

    it('SC-UKV-1708 — крестик даёт пустую строку — то же, что ушло в форму', (): void => {
        const fixture: ComponentFixture<DatePickerSelectionHostComponent> = setupHost();
        setValue(fixture, '2026-03-15');

        el(fixture, '[qa-dataid="date-picker-clear"] [qa-dataid="icon-button-control"]')?.nativeElement.click();
        fixture.detectChanges();

        expect(fixture.componentInstance.events).toEqual(['']);
        expect(fixture.componentInstance.control.value).toBe('');
    });

    it('SC-UKV-1708 — отключённое поле на очистку события не даёт', (): void => {
        const fixture: ComponentFixture<DatePickerSelectionHostComponent> = setupHost();
        setValue(fixture, '2026-03-15');
        fixture.componentInstance.control.disable();
        fixture.detectChanges();

        const picker: RtDatePickerComponent = fixture.debugElement.children[0].componentInstance as RtDatePickerComponent;
        (picker as unknown as { clear: () => void }).clear();
        fixture.detectChanges();

        expect(fixture.componentInstance.events).toEqual([]);
        expect(fixture.componentInstance.control.value).toBe('2026-03-15');
    });

    it('SC-UKV-1708 — обработчик события, вернувший форме прежнее значение, видит его в поле', (): void => {
        const fixture: ComponentFixture<DatePickerSelectionHostComponent> = setupHost();
        setValue(fixture, '2026-03-10');
        const picker: RtDatePickerComponent = fixture.debugElement.children[0].componentInstance as RtDatePickerComponent;
        picker.selectionChange.subscribe((): void => fixture.componentInstance.control.setValue('2026-03-10'));

        type(fixture, '15.03.2026');

        expect(fixture.componentInstance.control.value).toBe('2026-03-10');
        expect((qa(fixture, 'date-picker-control')?.nativeElement as HTMLInputElement).value).toBe('10.03.2026');
    });

    describe('панель', (): void => {
        afterEach((): void => {
            popup()?.closest('.cdk-overlay-container')?.replaceChildren();
        });

        it('SC-UKV-1708 — день из панели даёт одно событие с той же строкой, что получила форма', (): void => {
            const fixture: ComponentFixture<DatePickerSelectionHostComponent> = setupHost();
            setValue(fixture, '2026-03-15');
            (el(fixture, '[qa-dataid="date-picker-open"] [qa-dataid="icon-button-control"]')?.nativeElement as HTMLButtonElement).click();
            fixture.detectChanges();

            (popup()?.querySelector('[data-iso="2026-03-20"]') as HTMLButtonElement).click();
            fixture.detectChanges();

            expect(fixture.componentInstance.events).toEqual(['2026-03-20']);
            expect(fixture.componentInstance.control.value).toBe('2026-03-20');
        });
    });

    it('SC-UKV-1708 — модель сигнальной формы, заданная снаружи, события не даёт, набор — даёт', (): void => {
        const fixture: ComponentFixture<DatePickerSelectionSignalHostComponent> = createRtFixture(
            DatePickerSelectionSignalHostComponent,
            {},
            { providers: [RU_LOCALE] }
        );

        fixture.componentInstance.model.set({ day: '2026-03-15' });
        fixture.detectChanges();
        expect(fixture.componentInstance.events).toEqual([]);

        type(fixture, '20.03.2026');
        expect(fixture.componentInstance.events).toEqual(['2026-03-20']);
        expect(fixture.componentInstance.model().day).toBe(fixture.componentInstance.events[0]);
    });
});
