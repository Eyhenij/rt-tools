import { BooleanInput } from '@angular/cdk/coercion';
import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    effect,
    forwardRef,
    input,
    InputSignal,
    InputSignalWithTransform,
    signal,
    WritableSignal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

import { RtIconComponent } from '../icon/rt-icon.component';

const BEM_BLOCK: string = 'rt-checkbox';

/**
 * Чекбокс с `role="checkbox"` + `aria-checked` (`true`/`false`/`mixed`) поверх
 * нативного `<button>` — клавиатурный toggle (Enter/Space) работает «из коробки»
 * без отдельных keydown-хендлеров. Галочка/прочерк рисуются через `rt-icon`
 * (`check`/`minus`), бокс и цвета — на токенах `--rt-*`.
 *
 * Реализует `ControlValueAccessor` для `boolean` value через
 * `useExisting: forwardRef(...)` — `useClass` на self-reference вызывает
 * NG0200 cycle при boot'е.
 *
 * Source-of-truth для disabled — внутренний `isDisabled` signal: и signal-input
 * `disabled`, и CVA `setDisabledState` пишут в один и тот же signal (input —
 * через `effect()`, CVA — напрямую), так `[disabled]="true"` и
 * `FormControl.disable()` ведут себя одинаково.
 *
 * `indeterminate` — чисто визуальное mixed-состояние; клик по нему разрешается
 * в `true` (стандартное поведение tri-state чекбокса).
 *
 * Текстовая подпись проецируется через `<ng-content>`.
 */
@Component({
    selector: 'rt-checkbox',
    templateUrl: './rt-checkbox.component.html',
    styleUrl: './rt-checkbox.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // standalone components / directives
        RtIconComponent,
        BlockDirective,
        ElemDirective,
        ModDirective,
    ],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef((): typeof RtCheckboxComponent => RtCheckboxComponent),
            multi: true,
        },
    ],
    host: {
        class: BEM_BLOCK,
    },
})
export class RtCheckboxComponent implements ControlValueAccessor {
    #onChange: (value: boolean) => void = (): void => undefined;
    #onTouched: () => void = (): void => undefined;

    protected readonly isChecked: WritableSignal<boolean> = signal<boolean>(false);
    protected readonly isDisabled: WritableSignal<boolean> = signal<boolean>(false);

    public readonly inputId: InputSignal<string | null> = input<string | null>(null);

    public readonly ariaLabel: InputSignal<string | null> = input<string | null>(null);

    public readonly disabled: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    public readonly indeterminate: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    constructor() {
        // Синхронизируем signal-input `disabled` в `isDisabled`, чтобы
        // `[disabled]="..."` и `setDisabledState(...)` (CVA) писали в одно
        // и то же место. Effect живёт в injection context конструктора.
        effect((): void => {
            this.isDisabled.set(this.disabled());
        });
    }

    public writeValue(value: boolean | null | undefined): void {
        this.isChecked.set(value === true);
    }

    public registerOnChange(fn: (value: boolean) => void): void {
        this.#onChange = fn;
    }

    public registerOnTouched(fn: () => void): void {
        this.#onTouched = fn;
    }

    public setDisabledState(disabled: boolean): void {
        this.isDisabled.set(disabled);
    }

    protected toggle(): void {
        if (this.isDisabled()) {
            return;
        }
        // mixed-состояние при клике разрешается в checked (tri-state контракт).
        const next: boolean = this.indeterminate() ? true : !this.isChecked();
        this.isChecked.set(next);
        this.#onChange(next);
        this.#onTouched();
    }
}
