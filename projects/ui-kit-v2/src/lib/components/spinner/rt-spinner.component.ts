import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import { NgTemplateOutlet } from '@angular/common';
import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    input,
    InputSignal,
    InputSignalWithTransform,
    numberAttribute,
    Signal,
    ViewEncapsulation,
} from '@angular/core';

import { BlockDirective, ElemDirective } from '@rt-tools/core';

import { IRtSpinner } from './rt-spinner.model';

const BEM_BLOCK: string = 'rt-spinner';

/**
 * Атомарный rotating-spinner для loading-индикаторов.
 *
 * Без новых режимов кольцо рисует сам host: border с одной цветной стороной и вращение, своей
 * разметки нет. Так спиннер стоит у семи компонентов кита, и их разметка от режимов не меняется.
 *
 * Режимы `overlay`, `plate` и вид `arc` рисуют внутреннюю разметку, а host перестаёт быть кольцом:
 * - `overlay` — спиннер занимает позиционированного родителя целиком и ставит кольцо в центр;
 *   слой — ступень `sticky`, ниже всего, что открывается поверх страницы;
 * - `backdrop` — полупрозрачная подложка оверлея, без `overlay` не действует;
 * - `plate` — круглая плашка с тенью под кольцом;
 * - `appearance="arc"` — дуга без дорожки, как у Material.
 *
 * Анимация уважает `@media (prefers-reduced-motion)` — вращение замедляется.
 */
@Component({
    selector: 'rt-spinner',
    templateUrl: './rt-spinner.component.html',
    styleUrls: ['./rt-spinner.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [NgTemplateOutlet, BlockDirective, ElemDirective],
    host: {
        class: BEM_BLOCK,
        role: 'status',
        'aria-live': 'polite',
        '[class]': 'modifiers()',
        '[style.--rt-spinner-diameter]': 'cssDiameter()',
    },
})
export class RtSpinnerComponent {
    /** Кольцо рисуется внутренней разметкой, а не самим host-ом. */
    protected readonly framed: Signal<boolean> = computed((): boolean => this.overlay() || this.plate() || this.appearance() === 'arc');

    protected readonly modifiers: Signal<Record<string, boolean>> = computed((): Record<string, boolean> => ({
        [`${BEM_BLOCK}--${this.color()}`]: true,
        [`${BEM_BLOCK}--framed`]: this.framed(),
        [`${BEM_BLOCK}--overlay`]: this.overlay(),
        [`${BEM_BLOCK}--backdrop`]: this.overlay() && this.backdrop(),
    }));

    protected readonly cssDiameter: Signal<string> = computed((): string => `${this.diameter()}px`);

    /** Диаметр spinner'а в px. Default 32. */
    public readonly diameter: InputSignalWithTransform<number, NumberInput> = input<number, NumberInput>(32, {
        transform: numberAttribute,
    });

    /** Семантическая палитра. Default `primary`. */
    public readonly color: InputSignal<IRtSpinner.Color> = input<IRtSpinner.Color>('primary');

    /** Вид кольца: `border` — с дорожкой, `arc` — дуга без дорожки. Default `border`. */
    public readonly appearance: InputSignal<IRtSpinner.Appearance> = input<IRtSpinner.Appearance>('border');

    /** Спиннер накрывает позиционированного родителя и стоит в его центре. Default `false`. */
    public readonly overlay: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /** Полупрозрачная подложка оверлея; без `overlay` не действует. Default `false`. */
    public readonly backdrop: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /** Круглая плашка с тенью под кольцом. Default `false`. */
    public readonly plate: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });
}
