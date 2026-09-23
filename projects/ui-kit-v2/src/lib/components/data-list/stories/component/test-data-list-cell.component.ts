import { BooleanInput } from '@angular/cdk/coercion';
import {
    ChangeDetectionStrategy,
    Component,
    InputSignal,
    InputSignalWithTransform,
    OnInit,
    booleanAttribute,
    inject,
    input,
} from '@angular/core';

import { IFilterModel, IPageModel, ISortModel, TNullable } from '@rt-tools/utils';

import { RtDataTableConfigService } from '../../../data-table/rt-data-table-config.service';
import { IRtInput } from '../../../input/rt-input.model';
import { IRtDataTable } from '../../../data-table/rt-data-table.model';
import { ITestDataTableRow } from '../../../data-table/stories/component/test-data-table.rows';
import { RtDataListComponent } from '../../rt-data-list.component';
import { RtDataListSelectorsDirective } from '../../rt-data-list-selectors.directive';

/**
 * Одна ячейка матрицы: список со своей службой настроек.
 *
 * Служба нужна каждой ячейке своя — колонки список делит с таблицей и берёт их у неё, а одна
 * служба на весь показ дала бы всем ячейкам один состав. Ключ хранения у каждой ячейки тоже свой.
 *
 * Обвязка витрины: `tsconfig.lib.json` исключает папки историй, в пакет не уезжает.
 */
@Component({
    selector: 'app-data-list-cell',
    template: `
        <rt-data-list
            rtDataListSelectors
            keyExp="id"
            [tableConfigStorageKey]="storageKey()"
            [entities]="rows()"
            [pageModel]="page()"
            [currentSortModel]="sort()"
            [filterModel]="filters()"
            [isFiltersShown]="filtersShown()"
            [appearance]="appearance()"
            [filterAppearance]="filterAppearance()"
            [loading]="loading()"
            [fetching]="fetching()"
            [isSelectAllSelectorShown]="selectAllShown()"
            [isMultiSelect]="multiSelect()" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtDataListComponent, RtDataListSelectorsDirective],
    providers: [RtDataTableConfigService],
})
export class TestRtDataListCellComponent implements OnInit {
    readonly #configService: RtDataTableConfigService<ITestDataTableRow> = inject(RtDataTableConfigService);

    public readonly storageKey: InputSignal<string> = input.required<string>();

    public readonly columns: InputSignal<Array<IRtDataTable.Column<ITestDataTableRow>>> =
        input.required<Array<IRtDataTable.Column<ITestDataTableRow>>>();

    public readonly rows: InputSignal<ITestDataTableRow[]> = input<ITestDataTableRow[]>([]);
    public readonly page: InputSignal<IPageModel> = input.required<IPageModel>();
    public readonly sort: InputSignal<TNullable<ISortModel<'title'>>> = input<TNullable<ISortModel<'title'>>>(null);
    public readonly filters: InputSignal<Array<IFilterModel<'title' | 'city'>>> = input<Array<IFilterModel<'title' | 'city'>>>([]);
    public readonly appearance: InputSignal<IRtInput.Appearance> = input<IRtInput.Appearance>('fill');
    public readonly filterAppearance: InputSignal<IRtInput.Appearance> = input<IRtInput.Appearance>('outline');
    public readonly filtersShown: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });
    public readonly loading: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });
    public readonly fetching: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });
    public readonly selectAllShown: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(true, {
        transform: booleanAttribute,
    });
    public readonly multiSelect: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(true, {
        transform: booleanAttribute,
    });

    public ngOnInit(): void {
        this.#configService.initConfig(this.storageKey(), this.columns());
    }
}
