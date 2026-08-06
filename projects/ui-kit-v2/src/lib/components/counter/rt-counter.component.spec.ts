import { ChangeDetectionStrategy, Component, DebugElement } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { createRtFixture, el, hostClasses, qa, textOf } from '../../../testing/rt-kit-testing';
import { RtCounterComponent } from './rt-counter.component';

@Component({
    selector: 'rt-counter-host',
    template: '<rt-counter ariaLabel="Гостей" [formControl]="control" [min]="1" [max]="4" />',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtCounterComponent, ReactiveFormsModule],
})
class CounterHostComponent {
    public readonly control: FormControl<number | null> = new FormControl<number | null>(2);
}

function setup(inputs: Readonly<Record<string, unknown>> = {}): ComponentFixture<RtCounterComponent> {
    return createRtFixture(RtCounterComponent, inputs);
}

function value<T>(fixture: ComponentFixture<T>): string {
    return textOf(qa(fixture, 'counter-value'));
}

function press<T>(fixture: ComponentFixture<T>, id: 'counter-decrease' | 'counter-increase'): void {
    el(fixture, `[qa-dataid="${id}"] [qa-dataid="icon-button-control"]`)?.nativeElement.click();
    fixture.detectChanges();
}

function stepButton<T>(fixture: ComponentFixture<T>, id: 'counter-decrease' | 'counter-increase'): HTMLButtonElement {
    const found: DebugElement | null = el(fixture, `[qa-dataid="${id}"] [qa-dataid="icon-button-control"]`);
    return found?.nativeElement as HTMLButtonElement;
}

describe('RtCounterComponent', (): void => {
    it('несёт свой BEM-блок и объявлен группой', (): void => {
        const fixture: ComponentFixture<RtCounterComponent> = setup({ ariaLabel: 'Мест' });

        expect(hostClasses(fixture)).toContain('rt-counter');
        expect((fixture.nativeElement as HTMLElement).getAttribute('role')).toBe('group');
        expect((fixture.nativeElement as HTMLElement).getAttribute('aria-label')).toBe('Мест');
    });

    it('без входов начинается с нижней границы, а она — ноль', (): void => {
        expect(value(setup())).toBe('0');
    });

    describe('шаг', (): void => {
        it('плюс увеличивает на единицу', (): void => {
            const fixture: ComponentFixture<RtCounterComponent> = setup();

            press(fixture, 'counter-increase');

            expect(value(fixture)).toBe('1');
        });

        it('минус уменьшает на единицу', (): void => {
            const fixture: ComponentFixture<RtCounterComponent> = setup({ min: 0 });

            press(fixture, 'counter-increase');
            press(fixture, 'counter-increase');
            press(fixture, 'counter-decrease');

            expect(value(fixture)).toBe('1');
        });

        it('шаг задаётся входом', (): void => {
            const fixture: ComponentFixture<RtCounterComponent> = setup({ step: 5 });

            press(fixture, 'counter-increase');

            expect(value(fixture)).toBe('5');
        });
    });

    describe('границы', (): void => {
        it('на нижней границе кнопка минуса отключена', (): void => {
            expect(stepButton(setup({ min: 0 }), 'counter-decrease').disabled).toBe(true);
        });

        it('на верхней границе кнопка плюса отключена', (): void => {
            const fixture: ComponentFixture<RtCounterComponent> = setup({ max: 1 });

            press(fixture, 'counter-increase');

            expect(stepButton(fixture, 'counter-increase').disabled).toBe(true);
        });

        it('шаг не перепрыгивает границу, а упирается в неё', (): void => {
            const fixture: ComponentFixture<RtCounterComponent> = setup({ max: 3, step: 5 });

            press(fixture, 'counter-increase');

            expect(value(fixture)).toBe('3');
        });

        it('без верхней границы потолка нет', (): void => {
            const fixture: ComponentFixture<RtCounterComponent> = setup({ step: 1000 });

            press(fixture, 'counter-increase');

            expect(value(fixture)).toBe('1000');
        });
    });

    describe('отключение', (): void => {
        it('отключает обе кнопки', (): void => {
            const fixture: ComponentFixture<RtCounterComponent> = setup({ disabled: true, min: 0, max: 10 });

            expect(stepButton(fixture, 'counter-decrease').disabled).toBe(true);
            expect(stepButton(fixture, 'counter-increase').disabled).toBe(true);
        });

        it('отключённый счётчик не меняется', (): void => {
            const fixture: ComponentFixture<RtCounterComponent> = setup({ disabled: true });
            const changes: jest.Mock = jest.fn();
            fixture.componentInstance.registerOnChange(changes);

            press(fixture, 'counter-increase');

            expect(value(fixture)).toBe('0');
            expect(changes).not.toHaveBeenCalled();
        });
    });

    describe('реактивная форма', (): void => {
        it('значение формы отражается на счётчике', (): void => {
            expect(value(createRtFixture(CounterHostComponent))).toBe('2');
        });

        it('значение из формы поднимается до нижней границы', (): void => {
            // Форма может прийти с чем угодно, а счётчик обязан остаться внутри
            // своих границ — иначе кнопки блокируются по невозможному состоянию.
            const fixture: ComponentFixture<CounterHostComponent> = createRtFixture(CounterHostComponent);

            fixture.componentInstance.control.setValue(0);
            fixture.detectChanges();

            expect(value(fixture)).toBe('1');
        });

        it('значение из формы опускается до верхней границы', (): void => {
            const fixture: ComponentFixture<CounterHostComponent> = createRtFixture(CounterHostComponent);

            fixture.componentInstance.control.setValue(99);
            fixture.detectChanges();

            expect(value(fixture)).toBe('4');
        });

        it('null читается как нижняя граница', (): void => {
            const fixture: ComponentFixture<CounterHostComponent> = createRtFixture(CounterHostComponent);

            fixture.componentInstance.control.setValue(null);
            fixture.detectChanges();

            expect(value(fixture)).toBe('1');
        });

        it('шаг пишет значение в форму и помечает контрол тронутым', (): void => {
            const fixture: ComponentFixture<CounterHostComponent> = createRtFixture(CounterHostComponent);

            press(fixture, 'counter-increase');

            expect(fixture.componentInstance.control.value).toBe(3);
            expect(fixture.componentInstance.control.touched).toBe(true);
        });

        it('упор в границу событий не поднимает', (): void => {
            const fixture: ComponentFixture<CounterHostComponent> = createRtFixture(CounterHostComponent);
            fixture.componentInstance.control.setValue(4);
            fixture.detectChanges();
            fixture.componentInstance.control.markAsUntouched();

            press(fixture, 'counter-increase');

            expect(fixture.componentInstance.control.touched).toBe(false);
        });

        it('отключение формой отключает кнопки', (): void => {
            const fixture: ComponentFixture<CounterHostComponent> = createRtFixture(CounterHostComponent);

            fixture.componentInstance.control.disable();
            fixture.detectChanges();

            expect(stepButton(fixture, 'counter-increase').disabled).toBe(true);
        });
    });

    describe('доступность', (): void => {
        it('подписи кнопок берутся из словаря кита', (): void => {
            const fixture: ComponentFixture<RtCounterComponent> = setup();

            expect(stepButton(fixture, 'counter-decrease').getAttribute('aria-label')).toBe('Decrease');
            expect(stepButton(fixture, 'counter-increase').getAttribute('aria-label')).toBe('Increase');
        });

        it('свои подписи перебивают умолчание — форма знает, что именно считает', (): void => {
            const fixture: ComponentFixture<RtCounterComponent> = setup({
                decreaseLabel: 'Убрать гостя',
                increaseLabel: 'Добавить гостя',
            });

            expect(stepButton(fixture, 'counter-decrease').getAttribute('aria-label')).toBe('Убрать гостя');
            expect(stepButton(fixture, 'counter-increase').getAttribute('aria-label')).toBe('Добавить гостя');
        });

        it('новое число проговаривается вслух', (): void => {
            expect(qa(setup(), 'counter-value')?.attributes['aria-live']).toBe('polite');
        });
    });
});
