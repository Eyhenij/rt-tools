import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { IStoryState, STORY_CONTROL_STATES, storyStateLabel } from '../../../../../showcase/story-states';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtBreadcrumbsComponent } from '../../rt-breadcrumbs.component';
import { IRtBreadcrumbs } from '../../rt-breadcrumbs.model';
import { STORY_BREADCRUMBS_PATH, STORY_BREADCRUMBS_RECORD, STORY_BREADCRUMBS_SHORT } from './story-breadcrumbs';
import { TestRtBreadcrumbsNarrowCellComponent } from './test-breadcrumbs-narrow-cell.component';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TBreadcrumbsMatrixPart = 'chain' | 'look' | 'fold' | 'width' | 'states' | 'presets' | 'themes';

/** Случай пути: подпись ячейки и что передано компоненту. */
interface IBreadcrumbsCase {
    readonly name: string;
    readonly crumbs: readonly IRtBreadcrumbs.Crumb[];
    readonly back: boolean;
    readonly separator: string;
}

/**
 * Матрицы `rt-breadcrumbs` для витрины. Свёртка показана подменой сервиса точек перехода в ячейке:
 * кадр витрины широкий, а узкий путь нужен рядом с полным.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-breadcrumbs-matrix',
    templateUrl: './test-breadcrumbs-matrix.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtBreadcrumbsComponent,
        TestRtBreadcrumbsNarrowCellComponent,

        // showcase
        StoryPresetsComponent,
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtBreadcrumbsMatrixComponent {
    public part: TBreadcrumbsMatrixPart = 'chain';

    public readonly path: readonly IRtBreadcrumbs.Crumb[] = STORY_BREADCRUMBS_PATH;
    /** Четыре предка: на узком экране середина сворачивается, на широком путь входит в половину кадра. */
    public readonly foldPath: readonly IRtBreadcrumbs.Crumb[] = STORY_BREADCRUMBS_PATH.slice(0, 5);
    public readonly shortPath: readonly IRtBreadcrumbs.Crumb[] = STORY_BREADCRUMBS_SHORT;

    public readonly chainCases: readonly IBreadcrumbsCase[] = [
        { name: 'одно звено', crumbs: STORY_BREADCRUMBS_PATH.slice(0, 1), back: false, separator: '/' },
        { name: 'цепочка', crumbs: STORY_BREADCRUMBS_SHORT, back: false, separator: '/' },
        { name: 'с кнопкой «назад»', crumbs: STORY_BREADCRUMBS_SHORT, back: true, separator: '/' },
        { name: 'свой разделитель', crumbs: STORY_BREADCRUMBS_SHORT, back: false, separator: '›' },
        { name: 'раздел и длинное имя записи', crumbs: STORY_BREADCRUMBS_RECORD, back: false, separator: '›' },
    ];

    public readonly states: readonly IStoryState[] = STORY_CONTROL_STATES;

    public readonly stateLabel: (value: IStoryState) => string = storyStateLabel;
    public readonly caseLabel: (value: IBreadcrumbsCase) => string = (value: IBreadcrumbsCase): string => value.name;
}
