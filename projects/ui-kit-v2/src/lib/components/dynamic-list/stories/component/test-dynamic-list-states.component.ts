import { ChangeDetectionStrategy, Component } from '@angular/core';

import { IPageModel } from '@rt-tools/utils';

import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { RtDynamicListEmptyDirective, RtDynamicListErrorDirective } from '../../rt-dynamic-list-states.directive';
import { RtDynamicListComponent } from '../../rt-dynamic-list.component';

/** Случай динамического списка: ошибка, пустота и какой свой шаблон стоит. */
interface IDynamicListStateCase {
    readonly name: string;
    readonly empty: boolean;
    readonly error: string | null;
    readonly ownEmpty: boolean;
    readonly ownError: boolean;
}

const CASES: readonly IDynamicListStateCase[] = [
    { name: 'Ошибка загрузки: error не null, retry по кнопке', empty: false, error: '', ownEmpty: false, ownError: false },
    { name: 'Свой шаблон пустого: ng-template[rtDynamicListEmpty]', empty: true, error: null, ownEmpty: true, ownError: false },
    { name: 'Свой шаблон ошибки: ng-template[rtDynamicListError]', empty: false, error: 'Нет сети', ownEmpty: false, ownError: true },
];

/** Три страницы: без ошибки под записями стояла бы полоса страниц. */
const PAGE: IPageModel = { pageNumber: 1, pageSize: 20, totalCount: 55 };

/**
 * Ошибка загрузки и свои шаблоны `rt-dynamic-list` — по одобренному кадру. При ошибке панель
 * остаётся, записей и полосы страниц нет.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-dynamic-list-states',
    templateUrl: './test-dynamic-list-states.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtDynamicListComponent,

        // directives
        RtDynamicListEmptyDirective,
        RtDynamicListErrorDirective,

        // showcase
        StoryPresetsComponent,
        StoryRowComponent,
    ],
})
export class TestRtDynamicListStatesComponent {
    public readonly cases: readonly IDynamicListStateCase[] = CASES;
    public readonly page: IPageModel = PAGE;

    /** Рамка своего шаблона: пунктир показывает, где кончается разметка приложения. */
    public readonly slotStyle: string =
        'display: grid; gap: var(--rt-space-2); inline-size: fit-content; margin: var(--rt-space-6) auto; padding: var(--rt-space-4); border: 1px dashed var(--rt-color-border-strong); border-radius: var(--rt-radius-md); text-align: center';

    public readonly slotHintStyle: string = 'color: var(--rt-color-text-muted); font-size: var(--rt-text-sm)';

    public readonly caseLabel: (value: IDynamicListStateCase) => string = (value: IDynamicListStateCase): string => value.name;
}
