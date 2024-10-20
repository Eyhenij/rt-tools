import { Component, Injector, OnInit, effect, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconButton, MatMiniFabButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatMenuItem } from '@angular/material/menu';
import { MatTooltip } from '@angular/material/tooltip';

import { BlockDirective, ElemDirective } from '../../../../bem';
import { IDBStorageService } from '../../../../idb-storage';
import { RtIconOutlinedDirective } from '../../../../util';
import { RtuiToggleComponent } from '../../../toggle';
import { RtuiCustomTableCellsDirective } from '../../components';
import {
    RtuiDynamicListComponent,
    RtuiDynamicListCustomTableCellsDirective,
    RtuiDynamicListRowActionsDirective,
    RtuiDynamicListRowAdditionalActionsDirective,
    RtuiDynamicListToolbarActionsDirective,
    RtuiDynamicListToolbarSelectorsDirective,
} from '../../dynamic-list.component';
import { RtTableStoreService } from '../../util';
import { LIST_SORT_ORDER_ENUM } from '../../util/list-sort-order.enum';
import { PageModel, SortModel } from '../../util/lists.interface';
import { RtTableConfigService } from '../../util/table-config.service';
import { COLUMNS } from '../constants';
import { createPersonList } from '../mocks';
import { Person } from '../types';

@Component({
    standalone: true,
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

        // directives
        RtIconOutlinedDirective,
        BlockDirective,
        ElemDirective,
        RtuiDynamicListToolbarActionsDirective,
        RtuiDynamicListRowActionsDirective,
        RtuiDynamicListToolbarSelectorsDirective,
        RtuiDynamicListRowAdditionalActionsDirective,
        RtuiDynamicListCustomTableCellsDirective,
        RtuiCustomTableCellsDirective,
    ],
    providers: [IDBStorageService, RtTableConfigService, RtTableStoreService],
})
export default class TestDynamicListComponent implements OnInit {
    readonly #injector: Injector = inject(Injector);
    readonly #tableConfigService: RtTableConfigService<Person> = inject(RtTableConfigService);
    readonly #tableStoreService: RtTableStoreService<Person, 'id'> = inject(RtTableStoreService);

    public isMobile: boolean = false;
    public loading: boolean = false;
    public fetching: boolean = false;
    public isRefreshButtonShown: boolean = true;
    public isSelectorsShown: boolean = true;
    public isSelectAllSelectorShown: boolean = true;
    public isSelectorsColumnDisabled: boolean = false;
    public isMultiSelect: boolean = true;
    public isTableRowsClickable: boolean = false;
    public searchTerm: string = '';
    public data: Person[] = [];
    public pageModel: PageModel = {
        pageNumber: 1,
        pageSize: 10,
        totalCount: 0,
    };
    public currentSortModel: SortModel<NonNullable<keyof Person>> = {
        propertyName: 'id',
        sortDirection: LIST_SORT_ORDER_ENUM.ASC,
    };
    public storageKey: string = 'dynamicListManyItemsKey';

    public ngOnInit(): void {
        this.#tableConfigService.initConfig(this.storageKey, COLUMNS);

        effect(
            () => {
                if (this.#tableStoreService.selectedEntities()) {
                    // eslint-disable-next-line no-console
                    console.warn(this.#tableStoreService.selectedEntities());
                }
            },
            { injector: this.#injector, allowSignalWrites: true }
        );
    }

    public onRefresh(): void {
        this.data = createPersonList(20);
    }

    public onSortChange(sortModel: SortModel<NonNullable<keyof Person>>): void {
        this.currentSortModel = sortModel;
        // eslint-disable-next-line no-console
        console.warn('Sort Model', sortModel);
    }

    public onPageModelChange(pageModel: Partial<PageModel>): void {
        this.pageModel = { ...this.pageModel, ...pageModel };
    }

    public onRowClick(row: Person): void {
        // eslint-disable-next-line no-console
        console.warn('Row Click', row);
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
