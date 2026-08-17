import { ChangeDetectionStrategy, Component, input, InputSignal } from '@angular/core';
import { AdminMomentPipe } from '@rt/message-bus-admin/common/core/ui';
import { adminLabel } from '@rt/message-bus-admin/common/core/util';
import { IPostmortem } from '@rt/message-bus-admin/postmortems/util';
import { BlockDirective, ElemDirective } from '@rt-tools/core';
import { RtAsideSectionComponent, RtDetailListComponent, RtDetailRowComponent } from '@rt-tools/ui-kit-v2';

const BEM_BLOCK: string = 'admin-panel';

/**
 * Вид одного разбора: поля записи и её текст.
 *
 * Текст показывается текстом, а не размеченным содержимым: приёмник содержимого груза не
 * разбирает, и дерево, у которого есть токен, иначе получало бы исполнение своей разметки в
 * браузере вошедшего.
 *
 * Своего состояния у вида нет — запись приходит входом: читает её панель, а показывает он.
 */
@Component({
    selector: 'admin-postmortem-view',
    templateUrl: './admin-postmortem-view.component.html',
    styleUrl: './admin-postmortem-view.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // rt-tools
        BlockDirective,
        ElemDirective,
        RtAsideSectionComponent,
        RtDetailListComponent,
        RtDetailRowComponent,

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

    public readonly entity: InputSignal<IPostmortem.State> = input.required<IPostmortem.State>();
}
