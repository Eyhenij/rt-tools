import { ChangeDetectionStrategy, Component, effect, inject, Injector, OnInit, Signal, viewChild } from '@angular/core';

import { IDBStorageService } from '@rt-tools/core';
import { LIST_SORT_ORDER_ENUM, Nullable, SortModel } from '@rt-tools/utils';
import { RtuiTableComponent } from '../../components';
import { RtTableSelectorsDirective } from '../../util/table-selectors.directive';
import { RtTableConfigService } from '../../util/table-config.service';
import { COLUMNS } from '../constants';
import { Person } from '../types';

@Component({
    selector: 'app-test-table-component',
    templateUrl: './test-table-component.html',
    styleUrls: ['./test-table-component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtuiTableComponent,
        RtTableSelectorsDirective,
    ],
    providers: [IDBStorageService, RtTableConfigService],
})
export default class TestTableComponent implements OnInit {
    readonly #tableConfigService: RtTableConfigService<Person> = inject(RtTableConfigService);
    readonly #injector: Injector = inject(Injector);

    public isMultiSelect: boolean = true;
    public isSelectorsColumnShown: boolean = true;
    public isSelectorsColumnDisabled: boolean = false;
    public isMobile: boolean = false;
    public data: Person[] = [];
    public selectedEntitiesIds: number[] = [];
    public sortModel: SortModel<keyof Person> = {
        propertyName: 'id',
        sortDirection: LIST_SORT_ORDER_ENUM.ASC,
    };
    public storageKey: string = 'tableManyItemsKey';

    public readonly dynamicListTpl: Signal<Nullable<RtTableSelectorsDirective<Person, keyof Person, 'id'>>> =
        viewChild<RtTableSelectorsDirective<Person, keyof Person, 'id'>>(RtTableSelectorsDirective);

    public ngOnInit(): void {
        this.#tableConfigService.initConfig(this.storageKey, COLUMNS);

        effect(
            () => {
                if (this.dynamicListTpl()?.selectedEntities()) {
                    // eslint-disable-next-line no-console
                    console.warn('selectedEntities:', this.dynamicListTpl()?.selectedEntities());
                }
            },
            { injector: this.#injector }
        );
    }

    public sortChange(sortModel: SortModel<keyof Person>): SortModel<keyof Person> {
        return sortModel;
    }
}
