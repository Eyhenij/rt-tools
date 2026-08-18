import { NgTemplateOutlet } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    computed,
    contentChild,
    Directive,
    inject,
    input,
    InputSignal,
    Signal,
    TemplateRef,
} from '@angular/core';
import {
    ADMIN_LIST_HOST,
    adminLabel,
    EReadFault,
    IAdminListHost,
    IReadFault,
    LIST_PAGE_SIZES,
} from '@rt/message-bus-admin/common/core/util';
import { BlockDirective, ElemDirective } from '@rt-tools/core';
import {
    RtButtonDirective,
    RtIconButtonComponent,
    RtMessageComponent,
    RtPaginationComponent,
    RtToolbarComponent,
    RtToolbarLeftDirective,
    RtToolbarRightDirective,
} from '@rt-tools/ui-kit-v2';

const BEM_BLOCK: string = 'admin-page';

/**
 * Слот левой части тулбара: там стоит отбор раздела.
 *
 * Отбор кладёт сюда сам раздел. Зашитый в страницу, он был одинаков у всех разделов по
 * принуждению: разделу, которому нужен другой, положить его было некуда.
 *
 * @example
 * ```html
 * <admin-list-page qaPrefix="proposals" [title]="title">
 *     <ng-template adminListToolbarLeft>
 *         <admin-tree-filter [choices]="choices()" [tree]="query().tree" (treeChange)="changeTree($event)" />
 *     </ng-template>
 * </admin-list-page>
 * ```
 */
@Directive({
    selector: '[adminListToolbarLeft]',
})
export class AdminListToolbarLeftDirective {}

/**
 * Слот правой части тулбара: там стоят кнопки раздела.
 *
 * Обновление списка и настройка столбцов сюда не кладутся — их рисует сама страница, и стоят
 * они правее: человек ищет их на одном и том же месте у края тулбара на всех трёх разделах.
 */
@Directive({
    selector: '[adminListToolbarRight]',
})
export class AdminListToolbarRightDirective {}

/**
 * Слот над таблицей: там стоит то, что относится ко всему списку сразу.
 *
 * Сказанное о всём списке, поставленное строкой в сам список, читается как одна из записей.
 * Незанятый слот места не занимает вовсе — пустая полоса над таблицей читается поломкой
 * разметки.
 */
@Directive({
    selector: '[adminListAboveTable]',
})
export class AdminListAboveTableDirective {}

/**
 * Общий вид страницы списка: заголовок с подсказкой, тулбар со слотами, место под таблицу и
 * переключатель страниц.
 *
 * Таблицу страница не оборачивает, а принимает проекцией: столбцы таблица кита собирает
 * собственным запросом по содержимому, и через посредника они до неё не доходят. Раздел поэтому
 * объявляет таблицу у себя и кладёт сюда — а всё, что вокруг неё, одинаково у всех трёх
 * разделов и живёт здесь.
 *
 * Чтение, страницу, её размер и настройку столбцов страница спрашивает у хоста, а не отдаёт
 * наружу событиями: событие на каждое действие росло числом с каждым новым действием, а забытое
 * подключение было видно только на собранном экране.
 *
 * Отказ чтения занимает место списка, а не встаёт строкой над ним: показанные под отказом строки
 * — это прежнее чтение, и отличить их от приехавших только что нечем. Повтор стоит тут же,
 * рядом с причиной: правило дерева подаёт отказ списка тостом, но тост уходит, а повторить
 * человеку нужно тогда, когда он вернулся к экрану.
 */
@Component({
    selector: 'admin-list-page',
    templateUrl: './admin-list-page.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // angular
        NgTemplateOutlet,

        // rt-tools
        BlockDirective,
        ElemDirective,

        // components
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
    protected readonly columnsLabel: string = adminLabel('listColumns');

    /**
     * Размеры страницы, которые предлагает переключатель.
     *
     * Тот же набор, что признаёт разбор адреса: переключатель прячет себя, когда записей меньше
     * самого малого из предложенных, и разошедшиеся наборы дали бы вторую страницу без
     * переключателя.
     */
    protected readonly pageSizes: readonly number[] = LIST_PAGE_SIZES;

    /** Раздел, который эту страницу показывает: у него она спрашивает всё, чего не умеет сама. */
    protected readonly host: IAdminListHost = inject(ADMIN_LIST_HOST);

    /**
     * Что раздел положил в слоты. Незанятый слот на экране не появляется вовсе: пустая половина
     * тулбара и пустая полоса над таблицей читаются поломкой разметки, а не свободным местом.
     */
    protected readonly leftTpl: Signal<TemplateRef<unknown> | undefined> = contentChild(AdminListToolbarLeftDirective, {
        read: TemplateRef,
    });
    protected readonly rightTpl: Signal<TemplateRef<unknown> | undefined> = contentChild(AdminListToolbarRightDirective, {
        read: TemplateRef,
    });
    protected readonly aboveTpl: Signal<TemplateRef<unknown> | undefined> = contentChild(AdminListAboveTableDirective, {
        read: TemplateRef,
    });

    /**
     * Якоря проверки, собранные из префикса раздела.
     *
     * Одинаковые якоря на трёх разделах не отвечают на вопрос, чей элемент нашла проверка: спека,
     * открывшая не тот раздел, находит тот же якорь и проходит зелёной.
     */
    protected readonly hintId: Signal<string> = computed(() => `${this.qaPrefix()}-hint`);
    protected readonly columnsId: Signal<string> = computed(() => `${this.qaPrefix()}-columns`);
    protected readonly refreshId: Signal<string> = computed(() => `${this.qaPrefix()}-refresh`);
    protected readonly faultId: Signal<string> = computed(() => `${this.qaPrefix()}-fault`);
    protected readonly retryId: Signal<string> = computed(() => `${this.qaPrefix()}-retry`);

    /** Что сказать про отказ. Род `Session` — не поломка чтения, и текст у него свой. */
    protected readonly faultText: Signal<string> = computed(() => {
        const fault: IReadFault | null = this.host.fault();

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
        const fault: IReadFault | null = this.host.fault();

        return fault === null || fault.incident === '' ? '' : adminLabel('listIncident', { incident: fault.incident });
    });

    public readonly title: InputSignal<string> = input.required<string>();

    /** Пояснение при названии раздела. Пусто — заголовок стоит один, и места под подсказку нет. */
    public readonly hint: InputSignal<string> = input<string>('');

    /**
     * Короткое имя раздела, из которого собраны якоря его страницы. То же слово, что у его
     * таблицы: второе имя означало бы, что по якорю не найти ни таблицу от страницы, ни
     * страницу от таблицы.
     */
    public readonly qaPrefix: InputSignal<string> = input.required<string>();
}
