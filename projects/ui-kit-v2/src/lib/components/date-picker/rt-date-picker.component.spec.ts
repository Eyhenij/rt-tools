import { ChangeDetectionStrategy, Component, LOCALE_ID, Provider } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { createRtFixture, el, hostClasses, qa, textOf } from '../../../testing/rt-kit-testing';
import { IRtDatePicker } from './rt-date-picker.model';
import { RtDatePickerComponent } from './rt-date-picker.component';

/** Плоский вид зависит от локали — прибиваем её, иначе проверялась бы среда. */
const RU_LOCALE: Provider = { provide: LOCALE_ID, useValue: 'ru' };

@Component({
    selector: 'rt-date-picker-host',
    template: '<rt-date-picker [formControl]="control" />',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtDatePickerComponent, ReactiveFormsModule],
})
class DatePickerHostComponent {
    public readonly control: FormControl<string | null> = new FormControl<string | null>('');
}

function setup(inputs: Readonly<Record<string, unknown>> = {}): ComponentFixture<RtDatePickerComponent> {
    return createRtFixture(RtDatePickerComponent, inputs, { providers: [RU_LOCALE] });
}

function field<T>(fixture: ComponentFixture<T>): HTMLInputElement {
    return qa(fixture, 'date-picker-control')?.nativeElement as HTMLInputElement;
}

function type<T>(fixture: ComponentFixture<T>, text: string): void {
    const node: HTMLInputElement = field(fixture);
    node.value = text;
    node.dispatchEvent(new Event('input'));
    fixture.detectChanges();
}

describe('RtDatePickerComponent', (): void => {
    it('несёт свой BEM-блок', (): void => {
        expect(hostClasses(setup())).toContain('rt-date-picker');
    });

    it('без входа — нативное поле даты', (): void => {
        // Календарь рисует браузер: своего кит не везёт, поэтому раскладка и
        // формат ввода всегда совпадают с системными.
        expect(field(setup()).getAttribute('type')).toBe('date');
    });

    it.each<IRtDatePicker.Type>(['date', 'time', 'datetime-local'])('тип %s уезжает на нативное поле', (kind: IRtDatePicker.Type): void => {
        expect(field(setup({ type: kind })).getAttribute('type')).toBe(kind);
    });

    it('границы диапазона уезжают на нативное поле', (): void => {
        const fixture: ComponentFixture<RtDatePickerComponent> = setup({ min: '2026-01-01', max: '2026-12-31' });

        expect(field(fixture).getAttribute('min')).toBe('2026-01-01');
        expect(field(fixture).getAttribute('max')).toBe('2026-12-31');
    });

    describe('значение', (): void => {
        it('хранится строкой ISO — тем же форматом, что отдаёт нативное поле', (): void => {
            const fixture: ComponentFixture<DatePickerHostComponent> = createRtFixture(
                DatePickerHostComponent,
                {},
                { providers: [RU_LOCALE] }
            );

            type(fixture, '2026-03-15');

            expect(fixture.componentInstance.control.value).toBe('2026-03-15');
        });

        it('значение формы отражается в поле', (): void => {
            const fixture: ComponentFixture<DatePickerHostComponent> = createRtFixture(
                DatePickerHostComponent,
                {},
                { providers: [RU_LOCALE] }
            );

            fixture.componentInstance.control.setValue('2026-03-15');
            fixture.detectChanges();

            expect(field(fixture).value).toBe('2026-03-15');
        });

        it('уход фокуса помечает контрол тронутым', (): void => {
            const fixture: ComponentFixture<DatePickerHostComponent> = createRtFixture(
                DatePickerHostComponent,
                {},
                { providers: [RU_LOCALE] }
            );

            field(fixture).dispatchEvent(new Event('blur'));
            fixture.detectChanges();

            expect(fixture.componentInstance.control.touched).toBe(true);
        });
    });

    describe('режим только для чтения', (): void => {
        it('дата переписывается на язык интерфейса, а не остаётся ISO-строкой', (): void => {
            const fixture: ComponentFixture<RtDatePickerComponent> = setup();
            type(fixture, '2026-03-15');

            fixture.componentInstance.setReadonly(true);
            fixture.detectChanges();

            expect(textOf(qa(fixture, 'date-picker-readonly'))).toContain('2026');
            expect(textOf(qa(fixture, 'date-picker-readonly'))).not.toBe('2026-03-15');
        });

        it('время показывается часами и минутами', (): void => {
            const fixture: ComponentFixture<RtDatePickerComponent> = setup({ type: 'time' });
            type(fixture, '09:30');

            fixture.componentInstance.setReadonly(true);
            fixture.detectChanges();

            expect(textOf(qa(fixture, 'date-picker-readonly'))).toBe('09:30');
        });

        it('нераспознанное значение показывается как есть, а не пропадает', (): void => {
            // Значение пишется формой, а не набором: нативное поле даты чужую
            // строку в себя не пустит, а из формы она прийти может.
            const fixture: ComponentFixture<RtDatePickerComponent> = setup();
            fixture.componentInstance.writeValue('не дата');

            fixture.componentInstance.setReadonly(true);
            fixture.detectChanges();

            expect(textOf(qa(fixture, 'date-picker-readonly'))).toBe('не дата');
        });

        it('пустое значение рисуется прочерком', (): void => {
            const fixture: ComponentFixture<RtDatePickerComponent> = setup();

            fixture.componentInstance.setReadonly(true);
            fixture.detectChanges();

            expect(textOf(qa(fixture, 'date-picker-readonly'))).toBe('—');
        });
    });

    describe('очистка', (): void => {
        it('крестика нет, пока дата не выбрана', (): void => {
            expect(qa(setup(), 'date-picker-clear')).toBeNull();
        });

        it('крестик стирает дату', (): void => {
            const fixture: ComponentFixture<RtDatePickerComponent> = setup();
            type(fixture, '2026-03-15');

            el(fixture, '[qa-dataid="date-picker-clear"] button')?.nativeElement.click();
            fixture.detectChanges();

            expect(field(fixture).value).toBe('');
        });
    });

    it('отключение доходит до нативного поля', (): void => {
        expect(field(setup({ disabled: true })).disabled).toBe(true);
    });
});
