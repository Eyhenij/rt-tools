import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { RtBarListEmptyDirective, RtBarListErrorDirective } from '../../rt-bar-list-states.directive';
import { RtBarListComponent } from '../../rt-bar-list.component';
import { IRtBarList } from '../../rt-bar-list.model';
import { BAR_LIST_ROWS } from './bar-list.fixture';

/** Случай списка долей: ошибка и какой свой шаблон стоит. */
interface IBarListStateCase {
    readonly name: string;
    readonly rows: readonly IRtBarList.Row[];
    readonly error: string | null;
    readonly ownEmpty: boolean;
    readonly ownError: boolean;
}

const CASES: readonly IBarListStateCase[] = [
    { name: 'Ошибка загрузки: error не null, retry по кнопке', rows: BAR_LIST_ROWS, error: '', ownEmpty: false, ownError: false },
    { name: 'Свой шаблон пустого: ng-template[rtBarListEmpty]', rows: [], error: null, ownEmpty: true, ownError: false },
    { name: 'Свой шаблон ошибки: ng-template[rtBarListError]', rows: BAR_LIST_ROWS, error: 'Нет сети', ownEmpty: false, ownError: true },
];

/**
 * Ошибка загрузки и свои шаблоны `rt-bar-list` — по одобренному кадру. При ошибке полос нет,
 * заголовок остаётся.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-bar-list-states',
    templateUrl: './test-bar-list-states.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtBarListComponent,

        // directives
        RtBarListEmptyDirective,
        RtBarListErrorDirective,

        // showcase
        StoryPresetsComponent,
        StoryRowComponent,
    ],
})
export class TestRtBarListStatesComponent {
    public readonly cases: readonly IBarListStateCase[] = CASES;

    /** Рамка своего шаблона: пунктир показывает, где кончается разметка приложения. */
    public readonly slotStyle: string =
        'display: grid; gap: var(--rt-space-2); margin-block: var(--rt-space-6); padding: var(--rt-space-4); border: 1px dashed var(--rt-color-border-strong); border-radius: var(--rt-radius-md); text-align: center';

    public readonly slotHintStyle: string = 'color: var(--rt-color-text-muted); font-size: var(--rt-text-sm)';

    public readonly caseLabel: (value: IBarListStateCase) => string = (value: IBarListStateCase): string => value.name;
}
