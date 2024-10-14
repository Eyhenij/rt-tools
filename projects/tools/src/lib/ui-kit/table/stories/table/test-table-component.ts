import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';

import { IDBStorageService } from '../../../../idb-storage';
import { RtuiTableComponent } from '../../components';
import { LIST_SORT_ORDER_ENUM } from '../../util/list-sort-order.enum';
import { SortModel } from '../../util/lists.interface';
import { ITable } from '../../util/table-column.interface';
import { RtTableConfigService } from '../../util/table-config.service';
import { COLUMNS } from '../constants';
import { Person } from '../types';

@Component({
    standalone: true,
    selector: 'app-test-table-component',
    templateUrl: './test-table-component.html',
    styleUrls: ['./test-table-component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtuiTableComponent,
    ],
    providers: [IDBStorageService, RtTableConfigService],
})
export default class TestTableComponent implements OnInit {
    readonly #tableConfigService: RtTableConfigService<Person> = inject(RtTableConfigService);

    public isMobile: boolean = false;
    public data: Person[] = [];
    public columns: ITable.Column<Person>[] = [];
    public sortModel: SortModel<keyof Person> = {
        propertyName: 'id',
        sortDirection: LIST_SORT_ORDER_ENUM.ASC,
    };
    public storageKey: string = 'tableManyItemsKey';

    public ngOnInit(): void {
        this.#tableConfigService.initConfig(this.storageKey, COLUMNS);
    }

    public sortChange(sortModel: SortModel<keyof Person>): SortModel<keyof Person> {
        return sortModel;
    }
}
