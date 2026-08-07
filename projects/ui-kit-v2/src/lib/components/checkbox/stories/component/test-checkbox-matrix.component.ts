import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { StoryGridComponent } from '../../../../../showcase/story-grid.component';
import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { IStoryState, STORY_CONTROL_STATES, storyStateLabel } from '../../../../../showcase/story-states';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtCheckboxComponent } from '../../rt-checkbox.component';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type CheckboxMatrixPart = 'value' | 'label' | 'states' | 'themes';

/**
 * Положение чекбокса: значение и смешанность вместе, потому что порознь они не бывают —
 * смешанное состояние рисуется поверх любого значения.
 */
interface ICheckboxValueCase {
    readonly name: string;
    readonly indeterminate: boolean;
    readonly control: FormControl<boolean>;
}

/** Подпись приходит проекцией, поэтому её случаи — не значения входа, а разное содержимое. */
interface ICheckboxLabelCase {
    readonly name: string;
    readonly text: string;
    readonly control: FormControl<boolean>;
}

function checked(value: boolean): FormControl<boolean> {
    return new FormControl<boolean>(value, { nonNullable: true });
}

/**
 * Матрицы состояний `rt-checkbox` для витрины.
 *
 * Значение перемножено с отключённостью: отключённый чекбокс красит и рамку, и заливку, и
 * галочку — по одному отключённому положению не видно, что стало с остальными двумя.
 *
 * Значение приходит только формой: своего входа значения у контрола нет, его пишет `writeValue`.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-checkbox-matrix',
    template: `
        @switch (part) {
            @case ('value') {
                <app-story-row caption="Положение" [items]="valueCases" [itemLabel]="caseLabel">
                    <ng-template let-valueCase>
                        <rt-checkbox
                            [ariaLabel]="valueCase.name"
                            [indeterminate]="valueCase.indeterminate"
                            [formControl]="valueCase.control" />
                    </ng-template>
                </app-story-row>
            }

            @case ('label') {
                <app-story-row caption="Подпись" [items]="labelCases" [itemLabel]="caseLabel">
                    <ng-template let-labelCase>
                        @if (labelCase.text) {
                            <rt-checkbox [ariaLabel]="labelCase.name" [formControl]="labelCase.control">{{ labelCase.text }}</rt-checkbox>
                        } @else {
                            <rt-checkbox [ariaLabel]="labelCase.name" [formControl]="labelCase.control" />
                        }
                    </ng-template>
                </app-story-row>
            }

            @case ('states') {
                <app-story-row caption="Взаимодействие" [items]="states" [itemLabel]="stateLabel">
                    <ng-template let-state>
                        <rt-checkbox ariaLabel="Состояние" [attr.data-story-state]="state.state">Согласен с условиями</rt-checkbox>
                    </ng-template>
                </app-story-row>

                <app-story-grid
                    caption="Положение × отключённость"
                    [rows]="valueCases"
                    [columns]="switches"
                    [rowLabel]="caseLabel"
                    [columnLabel]="switchLabel">
                    <ng-template let-valueCase let-off="col">
                        <rt-checkbox
                            [ariaLabel]="valueCase.name"
                            [disabled]="off"
                            [indeterminate]="valueCase.indeterminate"
                            [formControl]="valueCase.control" />
                    </ng-template>
                </app-story-grid>
            }

            @case ('themes') {
                <app-story-themes caption="Положения в обеих темах">
                    <ng-template>
                        @for (valueCase of valueCases; track valueCase.name) {
                            <rt-checkbox
                                [ariaLabel]="valueCase.name"
                                [indeterminate]="valueCase.indeterminate"
                                [formControl]="valueCase.control">
                                {{ valueCase.name }}
                            </rt-checkbox>
                        }
                    </ng-template>
                </app-story-themes>
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // angular
        ReactiveFormsModule,

        // components
        RtCheckboxComponent,

        // showcase
        StoryGridComponent,
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtCheckboxMatrixComponent {
    public part: CheckboxMatrixPart = 'value';

    public readonly states: readonly IStoryState[] = STORY_CONTROL_STATES;
    public readonly stateLabel: (value: IStoryState) => string = storyStateLabel;

    /** Столбцы сетки отключённости: включённый контрол и он же отключённый. */
    public readonly switches: readonly boolean[] = [false, true];

    public readonly valueCases: readonly ICheckboxValueCase[] = [
        { name: 'не отмечен', indeterminate: false, control: checked(false) },
        { name: 'отмечен', indeterminate: false, control: checked(true) },
        { name: 'смешанный', indeterminate: true, control: checked(false) },
    ];

    public readonly labelCases: readonly ICheckboxLabelCase[] = [
        { name: 'без подписи', text: '', control: checked(true) },
        { name: 'короткая', text: 'Согласен', control: checked(true) },
        { name: 'длинная', text: 'Согласен с условиями обработки персональных данных', control: checked(true) },
    ];

    /** Подпись столбца сетки отключённости. */
    public readonly switchLabel: (value: boolean) => string = (value: boolean): string => (value ? 'отключён' : 'включён');

    /** Подпись случая: у всех наборов этой матрицы имя лежит в одном поле. */
    public readonly caseLabel: (value: { readonly name: string }) => string = (value: { readonly name: string }): string => value.name;
}
