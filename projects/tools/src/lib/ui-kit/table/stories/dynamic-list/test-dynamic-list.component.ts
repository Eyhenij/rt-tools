import { Component, computed, DestroyRef, effect, inject, Injector, OnInit, Signal, viewChild } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatIconButton, MatMiniFabButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatMenuItem } from '@angular/material/menu';
import { MatTooltip } from '@angular/material/tooltip';

import { BlockDirective } from '../../../../bem';
import { IDBStorageService } from '../../../../idb-storage';
import { Nullable, RtIconOutlinedDirective } from '../../../../util';
import { RtActionBarService, RtuiActionBarContainerComponent } from '../../../action-bar';
import { RtuiToggleComponent } from '../../../toggle';
import {
    RtuiDynamicListComponent,
    RtuiDynamicListCustomTableCellsDirective,
    RtuiDynamicListRowActionsDirective,
    RtuiDynamicListRowAdditionalActionsDirective,
    RtuiDynamicListToolbarActionsDirective,
    RtuiDynamicListToolbarSelectorsDirective,
} from '../../dynamic-list.component';
import { FILTER_OPERATOR_TYPE_ENUM, FilterModel, RtDynamicListSelectorsDirective } from '../../util';
import { LIST_SORT_ORDER_ENUM } from '../../util/list-sort-order.enum';
import { PageModel, SortModel } from '../../util/lists.interface';
import { RtTableConfigService } from '../../util/table-config.service';
import { COLUMNS } from '../constants';
import { createPersonList } from '../mocks';
import { Person } from '../types';

@Component({
    selector: 'app-test-dynamic-list-component',
    templateUrl: './test-dynamic-list.component.html',
    styleUrls: ['./test-dynamic-list.component.scss'],
    imports: [
        FormsModule,

        // material
        MatIcon,
        MatMiniFabButton,
        MatTooltip,
        MatMenuItem,
        MatIconButton,

        // components
        RtuiDynamicListComponent,
        RtuiToggleComponent,
        RtuiActionBarContainerComponent,

        // directives
        RtIconOutlinedDirective,
        BlockDirective,
        RtuiDynamicListToolbarActionsDirective,
        RtuiDynamicListRowActionsDirective,
        RtuiDynamicListToolbarSelectorsDirective,
        RtuiDynamicListRowAdditionalActionsDirective,
        RtuiDynamicListCustomTableCellsDirective,
        RtDynamicListSelectorsDirective,
    ],
    providers: [IDBStorageService, RtTableConfigService, RtActionBarService],
})
export default class TestDynamicListComponent implements OnInit {
    readonly #destroyRef: DestroyRef = inject(DestroyRef);
    readonly #injector: Injector = inject(Injector);
    readonly #tableConfigService: RtTableConfigService<Person> = inject(RtTableConfigService);
    readonly #actionBarService: RtActionBarService = inject(RtActionBarService);

    public isMultiSelect: boolean = true;
    public isSelectorsShown: boolean = true;
    public isSelectAllSelectorShown: boolean = true;
    public isSelectorsColumnDisabled: boolean = false;

    public isMobile: boolean = false;
    public loading: boolean = false;
    public fetching: boolean = false;
    public isRefreshButtonShown: boolean = true;
    public isAllEntitiesSelected: boolean = false;
    public isTableRowsClickable: boolean = false;
    public isFiltersShown: boolean = false;
    public searchTerm: string = '';
    public data: Person[] = [];
    public selectedEntitiesIds: number[] = [];
    public pageModel: PageModel = {
        pageNumber: 1,
        pageSize: 10,
        totalCount: 10,
    };
    public currentSortModel: SortModel<string> = {
        propertyName: 'id',
        sortDirection: LIST_SORT_ORDER_ENUM.ASC,
    };
    public filterModel: FilterModel[] = [
        {
            propertyName: 'name',
            operatorType: FILTER_OPERATOR_TYPE_ENUM.CONTAINS,
            value: '111',
        },
    ];
    public storageKey: string = 'dynamicListManyItemsKey';

    public readonly dynamicListTpl: Signal<Nullable<RtDynamicListSelectorsDirective<Person, keyof Person, 'id'>>> =
        viewChild<RtDynamicListSelectorsDirective<Person, keyof Person, 'id'>>(RtDynamicListSelectorsDirective);
    public readonly selectedEntities: Signal<Person[]> = computed(() => {
        return this.dynamicListTpl()?.selectedEntities() ?? [];
    });

    public ngOnInit(): void {
        this.#tableConfigService.initConfig(this.storageKey, COLUMNS);

        this.#actionBarService.setActions([
            {
                title: 'Select All',
                // eslint-disable-next-line no-console
                action: (): void => console.warn('Select All'),
                styles: {
                    margin: '0 2rem 0 0',
                    textDecoration: 'underline',
                },
            },
            // eslint-disable-next-line no-console
            { icon: 'content_copy', title: 'Copy', action: (): void => console.warn('Copy') },
            // eslint-disable-next-line no-console
            { icon: 'download', title: 'Export', action: (): void => console.warn('Export') },
            {
                icon: 'more_horiz',
                title: 'More',
                menu: [
                    // eslint-disable-next-line no-console
                    { icon: 'home', title: 'Action 1', action: (): void => console.warn('Action 1') },
                    // eslint-disable-next-line no-console
                    { icon: 'restart_alt', title: 'Action 2', action: (): void => console.warn('Action 2') },
                    // eslint-disable-next-line no-console
                    { icon: 'done_outline', title: 'Action 3', action: (): void => console.warn('Action 3') },
                ],
            },
            // eslint-disable-next-line no-console
            { icon: 'delete', title: 'Delete', action: (): void => console.warn('Delete') },
        ]);

        toObservable(this.selectedEntities, { injector: this.#injector })
            .pipe(takeUntilDestroyed(this.#destroyRef))
            .subscribe(() => {
                if (this.selectedEntities().length) {
                    this.#actionBarService.setCounts(this.selectedEntities().length, this.pageModel.totalCount);
                } else if (this.#actionBarService.config()?.selected) {
                    this.#actionBarService.closeActionBar();
                }
            });

        effect(
            () => {
                if (this.dynamicListTpl()?.selectedEntities()?.length) {
                    // eslint-disable-next-line no-console
                    console.warn('selectedEntities:', this.dynamicListTpl()?.selectedEntities());
                }
            },
            { injector: this.#injector }
        );

        effect(
            () => {
                if (this.dynamicListTpl()?.excludedEntities()) {
                    // eslint-disable-next-line no-console
                    console.warn('excludedEntities:', this.dynamicListTpl()?.excludedEntities());
                }
            },
            { injector: this.#injector }
        );
    }

    public onRefresh(): void {
        this.data = createPersonList(20);
    }

    public onSortChange(sortModel: SortModel<string>): void {
        this.currentSortModel = sortModel;
        // eslint-disable-next-line no-console
        console.warn('Sort Model', sortModel);
    }

    public onPageModelChange(pageModel: Partial<PageModel>): void {
        this.pageModel = { ...this.pageModel, ...pageModel };
    }

    public onFilterChange(filterModel: FilterModel[]): void {
        this.filterModel = filterModel;
        // eslint-disable-next-line no-console
        console.warn('Filters', this.filterModel);
    }

    public onRowClick(data: { row: Person; event: MouseEvent }): void {
        // eslint-disable-next-line no-console
        console.warn('Row Click', data);
    }

    public onRowDoubleClick(row: Person): void {
        // eslint-disable-next-line no-console
        console.warn('Row Double Click', row);
    }

    public onEdit(row: Person): void {
        // eslint-disable-next-line no-console
        console.warn('Edit', row);
    }

    public onDelete(row: Person): void {
        // eslint-disable-next-line no-console
        console.warn('Delete', row);
    }

    public onInfo(row: Person): void {
        // eslint-disable-next-line no-console
        console.warn('Info', row);
    }

    public onOpenNewTab(row: Person): void {
        // eslint-disable-next-line no-console
        console.warn('Open new tab', row);
    }
}
