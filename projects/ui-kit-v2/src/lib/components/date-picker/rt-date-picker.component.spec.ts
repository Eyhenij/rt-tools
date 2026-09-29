import { ChangeDetectionStrategy, Component, LOCALE_ID, Provider } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { BreakpointsService } from '../../platform';
import { createRtFixture, el, hostClasses, qa, textOf } from '../../../testing/rt-kit-testing';
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

/** Подмена наблюдателя ширины: сам он в тестовой среде ничего не измеряет. */
class NarrowBreakpointsService {
    public readonly narrow: () => boolean = (): boolean => true;
}

function setup(inputs: Readonly<Record<string, unknown>> = {}): ComponentFixture<RtDatePickerComponent> {
    return createRtFixture(RtDatePickerComponent, inputs, { providers: [RU_LOCALE] });
}

function setupHost(): ComponentFixture<DatePickerHostComponent> {
    return createRtFixture(DatePickerHostComponent, {}, { providers: [RU_LOCALE] });
}

function openButton<T>(fixture: ComponentFixture<T>): HTMLButtonElement {
    return el(fixture, '[qa-dataid="date-picker-open"] [qa-dataid="icon-button-control"]')?.nativeElement as HTMLButtonElement;
}

function popup(): HTMLElement | null {
    return document.querySelector('[qa-dataid="date-picker-popup"]');
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

    it('поле текстовое, подсказка показывает форму значения по типу', (): void => {
        expect(field(setup()).getAttribute('type')).toBe('text');
        expect(field(setup()).getAttribute('placeholder')).toBe('YYYY-MM-DD');
        expect(field(setup({ type: 'time' })).getAttribute('placeholder')).toBe('HH:mm');
        expect(field(setup({ type: 'datetime-local' })).getAttribute('placeholder')).toBe('YYYY-MM-DDTHH:mm');
    });

    describe('набор текста', (): void => {
        it('SC-UKV-419 — текст формы значения в границах становится значением', (): void => {
            const fixture: ComponentFixture<RtDatePickerComponent> = setup({ min: '2026-01-01', max: '2026-12-31' });
            const changes: string[] = [];
            fixture.componentInstance.registerOnChange((value: string): void => {
                changes.push(value);
            });

            type(fixture, '2026-03-15');

            expect(changes).toEqual(['2026-03-15']);
            expect(hostClasses(fixture)).not.toContain('rt-date-picker--invalid');
        });

        it('SC-UKV-419 — нечитаемый текст и дата за границей оставляют значение и помечают поле', (): void => {
            const fixture: ComponentFixture<DatePickerHostComponent> = setupHost();
            fixture.componentInstance.control.setValue('2026-03-15');
            fixture.detectChanges();

            type(fixture, 'не дата');
            expect(fixture.componentInstance.control.value).toBe('2026-03-15');
            expect(field(fixture).getAttribute('aria-invalid')).toBe('true');

            type(fixture, '2026-02-30');
            expect(fixture.componentInstance.control.value).toBe('2026-03-15');

            type(fixture, '2026-04-01');
            expect(fixture.componentInstance.control.value).toBe('2026-04-01');
            expect(field(fixture).getAttribute('aria-invalid')).toBeNull();
        });

        it('SC-UKV-419 — дата за max не становится значением', (): void => {
            const fixture: ComponentFixture<RtDatePickerComponent> = setup({ max: '2026-12-31' });
            const changes: jest.Mock = jest.fn();
            fixture.componentInstance.registerOnChange(changes);

            type(fixture, '2027-01-01');

            expect(changes).not.toHaveBeenCalled();
            expect(hostClasses(fixture)).toContain('rt-date-picker--invalid');
        });

        it('стёртый текст очищает значение', (): void => {
            const fixture: ComponentFixture<DatePickerHostComponent> = setupHost();
            type(fixture, '2026-03-15');

            type(fixture, '');

            expect(fixture.componentInstance.control.value).toBe('');
        });
    });

    describe('панель', (): void => {
        afterEach((): void => {
            popup()?.closest('.cdk-overlay-container')?.replaceChildren();
        });

        it('SC-UKV-420 — клик в текст панель не открывает, кнопка в конце поля — открывает', (): void => {
            const fixture: ComponentFixture<RtDatePickerComponent> = setup();

            field(fixture).click();
            fixture.detectChanges();
            expect(popup()).toBeNull();

            openButton(fixture).click();
            fixture.detectChanges();
            expect(popup()?.querySelector('rt-date-panel')).not.toBeNull();
        });

        it('SC-UKV-420 — Escape закрывает панель', (): void => {
            const fixture: ComponentFixture<RtDatePickerComponent> = setup();
            openButton(fixture).click();
            fixture.detectChanges();

            popup()
                ?.querySelector('rt-date-panel')
                ?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
            fixture.detectChanges();

            expect(popup()).toBeNull();
        });

        it('SC-UKV-418 — день из панели записывается в форму строкой формы значения и закрывает её', (): void => {
            const fixture: ComponentFixture<DatePickerHostComponent> = setupHost();
            fixture.componentInstance.control.setValue('2026-03-15');
            fixture.detectChanges();
            openButton(fixture).click();
            fixture.detectChanges();

            (popup()?.querySelector('[data-iso="2026-03-20"]') as HTMLButtonElement).click();
            fixture.detectChanges();

            expect(fixture.componentInstance.control.value).toBe('2026-03-20');
            expect(field(fixture).value).toBe('2026-03-20');
            expect(popup()).toBeNull();
        });

        it('отключённое поле панель не открывает', (): void => {
            const fixture: ComponentFixture<RtDatePickerComponent> = setup({ disabled: true });

            expect(openButton(fixture).disabled).toBe(true);
        });

        it('SC-UKV-428 — на узком экране панель открывается в нижней шторке', (): void => {
            const fixture: ComponentFixture<RtDatePickerComponent> = createRtFixture(
                RtDatePickerComponent,
                { type: 'datetime-local' },
                { providers: [RU_LOCALE, { provide: BreakpointsService, useClass: NarrowBreakpointsService }] }
            );
            const sheet: HTMLElement = qa(fixture, 'date-picker-sheet')?.nativeElement as HTMLElement;
            expect(sheet.classList).not.toContain('rt-bottom-sheet--open');
            expect(sheet.querySelector('rt-date-panel')).toBeNull();

            openButton(fixture).click();
            fixture.detectChanges();

            expect(sheet.classList).toContain('rt-bottom-sheet--open');
            expect(sheet.querySelector('rt-date-panel')?.classList).toContain('rt-date-panel--sheet');
            expect(sheet.querySelector('[qa-dataid="date-panel-tabs"]')).not.toBeNull();
            expect(popup()).toBeNull();
        });
    });

    describe('значение', (): void => {
        it('хранится строкой ISO — тем же форматом, что отдаёт нативное поле', (): void => {
            const fixture: ComponentFixture<DatePickerHostComponent> = setupHost();

            type(fixture, '2026-03-15');

            expect(fixture.componentInstance.control.value).toBe('2026-03-15');
        });

        it('значение формы отражается в поле', (): void => {
            const fixture: ComponentFixture<DatePickerHostComponent> = setupHost();

            fixture.componentInstance.control.setValue('2026-03-15');
            fixture.detectChanges();

            expect(field(fixture).value).toBe('2026-03-15');
        });

        it('уход фокуса помечает контрол тронутым', (): void => {
            const fixture: ComponentFixture<DatePickerHostComponent> = setupHost();

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
            // Значение пишется формой, а не набором: набранную чужую строку поле в
            // значение не пустит, а из формы она прийти может.
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
