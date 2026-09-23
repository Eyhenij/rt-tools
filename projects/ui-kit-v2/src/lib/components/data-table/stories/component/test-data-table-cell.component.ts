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

import { IFilterModel, ISortModel, TNullable } from '@rt-tools/utils';

import { RtMenuItemComponent } from '../../../menu/rt-menu-item.component';
import { RtDataTableComponent } from '../../rt-data-table.component';
import { RtDataTableConfigService } from '../../rt-data-table-config.service';
import { RtDataTableRowActionsDirective } from '../../rt-data-table-cells.directive';
import { RtDataTableSelectorsDirective } from '../../rt-data-table-selectors.directive';
import { IRtDataTable } from '../../rt-data-table.model';
import { ITestDataTableRow } from './test-data-table.rows';

/**
 * Одна ячейка матрицы: таблица со своей службой настроек.
 *
 * Служба нужна каждой ячейке своя — колонки таблица берёт не входом, а у неё, и одна служба на
 * весь показ дала бы всем ячейкам один набор колонок. Ключ хранения у каждой ячейки тоже свой:
 * под общим ключом настройка, сохранённая одной, досталась бы соседним.
 *
 * Обвязка витрины: `tsconfig.lib.json` исключает папки историй, в пакет не уезжает.
 */
@Component({
    selector: 'app-data-table-cell',
    template: `
        <rt-data-table
            rtDataTableSelectors
            keyExp="id"
            [look]="look()"
            [entities]="rows()"
            [currentSortModel]="sort()"
            [filterModel]="filters()"
            [isFiltersShown]="filtersShown()"
            [isTableRowsClickable]="clickable()"
            [isSelectorColumnShown]="selectorsShown()"
            [isMultiSelect]="multiSelect()"
            [isSelectorsColumnDisabled]="selectorsDisabled()">
            @if (withRowActions()) {
                <ng-template rtDataTableRowActions>
                    <rt-menu-item label="Открыть" icon="ico-eye" />
                    <rt-menu-item label="Удалить" icon="ico-trash" />
                </ng-template>
            }
        </rt-data-table>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtDataTableComponent,
        RtMenuItemComponent,

        // directives
        RtDataTableRowActionsDirective,
        RtDataTableSelectorsDirective,
    ],
    providers: [RtDataTableConfigService],
})
export class TestRtDataTableCellComponent implements OnInit {
    readonly #configService: RtDataTableConfigService<ITestDataTableRow> = inject(RtDataTableConfigService);

    public readonly storageKey: InputSignal<string> = input.required<string>();

    public readonly columns: InputSignal<Array<IRtDataTable.Column<ITestDataTableRow>>> =
        input.required<Array<IRtDataTable.Column<ITestDataTableRow>>>();

    public readonly look: InputSignal<IRtDataTable.Look> = input<IRtDataTable.Look>('material');
    public readonly rows: InputSignal<ITestDataTableRow[]> = input<ITestDataTableRow[]>([]);
    public readonly sort: InputSignal<TNullable<ISortModel<'title'>>> = input<TNullable<ISortModel<'title'>>>(null);
    public readonly filters: InputSignal<Array<IFilterModel<'title' | 'city'>>> = input<Array<IFilterModel<'title' | 'city'>>>([]);
    public readonly filtersShown: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });
    public readonly clickable: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });
    public readonly selectorsShown: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });
    public readonly multiSelect: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(true, {
        transform: booleanAttribute,
    });
    public readonly selectorsDisabled: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });
    public readonly withRowActions: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    public ngOnInit(): void {
        this.#configService.initConfig(this.storageKey(), this.columns());
    }
}
