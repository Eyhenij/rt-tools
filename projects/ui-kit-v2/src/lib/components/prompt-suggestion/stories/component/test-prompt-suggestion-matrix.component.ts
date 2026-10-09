import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtPromptSuggestionComponent } from '../../rt-prompt-suggestion.component';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TPromptSuggestionMatrixPart = 'list' | 'states' | 'presets' | 'themes';

/**
 * Матрицы `rt-prompt-suggestion` для витрины. Карточки стоят столбцом в колонке ширины панели
 * ассистента: стрелки должны встать на одну вертикаль при подписях разной длины.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-prompt-suggestion-matrix',
    templateUrl: './test-prompt-suggestion-matrix.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // angular
        NgTemplateOutlet,

        // components
        RtPromptSuggestionComponent,

        // showcase
        StoryPresetsComponent,
        StoryThemesComponent,
    ],
})
export class TestRtPromptSuggestionMatrixComponent {
    public part: TPromptSuggestionMatrixPart = 'list';

    public readonly labels: readonly string[] = [
        'Give me a performance overview',
        "What's changed in bookings?",
        'Which upcoming dates need attention?',
    ];
}
