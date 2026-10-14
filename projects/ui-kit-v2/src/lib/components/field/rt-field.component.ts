import { BooleanInput } from '@angular/cdk/coercion';
import {
    booleanAttribute,
    computed,
    contentChild,
    effect,
    inject,
    input,
    viewChild,
    AfterContentInit,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    InputSignal,
    InputSignalWithTransform,
    Signal,
    ViewEncapsulation,
} from '@angular/core';
import { ValidationErrors } from '@angular/forms';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

import { RT_KIT_LABELS, TRtKitLabelKey, TRtKitLabelMap, rtKitLabel } from '@rt-tools/ui-kit-v2/core';
import { rtNotchWidth, RtFormControlBase } from '@rt-tools/ui-kit-v2/form-control';
import { RtIconComponent } from '@rt-tools/ui-kit-v2/icon';
import { RtPopoverDirective } from '@rt-tools/ui-kit-v2/popover';
import { RtSkeletonWrapperComponent } from '@rt-tools/ui-kit-v2/skeleton-wrapper';
import { RtFieldHintDirective } from './rt-field-hint.directive';
import { RT_FIELD_DEFAULT_ERROR_KEYS, RT_FIELD_EMPTY_VALUE, IRtField } from './rt-field.model';

const BEM_BLOCK: string = 'rt-field';

/** Счётчик для авто-id (связка label[for] ↔ controlId спроецированного контрола). */
let uidSeed: number = 0;

function nextAutoId(): string {
    uidSeed += 1;
    return `rt-field-${uidSeed}`;
}

/**
 * Обёртка единой анатомии поля: label (+ опц. help-иконка с popover, + авто «*»
 * для required) сверху, спроецированный rt-контрол посередине, hint/error снизу.
 * `required` объявляет поле обязательным там, где валидатора на контроле нет (шаблонная форма).
 * `hideRequiredMark` глушит авто-«*» — для форм, где все поля обязательны и
 * маркер лишний (логин).
 * `reserveHintSpace` держит под контролом строку высотой в одно сообщение даже
 * когда ни ошибки, ни hint нет — чтобы появление ошибки не сдвигало форму вниз
 * (нужно для полей без постоянного hint, напр. логин).
 *
 * Читает контрол через contentChild(RtFormControlBase): авто-связывает label[for],
 * прокидывает read-only режим, показывает текст ошибки/required-маркер. На loading
 * оборачивает зону контрола в rt-skeleton-wrapper (label/hint остаются видимыми) —
 * нужно для route-aside, где поля рендерятся до прихода данных.
 */
@Component({
    selector: 'rt-field',
    templateUrl: './rt-field.component.html',
    styleUrls: ['./rt-field.component.scss', './rt-field-label-inside.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // standalone components / directives
        RtIconComponent,
        RtPopoverDirective,
        RtSkeletonWrapperComponent,
        BlockDirective,
        ElemDirective,
        ModDirective,
    ],
    host: {
        class: BEM_BLOCK,
        '[class.rt-field--filled]': 'filled()',
        '[class.rt-field--invalid]': 'showError()',
        '[class.rt-field--static]': 'isStatic()',
        '[class.rt-field--label-inside]': 'labelInside()',
        '[style.--rt-field-notch-width]': "notchWidth() + 'px'",
    },
})
export class RtFieldComponent implements AfterContentInit {
    // contentChild нельзя объявлять на ES-private (#) поле — Angular это запрещает,
    // поэтому проекция контрола живёт в protected-поле.
    protected readonly t: Signal<TRtKitLabelMap> = inject(RT_KIT_LABELS);

    protected readonly projectedControl: Signal<RtFormControlBase<unknown> | undefined> = contentChild(RtFormControlBase);

    // Проецируемый hint (с разметкой) — если присутствует, рендерится вместо
    // строкового [hint].
    protected readonly projectedHint: Signal<RtFieldHintDirective | undefined> = contentChild(RtFieldHintDirective);

    readonly #autoId: string = nextAutoId();

    /** Строка подписи: по её ширине материальный набор вырезает разрыв в рамке. `#`-поле `viewChild` не принимает. */
    protected readonly labelRow: Signal<ElementRef<HTMLElement> | undefined> = viewChild<ElementRef<HTMLElement>>('labelRow');

    /**
     * Ширина подписи на рамке, px. Разрыв рамки под подписью, как у поля Material, режется по этому
     * числу: ширину подписи стили сами не знают.
     */
    protected readonly notchWidth: Signal<number> = rtNotchWidth(this.labelRow);

    /** Итоговый id: явный controlId контрола важнее авто-id. */
    protected readonly controlId: Signal<string> = computed((): string => this.projectedControl()?.effectiveControlId() ?? this.#autoId);

    protected readonly isRequired: Signal<boolean> = computed((): boolean => this.projectedControl()?.required() ?? false);

    protected readonly showError: Signal<boolean> = computed((): boolean => !!this.projectedControl()?.invalid());

    /**
     * У контрола есть значение. Под материальным набором по нему подпись поднимается на рамку:
     * текст значения есть у всех контролов, поэтому одно правило служит полю, области текста,
     * числу и выбору.
     */
    protected readonly filled: Signal<boolean> = computed((): boolean => (this.projectedControl()?.displayText() ?? '') !== '');

    /** Поле без рамки ввода — только для чтения или в загрузке: подпись остаётся над значением. */
    protected readonly isStatic: Signal<boolean> = computed(
        (): boolean => this.readonly() || this.loading() || !!this.projectedControl()?.isReadonly()
    );

    /** Подпись материального набора ложится внутрь контрола: только у полей с местом подсказки. */
    protected readonly labelInside: Signal<boolean> = computed(
        (): boolean => !this.isStatic() && !!this.projectedControl()?.fieldLabelInside
    );

    /** Имя первого сработавшего валидатора: сообщений показываем по одному */
    readonly #failedValidator: Signal<string> = computed((): string => {
        const errs: ValidationErrors | null = this.projectedControl()?.errors() ?? null;
        return errs ? (Object.keys(errs)[0] ?? '') : '';
    });

    /**
     * Умолчание переводится по ключу.
     *
     * Ключ передаётся сигналом, а не строкой: так подпись пересчитывается и при
     * смене валидатора, и при смене языка — пользователь переключает его
     * на лету, и текст ошибки обязан переключиться вместе с формой.
     */
    readonly #defaultErrorText: Signal<string> = rtKitLabel(
        computed((): TRtKitLabelKey | '' => RT_FIELD_DEFAULT_ERROR_KEYS[this.#failedValidator()] ?? '')
    );

    /** Сообщение об ошибке: текст, переданный формой, важнее умолчания */
    protected readonly errorText: Signal<string> = computed((): string => {
        const validator: string = this.#failedValidator();
        if (!validator) {
            return '';
        }
        const own: string | undefined = this.errors()[validator];
        if (own) {
            return own;
        }
        return RT_FIELD_DEFAULT_ERROR_KEYS[validator] ? this.#defaultErrorText() : '';
    });

    protected readonly emptyValue: string = RT_FIELD_EMPTY_VALUE;

    public readonly label: InputSignal<string> = input<string>('');
    public readonly hint: InputSignal<string> = input<string>('');
    public readonly help: InputSignal<string> = input<string>('');
    public readonly readonly: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });
    public readonly loading: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });
    /**
     * Поле обязательно, хотя валидатора на контроле нет: шаблонная форма его не кладёт. Даёт «*» и
     * ошибку под тронутым пустым полем. Форму недействительной не делает — решение о записи
     * остаётся у формы.
     */
    public readonly required: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });
    public readonly hideRequiredMark: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });
    public readonly reserveHintSpace: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });
    public readonly errors: InputSignal<IRtField.ErrorMessages> = input<IRtField.ErrorMessages>({});

    constructor() {
        // Реактивно прокидываем read-only режим в спроецированный контрол.
        effect((): void => {
            this.projectedControl()?.setReadonly(this.readonly());
        });
        effect((): void => {
            this.projectedControl()?.setRequired(this.required());
        });
    }

    public ngAfterContentInit(): void {
        const ctrl: RtFormControlBase<unknown> | undefined = this.projectedControl();
        // Авто-id только если у контрола нет явного controlId — для label[for].
        if (ctrl && ctrl.effectiveControlId() === null) {
            ctrl.assignControlId(this.#autoId);
        }
    }
}
