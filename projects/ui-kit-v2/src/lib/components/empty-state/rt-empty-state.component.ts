import { ChangeDetectionStrategy, Component, input, InputSignal, ViewEncapsulation } from '@angular/core';

import { BlockDirective, ElemDirective } from '@rt-tools/core';

import { RtIconComponent } from '../icon/rt-icon.component';
import { IRtIcon } from '../icon/rt-icon.model';

const BEM_BLOCK: string = 'rt-empty-state';

/**
 * Заглушка пустого состояния: центрированная иконка в круглой подложке, заголовок,
 * опциональное описание и проецируемый слот для действия (кнопка «Прикрепить»,
 * «Выбрать» и т.п.). Применяется в пустых вкладках/списках и зонах загрузки, когда
 * сущностей ещё нет.
 *
 * Иконка опциональна (`icon`), действие — через `<ng-content />` (если ничего не
 * спроецировано, слот скрыт `:empty`). Громких severity-цветов нет — приглушённая
 * палитра, как у `rt-note`.
 */
@Component({
    selector: 'rt-empty-state',
    templateUrl: './rt-empty-state.component.html',
    styleUrl: './rt-empty-state.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // standalone components / directives
        RtIconComponent,
        BlockDirective,
        ElemDirective,
    ],
    host: {
        class: BEM_BLOCK,
    },
})
export class RtEmptyStateComponent {
    public readonly icon: InputSignal<IRtIcon.Name | null> = input<IRtIcon.Name | null>(null);

    public readonly title: InputSignal<string> = input<string>('');

    public readonly description: InputSignal<string | null> = input<string | null>(null);
}
