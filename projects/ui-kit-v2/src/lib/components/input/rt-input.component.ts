import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import {
    booleanAttribute,
    computed,
    forwardRef,
    inject,
    input,
    output,
    signal,
    viewChild,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    InputSignal,
    InputSignalWithTransform,
    OutputEmitterRef,
    Signal,
    ViewEncapsulation,
    WritableSignal,
} from '@angular/core';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

import { RT_KIT_LABELS, TRtKitLabelMap } from '@rt-tools/ui-kit-v2/core';
import { rtMaxlength, rtNotchWidth, RtFormControlBase } from '@rt-tools/ui-kit-v2/form-control';
import { IRtIcon } from '@rt-tools/ui-kit-v2/core';
import { RtIconComponent } from '@rt-tools/ui-kit-v2/icon';
import { RtIconButtonComponent } from '@rt-tools/ui-kit-v2/icon-button';
import { RtRadiusDirective } from '@rt-tools/ui-kit-v2/radius';
import { IRtInput } from '@rt-tools/ui-kit-v2/core';

const BEM_BLOCK: string = 'rt-input';

let floatingLabelSeed: number = 0;

function nextFloatingLabelId(): string {
    floatingLabelSeed += 1;
    return `rt-input-label-${floatingLabelSeed}`;
}

/**
 * Шеренный input common/ui. Поддерживает:
 * - интеграцию с Reactive Forms через общий `RtFormControlBase` (CVA-ядро,
 *   авто-подсветка invalid, `clearable`);
 * - левую и правую иконочные «слоты» (`iconLeft`, `iconRight`); по `iconLeftAction` /
 *   `iconRightAction` иконка становится кнопкой с подсказкой и своим выходом;
 * - подпись на рамке (`floatingLabel`): у пустого поля в покое лежит на месте подсказки, при
 *   значении или фокусе поднимается на верхнюю рамку, высоту поля не меняет;
 * - встроенный password-toggle (`passwordToggle=true` + `type="password"`);
 * - кнопку очистки (крестик) при наличии значения; на password-полях крестик
 *   не показывается (postfix занят toggle'ом).
 *
 * Все размеры/цвета — через `--rt-input-*` semantic-токены.
 */
@Component({
    selector: 'rt-input',
    templateUrl: './rt-input.component.html',
    styleUrls: ['./rt-input.component.scss', './rt-input-floating-label.scss', './rt-input-icons.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // standalone components / directives
        RtIconButtonComponent,
        RtIconComponent,
        BlockDirective,
        ElemDirective,
        ModDirective,
    ],
    providers: [
        // Алиас базового токена — чтобы rt-field мог найти контрол через
        // contentChild(RtFormControlBase) (query по абстрактному классу).
        { provide: RtFormControlBase, useExisting: forwardRef(() => RtInputComponent) },
    ],
    hostDirectives: [{ directive: RtRadiusDirective, inputs: ['radius'] }],
    host: {
        class: BEM_BLOCK,
        '[class.rt-input--disabled]': 'isDisabled()',
        '[class.rt-input--invalid]': 'isInvalid()',
        '[class.rt-input--readonly]': 'isReadonly()',
        '[class.rt-input--borderless]': '!bordered()',
        '[class.rt-input--appearance--fill]': "appearance() === 'fill'",
        '[class.rt-input--appearance--pill]': "appearance() === 'pill'",
        '[class.rt-input--size--sm]': "size() === 'sm'",
        '[class.rt-input--size--lg]': "size() === 'lg'",
        '[class.rt-input--with-icon-left]': '!!iconLeft()',
        '[class.rt-input--with-icon-right]': 'hasIconRight()',
        '[class.rt-input--floating]': '!!floatingLabel()',
        '[class.rt-input--clearable]': 'clearable()',
        '[style.--rt-input-notch-width]': "notchWidth() + 'px'",
        '[class.rt-input--filled]': 'hasValue()',
        '(mousedown)': 'onHostMousedown($event)',
    },
})
export class RtInputComponent extends RtFormControlBase<string> {
    protected readonly t: Signal<TRtKitLabelMap> = inject(RT_KIT_LABELS);

    protected readonly fieldEl: Signal<ElementRef<HTMLInputElement> | undefined> = viewChild<ElementRef<HTMLInputElement>>('fieldEl');

    /** Подпись на рамке: по её ширине материальный набор вырезает разрыв в рамке. `#`-поле `viewChild` не принимает. */
    protected readonly floatingLabelEl: Signal<ElementRef<HTMLElement> | undefined> = viewChild<ElementRef<HTMLElement>>('floatingLabelEl');

    /** Ширина подписи на рамке, px. */
    protected readonly notchWidth: Signal<number> = rtNotchWidth(this.floatingLabelEl);

    protected readonly isPasswordVisible: WritableSignal<boolean> = signal<boolean>(false);

    protected readonly hasValue: Signal<boolean> = computed((): boolean => this.value() !== '');

    /** Id подписи на рамке: на него ссылается `aria-labelledby` поля. */
    protected readonly floatingLabelId: string = nextFloatingLabelId();

    /** Подпись на рамке называет поле, только когда явного `ariaLabel` нет. */
    protected readonly labelledBy: Signal<string | null> = computed((): string | null =>
        this.floatingLabel() && !this.ariaLabel() ? this.floatingLabelId : null
    );

    protected readonly effectiveType: Signal<string> = computed((): string => {
        const t: IRtInput.Type = this.type();
        if (t === 'password' && this.passwordToggle() && this.isPasswordVisible()) {
            return 'text';
        }
        return t;
    });

    protected readonly showPasswordToggle: Signal<boolean> = computed((): boolean => this.passwordToggle() && this.type() === 'password');

    protected readonly hasIconRight: Signal<boolean> = computed((): boolean => !!this.iconRight() || this.showPasswordToggle());

    /** Иконка-кнопка отключена вместе с полем или своим входом. */
    protected readonly isIconLeftDisabled: Signal<boolean> = computed((): boolean => this.isDisabled() || this.iconLeftDisabled());
    protected readonly isIconRightDisabled: Signal<boolean> = computed((): boolean => this.isDisabled() || this.iconRightDisabled());

    protected readonly passwordToggleIcon: Signal<IRtIcon.Name> = computed((): IRtIcon.Name =>
        this.isPasswordVisible() ? 'ico-eyeClose' : 'ico-eye'
    );

    /** Вид рамки: `outline` — рамка со всех сторон, `fill` — залитое поле с чертой снизу. */
    public override readonly fieldLabelInside: boolean = true;
    public readonly appearance: InputSignal<IRtInput.Appearance> = input<IRtInput.Appearance>('outline');

    public readonly displayText: Signal<string> = computed((): string => this.value());

    public readonly type: InputSignal<IRtInput.Type> = input<IRtInput.Type>('text');
    public readonly placeholder: InputSignal<string> = input<string>('');
    public readonly iconLeft: InputSignal<IRtIcon.Name | null> = input<IRtIcon.Name | null>(null);
    public readonly iconRight: InputSignal<IRtIcon.Name | null> = input<IRtIcon.Name | null>(null);
    public readonly passwordToggle: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });
    public readonly autocomplete: InputSignal<string | null> = input<string | null>(null);

    /**
     * Предел длины значения: уходит атрибутом `maxlength` на поле, и браузер не даёт набрать лишний
     * знак. `null` — предела нет. Проверку формы вход не заменяет: значение, записанное кодом,
     * браузер не режет.
     */
    public readonly maxlength: InputSignalWithTransform<number | null, NumberInput> = input<number | null, NumberInput>(null, {
        transform: rtMaxlength,
    });

    /** Видимая подпись на рамке поля. `null` — подписи нет, поле как прежде. */
    public readonly floatingLabel: InputSignal<string | null> = input<string | null>(null);

    /** Левая иконка — кнопка: Tab, Enter, Space, нажатие уходит в `iconLeftClick`. */
    public readonly iconLeftAction: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /**
     * Правая иконка — кнопка, нажатие уходит в `iconRightClick`. На поле пароля с переключателем
     * показа не действует: место занято переключателем.
     */
    public readonly iconRightAction: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /**
     * Левая иконка-кнопка отключена, хотя поле доступно: например, поиск, который не ищет, пока
     * введено меньше трёх знаков. Подсказка у отключённой кнопки остаётся и объясняет почему.
     */
    public readonly iconLeftDisabled: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /** Правая иконка-кнопка отключена, хотя поле доступно. */
    public readonly iconRightDisabled: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /** Подсказка левой иконки-кнопки; она же её доступное имя. Без неё имя — имя иконки. */
    public readonly iconLeftTooltip: InputSignal<string | null> = input<string | null>(null);

    /** Подсказка правой иконки-кнопки; она же её доступное имя. */
    public readonly iconRightTooltip: InputSignal<string | null> = input<string | null>(null);

    /** Нажатие левой иконки-кнопки — мышью или клавишей (браузер шлёт click и на Enter/Space). */
    public readonly iconLeftClick: OutputEmitterRef<MouseEvent> = output<MouseEvent>();

    /** Нажатие правой иконки-кнопки. */
    public readonly iconRightClick: OutputEmitterRef<MouseEvent> = output<MouseEvent>();

    /**
     * Форма может вернуть полю прежнее значение в том же стеке, что и ввод: сигнал тогда равен
     * последнему отрисованному, привязка `[value]` не срабатывает, и поле остаётся с набранным.
     * Поэтому расхождение с полем пишется в него сразу.
     */
    public override writeValue(value: string | null): void {
        super.writeValue(value);
        const field: HTMLInputElement | undefined = this.fieldEl()?.nativeElement;
        if (field && field.value !== this.value()) {
            field.value = this.value();
        }
    }

    protected getEmptyValue(): string {
        return '';
    }

    protected focusAfterClear(): void {
        this.fieldEl()?.nativeElement.focus();
    }

    /**
     * Падинг/гэп рамки принадлежат host-контейнеру, а не `<input>`, поэтому клик
     * по этой зоне сам по себе не фокусирует поле. Перехватываем mousedown и
     * переводим фокус в input — но только если клик не пришёлся на само поле
     * (там нужно нативное позиционирование курсора) и не на интерактивный
     * постфикс (крестик/таггл со своими обработчиками).
     */
    protected onHostMousedown(event: MouseEvent): void {
        if (this.isDisabled()) {
            return;
        }
        const field: HTMLInputElement | undefined = this.fieldEl()?.nativeElement;
        const target: HTMLElement = event.target as HTMLElement;
        if (!field || target === field || target.closest('button, rt-icon-button')) {
            return;
        }
        event.preventDefault();
        field.focus();
    }

    protected onInput(event: Event): void {
        const target: HTMLInputElement = event.target as HTMLInputElement;
        const next: string = target.value;
        this.value.set(next);
        this.emitChange(next);
    }

    protected onBlur(): void {
        this.markTouched();
    }

    protected togglePassword(): void {
        this.isPasswordVisible.update((v: boolean): boolean => !v);
    }
}
