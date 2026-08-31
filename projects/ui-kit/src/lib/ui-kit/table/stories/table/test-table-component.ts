import { ChangeDetectionStrategy, Component, effect, inject, Injector, OnInit, Signal, viewChild } from '@angular/core';

import { IDBStorageService } from '@rt-tools/core';
import { TNullable } from '@rt-tools/utils';
import { EListSortOrder, ISortModel } from '@rt-tools/utils';
import { RtuiTableComponent } from '../../components';
import { RtTableSelectorsDirective } from '../../util/table-selectors.directive';
import { RtTableConfigService } from '../../util/table-config.service';
import { COLUMNS } from '../constants';
import { TPerson } from '../types';

@Component({
    selector: 'app-test-table-component',
    templateUrl: './test-table.component.html',
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
    readonly #tableConfigService: RtTableConfigService<TPerson> = inject(RtTableConfigService);
    readonly #injector: Injector = inject(Injector);

    public isMultiSelect: boolean = true;
    public isSelectorsColumnShown: boolean = true;
    public isSelectorsColumnDisabled: boolean = false;
    public data: TPerson[] = [];
    public selectedEntitiesIds: number[] = [];
    public sortModel: ISortModel<keyof TPerson> = {
        propertyName: 'id',
        sortDirection: EListSortOrder.ASC,
    };
    public storageKey: string = 'tableManyItemsKey';

    public readonly dynamicListTpl: Signal<TNullable<RtTableSelectorsDirective<TPerson, keyof TPerson, 'id'>>> =
        viewChild<RtTableSelectorsDirective<TPerson, keyof TPerson, 'id'>>(RtTableSelectorsDirective);

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

    public sortChange(sortModel: ISortModel<keyof TPerson>): ISortModel<keyof TPerson> {
        return sortModel;
    }
}
