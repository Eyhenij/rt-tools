import { ChangeDetectionStrategy, Component } from '@angular/core';

import { EFilterOperatorType, IFilterModel } from '@rt-tools/utils';

import { StoryPresetsComponent } from '../../../../../../showcase/story-presets.component';
import { StoryRowComponent } from '../../../../../../showcase/story-row.component';
import { StoryThemesComponent } from '../../../../../../showcase/story-themes.component';
import { IRtTable } from '../../../rt-table.model';
import { RtTableFilterHeaderComponent } from '../../rt-table-filter-header.component';
import { TestRtTableFilterInTableComponent } from './test-table-filter-in-table.component';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TFilterHeaderMatrixPart = 'kinds' | 'states' | 'presets' | 'themes' | 'in-table';

/** Один случай ряда: подпись ячейки, настройка отбора и набор условий, который ей виден. */
interface ICase {
    readonly label: string;
    readonly filter: IRtTable.ColumnFilter | null;
    readonly filters: readonly IFilterModel<string>[];
}

const STATUSES: readonly IRtTable.FilterOption[] = [
    { value: 'new', label: 'Новая' },
    { value: 'done', label: 'Закрыта' },
];

/** Заданный отбор по этой колонке: по нему видно и значение в поле, и очистку рядом. */
const SET: readonly IFilterModel<string>[] = [{ propertyName: 'title', operatorType: EFilterOperatorType.CONTAINS, value: 'Сочи' }];

/**
 * Матрицы состояний отбора в шапке столбца.
 *
 * Показов у семейства два рода: виды отбора — четыре готовые части кита, которые зовёт вид, — и
 * состояния самой ячейки: отбор не задан, отбор задан, колонка отбора не имеет вовсе. Скрещивать
 * их незачем: пара читается ровно как каждая ось по отдельности.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-table-filter-header-matrix',
    // native-ok: обёртка истории витрины — показ живёт рядом с историей, а не отдельным файлом разметки
    template: `
        @switch (part) {
            @case ('kinds') {
                <app-story-presets caption="Виды отбора в обоих наборах">
                    <ng-template>
                        <app-story-row slotWidth="16rem" [items]="kindCases" [itemLabel]="caseLabel">
                            <ng-template let-item>
                                <rt-table-filter-header propertyName="title" [filter]="item.filter" [filters]="item.filters" />
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('states') {
                <app-story-presets caption="Состояния ячейки в обоих наборах">
                    <ng-template>
                        <app-story-row slotWidth="16rem" [items]="stateCases" [itemLabel]="caseLabel">
                            <ng-template let-item>
                                <rt-table-filter-header propertyName="title" [filter]="item.filter" [filters]="item.filters" />
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('presets') {
                <app-story-presets caption="Отбор с заданным значением целиком" fill>
                    <ng-template>
                        <rt-table-filter-header propertyName="title" [filter]="textFilter" [filters]="setFilters" />
                    </ng-template>
                </app-story-presets>
            }

            @case ('in-table') {
                <app-table-filter-in-table />
            }

            @case ('themes') {
                <app-story-themes caption="Светлая и тёмная тема рядом">
                    <ng-template>
                        <rt-table-filter-header propertyName="title" [filter]="textFilter" [filters]="setFilters" />
                    </ng-template>
                </app-story-themes>
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        RtTableFilterHeaderComponent,
        StoryPresetsComponent,
        StoryRowComponent,
        StoryThemesComponent,
        TestRtTableFilterInTableComponent,
    ],
})
export class TestRtTableFilterHeaderMatrixComponent {
    public part: TFilterHeaderMatrixPart = 'kinds';

    public readonly textFilter: IRtTable.ColumnFilter = { kind: 'text' };
    public readonly setFilters: readonly IFilterModel<string>[] = SET;

    public readonly kindCases: readonly ICase[] = [
        { label: 'текст', filter: { kind: 'text' }, filters: [] },
        { label: 'число', filter: { kind: 'number' }, filters: [] },
        { label: 'выбор из списка', filter: { kind: 'select', options: STATUSES }, filters: [] },
        { label: 'дата', filter: { kind: 'date' }, filters: [] },
    ];

    public readonly stateCases: readonly ICase[] = [
        { label: 'отбор не задан', filter: { kind: 'text' }, filters: [] },
        { label: 'отбор задан', filter: { kind: 'text' }, filters: SET },
        {
            label: 'свой вид сравнения',
            filter: { kind: 'text', operators: [EFilterOperatorType.CONTAINS, EFilterOperatorType.EQUALS] },
            filters: [],
        },
        { label: 'колонка без отбора', filter: null, filters: [] },
    ];

    public readonly caseLabel: (value: ICase) => string = (value: ICase): string => value.label;
}
