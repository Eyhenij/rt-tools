import { ChangeDetectionStrategy, Component, computed, inject, input, InputSignal, Signal } from '@angular/core';
import { AdminMomentPipe } from '@rt/message-bus-admin/common/core/ui';
import { AdminTextService } from '@rt/message-bus-admin/common/core/util';
import { IMonthRecord } from '@rt/message-bus-admin/summaries/util';
import { BlockDirective, ElemDirective } from '@rt-tools/core';
import { RtAsideSectionComponent, RtDetailListComponent, RtDetailRowComponent, RtMarkdownTextComponent } from '@rt-tools/ui-kit-v2';

const BEM_BLOCK: string = 'admin-panel';

/**
 * Вид одной записи месяца: поля записи и сводка последнего прогона.
 *
 * Пока запись читается, названия свойств уже стоят, а на месте значений — скелетоны: их даёт
 * готовая строка кита. Записи при этом ещё нет вовсе, поэтому вход принимает и пустоту; слово
 * о пустой сводке в это время не показывается — иначе чтение читалось бы отсутствием сводки.
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
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // rt-tools
        BlockDirective,
        ElemDirective,
        RtAsideSectionComponent,
        RtDetailListComponent,
        RtDetailRowComponent,
        RtMarkdownTextComponent,

        // pipes
        AdminMomentPipe,
    ],
    host: { class: BEM_BLOCK },
})
export class AdminMonthRecordViewComponent {
    readonly #text: AdminTextService = inject(AdminTextService);

    protected readonly treeLabel: Signal<string> = computed((): string => this.#text.text('columnTree'));
    protected readonly monthLabel: Signal<string> = computed((): string => this.#text.text('columnMonth'));
    protected readonly sessionsLabel: Signal<string> = computed((): string => this.#text.text('columnSessions'));
    protected readonly ranAtLabel: Signal<string> = computed((): string => this.#text.text('columnRanAt'));
    protected readonly summaryLabel: Signal<string> = computed((): string => this.#text.text('detailsSummary'));
    protected readonly summaryMissing: Signal<string> = computed((): string => this.#text.text('detailsSummaryMissing'));

    public readonly entity: InputSignal<IMonthRecord.State | null> = input.required<IMonthRecord.State | null>();
    public readonly reading: InputSignal<boolean> = input<boolean>(false);
}
