import { BooleanInput } from '@angular/cdk/coercion';
import {
    booleanAttribute,
    computed,
    forwardRef,
    inject,
    input,
    signal,
    viewChild,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    InputSignal,
    InputSignalWithTransform,
    Signal,
    ViewEncapsulation,
    WritableSignal,
} from '@angular/core';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

import { RT_KIT_LABELS, RtKitLabelMap } from '../../i18n';
import { RtFormControlBase } from '../form-control/rt-form-control.base';
import { RtIconComponent, IRtIcon } from '../icon';
import { RtIconButtonComponent } from '../icon-button/rt-icon-button.component';
import { IRtInput } from './rt-input.model';

const BEM_BLOCK: string = 'rt-input';

/**
 * Шеренный input common/ui. Поддерживает:
 * - интеграцию с Reactive Forms через общий `RtFormControlBase` (CVA-ядро,
 *   авто-подсветка invalid, `clearable`);
 * - левую и правую иконочные «слоты» (`iconLeft`, `iconRight`);
 * - встроенный password-toggle (`passwordToggle=true` + `type="password"`);
 * - кнопку очистки (крестик) при наличии значения; на password-полях крестик
 *   не показывается (postfix занят toggle'ом).
 *
 * Все размеры/цвета — через `--rt-input-*` semantic-токены.
 */
@Component({
    selector: 'rt-input',
    templateUrl: './rt-input.component.html',
    styleUrls: ['./rt-input.component.scss'],
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
    host: {
        class: BEM_BLOCK,
        '[class.rt-input--disabled]': 'isDisabled()',
        '[class.rt-input--invalid]': 'isInvalid()',
        '[class.rt-input--readonly]': 'isReadonly()',
        '[class.rt-input--borderless]': '!bordered()',
        '[class.rt-input--size--sm]': "size() === 'sm'",
        '[class.rt-input--size--lg]': "size() === 'lg'",
        '[class.rt-input--with-icon-left]': '!!iconLeft()',
        '[class.rt-input--with-icon-right]': 'hasIconRight()',
        '(mousedown)': 'onHostMousedown($event)',
    },
})
export class RtInputComponent extends RtFormControlBase<string> {
    protected readonly t: Signal<RtKitLabelMap> = inject(RT_KIT_LABELS);

    protected readonly fieldEl: Signal<ElementRef<HTMLInputElement> | undefined> = viewChild<ElementRef<HTMLInputElement>>('fieldEl');

    protected readonly isPasswordVisible: WritableSignal<boolean> = signal<boolean>(false);

    protected readonly hasValue: Signal<boolean> = computed((): boolean => this.value() !== '');

    protected readonly effectiveType: Signal<string> = computed((): string => {
        const t: IRtInput.Type = this.type();
        if (t === 'password' && this.passwordToggle() && this.isPasswordVisible()) {
            return 'text';
        }
        return t;
    });

    protected readonly showPasswordToggle: Signal<boolean> = computed((): boolean => this.passwordToggle() && this.type() === 'password');

    protected readonly hasIconRight: Signal<boolean> = computed((): boolean => !!this.iconRight() || this.showPasswordToggle());

    protected readonly passwordToggleIcon: Signal<IRtIcon.Name> = computed((): IRtIcon.Name =>
        this.isPasswordVisible() ? 'ico-eyeClose' : 'ico-eye'
    );

    public readonly displayText: Signal<string> = computed((): string => this.value());

    public readonly type: InputSignal<IRtInput.Type> = input<IRtInput.Type>('text');
    public readonly placeholder: InputSignal<string> = input<string>('');
    public readonly iconLeft: InputSignal<IRtIcon.Name | null> = input<IRtIcon.Name | null>(null);
    public readonly iconRight: InputSignal<IRtIcon.Name | null> = input<IRtIcon.Name | null>(null);
    public readonly passwordToggle: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });
    public readonly autocomplete: InputSignal<string | null> = input<string | null>(null);

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
