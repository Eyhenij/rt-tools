import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatMiniFabButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';

import { BlockDirective, ElemDirective } from '../../../../bem';
import { RtIconOutlinedDirective } from '../../../../util';
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
        // material
        MatIcon,
        MatMiniFabButton,
        MatTooltip,

        // components
        RtuiTableComponent,

        // directives
        RtIconOutlinedDirective,
        BlockDirective,
        ElemDirective,
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

    public sortChange(sortModel: SortModel<keyof Person>): SortModel<keyof Person> {
        return sortModel;
    }
}
