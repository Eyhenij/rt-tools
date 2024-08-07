import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtuiTableComponent } from '../../table.component';
import { LIST_SORT_ORDER_ENUM } from '../../util/list-sort-order.enum';
import { PageModel, SortModel } from '../../util/lists.interface';
import { ITable } from '../../util/table-column.interface';
import { Person } from '../types';

@Component({
    standalone: true,
    selector: 'app-test-table-component',
    templateUrl: './test-table-component.html',
    styleUrls: ['./test-table-component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        NgTemplateOutlet,

        // components
        RtuiTableComponent,
    ],
    providers: [],
})
export default class TestTableComponent {
    public isMobile: boolean = false;
    public loading: boolean = false;
    public fetching: boolean = false;
    public searchTerm: string = '';
    public data: Person[] = [];
    public columns: ITable.Column<Person>[] = [];
    public pageModel: PageModel = {
        pageNumber: 1,
        pageSize: 10,
        totalCount: 0,
    };
    public sortModel: SortModel<keyof Person> = {
        propertyName: 'id',
        sortDirection: LIST_SORT_ORDER_ENUM.ASC,
    };
}
