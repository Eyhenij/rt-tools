import { ChangeDetectionStrategy, Component, input, InputSignal } from '@angular/core';
import { AdminMomentPipe } from '@rt/message-bus-admin/common/core/ui';
import { adminLabel } from '@rt/message-bus-admin/common/core/util';
import { IPostmortem } from '@rt/message-bus-admin/postmortems/util';
import { BlockDirective } from '@rt-tools/core';
import { RtAsideSectionComponent, RtDetailListComponent, RtDetailRowComponent, RtMarkdownTextComponent } from '@rt-tools/ui-kit-v2';

const BEM_BLOCK: string = 'admin-panel';

/**
 * Вид одного разбора: поля записи и её текст.
 *
 * Пока запись читается, названия свойств уже стоят, а на месте значений — скелетоны: их даёт
 * готовая строка кита. Записи при этом ещё нет вовсе, поэтому вход принимает и пустоту; текст
 * в это время не показывается — прежний принадлежит прежней записи, а нового ещё нет.
 *
 * Текст показывается разметкой — компонентом кита: разбирается закрытый перечень разметки
 * `.md`, а сырой HTML узлом не становится вовсе и виден текстом как есть.
 *
 * Своего состояния у вида нет — запись приходит входом: читает её панель, а показывает он.
 */
@Component({
    selector: 'admin-postmortem-view',
    templateUrl: './admin-postmortem-view.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // rt-tools
        BlockDirective,
        RtAsideSectionComponent,
        RtDetailListComponent,
        RtDetailRowComponent,
        RtMarkdownTextComponent,

        // pipes
        AdminMomentPipe,
    ],
    host: { class: BEM_BLOCK },
})
export class AdminPostmortemViewComponent {
    protected readonly treeLabel: string = adminLabel('columnTree');
    protected readonly fileLabel: string = adminLabel('columnFile');
    protected readonly arrivedLabel: string = adminLabel('columnArrivedAt');
    protected readonly updatedLabel: string = adminLabel('columnUpdatedAt');
    protected readonly textLabel: string = adminLabel('detailsText');

    public readonly entity: InputSignal<IPostmortem.State | null> = input.required<IPostmortem.State | null>();
    public readonly reading: InputSignal<boolean> = input<boolean>(false);
}
