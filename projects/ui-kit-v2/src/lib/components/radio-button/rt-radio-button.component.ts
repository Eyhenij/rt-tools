import { BooleanInput } from '@angular/cdk/coercion';
import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    DestroyRef,
    ElementRef,
    forwardRef,
    inject,
    Injector,
    input,
    InputSignal,
    InputSignalWithTransform,
    output,
    OutputEmitterRef,
    Signal,
    signal,
    ViewEncapsulation,
    WritableSignal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, ControlValueAccessor, NG_VALUE_ACCESSOR, NgControl } from '@angular/forms';
import { distinctUntilChanged, EMPTY, Observable, Subject, switchMap } from 'rxjs';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

import { RtRadiusDirective } from '@rt-tools/ui-kit-v2/radius';

import { IRtRadioGroupHost, RT_RADIO_GROUP } from './rt-radio-group.token';

const BEM_BLOCK: string = 'rt-radio-button';

/** Вход выбранности: не заданный вход — `null`, и тогда выбранность решает форма. */
function checkedAttribute(value: BooleanInput | null | undefined): boolean | null {
    return value === null || value === undefined ? null : booleanAttribute(value);
}

/**
 * Радиокнопка: `role="radio"` с `aria-checked` и `aria-disabled`, выбор нажатием, пробелом и Enter.
 *
 * Выбор приходит двумя путями. Форма пишет модель через `ControlValueAccessor`, и радиокнопка
 * выбрана, когда её значение — сама модель, а не равное ей. Без формы выбранность ставится входом
 * `checked`, а выбор сообщается выходом `checkedChange`: так строку отмечает таблица. Заданный вход
 * решает раньше модели формы.
 *
 * Нажатие на выбранную выбор не снимает — радиокнопку покидают только выбором другой. Каждое
 * нажатие сообщается наружу `clickAction` и дальше обёртки не идёт: строка таблицы под кружком не
 * открывается. Выбор клавишей наружу нажатием не сообщается.
 *
 * Отключение складывается из входа `disabled` и слова формы: форма зовёт `setDisabledState`
 * раньше первого обновления вида, и один общий signal затёр бы её слово.
 *
 * Внутри `rt-radio-group` в порядке обхода по Tab стоит одна радиокнопка группы, а соседей выбирают
 * стрелки; вне группы каждая радиокнопка стоит в порядке обхода сама, как прежде.
 *
 * Каждая радиокнопка — свой `ControlValueAccessor`, и значение, отданное одной, форма соседям на
 * том же контроле не пишет: поэтому модель берётся и у самого контрола.
 */
@Component({
    selector: 'rt-radio-button',
    templateUrl: './rt-radio-button.component.html',
    styleUrl: './rt-radio-button.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // standalone directives
        BlockDirective,
        ElemDirective,
        ModDirective,
    ],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef((): typeof RtRadioButtonComponent => RtRadioButtonComponent),
            multi: true,
        },
    ],
    hostDirectives: [{ directive: RtRadiusDirective, inputs: ['radius'] }],
    host: {
        class: BEM_BLOCK,
    },
})
export class RtRadioButtonComponent implements ControlValueAccessor {
    readonly #injector: Injector = inject(Injector);
    readonly #destroyRef: DestroyRef = inject(DestroyRef);
    readonly #host: ElementRef<HTMLElement> = inject<ElementRef<HTMLElement>>(ElementRef);
    readonly #group: IRtRadioGroupHost | null = inject(RT_RADIO_GROUP, { optional: true });

    #onChange: (value: unknown) => void = (): void => undefined;
    #onTouched: () => void = (): void => undefined;

    /**
     * Контрол, к которому радиокнопка привязана сейчас. Директива формы меняет его, не пересоздавая
     * себя: `[formControl]` получил другой контрол, `[formGroup]` — другую группу. Слушать надо
     * только нынешний — прежний, оставшись под подпиской, зажёг бы точку из мёртвой формы, и
     * нажатие по ней уже не дошло бы до живой.
     */
    readonly #controlSource: Subject<AbstractControl | null> = new Subject<AbstractControl | null>();

    /** Модель, записанная формой. */
    readonly #model: WritableSignal<unknown> = signal<unknown>(null);

    /** Отключение, назначенное формой через `setDisabledState`. */
    readonly #disabledByForm: WritableSignal<boolean> = signal<boolean>(false);

    protected readonly isChecked: Signal<boolean> = computed((): boolean => this.checked() ?? this.value() === this.#model());
    protected readonly isDisabled: Signal<boolean> = computed((): boolean => this.disabled() || this.#disabledByForm());

    /** Шаг Tab, отданный группой; до первого слова группы радиокнопка в группе вне обхода. */
    readonly #tabStop: WritableSignal<boolean> = signal<boolean>(false);

    /** Место в порядке обхода: в группе — только у той, на которую указала группа. */
    protected readonly tabIndex: Signal<number> = computed((): number => (this.#group === null || this.#tabStop() ? 0 : -1));

    /** Узел радиокнопки: по нему группа ставит радиокнопки в порядок страницы. */
    public readonly element: HTMLElement = this.#host.nativeElement;

    /** Значение радиокнопки: выбрана та, чьё значение — модель формы. */
    public readonly value: InputSignal<unknown> = input.required<unknown>();

    /** Выбранность без формы; не заданный вход оставляет решение форме. */
    public readonly checked: InputSignalWithTransform<boolean | null, BooleanInput | null | undefined> = input<
        boolean | null,
        BooleanInput | null | undefined
    >(null, { transform: checkedAttribute });

    public readonly disabled: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /** Вид «карточка»: рамка, содержимое слева, кружок справа. */
    public readonly card: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    public readonly label: InputSignal<string> = input<string>('');
    public readonly description: InputSignal<string> = input<string>('');

    /** Имя для вспомогательных средств, когда видимой подписи нет — кружок в строке таблицы. */
    public readonly ariaLabel: InputSignal<string | null> = input<string | null>(null);

    /** Выбрана ли радиокнопка — для группы, которая ведёт по ним стрелками. */
    public readonly selected: Signal<boolean> = computed((): boolean => this.isChecked());

    /** Отключена ли радиокнопка — группа её пропускает. */
    public readonly off: Signal<boolean> = computed((): boolean => this.isDisabled());

    /** Каждое нажатие указателем, сменило оно выбор или нет. */
    public readonly clickAction: OutputEmitterRef<MouseEvent> = output<MouseEvent>();

    /** Радиокнопка стала выбранной. */
    public readonly checkedChange: OutputEmitterRef<boolean> = output<boolean>();

    constructor() {
        // Радиокнопка встаёт в группу сама: так группа знает и радиокнопку из шаблона обёртки.
        this.#group?.register(this);
        this.#destroyRef.onDestroy((): void => this.#group?.unregister(this));

        // Значение, отданное соседкой, форма этой радиокнопке не пишет — модель берётся у самого
        // контрола, иначе точка осталась бы у двух сразу. Подписка идёт за сменой контрола и
        // бросает прежний.
        this.#controlSource
            .pipe(
                distinctUntilChanged(),
                switchMap((control: AbstractControl | null): Observable<unknown> => control?.valueChanges ?? EMPTY),
                takeUntilDestroyed(this.#destroyRef)
            )
            .subscribe((value: unknown): void => this.#model.set(value));
    }

    public writeValue(value: unknown): void {
        this.#model.set(value);
    }

    /**
     * Директива формы зовёт это при каждой привязке к контролу — и первой, и после смены контрола,
     * — уже поставив новый контрол себе. Здесь радиокнопка и узнаёт, кого слушать. Спросить
     * директиву в конструкторе нельзя: она берёт радиокнопку своим accessor, и это круговая
     * зависимость.
     */
    public registerOnChange(fn: (value: unknown) => void): void {
        this.#onChange = fn;
        this.#controlSource.next(this.#injector.get(NgControl, null, { self: true, optional: true })?.control ?? null);
    }

    public registerOnTouched(fn: () => void): void {
        this.#onTouched = fn;
    }

    public setDisabledState(disabled: boolean): void {
        this.#disabledByForm.set(disabled);
    }

    /** Группа отдаёт или забирает шаг Tab. */
    public setTabStop(on: boolean): void {
        this.#tabStop.set(on);
    }

    /** Лежит ли узел внутри радиокнопки — группа так находит, с какой ушла стрелка. */
    public contains(target: EventTarget | null): boolean {
        return target instanceof Node && this.#host.nativeElement.contains(target);
    }

    /** Выбор стрелкой из группы: фокус и выбор переходят сюда вместе. */
    public selectFromKeyboard(): void {
        this.#host.nativeElement.querySelector<HTMLElement>('[role="radio"]')?.focus();
        this.#select();
    }

    protected onClick(event: MouseEvent): void {
        this.#select();
        this.clickAction.emit(event);
        event.stopPropagation();
        event.preventDefault();
    }

    protected onKeydown(event: KeyboardEvent): void {
        if (event.key !== ' ' && event.key !== 'Enter') {
            return;
        }
        event.preventDefault();
        this.#select();
    }

    #select(): void {
        if (this.isDisabled()) {
            return;
        }
        if (!this.isChecked()) {
            this.#model.set(this.value());
            this.#onChange(this.value());
            this.checkedChange.emit(true);
        }
        this.#onTouched();
    }
}
