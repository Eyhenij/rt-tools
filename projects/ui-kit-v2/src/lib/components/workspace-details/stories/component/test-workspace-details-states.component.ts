import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { RtWorkspaceDetailsErrorDirective } from '../../rt-workspace-details-error.directive';
import { RtWorkspaceDetailsComponent } from '../../rt-workspace-details.component';
import { IRtWorkspaceDetails } from '../../rt-workspace-details.model';

const TRANSITION: IRtWorkspaceDetails.Transition = {
    options: [{ label: 'На согласование', value: 'review' }],
    loading: false,
    error: null,
    submitError: null,
    submitting: false,
    success: null,
    currentStageLabel: 'Черновик',
    noTransitionsText: 'Переходов из этого состояния нет',
};

const AUDIT: IRtWorkspaceDetails.Audit = {
    steps: [],
    loading: false,
    loadingMore: false,
    hasMore: false,
    error: null,
    emptyText: 'Событий пока нет',
};

/**
 * Ошибка загрузки `rt-workspace-details` — по одобренному кадру: во вкладке сведений вместо данных,
 * а не уведомлением; рядом свой шаблон ошибки.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-workspace-details-states',
    templateUrl: './test-workspace-details-states.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtWorkspaceDetailsComponent,

        // directives
        RtWorkspaceDetailsErrorDirective,

        // showcase
        StoryPresetsComponent,
        StoryRowComponent,
    ],
})
export class TestRtWorkspaceDetailsStatesComponent {
    public readonly cases: readonly boolean[] = [false, true];
    public readonly transition: IRtWorkspaceDetails.Transition = TRANSITION;
    public readonly audit: IRtWorkspaceDetails.Audit = AUDIT;

    /** Рамка своего шаблона: пунктир показывает, где кончается разметка приложения. */
    public readonly slotStyle: string =
        'display: grid; gap: var(--rt-space-2); padding: var(--rt-space-4); border: 1px dashed var(--rt-color-border-strong); border-radius: var(--rt-radius-md); text-align: center';

    public readonly slotHintStyle: string = 'color: var(--rt-color-text-muted); font-size: var(--rt-text-sm)';

    public readonly caseLabel: (value: boolean) => string = (value: boolean): string =>
        value ? 'Свой шаблон ошибки' : 'Ошибка загрузки: retry по кнопке';
}
