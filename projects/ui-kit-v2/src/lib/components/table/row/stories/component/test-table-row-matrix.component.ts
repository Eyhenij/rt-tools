import {
    CdkCell,
    CdkCellDef,
    CdkColumnDef,
    CdkHeaderCell,
    CdkHeaderCellDef,
    CdkHeaderRow,
    CdkHeaderRowDef,
    CdkRow,
    CdkRowDef,
} from '@angular/cdk/table';
import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryPresetsComponent } from '../../../../../../showcase/story-presets.component';
import {
    STORY_STATE_ACTIVE,
    STORY_STATE_DEFAULT,
    STORY_STATE_FOCUS_VISIBLE,
    STORY_STATE_HOVER,
} from '../../../../../../showcase/story-states';
import { StoryThemesComponent } from '../../../../../../showcase/story-themes.component';
import { RtTableRowDirective } from '../../../rt-table-row.directive';
import { IRtTable } from '../../../rt-table.model';
import { RtTableComponent } from '../../../rt-table.component';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TTableRowMatrixPart = 'states' | 'presets' | 'themes';

/** Строка показа: подпись состояния читает человек, признак — аддон. */
interface ITableRowCase {
    readonly title: string;
    readonly label: string;
    readonly state: string | null;
}

/**
 * Матрицы `[rtTableRow]` для витрины.
 *
 * Директива не рисует ничего сама: она даёт строке фокусируемость и активацию щелчком и
 * клавишей. Видимого у неё ровно два следа — курсор и кольцо фокуса, и оба приходят от правил
 * `[clickable]` таблицы. Поэтому строки показаны все сразу, каждая в своём состоянии: обычная,
 * под наведением, под нажатием и под фокусом с клавиши. Мышью в статичной сетке ни одно из них
 * не поймать, их рисует аддон по признаку на строке.
 *
 * Без директивы у строки нет `tabindex`, кольцу фокуса не на чем появиться, и кадр вышел бы
 * неотличимым от таблицы, у которой строки не нажимаются вовсе.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-table-row-matrix',
    // native-ok: обёртка истории витрины — показ живёт рядом с историей, а не отдельным файлом разметки
    template: `
        @switch (part) {
            @case ('states') {
                <div class="app-table-row-matrix__single" data-story-root>
                    <h3 class="app-table-row-matrix__caption">Состояния нажимаемой строки</h3>
                    <ng-container *ngTemplateOutlet="tableTemplate" />
                </div>
            }

            @case ('presets') {
                <app-story-presets caption="Нажимаемая строка в обоих наборах оформления">
                    <ng-template>
                        <ng-container *ngTemplateOutlet="tableTemplate" />
                    </ng-template>
                </app-story-presets>
            }

            @case ('themes') {
                <app-story-themes caption="Нажимаемая строка в обеих темах">
                    <ng-template>
                        <ng-container *ngTemplateOutlet="tableTemplate" />
                    </ng-template>
                </app-story-themes>
            }
        }

        <ng-template #tableTemplate>
            <table rt-table #table="rtTable" ariaLabel="Договоры" [clickable]="true" [dataSource]="rows" [columnsConfig]="columnsConfig">
                <ng-container cdkColumnDef="title">
                    <th *cdkHeaderCellDef cdk-header-cell>Договор</th>
                    <td *cdkCellDef="let row" cdk-cell>{{ row.title }}</td>
                </ng-container>
                <ng-container cdkColumnDef="state">
                    <th *cdkHeaderCellDef cdk-header-cell>Состояние строки</th>
                    <td *cdkCellDef="let row" cdk-cell>{{ row.label }}</td>
                </ng-container>

                <tr *cdkHeaderRowDef="table.displayedColumns()" cdk-header-row></tr>
                <tr *cdkRowDef="let row; columns: table.displayedColumns()" cdk-row rtTableRow [attr.data-story-state]="row.state"></tr>
            </table>
        </ng-template>
    `,
    // native-ok: обёртка истории витрины — правила ячейки живут рядом с показом, а не отдельным файлом
    styles: `
        .app-table-row-matrix__single {
            display: grid;
            gap: 0.75rem;
            padding: 1rem;
        }

        .app-table-row-matrix__caption {
            margin: 0;
            font-size: 0.875rem;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // angular
        NgTemplateOutlet,
        CdkColumnDef,
        CdkHeaderCellDef,
        CdkHeaderCell,
        CdkCellDef,
        CdkCell,
        CdkHeaderRowDef,
        CdkHeaderRow,
        CdkRowDef,
        CdkRow,

        // components
        RtTableComponent,
        RtTableRowDirective,

        // showcase
        StoryPresetsComponent,
        StoryThemesComponent,
    ],
})
export class TestRtTableRowMatrixComponent {
    public part: TTableRowMatrixPart = 'states';

    public readonly columnsConfig: ReadonlyArray<IRtTable.ColumnConfig> = [
        { key: 'title', label: 'Договор', locked: true },
        { key: 'state', label: 'Состояние строки' },
    ];

    public readonly rows: readonly ITableRowCase[] = [
        { title: 'Договор №2024-118', label: STORY_STATE_DEFAULT.name, state: STORY_STATE_DEFAULT.state },
        { title: 'Договор №2024-119', label: STORY_STATE_HOVER.name, state: STORY_STATE_HOVER.state },
        { title: 'Договор №2024-120', label: STORY_STATE_ACTIVE.name, state: STORY_STATE_ACTIVE.state },
        {
            title: 'Договор №2024-121',
            label: STORY_STATE_FOCUS_VISIBLE.name,
            state: STORY_STATE_FOCUS_VISIBLE.state,
        },
    ];
}
