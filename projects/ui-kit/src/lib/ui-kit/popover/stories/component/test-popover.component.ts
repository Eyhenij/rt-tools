import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButton } from '@angular/material/button';

import { BlockDirective, ElemDirective } from '@rt-tools/core';

import { RtPopoverDirective } from '../../rt-popover.directive';
import { RtuiPopoverContainerComponent } from '../../rtui-popover-container.component';

/** Какое содержимое подано слою: у каждого свой вид, и меряются они порознь. */
export type TPopoverContent = 'short' | 'long' | 'markup' | 'none';

/**
 * Обёртка показа всплывающего слоя.
 *
 * Слой показывается двумя путями, и они отвечают на разные вопросы. Поставленный разметкой
 * говорит, что он рисует: содержимое, класс от потребителя, пустоту. Открытый директивой — что
 * он появляется по нажатию и встаёт под источником, в теле страницы, а не внутри хоста.
 *
 * Класс от потребителя показывает только первый путь: директива своего входа под него не имеет
 * и слою его не передаёт.
 */
@Component({
    selector: 'app-popover',
    templateUrl: './test-popover.component.html',
    styleUrls: ['./test-popover.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        MatButton,

        // directives
        BlockDirective,
        ElemDirective,
        RtPopoverDirective,

        // components
        RtuiPopoverContainerComponent,
    ],
})
export class TestPopoverComponent {
    public content: TPopoverContent = 'short';
    public popoverClass: string = '';
    /** Слой поставлен разметкой — так видно содержимое и класс; иначе показывается источник. */
    public inline: boolean = true;
}
