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
    template: `
        @switch (part) {
            @case ('value') {
                <app-story-presets caption="Выбор в обоих наборах">
                    <ng-template>
                        <app-story-row [items]="valueCases" [itemLabel]="caseLabel">
                            <ng-template let-valueCase>
                                <rt-radio-button [value]="valueCase.name" [checked]="valueCase.checked" [ariaLabel]="valueCase.name" />
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('label') {
                <app-story-presets caption="Подпись и пояснение в обоих наборах">
                    <ng-template>
                        <app-story-row [items]="labelCases" [itemLabel]="caseLabel">
                            <ng-template let-labelCase>
                                <rt-radio-button
                                    [value]="labelCase.name"
                                    [checked]="true"
                                    [label]="labelCase.label"
                                    [description]="labelCase.description"
                                    [ariaLabel]="labelCase.name" />
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('card') {
                <app-story-presets caption="Вид «карточка» × выбор в обоих наборах">
                    <ng-template>
                        <app-story-grid
                            caption="Вид × выбор"
                            [rows]="looks"
                            [columns]="valueCases"
                            [rowLabel]="lookLabel"
                            [columnLabel]="caseLabel">
                            <ng-template let-card let-valueCase="col">
                                <rt-radio-button
                                    label="Доставка курьером"
                                    description="Завтра с 10 до 18"
                                    [value]="valueCase.name"
                                    [checked]="valueCase.checked"
                                    [card]="card" />
                            </ng-template>
                        </app-story-grid>
                    </ng-template>
                </app-story-presets>
            }

            @case ('states') {
                <app-story-presets caption="Взаимодействие в обоих наборах">
                    <ng-template>
                        <app-story-row [items]="states" [itemLabel]="stateLabel">
                            <ng-template let-state>
                                <rt-radio-button label="Москва" [value]="1" [attr.data-story-state]="state.state" />
                            </ng-template>
                        </app-story-row>

                        <app-story-grid
                            caption="Выбор × отключённость"
                            [rows]="valueCases"
                            [columns]="switches"
                            [rowLabel]="caseLabel"
                            [columnLabel]="switchLabel">
                            <ng-template let-valueCase let-off="col">
                                <rt-radio-button label="Москва" [value]="valueCase.name" [checked]="valueCase.checked" [disabled]="off" />
                            </ng-template>
                        </app-story-grid>

                        <app-story-grid
                            caption="Карточка: выбор × отключённость"
                            [rows]="valueCases"
                            [columns]="switches"
                            [rowLabel]="caseLabel"
                            [columnLabel]="switchLabel">
                            <ng-template let-valueCase let-off="col">
                                <rt-radio-button
                                    label="Доставка курьером"
                                    [value]="valueCase.name"
                                    [checked]="valueCase.checked"
                                    [disabled]="off"
                                    [card]="true" />
                            </ng-template>
                        </app-story-grid>
                    </ng-template>
                </app-story-presets>
            }

            @case ('presets') {
                <app-story-presets caption="Положения в обоих наборах">
                    <ng-template>
                        @for (valueCase of valueCases; track valueCase.name) {
                            <rt-radio-button [value]="valueCase.name" [checked]="valueCase.checked" [label]="valueCase.name" />
                            <rt-radio-button
                                description="Завтра с 10 до 18"
                                [value]="valueCase.name"
                                [checked]="valueCase.checked"
                                [label]="valueCase.name"
                                [card]="true" />
                        }
                    </ng-template>
                </app-story-presets>
            }

            @case ('themes') {
                <app-story-presets caption="Положения в обеих темах в обоих наборах">
                    <ng-template>
                        <app-story-themes>
                            <ng-template>
                                @for (valueCase of valueCases; track valueCase.name) {
                                    <rt-radio-button [value]="valueCase.name" [checked]="valueCase.checked" [label]="valueCase.name" />
                                    <rt-radio-button
                                        description="Завтра с 10 до 18"
                                        [value]="valueCase.name"
                                        [checked]="valueCase.checked"
                                        [label]="valueCase.name"
                                        [card]="true" />
                                }
                            </ng-template>
                        </app-story-themes>
                    </ng-template>
                </app-story-presets>
            }
        }
    `,
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
