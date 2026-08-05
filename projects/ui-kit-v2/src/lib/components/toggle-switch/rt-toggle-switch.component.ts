import { BooleanInput } from '@angular/cdk/coercion';
import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    effect,
    forwardRef,
    input,
    InputSignal,
    InputSignalWithTransform,
    Signal,
    signal,
    WritableSignal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

import { RtIconComponent } from '../icon/rt-icon.component';
import { IRtIcon } from '../icon/rt-icon.model';
import { IRtToggleSwitch } from './rt-toggle-switch.model';

const BEM_BLOCK: string = 'rt-toggle-switch';

/**
 * On/off switch с `role="switch"` + `aria-checked` — более правильный a11y
 * pattern чем `<input type="checkbox">` для toggle (screen readers произносят
 * "switch off/on" вместо "checkbox checked/unchecked").
 *
 * Реализует `ControlValueAccessor` для `boolean` value через
 * `useExisting: forwardRef(...)` — `useClass` на self-reference вызывает
 * NG0200 cycle при boot'е.
 *
 * Source-of-truth для disabled — внутренний `isDisabled` signal. И signal-input
 * `disabled`, и CVA `setDisabledState` пишут в один и тот же signal: input —
 * через `effect()`, CVA — напрямую через метод. Так `[disabled]="true"` и
 * `FormControl.disable()` ведут себя одинаково.
 *
 * Опциональные иконки `iconOff` / `iconOn` рисуются внутри трека статично:
 * off-иконка в начальной половине, on-иконка в конечной. Бегунок непрозрачен
 * и наезжает на иконку активного состояния, так что видна всегда иконка того
 * состояния, куда переключится контрол.
 *
 * ViewEncapsulation — default (Emulated), стили обёрнуты в `:host { ... }`.
 */
@Component({
    selector: 'rt-toggle-switch',
    templateUrl: './rt-toggle-switch.component.html',
    styleUrl: './rt-toggle-switch.component.scss',
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
            useExisting: forwardRef((): typeof RtToggleSwitchComponent => RtToggleSwitchComponent),
            multi: true,
        },
    ],
    host: {
        class: BEM_BLOCK,
    },
})
export class RtToggleSwitchComponent implements ControlValueAccessor {
    #onChange: (value: boolean) => void = (): void => undefined;
    #onTouched: () => void = (): void => undefined;

    protected readonly isOn: WritableSignal<boolean> = signal<boolean>(false);
    protected readonly isDisabled: WritableSignal<boolean> = signal<boolean>(false);

    /**
     * BEM-модификаторы для `[rtMod]`. Собираем в .ts, потому что
     * Angular template-parser не поддерживает computed property keys
     * в inline-объектах, а размер приходит ключом.
     */
    protected readonly bemMods: Signal<Record<string, boolean>> = computed((): Record<string, boolean> => ({
        [this.size()]: true,
        on: this.isOn(),
        disabled: this.isDisabled(),
        withIcons: this.iconOff() !== null || this.iconOn() !== null,
    }));

    public readonly inputId: InputSignal<string | null> = input<string | null>(null);

    public readonly ariaLabel: InputSignal<string | null> = input<string | null>(null);

    /** Размерный тир трека. */
    public readonly size: InputSignal<IRtToggleSwitch.Size> = input<IRtToggleSwitch.Size>('sm');

    /** Иконка выключенного состояния — в начальной половине трека. Пусто — без иконки. */
    public readonly iconOff: InputSignal<IRtIcon.Name | null> = input<IRtIcon.Name | null>(null);

    /** Иконка включённого состояния — в конечной половине трека. Пусто — без иконки. */
    public readonly iconOn: InputSignal<IRtIcon.Name | null> = input<IRtIcon.Name | null>(null);

    public readonly disabled: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
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
        this.isOn.set(value === true);
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
        const next: boolean = !this.isOn();
        this.isOn.set(next);
        this.#onChange(next);
        this.#onTouched();
    }
}
