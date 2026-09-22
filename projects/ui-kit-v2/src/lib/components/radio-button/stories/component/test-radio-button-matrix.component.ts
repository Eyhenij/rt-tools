import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryGridComponent } from '../../../../../showcase/story-grid.component';
import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { IStoryState, STORY_CONTROL_STATES, storyStateLabel } from '../../../../../showcase/story-states';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtRadioButtonComponent } from '../../rt-radio-button.component';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TRadioButtonMatrixPart = 'value' | 'label' | 'card' | 'states' | 'presets' | 'themes';

interface IRadioValueCase {
    readonly name: string;
    readonly checked: boolean;
}

interface IRadioLabelCase {
    readonly name: string;
    readonly label: string;
    readonly description: string;
}

/**
 * Матрицы состояний `rt-radio-button` для витрины.
 *
 * Выбор перемножен с видом «карточка» и с отключённостью: отключённая гасит и кружок, и точку, и
 * рамку карточки разом, и по одной отключённой ячейке не видно, что стало со вторым выбором.
 *
 * Выбор ставится входом `checked`: матрица показывает положения, а не ведёт модель.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-radio-button-matrix',
    templateUrl: './test-radio-button-matrix.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtRadioButtonComponent,

        // showcase
        StoryGridComponent,
        StoryPresetsComponent,
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtRadioButtonMatrixComponent {
    public part: TRadioButtonMatrixPart = 'value';

    public readonly states: readonly IStoryState[] = STORY_CONTROL_STATES;
    public readonly stateLabel: (value: IStoryState) => string = storyStateLabel;

    /** Столбцы сетки отключённости: включённая радиокнопка и она же отключённая. */
    public readonly switches: readonly boolean[] = [false, true];

    /** Строки сетки вида: обычный вид и карточка. */
    public readonly looks: readonly boolean[] = [false, true];

    public readonly valueCases: readonly IRadioValueCase[] = [
        { name: 'не выбрана', checked: false },
        { name: 'выбрана', checked: true },
    ];

    public readonly labelCases: readonly IRadioLabelCase[] = [
        { name: 'без текстов', label: '', description: '' },
        { name: 'подпись', label: 'Москва', description: '' },
        { name: 'подпись и пояснение', label: 'Москва', description: 'Столица, доставка за день' },
    ];

    public readonly switchLabel: (value: boolean) => string = (value: boolean): string => (value ? 'отключена' : 'включена');
    public readonly lookLabel: (value: boolean) => string = (value: boolean): string => (value ? 'карточка' : 'обычный');

    /** Подпись случая: у всех наборов этой матрицы имя лежит в одном поле. */
    public readonly caseLabel: (value: { readonly name: string }) => string = (value: { readonly name: string }): string => value.name;
}
