import { ChangeDetectionStrategy, Component, input, InputSignal } from '@angular/core';
import { AdminMomentPipe } from '@rt/message-bus-admin/common/core/ui';
import { adminLabel } from '@rt/message-bus-admin/common/core/util';
import { IMonthRecord } from '@rt/message-bus-admin/summaries/util';
import { BlockDirective, ElemDirective } from '@rt-tools/core';

const BEM_BLOCK: string = 'admin-panel';

/**
 * Вид одной записи месяца: поля записи и сводка последнего прогона.
 *
 * Сводка показывается текстом, а не размеченным содержимым: приёмник содержимого груза не
 * разбирает, и дерево, у которого есть токен, иначе получало бы исполнение своего тела в
 * браузере вошедшего.
 *
 * Пустая сводка объясняет себя словами, а не пустым местом: запись месяца заводит любой род
 * груза, и месяц без сводки — обычное дело, а не поломка чтения.
 *
 * Своего состояния у вида нет — запись приходит входом: читает её панель, а показывает он.
 */
@Component({
    selector: 'admin-month-record-view',
    templateUrl: './admin-month-record-view.component.html',
    styleUrl: './admin-month-record-view.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // rt-tools
        BlockDirective,
        ElemDirective,

        // pipes
        AdminMomentPipe,
    ],
    host: { class: BEM_BLOCK },
})
export class AdminMonthRecordViewComponent {
    protected readonly treeLabel: string = adminLabel('columnTree');
    protected readonly monthLabel: string = adminLabel('columnMonth');
    protected readonly sessionsLabel: string = adminLabel('columnSessions');
    protected readonly ranAtLabel: string = adminLabel('columnRanAt');
    protected readonly summaryLabel: string = adminLabel('detailsSummary');
    protected readonly summaryMissing: string = adminLabel('detailsSummaryMissing');

    public readonly entity: InputSignal<IMonthRecord.State> = input.required<IMonthRecord.State>();
}
