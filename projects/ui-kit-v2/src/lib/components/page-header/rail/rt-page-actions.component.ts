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
import { RtTooltipDirective } from '@rt-tools/ui-kit-v2/tooltip';
import { IRtPageHeader } from '../rt-page-header.model';
import { RtPageUserComponent } from './rt-page-user.component';

const BEM_BLOCK: string = 'rt-page-actions';

/**
 * Кнопки вокруг страницы: ассистент, уведомления и профиль. Одна часть на три места: столбец в
 * подвале рейки, строка шапки телефона и ряд вкладок. Состав задаёт приложение.
 */
@Component({
    selector: 'rt-page-actions',
    templateUrl: './rt-page-actions.component.html',
    styleUrl: './rt-page-actions.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [RtIconComponent, RtPageUserComponent, RtTooltipDirective, BlockDirective, ElemDirective, ModDirective],
    host: { class: BEM_BLOCK, '[class.rt-page-actions--rail]': "placement() === 'rail'" },
})
export class RtPageActionsComponent {
    public readonly items: InputSignal<ReadonlyArray<IRtPageHeader.Item>> = input<ReadonlyArray<IRtPageHeader.Item>>([]);

    public readonly user: InputSignal<IRtPageHeader.User | null> = input<IRtPageHeader.User | null>(null);

    public readonly userMenu: InputSignal<TemplateRef<unknown> | null> = input<TemplateRef<unknown> | null>(null);

    /** Где стоят кнопки: в подвале рейки или в ряду вкладок. */
    public readonly placement: InputSignal<'rail' | 'bar'> = input<'rail' | 'bar'>('bar');

    public readonly itemClick: OutputEmitterRef<string> = output<string>();

    public readonly userClick: OutputEmitterRef<void> = output<void>();
}
