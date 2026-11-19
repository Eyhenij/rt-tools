import { NgTemplateOutlet } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    input,
    InputSignal,
    output,
    OutputEmitterRef,
    TemplateRef,
    ViewEncapsulation,
} from '@angular/core';

// rt-tools
import { BlockDirective, ElemDirective } from '@rt-tools/core';

import { RtBottomSheetComponent } from '@rt-tools/ui-kit-v2/bottom-sheet';

const BEM_BLOCK: string = 'rt-popover-sheet';

/**
 * Панель выбора `[rtPopover]` в нижней шторке кита — так её открывает директива на узком экране.
 *
 * Шаблон панели тот же, что у панели рядом с триггером: шторка лишь даёт ему место во всю ширину
 * экрана, заголовок и ручку. Ширина, взятая у триггера, сюда не доходит — панель тянется по шторке.
 * Закрытие подложкой и ручкой уходит наружу одним событием `dismissed`: директива закрывает по нему
 * панель так же, как по нажатию снаружи.
 */
@Component({
    selector: 'rt-popover-sheet',
    templateUrl: './rt-popover-sheet.component.html',
    styleUrl: './rt-popover-sheet.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // @angular
        NgTemplateOutlet,

        // rt-tools
        BlockDirective,
        ElemDirective,
        RtBottomSheetComponent,
    ],
    host: {
        class: BEM_BLOCK,
    },
})
export class RtPopoverSheetComponent {
    public readonly template: InputSignal<TemplateRef<unknown> | null> = input<TemplateRef<unknown> | null>(null);
    public readonly context: InputSignal<unknown> = input<unknown>(null);
    public readonly title: InputSignal<string> = input<string>('');
    public readonly open: InputSignal<boolean> = input<boolean>(false);

    public readonly dismissed: OutputEmitterRef<void> = output<void>();

    protected openChange(open: boolean): void {
        if (!open) {
            this.dismissed.emit();
        }
    }
}
