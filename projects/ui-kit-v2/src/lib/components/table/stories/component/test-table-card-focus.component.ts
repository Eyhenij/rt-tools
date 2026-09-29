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
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { BreakpointsService } from '../../../../platform';
import { RtTableRowDirective } from '../../rt-table-row.directive';
import { RtTableComponent } from '../../rt-table.component';

/** Строка витрины: то, что показывают ячейки. */
interface ICardRow {
    readonly id: number;
    readonly title: string;
    readonly city: string;
}

const ROWS: readonly ICardRow[] = [
    { id: 1, title: 'Договор №2024-118', city: 'Москва' },
    { id: 2, title: 'Договор №2024-119', city: 'Санкт-Петербург' },
];

/**
 * Нажимаемая таблица в виде карточек при любой ширине кадра.
 *
 * Карточки таблица рисует по службе порогов ширины, и на узком кадре они появляются только после
 * смены ширины — уже после того, как витрина раздала состояния взаимодействия. Первая карточка
 * тогда осталась бы без фокуса. Поэтому здесь служба отвечает «узко» с первой отрисовки.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-table-card-focus',
    template: `
        <app-story-presets caption="Первая карточка под фокусом с клавиши">
            <ng-template>
                <table rt-table ariaLabel="Договоры" clickable [dataSource]="rows" [columns]="columns">
                    <ng-container cdkColumnDef="title">
                        <th *cdkHeaderCellDef cdk-header-cell>Договор</th>
                        <td *cdkCellDef="let row" cdk-cell>{{ row.title }}</td>
                    </ng-container>
                    <ng-container cdkColumnDef="city">
                        <th *cdkHeaderCellDef cdk-header-cell>Город</th>
                        <td *cdkCellDef="let row" cdk-cell>{{ row.city }}</td>
                    </ng-container>
                    <tr *cdkHeaderRowDef="columns" cdk-header-row></tr>
                    <tr *cdkRowDef="let row; columns: columns" cdk-row rtTableRow></tr>
                </table>
            </ng-template>
        </app-story-presets>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [{ provide: BreakpointsService, useValue: { narrow: signal<boolean>(true) } }],
    imports: [
        RtTableComponent,
        RtTableRowDirective,
        CdkCell,
        CdkCellDef,
        CdkColumnDef,
        CdkHeaderCell,
        CdkHeaderCellDef,
        CdkHeaderRow,
        CdkHeaderRowDef,
        CdkRow,
        CdkRowDef,
        StoryPresetsComponent,
    ],
})
export class TestRtTableCardFocusComponent {
    public readonly rows: readonly ICardRow[] = ROWS;
    public readonly columns: readonly string[] = ['title', 'city'];
}
