import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtCounterComponent } from '../../rt-counter.component';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type CounterMatrixPart = 'bounds' | 'value' | 'states' | 'themes';

/** Положение счётчика относительно границ — оно и решает, какая кнопка погашена. */
interface ICounterCase {
    readonly name: string;
    readonly min: number;
    readonly max: number;
    readonly disabled: boolean;
    readonly control: FormControl<number>;
}

function count(value: number): FormControl<number> {
    return new FormControl<number>(value, { nonNullable: true });
}

/**
 * Матрицы состояний `rt-counter` для витрины.
 *
 * Границы — не отдельная ось, а то, что решает вид: на нижней границе гаснет «минус», на
 * верхней «плюс». Поэтому ячейки различаются не входами `min`/`max`, а положением значения
 * между ними.
 *
 * Своих состояний взаимодействия у счётчика нет: наведение и фокус принадлежат кнопкам
 * [`rt-icon-button`](./?path=/docs/components-iconbutton-overview--docs) и показаны в их матрице.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-counter-matrix',
    template: `
        @switch (part) {
            @case ('bounds') {
                <app-story-row caption="Положение между границами" [items]="boundCases" [itemLabel]="caseLabel">
                    <ng-template let-boundCase>
                        <rt-counter
                            [ariaLabel]="boundCase.name"
                            [min]="boundCase.min"
                            [max]="boundCase.max"
                            [formControl]="boundCase.control" />
                    </ng-template>
                </app-story-row>
            }

            @case ('value') {
                <app-story-row caption="Разрядность значения" [items]="valueCases" [itemLabel]="caseLabel">
                    <ng-template let-valueCase>
                        <rt-counter [ariaLabel]="valueCase.name" [max]="valueCase.max" [formControl]="valueCase.control" />
                    </ng-template>
                </app-story-row>
            }

            @case ('states') {
                <app-story-row caption="Состояния" [items]="stateCases" [itemLabel]="caseLabel">
                    <ng-template let-stateCase>
                        <rt-counter
                            [ariaLabel]="stateCase.name"
                            [min]="stateCase.min"
                            [max]="stateCase.max"
                            [disabled]="stateCase.disabled"
                            [formControl]="stateCase.control" />
                    </ng-template>
                </app-story-row>
            }

            @case ('themes') {
                <app-story-themes caption="Счётчик в обеих темах">
                    <ng-template>
                        @for (stateCase of stateCases; track stateCase.name) {
                            <rt-counter
                                [ariaLabel]="stateCase.name"
                                [min]="stateCase.min"
                                [max]="stateCase.max"
                                [disabled]="stateCase.disabled"
                                [formControl]="stateCase.control" />
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
        RtCounterComponent,

        // showcase
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtCounterMatrixComponent {
    public part: CounterMatrixPart = 'bounds';

    public readonly boundCases: readonly ICounterCase[] = [
        { name: 'на нижней границе', min: 1, max: 4, disabled: false, control: count(1) },
        { name: 'между границами', min: 1, max: 4, disabled: false, control: count(2) },
        { name: 'на верхней границе', min: 1, max: 4, disabled: false, control: count(4) },
        { name: 'без потолка', min: 0, max: Number.MAX_SAFE_INTEGER, disabled: false, control: count(7) },
    ];

    public readonly valueCases: readonly ICounterCase[] = [
        { name: 'ноль', min: 0, max: 999, disabled: false, control: count(0) },
        { name: 'две цифры', min: 0, max: 999, disabled: false, control: count(12) },
        { name: 'три цифры', min: 0, max: 999, disabled: false, control: count(365) },
    ];

    public readonly stateCases: readonly ICounterCase[] = [
        { name: 'обычное', min: 0, max: 9, disabled: false, control: count(3) },
        { name: 'минус погашен', min: 0, max: 9, disabled: false, control: count(0) },
        { name: 'плюс погашен', min: 0, max: 9, disabled: false, control: count(9) },
        { name: 'отключён целиком', min: 0, max: 9, disabled: true, control: count(3) },
    ];

    /** Подпись случая: у всех наборов этой матрицы имя лежит в одном поле. */
    public readonly caseLabel: (value: ICounterCase) => string = (value: ICounterCase): string => value.name;
}
