import { BooleanInput } from '@angular/cdk/coercion';
import {
    booleanAttribute,
    computed,
    DestroyRef,
    Directive,
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
 * - сигнал значения `value`, состояния `isDisabled`/`isInvalid` (отключение
 *   складывается из входа `disabled` и слова формы — см. `isDisabled`);
 * - общие инпуты `size`/`disabled`/`controlId`/`ariaLabel`/`clearable`;
 * - оркестрацию очистки (`clear`) через абстрактные хуки конкретного поля.
 *
 * Конкретные поля реализуют `getEmptyValue`/`hasValue`/`focusAfterClear`. Поля
 * с отдельным display-состоянием (autocomplete, input-number) дополнительно
 * переопределяют `writeValue`/`clearValue`, синхронизируя свой display-сигнал.
 */
/**
 * Состояние формы, каким его видит поле: негодность, ошибки и обязательность.
 *
 * Собрано одной записью затем, что источников у него два и говорят они по-разному. Прежняя
 * привязка рассылает состояние событиями контрола, сигнальная — не рассылает вовсе и отдаёт
 * его чтениями своего переходника. Порознь эти два пути дали бы полю два набора сигналов, и
 * обёртке пришлось бы знать, какой из них живой.
 */
interface IControlState {
    invalid: boolean;
    errors: ValidationErrors | null;
    required: boolean;
}

/** Состояние поля, которому форма ещё ничего не сказала. */
const PRISTINE_STATE: IControlState = { invalid: false, errors: null, required: false };

/** Рассылает ли контрол своё состояние. Переходник сигнальной формы — не рассылает. */
function emitsEvents(control: AbstractControl): boolean {
    return typeof (control.events as { pipe?: unknown } | undefined)?.pipe === 'function';
}

/** Состояние формы, снятое с контрола любого рода. */
function stateOf(control: AbstractControl): IControlState {
    return {
        invalid: !!control.invalid && (control.touched || control.dirty),
        errors: control.errors,
        required: control.hasValidator(Validators.required),
    };
}

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
    /** Состояние, разосланное прежней привязкой: её контрол сигналами не читается. */
    readonly #pushedState: WritableSignal<IControlState> = signal<IControlState>(PRISTINE_STATE);
    /**
     * Контрол сигнальной привязки. Его состояние не рассылается, а читается геттерами, и
     * внутри геттеров стоят вызовы сигналов формы — то есть из `computed` оно реактивно.
     */
    readonly #signalControl: WritableSignal<AbstractControl | null> = signal<AbstractControl | null>(null);
    /** Отключение, назначенное формой через CVA (`setDisabledState`). */
    readonly #disabledByForm: WritableSignal<boolean> = signal<boolean>(false);

    protected readonly value: WritableSignal<TValue>;
    /**
     * Отключение: вход и форма — два независимых источника, поле отключено,
     * если так сказал любой из них. Сводить их в один signal нельзя: форма
     * зовёт `setDisabledState` при связывании контрола, то есть раньше, чем
     * поле впервые обновит своё вью, и мирроринг входа затирал бы её слово —
     * контрол, созданный отключённым, оказывался бы редактируемым.
     */
    protected readonly isDisabled: Signal<boolean> = computed((): boolean => this.disabled() || this.#disabledByForm());
    /** Состояние формы: у сигнальной привязки читается, у прежней берётся разосланное. */
    readonly #state: Signal<IControlState> = computed((): IControlState => {
        const control: AbstractControl | null = this.#signalControl();
        return control === null ? this.#pushedState() : stateOf(control);
    });

    protected readonly isInvalid: Signal<boolean> = computed((): boolean => this.#state().invalid);

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

    /** Публичный invalid для rt-field (touched/dirty учтён в состоянии). */
    public readonly invalid: Signal<boolean> = computed((): boolean => this.isInvalid());

    /** Текущие ошибки связанного контрола — источник текста ошибки в rt-field. */
    public readonly errors: Signal<ValidationErrors | null> = computed((): ValidationErrors | null => this.#state().errors);

    /** Помечен ли контрол как обязательный — для авто-«*» в rt-field. */
    public readonly required: Signal<boolean> = computed((): boolean => this.#state().required);

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
    }

    public ngOnInit(): void {
        const control: AbstractControl | null = this.#ngControl?.control ?? null;
        if (control === null) {
            return;
        }
        // Контрол, который состояния не рассылает, — переходник сигнальной формы: событий у
        // него нет вовсе, и подписка на них роняла поле из запуска вместе со всем поддеревом
        // разметки. Состояние у него читается геттерами, поэтому берётся вычислением.
        if (!emitsEvents(control)) {
            this.#signalControl.set(control);
            return;
        }
        // Авто-подсветка invalid + зеркало ошибок/required для rt-field.
        this.#pushedState.set(stateOf(control));
        control.events.pipe(takeUntilDestroyed(this.#destroyRef)).subscribe((): void => {
            this.#pushedState.set(stateOf(control));
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
        this.#disabledByForm.set(isDisabled);
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
}
