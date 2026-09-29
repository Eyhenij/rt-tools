import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { IPageModel } from '@rt-tools/utils';

import { RtDynamicListComponent } from '../../rt-dynamic-list.component';

/** Три страницы: под списком стоит ряд номеров. */
const PAGE: IPageModel = { pageNumber: 1, pageSize: 20, totalCount: 55 };

/**
 * Страница входов `rt-dynamic-list`: значения переключает витрина, а записи сюда проецируются
 * обёрткой — подать их входом семья не даёт и не должна.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-dynamic-list',
    template: `
        <div class="app-dynamic-list__box">
            <rt-dynamic-list
                [pageModel]="page"
                [loading]="loading"
                [fetching]="fetching"
                [empty]="empty"
                [filtered]="filtered"
                [showSearch]="showSearch"
                [showRefresh]="showRefresh"
                [showClearFilters]="showClearFilters"
                [showColumnSettings]="showColumnSettings"
                [selectable]="selectable"
                [selectedCount]="selectedCount">
                <ng-container [ngTemplateOutlet]="rowsTpl" />
            </rt-dynamic-list>
        </div>

        <ng-template #rowsTpl>
            <div class="app-dynamic-list__rows">
                @for (row of rows; track row) {
                    <div class="app-dynamic-list__row">{{ row }}</div>
                }
            </div>
        </ng-template>
    `,
    styles: `
        .app-dynamic-list__box {
            height: 18rem;
            max-width: 100%;
            min-width: 0;
            border: 1px solid var(--rt-color-border-subtle);
            border-radius: var(--rt-radius-sm);
            padding: var(--rt-space-2);
            background: var(--rt-color-bg-surface);
        }

        .app-dynamic-list__rows {
            display: flex;
            flex-direction: column;
        }

        .app-dynamic-list__row {
            border-bottom: 1px solid var(--rt-color-border-subtle);
            padding: var(--rt-space-2) 0;
            color: var(--rt-color-text-primary);
            font-size: var(--rt-text-xs);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgTemplateOutlet, RtDynamicListComponent],
})
export class TestRtDynamicListComponent {
    public loading: boolean = false;
    public fetching: boolean = false;
    public empty: boolean = false;
    public filtered: boolean = false;
    public showSearch: boolean = true;
    public showRefresh: boolean = true;
    public showClearFilters: boolean = true;
    public showColumnSettings: boolean = true;
    public selectable: boolean = true;
    public selectedCount: number = 0;

    public readonly page: IPageModel = PAGE;

    public readonly rows: readonly string[] = [
        'Замена фильтра, цех 2',
        'Поверка манометра, узел 7',
        'Обход трассы, участок 14',
        'Приёмка смены, бригада 3',
    ];
}
