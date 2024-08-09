import { Component } from '@angular/core';
import { MatMiniFabButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatMenuItem } from '@angular/material/menu';
import { MatTooltip } from '@angular/material/tooltip';

import { BlockDirective, ElemDirective } from '../../../../bem';
import { RtIconOutlinedDirective } from '../../../../util';
import {
    RtuiDynamicListComponent,
    RtuiDynamicListRowActionsDirective,
    RtuiDynamicListToolbarActionsDirective,
} from '../../dynamic-list.component';
import { LIST_SORT_ORDER_ENUM } from '../../util/list-sort-order.enum';
import { PageModel, SortModel } from '../../util/lists.interface';
import { ITable } from '../../util/table-column.interface';
import { Person } from '../types';

@Component({
    standalone: true,
    selector: 'app-test-dynamic-list-component',
    templateUrl: './test-dynamic-list.component.html',
    styleUrls: ['./test-dynamic-list.component.scss'],
    imports: [
        // material
        MatIcon,
        MatMiniFabButton,
        MatTooltip,
        MatMenuItem,

        // components
        RtuiDynamicListComponent,

        // directives
        RtIconOutlinedDirective,
        BlockDirective,
        ElemDirective,
        RtuiDynamicListToolbarActionsDirective,
        RtuiDynamicListRowActionsDirective,
    ],
    providers: [],
})
export default class TestDynamicListComponent {
    public isMobile: boolean = false;
    public loading: boolean = false;
    public fetching: boolean = false;
    public isSelectorShown: boolean = true;
    public isAllEntitiesSelected: boolean = false;
    public searchTerm: string = '';
    public data: Person[] = [];
    public columns: ITable.Column<Person>[] = [];
    public selectedEntitiesKeys: number[] = [];
    public pageModel: PageModel = {
        pageNumber: 1,
        pageSize: 10,
        totalCount: 0,
    };
    public currentSortModel: SortModel<NonNullable<keyof Person>> = {
        propertyName: 'id',
        sortDirection: LIST_SORT_ORDER_ENUM.ASC,
    };

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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public onEdit(event: any): void {
        // eslint-disable-next-line no-console
        console.warn('Edit', event);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public onDelete(event: any): void {
        // eslint-disable-next-line no-console
        console.warn('Delete', event);
    }

    public onToggleEntity(value: { key: number; checked: boolean }): void {
        const updatedList: number[] = [];
        this.selectedEntitiesKeys.forEach((el: number) => updatedList.push(el));
        this.selectedEntitiesKeys = [];

        if (value.checked) {
            updatedList.push(value.key);
        } else {
            const index: number = updatedList.indexOf(value.key);
            updatedList.splice(index, 1);
        }

        this.selectedEntitiesKeys = updatedList;
    }

    public onToggleExistingEntities(checked: boolean): void {
        this.selectedEntitiesKeys = [];

        if (checked) {
            this.data.forEach((el: Person) => {
                this.selectedEntitiesKeys.push(el.id);
            });
        } else {
            this.isAllEntitiesSelected = false;
        }
    }

    public onToggleAllEntities(checked: boolean): void {
        this.isAllEntitiesSelected = checked;
        this.onToggleExistingEntities(checked);
    }
}
