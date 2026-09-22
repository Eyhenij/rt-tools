import {
    ChangeDetectionStrategy,
    Component,
    computed,
    inject,
    input,
    InputSignal,
    output,
    OutputEmitterRef,
    Signal,
    ViewEncapsulation,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';
import { IPageModel } from '@rt-tools/utils';

import { rtKitLabel } from '../../../i18n';
import { BreakpointsService } from '../../../platform';
import { RtIconButtonComponent } from '../../icon-button/rt-icon-button.component';
import { RtSelectComponent } from '../../select/rt-select.component';
import { IRtSelect } from '../../select/rt-select.model';
import {
    DATA_LIST_PAGE_DIVIDER,
    dataListPageAfterSizeChange,
    dataListPageNumbers,
    dataListPageReachable,
    dataListPageSizes,
    dataListPaginationShown,
} from '../rt-data-list-pagination.logic';

const BEM_BLOCK: string = 'rt-data-list-pagination';

/** Пункт ряда страниц: номер, разрыв или нынешняя страница. */
interface IPageItem {
    label: string;
    page: number | null;
    active: boolean;
    divider: boolean;
    enabled: boolean;
}

/**
 * Полоса страниц списка `rt-data-list` — полоса первого кита без Material.
 *
 * Своей страницы полоса не держит: она просит приложение и рисует то, что придёт. Пока все
 * записи помещаются на самую маленькую страницу, полосы нет вовсе; на узком экране от ряда
 * номеров остаётся только нынешний.
 */
@Component({
    selector: 'rt-data-list-pagination',
    templateUrl: './rt-data-list-pagination.component.html',
    styleUrl: './rt-data-list-pagination.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // components
        RtIconButtonComponent,
        RtSelectComponent,

        // directives
        BlockDirective,
        ElemDirective,
        FormsModule,
        ModDirective,
    ],
    host: { class: BEM_BLOCK },
})
export class RtDataListPaginationComponent {
    readonly #breakpoints: BreakpointsService = inject(BreakpointsService);

    /** Экран узкий: замер кита, и другого источника у этого признака нет. */
    protected readonly narrow: Signal<boolean> = this.#breakpoints.narrow;

    protected readonly itemsPerPageLabel: Signal<string> = rtKitLabel('dataListItemsPerPage');
    protected readonly prevPageLabel: Signal<string> = rtKitLabel('dataListPrevPage');
    protected readonly nextPageLabel: Signal<string> = rtKitLabel('dataListNextPage');

    protected readonly isShown: Signal<boolean> = computed(() => dataListPaginationShown(this.currentPageModel()));

    /** Пункты ряда: что нарисовать, куда ведёт пункт и нажимается ли он вовсе. */
    protected readonly items: Signal<IPageItem[]> = computed(() => {
        const page: IPageModel = this.currentPageModel();

        return dataListPageNumbers(page).map((value: number | string) => ({
            label: String(value),
            page: typeof value === 'number' ? value : null,
            active: value === page.pageNumber,
            divider: value === DATA_LIST_PAGE_DIVIDER,
            enabled: typeof value === 'number' && value !== page.pageNumber && dataListPageReachable(page, value),
        }));
    });

    protected readonly prevEnabled: Signal<boolean> = computed(() => !!this.currentPageModel().hasPrev);
    protected readonly nextEnabled: Signal<boolean> = computed(() => !!this.currentPageModel().hasNext);

    protected readonly sizeOptions: Signal<IRtSelect.Option<number>[]> = computed(() =>
        dataListPageSizes(this.currentPageModel()).map((size: number) => ({ label: String(size), value: size }))
    );

    public readonly currentPageModel: InputSignal<IPageModel> = input.required<IPageModel>();

    public readonly pageModelChange: OutputEmitterRef<Partial<IPageModel>> = output<Partial<IPageModel>>();

    /** Страницу просят только тогда, когда на неё есть куда идти. */
    protected onPageNumber(pageNumber: number | string): void {
        if (typeof pageNumber === 'number' && dataListPageReachable(this.currentPageModel(), pageNumber)) {
            this.pageModelChange.emit({ pageNumber });
        }
    }

    protected onPageSize(pageSize: number | null): void {
        if (pageSize !== null && pageSize !== this.currentPageModel().pageSize) {
            this.pageModelChange.emit(dataListPageAfterSizeChange(this.currentPageModel(), pageSize));
        }
    }
}
