import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
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
    numberAttribute,
    Signal,
    signal,
    WritableSignal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { translateSignal } from '@jsverse/transloco';

import { BlockDirective, ElemDirective } from '@rt-tools/core';

import { RtIconButtonComponent } from '../icon-button/rt-icon-button.component';
import { RT_COUNTER_DECREASE_KEY, RT_COUNTER_INCREASE_KEY } from './rt-counter.model';

const BEM_BLOCK: string = 'rt-counter';

/** Значение всегда внутри границ: и при записи из формы, и при шаге кнопкой. */
function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

/**
 * Счётчик «− N +» для целых величин: количество гостей, мест, единиц.
 * В отличие от `rt-input-number` значение нельзя ввести с клавиатуры — только
 * шагами, поэтому здесь нет ни маски, ни дробной части, ни кнопки очистки.
 *
 * Реализует `ControlValueAccessor` для `number` через
 * `useExisting: forwardRef(...)` — `useClass` на self-reference вызывает
 * NG0200 cycle при boot'е.
 *
 * Source-of-truth для disabled — внутренний `isDisabled` signal: и signal-input
 * `disabled`, и CVA `setDisabledState` пишут в него, поэтому `[disabled]="true"`
 * и `FormControl.disable()` ведут себя одинаково.
 *
 * Хост объявлен группой с `aria-label`, значение помечено `aria-live`, так что
 * скринридер называет назначение счётчика и проговаривает новое число.
 *
 * ViewEncapsulation — default (Emulated), стили обёрнуты в `:host { ... }`.
 */
@Component({
    selector: 'rt-counter',
    templateUrl: './rt-counter.component.html',
    styleUrl: './rt-counter.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // rt-tools
        BlockDirective,
        ElemDirective,

        // components
        RtIconButtonComponent,
    ],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef((): typeof RtCounterComponent => RtCounterComponent),
            multi: true,
        },
    ],
    host: {
        class: BEM_BLOCK,
        role: 'group',
        '[attr.aria-label]': 'ariaLabel()',
    },
})
export class RtCounterComponent implements ControlValueAccessor {
    #onChange: (value: number) => void = (): void => undefined;
    #onTouched: () => void = (): void => undefined;

    readonly #decreaseFallback: Signal<string> = translateSignal(RT_COUNTER_DECREASE_KEY);
    readonly #increaseFallback: Signal<string> = translateSignal(RT_COUNTER_INCREASE_KEY);

    protected readonly value: WritableSignal<number> = signal<number>(0);
    protected readonly isDisabled: WritableSignal<boolean> = signal<boolean>(false);
    /** Своя подпись важнее умолчания: форма знает, что именно считает */
    protected readonly decreaseAriaLabel: Signal<string> = computed((): string => this.decreaseLabel() || this.#decreaseFallback());
    protected readonly increaseAriaLabel: Signal<string> = computed((): string => this.increaseLabel() || this.#increaseFallback());

    protected readonly canDecrease: Signal<boolean> = computed((): boolean => !this.isDisabled() && this.value() > this.min());

    protected readonly canIncrease: Signal<boolean> = computed((): boolean => !this.isDisabled() && this.value() < this.max());

    public readonly ariaLabel: InputSignal<string | null> = input<string | null>(null);

    /** Нижняя граница; значение из формы поднимается до неё. */
    public readonly min: InputSignalWithTransform<number, NumberInput> = input<number, NumberInput>(0, { transform: numberAttribute });

    /** Верхняя граница; по умолчанию потолка нет. */
    public readonly max: InputSignalWithTransform<number, NumberInput> = input<number, NumberInput>(Number.MAX_SAFE_INTEGER, {
        transform: numberAttribute,
    });

    public readonly step: InputSignalWithTransform<number, NumberInput> = input<number, NumberInput>(1, { transform: numberAttribute });

    /** Пусто — берётся переведённая подпись по умолчанию */
    public readonly decreaseLabel: InputSignal<string> = input<string>('');

    public readonly increaseLabel: InputSignal<string> = input<string>('');

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

    public writeValue(value: number | null | undefined): void {
        this.value.set(clamp(Number(value ?? this.min()), this.min(), this.max()));
    }

    public registerOnChange(fn: (value: number) => void): void {
        this.#onChange = fn;
    }

    public registerOnTouched(fn: () => void): void {
        this.#onTouched = fn;
    }

    public setDisabledState(disabled: boolean): void {
        this.isDisabled.set(disabled);
    }

    protected decrease(): void {
        this.#shift(-this.step());
    }

    protected increase(): void {
        this.#shift(this.step());
    }

    #shift(delta: number): void {
        if (this.isDisabled()) {
            return;
        }
        const next: number = clamp(this.value() + delta, this.min(), this.max());
        if (next === this.value()) {
            return;
        }
        this.value.set(next);
        this.#onChange(next);
        this.#onTouched();
    }
}
