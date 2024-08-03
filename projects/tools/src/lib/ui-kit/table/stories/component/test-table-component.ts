import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTab, MatTabGroup } from '@angular/material/tabs';

import { BlockDirective, ElemDirective } from '../../../../bem';
import { RtuiTableComponent } from '../../table.component';
import { LIST_SORT_ORDER_ENUM } from '../../util/list-sort-order.enum';
import { PageModel, SortModel } from '../../util/lists.interface';
import { ITable } from '../../util/table-column.interface';
import { COLUMNS } from '../constants';
import { createPersonList } from '../mocks';
import { Person } from '../types';

@Component({
    standalone: true,
    templateUrl: './test-table-component.html',
    styleUrls: ['./test-table-component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        NgTemplateOutlet,
        MatButton,
        MatIcon,
        MatIconButton,
        MatTabGroup,
        MatTab,

        // directives
        BlockDirective,
        ElemDirective,

        // components
        RtuiTableComponent,
    ],
    providers: [],
})
export default class TestTableComponent {
    protected readonly data: Person[] = createPersonList(20);
    protected readonly columns: ITable.Column<Person>[] = COLUMNS;
    protected readonly pageModel: PageModel = {
        pageNumber: 1,
        pageSize: 10,
        totalCount: this.data.length,
    };
    protected readonly sortModel: SortModel<keyof Person> = {
        propertyName: 'id',
        sortDirection: LIST_SORT_ORDER_ENUM.ASC,
    };

    public isMobile: boolean = false;
}
