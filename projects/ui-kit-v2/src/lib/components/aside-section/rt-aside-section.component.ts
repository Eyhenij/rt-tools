import { ChangeDetectionStrategy, Component, input, InputSignal, ViewEncapsulation } from '@angular/core';

import { BlockDirective, ElemDirective } from '@rt-tools/core';

const BEM_BLOCK: string = 'rt-aside-section';

/**
 * Смысловая секция внутри асайда: единый вертикальный ритм между полями и
 * необязательный заголовок одного стиля. Заменяет разнобой из `fieldset`,
 * самопальных `div`-секций, `h3` и `<legend>`, которым раньше каждый диалог
 * группировал контент по-своему.
 *
 * Заголовок (`[heading]`) рендерится только когда задан. Соседние секции
 * автоматически разделяются верхней границей — отдельный разделитель в
 * потребителе не нужен.
 */
@Component({
    selector: 'rt-aside-section',
    templateUrl: './rt-aside-section.component.html',
    styleUrl: './rt-aside-section.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // standalone components / directives
        BlockDirective,
        ElemDirective,
    ],
    host: {
        class: BEM_BLOCK,
    },
})
export class RtAsideSectionComponent {
    public readonly heading: InputSignal<string | null> = input<string | null>(null);
}
