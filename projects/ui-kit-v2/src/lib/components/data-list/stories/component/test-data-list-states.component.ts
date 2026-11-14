import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { TestRtDataListStatesCellComponent } from './test-data-list-states-cell.component';

/** Случай списка данных: пустота, ошибка и какой свой шаблон стоит. */
interface IDataListStateCase {
    readonly key: string;
    readonly name: string;
    readonly empty: boolean;
    readonly error: string | null;
    readonly ownEmpty: boolean;
    readonly ownError: boolean;
}

const CASES: readonly IDataListStateCase[] = [
    { key: 'error', name: 'Ошибка загрузки: error не null, retry по кнопке', empty: false, error: '', ownEmpty: false, ownError: false },
    {
        key: 'own-empty',
        name: 'Свой шаблон пустого: ng-template[rtDataListEmpty]',
        empty: true,
        error: null,
        ownEmpty: true,
        ownError: false,
    },
    {
        key: 'own-error',
        name: 'Свой шаблон ошибки: ng-template[rtDataListError]',
        empty: false,
        error: 'Нет сети',
        ownEmpty: false,
        ownError: true,
    },
];

/**
 * Ошибка загрузки и свои шаблоны `rt-data-list` — по одобренному кадру. При ошибке полоса действий
 * остаётся, таблицы нет.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-data-list-states',
    templateUrl: './test-data-list-states.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // showcase
        StoryPresetsComponent,
        StoryRowComponent,
        TestRtDataListStatesCellComponent,
    ],
})
export class TestRtDataListStatesComponent {
    public readonly cases: readonly IDataListStateCase[] = CASES;

    public readonly caseLabel: (value: IDataListStateCase) => string = (value: IDataListStateCase): string => value.name;
}
