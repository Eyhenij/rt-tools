import { NgTemplateOutlet } from '@angular/common';
import {
    input,
    output,
    ChangeDetectionStrategy,
    Component,
    InputSignal,
    OutputEmitterRef,
    TemplateRef,
    ViewEncapsulation,
} from '@angular/core';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

import { RtIconComponent } from '@rt-tools/ui-kit-v2/icon';
import { RtPopoverDirective } from '@rt-tools/ui-kit-v2/popover';

const BEM_BLOCK: string = 'rt-page-header-user';

/**
 * Кнопка профиля горизонтальной шапки. Меню открывается наведением, как и разделы: весь верхний ряд
 * ведёт себя одинаково. Нажатие остаётся запасным путём для касания, а переход курсора на список
 * языков панель переживает: вложенный оверлей за уход наружу не считается. На узком экране меню
 * стоит на той же подложке, что меню разделов из бургера. Классы и стили кнопки остаются у шапки.
 */
@Component({
    selector: 'rt-page-header-user',
    templateUrl: './rt-page-header-user.component.html',
    styleUrl: './rt-page-header-user.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [NgTemplateOutlet, RtIconComponent, RtPopoverDirective, BlockDirective, ElemDirective, ModDirective],
    host: { class: BEM_BLOCK },
})
export class RtPageHeaderUserComponent {
    public readonly name: InputSignal<string> = input.required<string>();

    public readonly avatar: InputSignal<string> = input.required<string>();

    public readonly menu: InputSignal<TemplateRef<unknown> | null> = input<TemplateRef<unknown> | null>(null);

    public readonly backdropClass: InputSignal<string> = input<string>('');

    public readonly userClick: OutputEmitterRef<void> = output<void>();
}
