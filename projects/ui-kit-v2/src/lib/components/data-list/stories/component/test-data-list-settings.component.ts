import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RT_ASIDE_DATA } from '../../../aside/rt-aside.tokens';
import { RtAsideRef } from '../../../aside/rt-aside-ref';
import { IRtDataTable } from '../../../data-table/rt-data-table.model';
import { ITestDataTableRow, TEST_DATA_TABLE_SHORT_COLUMNS } from '../../../data-table/stories/component/test-data-table.rows';
import { RtDataListSettingsAsideComponent } from '../../settings/rt-data-list-settings-aside.component';

/** Настройка, с которой панель открывают в витрине: одна колонка спрятана, полосы разные. */
const SAVED: IRtDataTable.Config.Data<ITestDataTableRow> = {
    isVerticalScrollbarShown: false,
    isHorizontalScrollbarShown: true,
    columns: TEST_DATA_TABLE_SHORT_COLUMNS.map((column: IRtDataTable.Column<ITestDataTableRow>, index: number) => ({
        ...column,
        orderIndex: index,
        displayName: column.header.label,
        hidden: column.propName === 'sum',
    })),
};

/**
 * Двойник ссылки на панель: настоящую даёт служба боковых панелей, а в витрине панель стоит
 * прямо в кадре — иначе её разметки не видно вовсе, она живёт в наложении поверх страницы.
 */
const ASIDE_REF_STUB: Pick<RtAsideRef<IRtDataTable.Config.Data<ITestDataTableRow>>, 'close'> = {
    close: (): void => undefined,
};

/**
 * Панель настройки колонок в кадре.
 *
 * Панель берёт настройку не входом, а впрыском — её даёт служба боковых панелей при открытии.
 * Поэтому обёртка объявляет оба токена сама: без них панель не поднимется вовсе.
 *
 * Обвязка витрины: `tsconfig.lib.json` исключает папки историй, в пакет не уезжает.
 */
@Component({
    selector: 'app-data-list-settings',
    template: `
        <rt-data-list-settings-aside />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtDataListSettingsAsideComponent],
    providers: [
        { provide: RT_ASIDE_DATA, useValue: SAVED },
        { provide: RtAsideRef, useValue: ASIDE_REF_STUB },
    ],
})
export class TestRtDataListSettingsComponent {}
