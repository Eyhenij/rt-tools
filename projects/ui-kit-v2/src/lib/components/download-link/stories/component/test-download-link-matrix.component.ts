import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { IStoryState, STORY_STATES, storyStateLabel } from '../../../../../showcase/story-states';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtDownloadLinkComponent } from '../../rt-download-link.component';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type DownloadLinkMatrixPart = 'label' | 'states' | 'themes';

/**
 * Матрицы `rt-download-link` для витрины.
 *
 * Вход у кнопки один — подпись, и перемножать её не с чем. Зато у неё есть состояния
 * взаимодействия, и показать их важнее: кнопка нарисована как ссылка, и место фокуса с
 * клавиатуры на ней иначе не видно.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-download-link-matrix',
    template: `
        @switch (part) {
            @case ('label') {
                <app-story-row caption="Подпись" [items]="labels">
                    <ng-template let-label>
                        <rt-download-link [label]="label" />
                    </ng-template>
                </app-story-row>
            }

            @case ('states') {
                <app-story-row caption="Взаимодействие" [items]="states" [itemLabel]="stateLabel">
                    <ng-template let-state>
                        <rt-download-link label="Договор.pdf" [attr.data-story-state]="state.state" />
                    </ng-template>
                </app-story-row>
            }

            @case ('themes') {
                <app-story-themes caption="Кнопка в обеих темах">
                    <ng-template>
                        <rt-download-link label="Договор.pdf" />
                    </ng-template>
                </app-story-themes>
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtDownloadLinkComponent,

        // showcase
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtDownloadLinkMatrixComponent {
    public part: DownloadLinkMatrixPart = 'label';

    /** Подпись — свободная строка: ряд показывает края, короткое имя и длинное. */
    public readonly labels: readonly string[] = ['Акт.pdf', 'Договор.pdf', 'Выгрузка операций за сентябрь 2026.xlsx'];

    public readonly states: readonly IStoryState[] = STORY_STATES;
    public readonly stateLabel: (value: IStoryState) => string = storyStateLabel;
}
