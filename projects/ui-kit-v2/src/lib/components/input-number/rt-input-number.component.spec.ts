import { ChangeDetectionStrategy, Component, LOCALE_ID, Provider } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { createRtFixture, el, hostClasses, qa, textOf } from '../../../testing/rt-kit-testing';
import { RtInputNumberComponent } from './rt-input-number.component';

/**
 * Разбор и запись значения зависят от локали: она задаёт и разделитель разрядов,
 * и десятичный. Спека прибивает `ru` — ту локаль, под которую поле написано
 * (разряды разделяет пробел, дробную часть — запятая).
 */
const RU_LOCALE: Provider = { provide: LOCALE_ID, useValue: 'ru' };

@Component({
    selector: 'rt-input-number-host',
    template: '<rt-input-number [formControl]="control" />',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtInputNumberComponent, ReactiveFormsModule],
})
class InputNumberHostComponent {
    public readonly control: FormControl<number | null> = new FormControl<number | null>(null);
}

function setup(inputs: Readonly<Record<string, unknown>> = {}): ComponentFixture<RtInputNumberComponent> {
    return createRtFixture(RtInputNumberComponent, inputs, { providers: [RU_LOCALE] });
}

function setupHost(): ComponentFixture<InputNumberHostComponent> {
    return createRtFixture(InputNumberHostComponent, {}, { providers: [RU_LOCALE] });
}

function field<T>(fixture: ComponentFixture<T>): HTMLInputElement {
    return qa(fixture, 'input-number-control')?.nativeElement as HTMLInputElement;
}

function type<T>(fixture: ComponentFixture<T>, text: string): void {
    const node: HTMLInputElement = field(fixture);
    node.value = text;
    node.dispatchEvent(new Event('input'));
    fixture.detectChanges();
}

function blur<T>(fixture: ComponentFixture<T>): void {
    field(fixture).dispatchEvent(new Event('blur'));
    fixture.detectChanges();
}

/** Неразрывный пробел — им русская локаль разделяет разряды. */
const NBSP: string = ' ';

describe('RtInputNumberComponent', (): void => {
    it('несёт свой BEM-блок', (): void => {
        expect(hostClasses(setup())).toContain('rt-input-number');
    });

    it('это текстовое поле с числовой клавиатурой, а не type=number', (): void => {
        // У нативного числового поля колесо мыши меняет значение, а разделители
        // зависят от браузера — оба поведения здесь не нужны.
        const node: HTMLInputElement = field(setup());

        expect(node.type).toBe('text');
        expect(node.getAttribute('inputmode')).toBe('decimal');
        expect(node.getAttribute('autocomplete')).toBe('off');
    });

    describe('набор', (): void => {
        it('разряды группируются прямо во время набора', (): void => {
            const fixture: ComponentFixture<RtInputNumberComponent> = setup();

            type(fixture, '1000000');

            expect(field(fixture).value).toBe(`1${NBSP}000${NBSP}000`);
        });

        it('ведущие нули убираются', (): void => {
            const fixture: ComponentFixture<RtInputNumberComponent> = setup();

            type(fixture, '007');

            expect(field(fixture).value).toBe('7');
        });

        it('буквы в поле не попадают', (): void => {
            const fixture: ComponentFixture<RtInputNumberComponent> = setup();

            type(fixture, '12ab3');

            expect(field(fixture).value).toBe('123');
        });

        it('хвостовой разделитель сохраняется — иначе дробную часть не набрать', (): void => {
            const fixture: ComponentFixture<RtInputNumberComponent> = setup();

            type(fixture, '12,');

            expect(field(fixture).value).toBe('12,');
        });

        it('точка принимается наравне с запятой', (): void => {
            const fixture: ComponentFixture<RtInputNumberComponent> = setup();

            type(fixture, '12.5');
            blur(fixture);

            expect(field(fixture).value).toBe('12,50');
        });
    });

    describe('уход фокуса', (): void => {
        it('дописывает дробную часть до точности, а она по умолчанию — два знака', (): void => {
            // Точность фиксирована: нижняя и верхняя границы дробной части
            // сходятся в одно число, поэтому «12» превращается в «12,00».
            const fixture: ComponentFixture<RtInputNumberComponent> = setup();

            type(fixture, '12');
            blur(fixture);

            expect(field(fixture).value).toBe('12,00');
        });

        it('заданная точность в четыре знака дописывает четыре', (): void => {
            const fixture: ComponentFixture<RtInputNumberComponent> = setup({ maxFractionDigits: 4 });

            type(fixture, '12');
            blur(fixture);

            expect(field(fixture).value).toBe('12,0000');
        });

        it('целочисленное поле округляет дробь', (): void => {
            const fixture: ComponentFixture<RtInputNumberComponent> = setup({ maxFractionDigits: 0 });

            type(fixture, '1000,5');
            blur(fixture);

            expect(field(fixture).value).toBe(`1${NBSP}001`);
        });

        it('значение ниже нижней границы поднимается до неё', (): void => {
            const fixture: ComponentFixture<RtInputNumberComponent> = setup({ min: 10, maxFractionDigits: 0 });

            type(fixture, '3');
            blur(fixture);

            expect(field(fixture).value).toBe('10');
        });

        it('значение выше верхней границы опускается до неё', (): void => {
            const fixture: ComponentFixture<RtInputNumberComponent> = setup({ max: 50, maxFractionDigits: 0 });

            type(fixture, '99');
            blur(fixture);

            expect(field(fixture).value).toBe('50');
        });

        it('нечисловой остаток сбрасывается в пустое поле', (): void => {
            const fixture: ComponentFixture<RtInputNumberComponent> = setup();

            type(fixture, 'абв');
            blur(fixture);

            expect(field(fixture).value).toBe('');
        });
    });

    describe('очистка', (): void => {
        it('крестика нет, пока поле пусто', (): void => {
            expect(qa(setup(), 'input-number-clear')).toBeNull();
        });

        it('крестик появляется при непустом значении', (): void => {
            const fixture: ComponentFixture<RtInputNumberComponent> = setup();

            type(fixture, '5');

            expect(qa(fixture, 'input-number-clear')).not.toBeNull();
        });

        it('крестик обнуляет поле, а не опустошает его', (): void => {
            // У числового поля ноль осмыслен, поэтому «очистка» — это обнуление.
            const fixture: ComponentFixture<RtInputNumberComponent> = setup({ minFractionDigits: 2 });
            type(fixture, '25');

            el(fixture, '[qa-dataid="input-number-clear"] button')?.nativeElement.click();
            fixture.detectChanges();

            expect(field(fixture).value).toBe('0,00');
        });

        it('при нуле крестика нет — обнулять больше нечего', (): void => {
            const fixture: ComponentFixture<RtInputNumberComponent> = setup();

            type(fixture, '0');

            expect(qa(fixture, 'input-number-clear')).toBeNull();
        });
    });

    describe('префикс', (): void => {
        it('рисуется слева и спрятан от скринридера — валюту он прочитает из подписи поля', (): void => {
            const fixture: ComponentFixture<RtInputNumberComponent> = setup({ prefix: '₽' });

            expect(textOf(qa(fixture, 'input-number-prefix'))).toBe('₽');
            expect(qa(fixture, 'input-number-prefix')?.attributes['aria-hidden']).toBe('true');
        });

        it('в режиме чтения префикс рисуется только при значении', (): void => {
            const fixture: ComponentFixture<RtInputNumberComponent> = setup({ prefix: '₽' });

            fixture.componentInstance.setReadonly(true);
            fixture.detectChanges();

            expect(qa(fixture, 'input-number-prefix')).toBeNull();
        });
    });

    describe('реактивная форма', (): void => {
        it('значение формы приходит уже отформатированным', (): void => {
            const fixture: ComponentFixture<InputNumberHostComponent> = setupHost();

            fixture.componentInstance.control.setValue(1234.5);
            fixture.detectChanges();

            expect(field(fixture).value).toBe(`1${NBSP}234,50`);
        });

        it('набор пишет число в форму', (): void => {
            const fixture: ComponentFixture<InputNumberHostComponent> = setupHost();

            type(fixture, '1500');

            expect(fixture.componentInstance.control.value).toBe(1500);
        });

        it('пустое поле пишет в форму null, а не ноль', (): void => {
            const fixture: ComponentFixture<InputNumberHostComponent> = setupHost();
            type(fixture, '5');

            type(fixture, '');

            expect(fixture.componentInstance.control.value).toBeNull();
        });

        it('нечисловой набор форму не трогает до ухода фокуса', (): void => {
            const fixture: ComponentFixture<InputNumberHostComponent> = setupHost();
            type(fixture, '7');

            type(fixture, 'абв');

            expect(fixture.componentInstance.control.value).toBe(7);
        });

        it('уход фокуса пишет округлённое и зажатое значение', (): void => {
            const fixture: ComponentFixture<InputNumberHostComponent> = setupHost();

            type(fixture, '12,345');
            blur(fixture);

            expect(fixture.componentInstance.control.value).toBe(12.35);
            expect(fixture.componentInstance.control.touched).toBe(true);
        });

        it('отключение формой отключает нативное поле', (): void => {
            const fixture: ComponentFixture<InputNumberHostComponent> = setupHost();

            fixture.componentInstance.control.disable();
            fixture.detectChanges();

            expect(field(fixture).disabled).toBe(true);
        });
    });

    describe('локаль с запятой в разрядах', (): void => {
        function setupEnUs(): ComponentFixture<InputNumberHostComponent> {
            return createRtFixture(InputNumberHostComponent, {}, { providers: [{ provide: LOCALE_ID, useValue: 'en-US' }] });
        }

        it('разряды показываются запятой, а в форму уходит целое число', (): void => {
            // Разбор идёт по разделителям локали: запятая здесь — разряды, и
            // читать её как десятичную нельзя, иначе «1,000» превращается в 1.
            const fixture: ComponentFixture<InputNumberHostComponent> = setupEnUs();

            type(fixture, '1000');

            expect(field(fixture).value).toBe('1,000');
            expect(fixture.componentInstance.control.value).toBe(1000);
        });

        it('дробная часть отделяется точкой', (): void => {
            const fixture: ComponentFixture<InputNumberHostComponent> = setupEnUs();

            type(fixture, '1234.5');

            expect(fixture.componentInstance.control.value).toBe(1234.5);
        });

        it('запятая внутри набора остаётся разрядами, а не дробной частью', (): void => {
            // Показ и разбор обязаны сходиться: если поле рисует запятую как
            // разряды, разбор не вправе считать её десятичной.
            const fixture: ComponentFixture<InputNumberHostComponent> = setupEnUs();

            type(fixture, '1,5');

            expect(field(fixture).value).toBe('15');
            expect(fixture.componentInstance.control.value).toBe(15);
        });

        it('уход фокуса оставляет то же число, что и показано', (): void => {
            const fixture: ComponentFixture<InputNumberHostComponent> = setupEnUs();

            type(fixture, '1234567.89');
            blur(fixture);

            expect(field(fixture).value).toBe('1,234,567.89');
            expect(fixture.componentInstance.control.value).toBe(1234567.89);
        });
    });
});
