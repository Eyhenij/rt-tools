import { ChangeDetectionStrategy, Component, LOCALE_ID, Provider, WritableSignal, signal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FieldTree, FormField, form } from '@angular/forms/signals';

import { TRtInputWrite, createRtFixture, qa, setInputs } from '../../../testing/rt-kit-testing';
import { RtInputNumberComponent } from './rt-input-number.component';

/** Разбор числа зависит от локали — прибиваем её. */
const RU_LOCALE: Provider = { provide: LOCALE_ID, useValue: 'ru' };

/**
 * Сигнальная форма пишет в `min`, `max` `undefined`, когда границу не задала. Тип ниже не
 * соберётся, если вход перестанет это принимать.
 */
const BOUNDS_TAKE_UNDEFINED: [
    undefined extends TRtInputWrite<RtInputNumberComponent['min']> ? true : false,
    undefined extends TRtInputWrite<RtInputNumberComponent['max']> ? true : false,
] = [true, true];

interface IOrder {
    count: number | null;
}

/** Числовое поле под сигнальной формой, которая не задала границ. */
@Component({
    selector: 'rt-input-number-signal-host',
    template: '<rt-input-number [formField]="order.count" />',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtInputNumberComponent, FormField],
})
class InputNumberSignalHostComponent {
    public readonly model: WritableSignal<IOrder> = signal<IOrder>({ count: null });
    public readonly order: FieldTree<IOrder> = form(this.model);
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

describe('RtInputNumberComponent под сигнальной формой', (): void => {
    it('SC-UKV-1584 — входы границ принимают undefined', (): void => {
        expect(BOUNDS_TAKE_UNDEFINED).toEqual([true, true]);
    });

    it('SC-UKV-1584 — поле без границ собирается, и число уходит в модель без зажима', (): void => {
        const fixture: ComponentFixture<InputNumberSignalHostComponent> = createRtFixture(
            InputNumberSignalHostComponent,
            {},
            {
                providers: [RU_LOCALE],
            }
        );
        const number: RtInputNumberComponent = fixture.debugElement.query(By.directive(RtInputNumberComponent))
            .componentInstance as RtInputNumberComponent;

        type(fixture, '-1500');
        blur(fixture);

        expect(fixture.componentInstance.model()).toEqual({ count: -1500 });
        expect(number.min()).toBeNull();
        expect(number.max()).toBeNull();
    });

    it('SC-UKV-1584 — граница undefined читается как её отсутствие, null и число — как раньше', (): void => {
        const fixture: ComponentFixture<RtInputNumberComponent> = createRtFixture(
            RtInputNumberComponent,
            { min: 0, max: 10 },
            {
                providers: [RU_LOCALE],
            }
        );
        expect([fixture.componentInstance.min(), fixture.componentInstance.max()]).toEqual([0, 10]);

        setInputs(fixture, { min: undefined, max: null });

        expect(fixture.componentInstance.min()).toBeNull();
        expect(fixture.componentInstance.max()).toBeNull();
    });
});
