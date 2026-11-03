import { ChangeDetectionStrategy, Component, LOCALE_ID, Provider, signal, WritableSignal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { createRtFixture, qa } from '../../../testing/rt-kit-testing';
import { RtInputNumberComponent } from './rt-input-number.component';

/** Спека стрелок шага — в русской локали, как и основная спека поля. */
const RU_LOCALE: Provider = { provide: LOCALE_ID, useValue: 'ru' };

interface IStepView {
    value?: number | null;
    step?: number;
    min?: number | null;
    max?: number | null;
    stepper?: boolean;
    maxFractionDigits?: number;
}

@Component({
    selector: 'rt-input-number-step-host',
    template: `
        <rt-input-number
            [formControl]="control"
            [step]="step()"
            [min]="min()"
            [max]="max()"
            [stepper]="stepper()"
            [maxFractionDigits]="maxFractionDigits()" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtInputNumberComponent, ReactiveFormsModule],
})
class StepHostComponent {
    public readonly control: FormControl<number | null> = new FormControl<number | null>(null);
    public readonly step: WritableSignal<number> = signal<number>(1);
    public readonly min: WritableSignal<number | null> = signal<number | null>(null);
    public readonly max: WritableSignal<number | null> = signal<number | null>(null);
    public readonly stepper: WritableSignal<boolean> = signal<boolean>(true);
    public readonly maxFractionDigits: WritableSignal<number> = signal<number>(0);
}

function setup(view: IStepView = {}): ComponentFixture<StepHostComponent> {
    const fixture: ComponentFixture<StepHostComponent> = createRtFixture(StepHostComponent, {}, { providers: [RU_LOCALE] });
    const host: StepHostComponent = fixture.componentInstance;

    host.step.set(view.step ?? 1);
    host.min.set(view.min ?? null);
    host.max.set(view.max ?? null);
    host.stepper.set(view.stepper ?? true);
    host.maxFractionDigits.set(view.maxFractionDigits ?? 0);
    host.control.setValue(view.value ?? null);
    fixture.detectChanges();

    return fixture;
}

function field(fixture: ComponentFixture<StepHostComponent>): HTMLInputElement {
    return qa(fixture, 'input-number-control')?.nativeElement as HTMLInputElement;
}

function arrow(fixture: ComponentFixture<StepHostComponent>, direction: 'up' | 'down'): HTMLButtonElement | null {
    return (qa(fixture, `input-number-step-${direction}`)?.nativeElement as HTMLButtonElement | undefined) ?? null;
}

function press(fixture: ComponentFixture<StepHostComponent>, direction: 'up' | 'down'): void {
    arrow(fixture, direction)?.click();
    fixture.detectChanges();
}

function key(fixture: ComponentFixture<StepHostComponent>, name: 'ArrowUp' | 'ArrowDown'): KeyboardEvent {
    const event: KeyboardEvent = new KeyboardEvent('keydown', { key: name, cancelable: true });
    field(fixture).dispatchEvent(event);
    fixture.detectChanges();
    return event;
}

describe('RtInputNumberComponent — стрелки шага', (): void => {
    it('SC-UKV-1133 — верхняя стрелка прибавляет шаг', (): void => {
        const fixture: ComponentFixture<StepHostComponent> = setup({ value: 10 });

        press(fixture, 'up');

        expect(field(fixture).value).toBe('11');
        expect(fixture.componentInstance.control.value).toBe(11);
    });

    it('SC-UKV-1134 — нижняя стрелка вычитает шаг', (): void => {
        const fixture: ComponentFixture<StepHostComponent> = setup({ value: 10, step: 0.5, maxFractionDigits: 1 });

        press(fixture, 'down');

        expect(field(fixture).value).toBe('9,5');
        expect(fixture.componentInstance.control.value).toBe(9.5);
    });

    it('SC-UKV-1135 — клавиши «вверх» и «вниз» шагают и не двигают каретку', (): void => {
        const fixture: ComponentFixture<StepHostComponent> = setup({ value: 10 });

        const up: KeyboardEvent = key(fixture, 'ArrowUp');
        key(fixture, 'ArrowDown');
        key(fixture, 'ArrowDown');

        expect(up.defaultPrevented).toBe(true);
        expect(field(fixture).value).toBe('9');
        expect(fixture.componentInstance.control.value).toBe(9);
    });

    it('SC-UKV-1136 — шаг из пустого поля начинается с нуля и зажимается в диапазон', (): void => {
        const fixture: ComponentFixture<StepHostComponent> = setup({ min: 5 });

        press(fixture, 'up');

        expect(field(fixture).value).toBe('5');
        expect(fixture.componentInstance.control.value).toBe(5);
    });

    it('SC-UKV-1137 — шаг за границу встаёт на границу', (): void => {
        const fixture: ComponentFixture<StepHostComponent> = setup({ value: 19, step: 5, max: 20 });

        press(fixture, 'up');

        expect(field(fixture).value).toBe('20');
        expect(fixture.componentInstance.control.value).toBe(20);
    });

    it('SC-UKV-1138 — стрелка к достигнутой границе выключена, клавиша не шагает', (): void => {
        const fixture: ComponentFixture<StepHostComponent> = setup({ value: 20, max: 20 });

        expect(arrow(fixture, 'up')?.disabled).toBe(true);
        expect(arrow(fixture, 'down')?.disabled).toBe(false);

        key(fixture, 'ArrowUp');

        expect(fixture.componentInstance.control.value).toBe(20);
    });

    it('SC-UKV-1138 — на минимуме выключена нижняя стрелка', (): void => {
        const fixture: ComponentFixture<StepHostComponent> = setup({ value: 1, min: 1 });

        expect(arrow(fixture, 'down')?.disabled).toBe(true);
        expect(arrow(fixture, 'up')?.disabled).toBe(false);
    });

    it('SC-UKV-1139 — результат округляется до знаков шага', (): void => {
        const fixture: ComponentFixture<StepHostComponent> = setup({ value: 0.1, step: 0.2, maxFractionDigits: 2 });

        press(fixture, 'up');

        expect(fixture.componentInstance.control.value).toBe(0.3);
    });

    it('SC-UKV-1140 — вход stepper прячет стрелки, клавиши шагают и без них', (): void => {
        const fixture: ComponentFixture<StepHostComponent> = setup({ value: 10, stepper: false });

        expect(qa(fixture, 'input-number-control')).not.toBeNull();
        expect(qa(fixture, 'input-number-stepper')).toBeNull();

        key(fixture, 'ArrowUp');

        expect(fixture.componentInstance.control.value).toBe(11);
    });

    it('SC-UKV-1140 — по умолчанию стрелки видны', (): void => {
        const fixture: ComponentFixture<RtInputNumberComponent> = createRtFixture(RtInputNumberComponent, {}, { providers: [RU_LOCALE] });

        expect(qa(fixture, 'input-number-stepper')).not.toBeNull();
    });

    it('SC-UKV-1141 — выключенное поле выключает обе стрелки и клавиши', (): void => {
        const fixture: ComponentFixture<StepHostComponent> = setup({ value: 10 });
        fixture.componentInstance.control.disable();
        fixture.detectChanges();

        expect(arrow(fixture, 'up')?.disabled).toBe(true);
        expect(arrow(fixture, 'down')?.disabled).toBe(true);

        key(fixture, 'ArrowUp');

        expect(fixture.componentInstance.control.value).toBe(10);
    });

    it('SC-UKV-1142 — поле только для чтения стрелок не показывает', (): void => {
        const fixture: ComponentFixture<RtInputNumberComponent> = createRtFixture(RtInputNumberComponent, {}, { providers: [RU_LOCALE] });
        fixture.componentInstance.setReadonly(true);
        fixture.detectChanges();

        expect(qa(fixture, 'input-number-readonly')).not.toBeNull();
        expect(qa(fixture, 'input-number-stepper')).toBeNull();
    });

    it('SC-UKV-1143 — стрелки не берут остановку таба и названы подписями кита', (): void => {
        const fixture: ComponentFixture<StepHostComponent> = setup({ value: 10 });

        expect(arrow(fixture, 'up')?.getAttribute('tabindex')).toBe('-1');
        expect(arrow(fixture, 'down')?.getAttribute('tabindex')).toBe('-1');
        expect(arrow(fixture, 'up')?.getAttribute('aria-label')).toBe('Increase');
        expect(arrow(fixture, 'down')?.getAttribute('aria-label')).toBe('Decrease');
    });

    it('SC-UKV-1144 — обе стрелки рисуют один значок, нижняя — перевёрнутым', (): void => {
        const fixture: ComponentFixture<StepHostComponent> = setup({ value: 10 });
        const up: HTMLElement | null | undefined = arrow(fixture, 'up')?.querySelector('rt-icon');
        const down: HTMLElement | null | undefined = arrow(fixture, 'down')?.querySelector('rt-icon');

        expect(up?.querySelector('use')?.getAttribute('href')).toBe('#rt-icon-chevron-up');
        expect(down?.querySelector('use')?.getAttribute('href')).toBe('#rt-icon-chevron-up');
        expect(up?.classList).not.toContain('rt-input-number__step-icon--flipped');
        expect(down?.classList).toContain('rt-input-number__step-icon--flipped');
    });

    it('SC-UKV-1145 — в поле sm значок стрелки 10 px, в поле md — 12 px', (): void => {
        const small: ComponentFixture<RtInputNumberComponent> = createRtFixture(
            RtInputNumberComponent,
            { size: 'sm' },
            { providers: [RU_LOCALE] }
        );
        const medium: ComponentFixture<RtInputNumberComponent> = createRtFixture(
            RtInputNumberComponent,
            { size: 'md' },
            { providers: [RU_LOCALE] }
        );
        const smallIcon: HTMLElement = qa(small, 'input-number-step-up')?.nativeElement.querySelector('rt-icon') as HTMLElement;
        const mediumIcon: HTMLElement = qa(medium, 'input-number-step-up')?.nativeElement.querySelector('rt-icon') as HTMLElement;

        expect(smallIcon.style.width).toBe('10px');
        expect(mediumIcon.style.width).toBe('var(--rt-icon-step-xs, var(--rt-size-3))');
    });
});
