import { BooleanInput } from '@angular/cdk/coercion';
import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    inject,
    input,
    InputSignal,
    InputSignalWithTransform,
    OnInit,
} from '@angular/core';

import { IPageModel } from '@rt-tools/utils';

import { RtDataTableConfigService } from '../../../data-table/rt-data-table-config.service';
import {
    ITestDataTableRow,
    TEST_DATA_TABLE_ROWS,
    TEST_DATA_TABLE_SHORT_COLUMNS,
} from '../../../data-table/stories/component/test-data-table.rows';
import { RtDataListEmptyDirective, RtDataListErrorDirective } from '../../rt-data-list-states.directive';
import { RtDataListComponent } from '../../rt-data-list.component';
import { RtDataListSelectorsDirective } from '../../rt-data-list-selectors.directive';

/** Одна страница: на кадре полосы страниц нет, и под таким списком её не рисуют. */
const PAGE: IPageModel = { pageNumber: 1, pageSize: 10, totalCount: 3, hasPrev: false, hasNext: false };

/**
 * Одна ячейка показа ошибки и своих шаблонов: список со своей службой настроек и своим ключом.
 * Свои шаблоны проецируются в сам список, поэтому ячейка объявляет их у себя по входам.
 *
 * Обвязка витрины: `tsconfig.lib.json` исключает папки историй, в пакет не уезжает.
 */
@Component({
    selector: 'app-data-list-states-cell',
    templateUrl: './test-data-list-states-cell.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtDataListComponent, RtDataListSelectorsDirective, RtDataListEmptyDirective, RtDataListErrorDirective],
    providers: [RtDataTableConfigService],
})
export class TestRtDataListStatesCellComponent implements OnInit {
    readonly #configService: RtDataTableConfigService<ITestDataTableRow> = inject(RtDataTableConfigService);

    protected readonly page: IPageModel = PAGE;

    /** Рамка своего шаблона: пунктир показывает, где кончается разметка приложения. */
    protected readonly slotStyle: string =
        'display: grid; gap: var(--rt-space-2); inline-size: fit-content; margin: var(--rt-space-6) auto; padding: var(--rt-space-4); border: 1px dashed var(--rt-color-border-strong); border-radius: var(--rt-radius-md); text-align: center';

    protected readonly slotHintStyle: string = 'color: var(--rt-color-text-muted); font-size: var(--rt-text-sm)';

    protected readonly rows: ITestDataTableRow[] = TEST_DATA_TABLE_ROWS;

    public readonly storageKey: InputSignal<string> = input.required<string>();
    public readonly empty: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });
    public readonly error: InputSignal<string | null> = input<string | null>(null);
    public readonly ownEmpty: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });
    public readonly ownError: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    public ngOnInit(): void {
        this.#configService.initConfig(this.storageKey(), TEST_DATA_TABLE_SHORT_COLUMNS);
    }
}
