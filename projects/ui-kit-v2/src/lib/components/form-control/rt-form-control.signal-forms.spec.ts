import { ChangeDetectionStrategy, Component, WritableSignal, signal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { FieldTree, FormField, disabled, form, required } from '@angular/forms/signals';

import { createRtFixture, qa, textOf } from '../../../testing/rt-kit-testing';
import { RtFieldComponent } from '../field/rt-field.component';
import { RtInputComponent } from '../input/rt-input.component';

interface IProfile {
    name: string;
}

/** Поле под сигнальной привязкой: форма объявляет значение обязательным. */
@Component({
    selector: 'rt-signal-form-host',
    template: `
        <rt-field label="Имя">
            <rt-input placeholder="Имя" [formField]="profile.name" />
        </rt-field>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtFieldComponent, RtInputComponent, FormField],
})
class SignalFormHostComponent {
    protected readonly model: WritableSignal<IProfile> = signal<IProfile>({ name: '' });

    protected readonly profile: FieldTree<IProfile> = form(this.model, (path): void => {
        required(path.name);
    });
}

/** То же поле, но форма его отключила. */
@Component({
    selector: 'rt-signal-form-disabled-host',
    template: `
        <rt-field label="Имя">
            <rt-input placeholder="Имя" [formField]="profile.name" />
        </rt-field>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtFieldComponent, RtInputComponent, FormField],
})
class SignalFormDisabledHostComponent {
    protected readonly model: WritableSignal<IProfile> = signal<IProfile>({ name: '' });

    protected readonly profile: FieldTree<IProfile> = form(this.model, (path): void => {
        disabled(path.name, (): boolean => true);
    });
}

/** Прежняя привязка — она обязана работать слово в слово как раньше. */
@Component({
    selector: 'rt-reactive-form-host',
    template: `
        <rt-field label="Имя">
            <rt-input placeholder="Имя" [formControl]="control" />
        </rt-field>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtFieldComponent, RtInputComponent, ReactiveFormsModule],
})
class ReactiveFormHostComponent {
    protected readonly control: FormControl<string | null> = new FormControl<string | null>('', [Validators.required]);
}

function fieldOf<T>(fixture: ComponentFixture<T>): HTMLInputElement {
    return qa(fixture, 'input-control')?.nativeElement as HTMLInputElement;
}

/** Касание поля: обёртка показывает негодность только после него. */
function touch<T>(fixture: ComponentFixture<T>): void {
    fieldOf(fixture).dispatchEvent(new Event('blur'));
    fixture.detectChanges();
}

describe('Поле набора под сигнальной формой', (): void => {
    it('SC-UKV-77: поле на сигнальной привязке рисуется', (): void => {
        const fixture: ComponentFixture<SignalFormHostComponent> = createRtFixture(SignalFormHostComponent);

        expect(fieldOf(fixture)).toBeTruthy();
    });

    it('SC-UKV-78: негодность сигнальной привязки доходит до поля', (): void => {
        const fixture: ComponentFixture<SignalFormHostComponent> = createRtFixture(SignalFormHostComponent);

        touch(fixture);

        expect(qa(fixture, 'field-error')).toBeTruthy();
    });

    it('SC-UKV-79: до касания негодность не показывается', (): void => {
        const fixture: ComponentFixture<SignalFormHostComponent> = createRtFixture(SignalFormHostComponent);

        expect(qa(fixture, 'field-error')).toBeNull();
    });

    it('SC-UKV-80: ошибки сигнальной привязки видны обёртке', (): void => {
        const fixture: ComponentFixture<SignalFormHostComponent> = createRtFixture(SignalFormHostComponent);

        touch(fixture);

        expect(textOf(qa(fixture, 'field-error'))).not.toBe('');
    });

    it('SC-UKV-81: обязательность сигнальной привязки даёт звёздочку', (): void => {
        const fixture: ComponentFixture<SignalFormHostComponent> = createRtFixture(SignalFormHostComponent);

        expect(qa(fixture, 'field-required')).toBeTruthy();
    });

    it('SC-UKV-82: отключение сигнальной привязкой отключает поле', (): void => {
        const fixture: ComponentFixture<SignalFormDisabledHostComponent> = createRtFixture(SignalFormDisabledHostComponent);

        expect(fieldOf(fixture).disabled).toBe(true);
    });

    it('SC-UKV-83: прежняя привязка работает как раньше', (): void => {
        const fixture: ComponentFixture<ReactiveFormHostComponent> = createRtFixture(ReactiveFormHostComponent);

        expect(qa(fixture, 'field-required')).toBeTruthy();

        touch(fixture);

        expect(qa(fixture, 'field-error')).toBeTruthy();
    });
});
