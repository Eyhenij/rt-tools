import { ChangeDetectionStrategy, Component, input, InputSignal } from '@angular/core';
import { AdminMomentPipe } from '@rt/message-bus-admin/common/core/ui';
import { adminLabel } from '@rt/message-bus-admin/common/core/util';
import { IProposal } from '@rt/message-bus-admin/proposals/util';
import { BlockDirective, ElemDirective } from '@rt-tools/core';
import { RtAsideSectionComponent, RtDetailListComponent, RtDetailRowComponent } from '@rt-tools/ui-kit-v2';

const BEM_BLOCK: string = 'admin-panel';

/**
 * Вид одного предложения: поля записи и её текст.
 *
 * Пока запись читается, названия свойств уже стоят, а на месте значений — скелетоны: их даёт
 * готовая строка кита. Записи при этом ещё нет вовсе, поэтому вход принимает и пустоту; текст
 * в это время не показывается — прежний принадлежит прежней записи, а нового ещё нет.
 *
 * Текст показывается текстом, а не размеченным содержимым: приёмник содержимого груза не
 * разбирает, и дерево, у которого есть токен, иначе получало бы исполнение своей разметки в
 * браузере вошедшего.
 *
 * Своего состояния у вида нет — запись приходит входом: читает её панель, а показывает он.
 */
@Component({
    selector: 'admin-proposal-view',
    templateUrl: './admin-proposal-view.component.html',
    styleUrl: './admin-proposal-view.component.scss',
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
export class AdminProposalViewComponent {
    protected readonly treeLabel: string = adminLabel('columnTree');
    protected readonly resourceLabel: string = adminLabel('columnResource');
    protected readonly addressLabel: string = adminLabel('columnAddress');
    protected readonly monthLabel: string = adminLabel('columnMonth');
    protected readonly arrivedLabel: string = adminLabel('columnArrivedAt');
    protected readonly textLabel: string = adminLabel('detailsText');

    public readonly entity: InputSignal<IProposal.State | null> = input.required<IProposal.State | null>();
    public readonly reading: InputSignal<boolean> = input<boolean>(false);
}
