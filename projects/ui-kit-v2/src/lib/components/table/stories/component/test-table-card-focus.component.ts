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
    templateUrl: './test-table-card-focus.component.html',
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
