import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtuiTableComponent } from '../../components';
import { LIST_SORT_ORDER_ENUM } from '../../util/list-sort-order.enum';
import { SortModel } from '../../util/lists.interface';
import { ITable } from '../../util/table-column.interface';
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
    providers: [],
})
export default class TestTableComponent {
    public isMobile: boolean = false;
    public data: Person[] = [];
    public columns: ITable.Column<Person>[] = [];
    public sortModel: SortModel<keyof Person> = {
        propertyName: 'id',
        sortDirection: LIST_SORT_ORDER_ENUM.ASC,
    };

    public sortChange(sortModel: SortModel<keyof Person>): SortModel<keyof Person> {
        return sortModel;
    }
}
