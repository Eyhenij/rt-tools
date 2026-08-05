import { BooleanInput } from '@angular/cdk/coercion';
import {
    booleanAttribute,
    computed,
    DestroyRef,
    Directive,
    effect,
    inject,
    input,
    InputSignal,
    InputSignalWithTransform,
    OnInit,
    Signal,
    signal,
    WritableSignal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, ControlValueAccessor, NgControl, ValidationErrors, Validators } from '@angular/forms';

import { IRtInput } from '../input/rt-input.model';

/**
 * Базовый класс input-семейства common/ui. Владеет единым CVA-ядром:
 * - self-injected `NgControl` + ручная привязка `valueAccessor` (без
 *   `NG_VALUE_ACCESSOR` provider — иначе NG0200 cycle при self-reference),
 *   что даёт доступ к `control.invalid/touched` для авто-подсветки ошибки;
 * - сигнал значения `value`, состояния `isDisabled`/`isInvalid`;
 * - общие инпуты `size`/`disabled`/`controlId`/`ariaLabel`/`clearable`;
 * - оркестрацию очистки (`clear`) через абстрактные хуки конкретного поля.
 *
 * Конкретные поля реализуют `getEmptyValue`/`hasValue`/`focusAfterClear`. Поля
 * с отдельным display-состоянием (autocomplete, input-number) дополнительно
 * переопределяют `writeValue`/`clearValue`, синхронизируя свой display-сигнал.
 */
@Directive()
export abstract class RtFormControlBase<TValue> implements ControlValueAccessor, OnInit {
    readonly #ngControl: NgControl | null = inject(NgControl, { self: true, optional: true });
    readonly #destroyRef: DestroyRef = inject(DestroyRef);

    #onChange: (value: TValue) => void = (): void => undefined;
    #onTouched: () => void = (): void => undefined;

    // Состояние, которым управляет родительский rt-field (через публичные сеттеры):
    // авто-id для связки label[for], read-only режим, зеркало ошибок/required.
    readonly #controlIdAssigned: WritableSignal<string | null> = signal<string | null>(null);
    readonly #readonlyAssigned: WritableSignal<boolean> = signal<boolean>(false);
    readonly #errors: WritableSignal<ValidationErrors | null> = signal<ValidationErrors | null>(null);
    readonly #required: WritableSignal<boolean> = signal<boolean>(false);

    protected readonly value: WritableSignal<TValue>;
    protected readonly isDisabled: WritableSignal<boolean> = signal<boolean>(false);
    protected readonly isInvalid: WritableSignal<boolean> = signal<boolean>(false);

    /** Видимость кнопки очистки: включена, есть значение, поле активно. */
    protected readonly showClearButton: Signal<boolean> = computed(
        (): boolean => this.clearable() && this.hasValue() && !this.isDisabled()
    );

    /** Есть ли в поле значение — гейт видимости крестика. */
    protected abstract readonly hasValue: Signal<boolean>;

    public readonly size: InputSignal<IRtInput.Size> = input<IRtInput.Size>('md');
    public readonly disabled: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });
    public readonly controlId: InputSignal<string | null> = input<string | null>(null);
    public readonly ariaLabel: InputSignal<string | null> = input<string | null>(null);
    public readonly clearable: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(true, {
        transform: booleanAttribute,
    });

    /**
     * Видимая resting-рамка контрола. По умолчанию `true` — рамка видна на обеих
     * темах. `false` снимает только resting-рамку; focus/invalid состояния свою
     * рамку показывают всё равно, read-only остаётся плоским.
     */
    public readonly bordered: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(true, {
        transform: booleanAttribute,
    });

    /** Итоговый id поля: явный input важнее авто-id, назначенного rt-field. */
    public readonly effectiveControlId: Signal<string | null> = computed(
        (): string | null => this.controlId() ?? this.#controlIdAssigned()
    );

    /** Read-only режим (плоский текст вместо контрола); включается rt-field'ом. */
    public readonly isReadonly: Signal<boolean> = this.#readonlyAssigned.asReadonly();

    /** Публичный invalid для rt-field (touched/dirty уже учтён в #syncState). */
    public readonly invalid: Signal<boolean> = computed((): boolean => this.isInvalid());

    /** Текущие ошибки связанного контрола — источник текста ошибки в rt-field. */
    public readonly errors: Signal<ValidationErrors | null> = this.#errors.asReadonly();

    /** Помечен ли контрол как обязательный — для авто-«*» в rt-field. */
    public readonly required: Signal<boolean> = this.#required.asReadonly();

    /** Текст read-only представления. Реализуется конкретным контролом. */
    public abstract readonly displayText: Signal<string>;

    constructor() {
        this.value = signal<TValue>(this.getEmptyValue());
        // Self-inject NgControl + ручная привязка valueAccessor: доступ к
        // control.invalid/touched без NG_VALUE_ACCESSOR provider'а (тот
        // спровоцировал бы NG0200 cycle при self-reference).
        if (this.#ngControl !== null) {
            this.#ngControl.valueAccessor = this;
        }
        // Signal-input `disabled` → внутренний isDisabled (CVA пишет туда же).
        effect((): void => {
            this.isDisabled.set(this.disabled());
        });
    }

    public ngOnInit(): void {
        const control: AbstractControl | null = this.#ngControl?.control ?? null;
        if (control === null) {
            return;
        }
        // Авто-подсветка invalid + зеркало ошибок/required для rt-field.
        this.#required.set(control.hasValidator(Validators.required));
        this.#syncState(control);
        control.events.pipe(takeUntilDestroyed(this.#destroyRef)).subscribe((): void => {
            this.#syncState(control);
        });
    }

    public writeValue(value: TValue | null): void {
        this.value.set(value ?? this.getEmptyValue());
    }

    public registerOnChange(fn: (value: TValue) => void): void {
        this.#onChange = fn;
    }

    public registerOnTouched(fn: () => void): void {
        this.#onTouched = fn;
    }

    public setDisabledState(isDisabled: boolean): void {
        this.isDisabled.set(isDisabled);
    }

    /** Назначить авто-id (rt-field), когда у контрола нет явного controlId. */
    public assignControlId(id: string): void {
        this.#controlIdAssigned.set(id);
    }

    /** Включить/выключить read-only режим — вызывает родительский rt-field. */
    public setReadonly(value: boolean): void {
        this.#readonlyAssigned.set(value);
    }

    /** Очистка значения по кнопке-крестику + возврат фокуса в поле. */
    protected clear(event?: Event): void {
        event?.stopPropagation();
        if (this.isDisabled()) {
            return;
        }
        this.clearValue();
        this.#onChange(this.value());
        this.#onTouched();
        this.focusAfterClear();
    }

    /** Сбрасывает значение к пустому. Поля с display-сигналом расширяют. */
    protected clearValue(): void {
        this.value.set(this.getEmptyValue());
    }

    /** Прокидывает change наружу — для обработчиков пользовательского ввода. */
    protected emitChange(value: TValue): void {
        this.#onChange(value);
    }

    /** Помечает контрол touched — для blur/close-обработчиков. */
    protected markTouched(): void {
        this.#onTouched();
    }

    /** Пустое значение поля (тип-специфично: "", null, []). */
    protected abstract getEmptyValue(): TValue;

    /** Возврат фокуса после очистки (в input или на trigger-кнопку). */
    protected abstract focusAfterClear(): void;

    #syncState(control: AbstractControl): void {
        this.isInvalid.set(!!control.invalid && (control.touched || control.dirty));
        this.#errors.set(control.errors);
    }
}
