import { ChangeDetectionStrategy, Component, input, InputSignal, ViewEncapsulation } from '@angular/core';

import { BlockDirective, ElemDirective } from '@rt-tools/core';

const BEM_BLOCK: string = 'rt-counter-row';

/**
 * Строка списка со счётчиком: подпись с пояснением слева, контрол справа,
 * волосяная линия между соседними строками.
 *
 * Сам счётчик проецируется, а не собирается внутри: строка отвечает только за
 * раскладку, и её не приходится расширять каждый раз, когда у `rt-counter`
 * появляется новый input.
 *
 * ViewEncapsulation.None — стили таргетируют имя элемента и BEM-класс блока.
 */
@Component({
    selector: 'rt-counter-row',
    templateUrl: './rt-counter-row.component.html',
    styleUrl: './rt-counter-row.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // rt-tools
        BlockDirective,
        ElemDirective,
    ],
    host: {
        class: BEM_BLOCK,
    },
})
export class RtCounterRowComponent {
    public readonly label: InputSignal<string> = input.required<string>();

    /** Пояснение под подписью: возрастная вилка, условие. Пусто — строки нет. */
    public readonly hint: InputSignal<string> = input<string>('');
}
