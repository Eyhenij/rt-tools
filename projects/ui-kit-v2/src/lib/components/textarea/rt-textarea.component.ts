import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    ElementRef,
    forwardRef,
    input,
    InputSignal,
    InputSignalWithTransform,
    numberAttribute,
    Signal,
    viewChild,
    ViewEncapsulation,
} from '@angular/core';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

import { RtFormControlBase } from '../form-control/rt-form-control.base';

const BEM_BLOCK: string = 'rt-textarea';

export type IRtTextareaResize = 'none' | 'vertical';

/**
 * Шеренный textarea common/ui. CVA через общий `RtFormControlBase` —
 * авто-подсветка invalid. Размерные варианты sm/md/lg через host-класс. Resize
 * policy none/vertical.
 *
 * Крестик-очистка НЕ рендерится: в многострочном поле он нетипичен (`clearable`
 * наследуется, но шаблон его не использует).
 *
 * Размеры/цвета — через `--rt-input-*` / `--rt-textarea-*` semantic-токены.
 * `font-family: inherit` явно — textarea иначе падает на UA-default (monospace).
 */
@Component({
    selector: 'rt-textarea',
    templateUrl: './rt-textarea.component.html',
    styleUrls: ['./rt-textarea.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // standalone components / directives
        BlockDirective,
        ElemDirective,
        ModDirective,
    ],
    providers: [
        // Алиас базового токена — для contentChild(RtFormControlBase) в rt-field.
        { provide: RtFormControlBase, useExisting: forwardRef(() => RtTextareaComponent) },
    ],
    host: {
        class: BEM_BLOCK,
        '[class.rt-textarea--size--sm]': "size() === 'sm'",
        '[class.rt-textarea--size--lg]': "size() === 'lg'",
        '[class.rt-textarea--disabled]': 'isDisabled()',
        '[class.rt-textarea--readonly]': 'readonly()',
        '[class.rt-textarea--invalid]': 'isInvalid()',
        '[class.rt-textarea--borderless]': '!bordered()',
    },
})
export class RtTextareaComponent extends RtFormControlBase<string> {
    protected readonly fieldEl: Signal<ElementRef<HTMLTextAreaElement> | undefined> = viewChild<ElementRef<HTMLTextAreaElement>>('fieldEl');

    protected readonly hasValue: Signal<boolean> = computed((): boolean => this.value() !== '');

    public readonly displayText: Signal<string> = computed((): string => this.value());

    public readonly placeholder: InputSignal<string> = input<string>('');
    public readonly readonly: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });
    public readonly rows: InputSignalWithTransform<number, NumberInput> = input<number, NumberInput>(3, { transform: numberAttribute });
    public readonly resize: InputSignal<IRtTextareaResize> = input<IRtTextareaResize>('vertical');

    protected getEmptyValue(): string {
        return '';
    }

    protected focusAfterClear(): void {
        this.fieldEl()?.nativeElement.focus();
    }

    protected onInput(event: Event): void {
        const target: HTMLTextAreaElement = event.target as HTMLTextAreaElement;
        const next: string = target.value;
        this.value.set(next);
        this.emitChange(next);
    }

    protected onBlur(): void {
        this.markTouched();
    }
}
