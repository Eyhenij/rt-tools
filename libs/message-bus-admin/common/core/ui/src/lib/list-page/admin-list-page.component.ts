import { ChangeDetectionStrategy, Component, computed, input, InputSignal, output, OutputEmitterRef, Signal } from '@angular/core';
import { adminLabel, EReadFault, IReadFault, LIST_PAGE_SIZES } from '@rt/message-bus-admin/common/core/util';
import { ITreeChoice } from '@rt/message-bus-common';
import { BlockDirective, ElemDirective } from '@rt-tools/core';
import { IPageModel } from '@rt-tools/utils';
import {
    RtButtonDirective,
    RtIconButtonComponent,
    RtMessageComponent,
    RtPaginationComponent,
    RtToolbarComponent,
    RtToolbarLeftDirective,
    RtToolbarRightDirective,
} from '@rt-tools/ui-kit-v2';

import { AdminTreeFilterComponent } from '../tree-filter/admin-tree-filter.component';

const BEM_BLOCK: string = 'admin-page';

/**
 * Общий вид страницы списка: заголовок, тулбар с отбором, место под таблицу и переключатель
 * страниц.
 *
 * Таблицу страница не оборачивает, а принимает проекцией: столбцы таблица кита собирает
 * собственным запросом по содержимому, и через посредника они до неё не доходят. Раздел поэтому
 * объявляет таблицу у себя и кладёт сюда — а всё, что вокруг неё, одинаково у всех трёх
 * разделов и живёт здесь.
 *
 * Отказ чтения занимает место списка, а не встаёт строкой над ним: показанные под отказом строки
 * — это прежнее чтение, и отличить их от приехавших только что нечем. Повтор стоит тут же,
 * рядом с причиной: правило дерева подаёт отказ списка тостом, но тост уходит, а повторить
 * человеку нужно тогда, когда он вернулся к экрану.
 */
@Component({
    selector: 'admin-list-page',
    templateUrl: './admin-list-page.component.html',
    styleUrl: './admin-list-page.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // rt-tools
        BlockDirective,
        ElemDirective,

        // components
        AdminTreeFilterComponent,
        RtButtonDirective,
        RtIconButtonComponent,
        RtMessageComponent,
        RtPaginationComponent,
        RtToolbarComponent,
        RtToolbarLeftDirective,
        RtToolbarRightDirective,
    ],
    host: { class: BEM_BLOCK },
})
export class AdminListPageComponent {
    protected readonly refreshLabel: string = adminLabel('listRefresh');
    protected readonly retryLabel: string = adminLabel('listRetry');

    /**
     * Размеры страницы, которые предлагает переключатель.
     *
     * Тот же набор, что признаёт разбор адреса: переключатель прячет себя, когда записей меньше
     * самого малого из предложенных, и разошедшиеся наборы дали бы вторую страницу без
     * переключателя.
     */
    protected readonly pageSizes: readonly number[] = LIST_PAGE_SIZES;

    /** Что сказать про отказ. Род `Session` — не поломка чтения, и текст у него свой. */
    protected readonly faultText: Signal<string> = computed(() => {
        const fault: IReadFault | null = this.fault();

        if (fault === null) {
            return '';
        }

        return adminLabel(fault.kind === EReadFault.Session ? 'listSessionEnded' : 'listFailed');
    });

    /**
     * Номер обращения отдельной строкой: по нему поломку находят в журнале, и человек называет
     * его, когда рассказывает о ней. Пусто — приёмник его не называл.
     */
    protected readonly incidentText: Signal<string> = computed(() => {
        const fault: IReadFault | null = this.fault();

        return fault === null || fault.incident === '' ? '' : adminLabel('listIncident', { incident: fault.incident });
    });

    public readonly title: InputSignal<string> = input.required<string>();
    public readonly pageModel: InputSignal<IPageModel> = input.required<IPageModel>();
    public readonly choices: InputSignal<readonly ITreeChoice[]> = input<readonly ITreeChoice[]>([]);
    public readonly tree: InputSignal<string> = input<string>('');
    public readonly loading: InputSignal<boolean> = input<boolean>(false);
    public readonly fault: InputSignal<IReadFault | null> = input<IReadFault | null>(null);

    public readonly treeChange: OutputEmitterRef<string> = output<string>();
    public readonly pageChange: OutputEmitterRef<number> = output<number>();
    public readonly sizeChange: OutputEmitterRef<number> = output<number>();
    public readonly retried: OutputEmitterRef<void> = output<void>();
}
