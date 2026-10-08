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
    template: `
        <ng-template #list>
            <div style="display: flex; flex-direction: column; gap: 8px; inline-size: 388px">
                @for (label of labels; track label) {
                    <rt-prompt-suggestion [label]="label" />
                }
            </div>
        </ng-template>

        @switch (part) {
            @case ('list') {
                <app-story-presets caption="Три подсказки разной длины в обоих наборах">
                    <ng-template>
                        <ng-container [ngTemplateOutlet]="list" />
                    </ng-template>
                </app-story-presets>
            }

            @case ('states') {
                <app-story-presets caption="Включена и выключена в обоих наборах">
                    <ng-template>
                        <div style="display: flex; flex-direction: column; gap: 8px; inline-size: 388px">
                            <rt-prompt-suggestion label="Give me a performance overview" />
                            <rt-prompt-suggestion label="Give me a performance overview" [disabled]="true" />
                        </div>
                    </ng-template>
                </app-story-presets>
            }

            @case ('presets') {
                <app-story-presets caption="Одна подсказка в обоих наборах">
                    <ng-template>
                        <div style="inline-size: 388px">
                            <rt-prompt-suggestion label="Which upcoming dates need attention?" />
                        </div>
                    </ng-template>
                </app-story-presets>
            }

            @case ('themes') {
                <app-story-presets caption="Подсказки в обеих темах в обоих наборах">
                    <ng-template>
                        <app-story-themes>
                            <ng-template>
                                <ng-container [ngTemplateOutlet]="list" />
                            </ng-template>
                        </app-story-themes>
                    </ng-template>
                </app-story-presets>
            }
        }
    `,
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
