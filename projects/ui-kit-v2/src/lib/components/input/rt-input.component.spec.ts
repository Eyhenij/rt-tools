import { ChangeDetectionStrategy, Component, DebugElement } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

import { createRtFixture, el, hostClasses, qa, setInputs, textOf } from '../../../testing/rt-kit-testing';
import { RtInputComponent } from './rt-input.component';
import { IRtInput } from './rt-input.model';

@Component({
    selector: 'rt-input-host',
    template: '<rt-input [formControl]="control" placeholder="Имя" />',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtInputComponent, ReactiveFormsModule],
})
class InputHostComponent {
    public readonly control: FormControl<string | null> = new FormControl<string | null>('', [Validators.required]);
}

function setup(inputs: Readonly<Record<string, unknown>> = {}): ComponentFixture<RtInputComponent> {
    return createRtFixture(RtInputComponent, inputs);
}

function field<T>(fixture: ComponentFixture<T>): HTMLInputElement {
    return qa(fixture, 'input-control')?.nativeElement as HTMLInputElement;
}

function type<T>(fixture: ComponentFixture<T>, text: string): void {
    const node: HTMLInputElement = field(fixture);
    node.value = text;
    node.dispatchEvent(new Event('input'));
    fixture.detectChanges();
}

describe('RtInputComponent', (): void => {
    it('несёт свой BEM-блок', (): void => {
        expect(hostClasses(setup())).toContain('rt-input');
    });

    it('без входов — обычное текстовое поле', (): void => {
        expect(field(setup()).type).toBe('text');
    });

    it.each<IRtInput.Type>(['text', 'password', 'email', 'time'])('тип %s уезжает на нативное поле', (inputType: IRtInput.Type): void => {
        expect(field(setup({ type: inputType })).type).toBe(inputType);
    });

    it('подсказка уезжает на нативное поле', (): void => {
        expect(field(setup({ placeholder: 'Введите имя' })).placeholder).toBe('Введите имя');
    });

    describe('размер', (): void => {
        it('средний размер класса не выводит — он и есть умолчание', (): void => {
            expect(hostClasses(setup()).filter((cls: string): boolean => cls.startsWith('rt-input--size'))).toEqual([]);
        });

        it.each<[IRtInput.Size, string]>([
            ['sm', 'rt-input--size--sm'],
            ['lg', 'rt-input--size--lg'],
        ])('размер %s выводит класс', (size: IRtInput.Size, expected: string): void => {
            expect(hostClasses(setup({ size }))).toContain(expected);
        });
    });

    describe('иконки', (): void => {
        it('левая иконка рисуется и помечает host', (): void => {
            const fixture: ComponentFixture<RtInputComponent> = setup({ iconLeft: 'search' });

            expect(el(fixture, '.rt-input__icon-left use')?.attributes['href']).toBe('#rt-icon-search');
            expect(hostClasses(fixture)).toContain('rt-input--with-icon-left');
        });

        it('правая иконка рисуется и помечает host', (): void => {
            const fixture: ComponentFixture<RtInputComponent> = setup({ iconRight: 'check' });

            expect(el(fixture, '.rt-input__icon-right use')?.attributes['href']).toBe('#rt-icon-check');
            expect(hostClasses(fixture)).toContain('rt-input--with-icon-right');
        });
    });

    describe('очистка', (): void => {
        it('крестика нет, пока поле пусто', (): void => {
            expect(qa(setup(), 'input-clear')).toBeNull();
        });

        it('крестик появляется, как только появилось значение', (): void => {
            const fixture: ComponentFixture<RtInputComponent> = setup();

            type(fixture, 'Иван');

            expect(qa(fixture, 'input-clear')).not.toBeNull();
        });

        it('крестик стирает значение', (): void => {
            const fixture: ComponentFixture<RtInputComponent> = setup();
            type(fixture, 'Иван');

            el(fixture, '[qa-dataid="input-clear"] button')?.nativeElement.click();
            fixture.detectChanges();

            expect(field(fixture).value).toBe('');
        });

        it('очистку можно выключить входом', (): void => {
            const fixture: ComponentFixture<RtInputComponent> = setup({ clearable: false });

            type(fixture, 'Иван');

            expect(qa(fixture, 'input-clear')).toBeNull();
        });

        it('у отключённого поля крестика нет', (): void => {
            const fixture: ComponentFixture<RtInputComponent> = setup();
            type(fixture, 'Иван');

            setInputs(fixture, { disabled: true });
            fixture.detectChanges();

            expect(qa(fixture, 'input-clear')).toBeNull();
        });

        it('крестик исключён из таб-порядка — до него табом не доходят', (): void => {
            const fixture: ComponentFixture<RtInputComponent> = setup();
            type(fixture, 'Иван');

            expect(el(fixture, '[qa-dataid="input-clear"] button')?.attributes['tabindex']).toBe('-1');
        });
    });

    describe('пароль', (): void => {
        it('переключатель показывается только на поле пароля', (): void => {
            expect(qa(setup({ passwordToggle: true, type: 'text' }), 'input-password-toggle')).toBeNull();
            expect(qa(setup({ passwordToggle: true, type: 'password' }), 'input-password-toggle')).not.toBeNull();
        });

        it('переключатель открывает и снова прячет значение', (): void => {
            const fixture: ComponentFixture<RtInputComponent> = setup({ passwordToggle: true, type: 'password' });
            const toggle: DebugElement | null = qa(fixture, 'input-password-toggle');

            toggle?.nativeElement.click();
            fixture.detectChanges();
            expect(field(fixture).type).toBe('text');

            qa(fixture, 'input-password-toggle')?.nativeElement.click();
            fixture.detectChanges();
            expect(field(fixture).type).toBe('password');
        });

        it('подпись переключателя меняется вместе с состоянием', (): void => {
            const fixture: ComponentFixture<RtInputComponent> = setup({ passwordToggle: true, type: 'password' });

            expect(qa(fixture, 'input-password-toggle')?.attributes['aria-label']).toBe('Show password');

            qa(fixture, 'input-password-toggle')?.nativeElement.click();
            fixture.detectChanges();

            expect(qa(fixture, 'input-password-toggle')?.attributes['aria-label']).toBe('Hide password');
        });

        it('на поле пароля крестик уступает место переключателю', (): void => {
            // Постфикс один; показать и то, и другое некуда.
            const fixture: ComponentFixture<RtInputComponent> = setup({ passwordToggle: true, type: 'password' });

            type(fixture, 'секрет');

            expect(qa(fixture, 'input-clear')).toBeNull();
            expect(qa(fixture, 'input-password-toggle')).not.toBeNull();
        });
    });

    describe('режим только для чтения', (): void => {
        it('включается снаружи и подменяет поле плоским текстом', (): void => {
            // Режим включает вмещающий `rt-field`, а не вход компонента.
            const fixture: ComponentFixture<RtInputComponent> = setup();
            type(fixture, 'Иван');

            fixture.componentInstance.setReadonly(true);
            fixture.detectChanges();

            expect(qa(fixture, 'input-control')).toBeNull();
            expect(textOf(qa(fixture, 'input-readonly'))).toBe('Иван');
        });

        it('пустое значение рисуется прочерком', (): void => {
            const fixture: ComponentFixture<RtInputComponent> = setup();

            fixture.componentInstance.setReadonly(true);
            fixture.detectChanges();

            expect(textOf(qa(fixture, 'input-readonly'))).toBe('—');
        });
    });

    describe('реактивная форма', (): void => {
        it('значение формы отражается в поле', (): void => {
            const fixture: ComponentFixture<InputHostComponent> = createRtFixture(InputHostComponent);

            fixture.componentInstance.control.setValue('Иван');
            fixture.detectChanges();

            expect(field(fixture).value).toBe('Иван');
        });

        it('ввод пишет значение в форму', (): void => {
            const fixture: ComponentFixture<InputHostComponent> = createRtFixture(InputHostComponent);

            type(fixture, 'Пётр');

            expect(fixture.componentInstance.control.value).toBe('Пётр');
        });

        it('уход фокуса помечает контрол тронутым', (): void => {
            const fixture: ComponentFixture<InputHostComponent> = createRtFixture(InputHostComponent);

            field(fixture).dispatchEvent(new Event('blur'));
            fixture.detectChanges();

            expect(fixture.componentInstance.control.touched).toBe(true);
        });

        it('ошибка подсвечивается только после того, как поля коснулись', (): void => {
            // Пустое обязательное поле невалидно с самого начала; краснеть до
            // первого касания оно не должно.
            const fixture: ComponentFixture<InputHostComponent> = createRtFixture(InputHostComponent);

            expect(el(fixture, 'rt-input')?.nativeElement.classList).not.toContain('rt-input--invalid');

            fixture.componentInstance.control.markAsTouched();
            fixture.componentInstance.control.updateValueAndValidity();
            fixture.detectChanges();

            expect(Array.from(el(fixture, 'rt-input')?.nativeElement.classList as DOMTokenList)).toContain('rt-input--invalid');
        });

        it('поле знает, что контрол обязателен — по этому rt-field рисует звёздочку', (): void => {
            const fixture: ComponentFixture<InputHostComponent> = createRtFixture(InputHostComponent);
            const control: RtInputComponent = el(fixture, 'rt-input')?.componentInstance as RtInputComponent;

            expect(control.required()).toBe(true);
        });

        it('отключение формой отключает нативное поле', (): void => {
            const fixture: ComponentFixture<InputHostComponent> = createRtFixture(InputHostComponent);

            fixture.componentInstance.control.disable();
            fixture.detectChanges();

            expect(field(fixture).disabled).toBe(true);
        });
    });

    describe('рамка', (): void => {
        it('по умолчанию видна', (): void => {
            expect(hostClasses(setup())).not.toContain('rt-input--borderless');
        });

        it('снимается входом', (): void => {
            expect(hostClasses(setup({ bordered: false }))).toContain('rt-input--borderless');
        });
    });

    describe('доступность', (): void => {
        it('идентификатор кладётся на нативное поле', (): void => {
            expect(field(setup({ controlId: 'name' })).id).toBe('name');
        });

        it('подпись для скринридера уезжает на нативное поле', (): void => {
            expect(qa(setup({ ariaLabel: 'Имя' }), 'input-control')?.attributes['aria-label']).toBe('Имя');
        });

        it('признак ошибки не пишется, пока ошибки нет', (): void => {
            expect(qa(setup(), 'input-control')?.attributes['aria-invalid']).toBeUndefined();
        });
    });
});
