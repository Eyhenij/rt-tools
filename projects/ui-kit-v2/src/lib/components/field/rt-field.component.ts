import { BooleanInput } from '@angular/cdk/coercion';
import {
    booleanAttribute,
    computed,
    contentChild,
    effect,
    inject,
    input,
    AfterContentInit,
    ChangeDetectionStrategy,
    Component,
    InputSignal,
    InputSignalWithTransform,
    Signal,
    ViewEncapsulation,
} from '@angular/core';
import { ValidationErrors } from '@angular/forms';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

import { RT_KIT_LABELS, RtKitLabelKey, RtKitLabelMap, rtKitLabel } from '../../i18n';
import { RtFormControlBase } from '../form-control/rt-form-control.base';
import { RtIconComponent } from '../icon';
import { RtPopoverDirective } from '../popover/rt-popover.directive';
import { RtSkeletonWrapperComponent } from '../skeleton-wrapper/rt-skeleton-wrapper.component';
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
    styleUrls: ['./rt-field.component.scss'],
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
    host: { class: BEM_BLOCK },
})
export class RtFieldComponent implements AfterContentInit {
    // contentChild нельзя объявлять на ES-private (#) поле — Angular это запрещает,
    // поэтому проекция контрола живёт в protected-поле.
    protected readonly t: Signal<RtKitLabelMap> = inject(RT_KIT_LABELS);

    protected readonly projectedControl: Signal<RtFormControlBase<unknown> | undefined> = contentChild(RtFormControlBase);

    // Проецируемый hint (с разметкой) — если присутствует, рендерится вместо
    // строкового [hint].
    protected readonly projectedHint: Signal<RtFieldHintDirective | undefined> = contentChild(RtFieldHintDirective);

    readonly #autoId: string = nextAutoId();

    /** Итоговый id: явный controlId контрола важнее авто-id. */
    protected readonly controlId: Signal<string> = computed((): string => this.projectedControl()?.effectiveControlId() ?? this.#autoId);

    protected readonly isRequired: Signal<boolean> = computed((): boolean => this.projectedControl()?.required() ?? false);

    protected readonly showError: Signal<boolean> = computed((): boolean => !!this.projectedControl()?.invalid());

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
        computed((): RtKitLabelKey | '' => RT_FIELD_DEFAULT_ERROR_KEYS[this.#failedValidator()] ?? '')
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
    }

    public ngAfterContentInit(): void {
        const ctrl: RtFormControlBase<unknown> | undefined = this.projectedControl();
        // Авто-id только если у контрола нет явного controlId — для label[for].
        if (ctrl && ctrl.effectiveControlId() === null) {
            ctrl.assignControlId(this.#autoId);
        }
    }
}
