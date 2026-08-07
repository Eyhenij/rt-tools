import {
    booleanAttribute,
    computed,
    inject,
    input,
    output,
    ChangeDetectionStrategy,
    Component,
    InputSignal,
    InputSignalWithTransform,
    OutputEmitterRef,
    Signal,
    ViewEncapsulation,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';
import { IPageModel } from '@rt-tools/utils';

import { RT_KIT_LABELS, RtKitLabelMap, RtKitLabelParams, rtKitLabel } from '../../i18n';
import { RtIconButtonComponent } from '../icon-button/rt-icon-button.component';
import { RtSelectComponent } from '../select/rt-select.component';
import { IRtSelect } from '../select/rt-select.model';
import { lastPageOf, pageItemsOf, rangeFromOf, rangeToOf } from './rt-pagination.logic';
import { IRtPagination } from './rt-pagination.model';

const BEM_BLOCK: string = 'rt-pagination';
const NEIGHBOURS: number = 1; // соседей вокруг открытой страницы

@Component({
    selector: 'rt-pagination',
    templateUrl: './rt-pagination.component.html',
    styleUrl: './rt-pagination.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // Angular
        FormsModule,

        // standalone components / directives
        RtIconButtonComponent,
        RtSelectComponent,
        BlockDirective,
        ElemDirective,
        ModDirective,
    ],
    host: {
        class: BEM_BLOCK,
        '[style.display]': "isVisible() ? null : 'none'",
    },
})
export class RtPaginationComponent {
    protected readonly t: Signal<RtKitLabelMap> = inject(RT_KIT_LABELS);

    protected readonly perPageSelectOptions: Signal<ReadonlyArray<IRtSelect.Option<number>>> = computed(
        (): ReadonlyArray<IRtSelect.Option<number>> =>
            this.perPageOptions().map((n: number): IRtSelect.Option<number> => ({ label: String(n), value: n }))
    );

    /**
     * Диапазон записей и номер страницы — с подстановками, поэтому карте подписей
     * они не годятся: числа приходят из модели страницы.
     */
    protected readonly rangeLabel: Signal<string> = rtKitLabel(
        'uiRangeOf',
        computed((): RtKitLabelParams => ({ from: this.rangeFrom(), to: this.rangeTo(), total: this.pageModel().totalCount }))
    );

    protected readonly pageLabel: Signal<string> = rtKitLabel(
        'uiPageOf',
        computed((): RtKitLabelParams => ({ page: this.pageModel().pageNumber, last: this.lastPage() }))
    );

    protected readonly isFirst: Signal<boolean> = computed((): boolean => this.pageModel().pageNumber <= 1);

    protected readonly isLast: Signal<boolean> = computed((): boolean => this.pageModel().pageNumber >= this.lastPage());

    public readonly pageModel: InputSignal<IPageModel> = input.required<IPageModel>();

    public readonly perPageOptions: InputSignal<ReadonlyArray<number>> = input<ReadonlyArray<number>>([20, 50, 100]);

    public readonly loading: InputSignalWithTransform<boolean, unknown> = input(false, {
        transform: booleanAttribute,
    });

    public readonly pageChange: OutputEmitterRef<number> = output<number>();

    public readonly perPageChange: OutputEmitterRef<number> = output<number>();

    /**
     * Пагинацию показываем, только когда есть что листать/менять: всё не влезает
     * на одну страницу даже при минимальной опции размера (`total > наименьший
     * perPageOption`). Иначе и навигация, и селектор размера бесполезны — прячем
     * весь бар (включая пустой и пустой-по-фильтру список).
     */
    public readonly isVisible: Signal<boolean> = computed((): boolean => {
        const options: ReadonlyArray<number> = this.perPageOptions();
        const smallest: number = options.length > 0 ? Math.min(...options) : 0;
        return this.pageModel().totalCount > smallest;
    });

    /** Сколько всего страниц при нынешнем размере страницы. */
    public readonly lastPage: Signal<number> = computed((): number => lastPageOf(this.pageModel()));

    /**
     * Границы диапазона записей открытой страницы. Собираются числами, а сама
     * подпись — в шаблоне: только там подстановка проходит через словарь и
     * переживает смену языка.
     */
    public readonly rangeFrom: Signal<number> = computed((): number => rangeFromOf(this.pageModel()));

    public readonly rangeTo: Signal<number> = computed((): number => rangeToOf(this.pageModel()));

    /** Полоса номеров страниц с разрывами «…». Пуста при единственной странице. */
    public readonly pageItems: Signal<ReadonlyArray<IRtPagination.PageItem>> = computed((): ReadonlyArray<IRtPagination.PageItem> =>
        pageItemsOf(this.pageModel(), NEIGHBOURS)
    );

    public goTo(pageNumber: number): void {
        if (this.loading() || pageNumber === this.pageModel().pageNumber || pageNumber < 1 || pageNumber > this.lastPage()) {
            return;
        }
        this.pageChange.emit(pageNumber);
    }

    protected onPerPage(value: number | null): void {
        if (value === null || this.loading() || value === this.pageModel().pageSize) {
            return;
        }
        this.perPageChange.emit(value);
    }
}
