import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { IStoryState, STORY_STATES, storyStateLabel } from '../../../../../showcase/story-states';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtNightGridComponent } from '../../rt-night-grid.component';
import { IRtNightGrid } from '../../rt-night-grid.model';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TNightGridMatrixPart = 'state' | 'length' | 'states' | 'edges' | 'themes';

/** Случай сетки: имя для подписи ячейки и сами клетки. */
interface INightGridCase {
    readonly name: string;
    readonly cells: readonly IRtNightGrid.Cell[];
}

const STATES: readonly IRtNightGrid.State[] = ['free', 'primary', 'secondary'];

/** Что показывает клетка: подпись на каждое состояние. */
const STATE_LABELS: Readonly<Record<IRtNightGrid.State, string>> = {
    free: 'свободно',
    primary: 'занято',
    secondary: 'бронь под вопросом',
};

/** Собирает месяц клеток, раздавая состояния по кругу. */
function month(count: number, pick: (index: number) => IRtNightGrid.State): readonly IRtNightGrid.Cell[] {
    return Array.from({ length: count }, (_: unknown, index: number): IRtNightGrid.Cell => {
        const state: IRtNightGrid.State = pick(index);
        const day: number = index + 1;

        return { state, id: `day-${day}`, title: `${day} марта — ${STATE_LABELS[state]}` };
    });
}

/**
 * Матрицы состояний `rt-night-grid` для витрины.
 *
 * Ось у сетки одна — состояние клетки, — и она показывается всеми тремя значениями подряд:
 * клетки плотные, и различить свободную от второстепенной можно только рядом друг с другом.
 *
 * **Клетка пустая — весь смысл несёт её подпись.** Внутри нет ни текста, ни иконки, поэтому в
 * матрице подписи заданы самодостаточными: «3 марта — занято», а не «занято».
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-night-grid-matrix',
    template: `
        @switch (part) {
            @case ('state') {
                <app-story-row caption="Состояние клетки" slotWidth="16rem" [items]="stateCases" [itemLabel]="caseLabel">
                    <ng-template let-item>
                        <rt-night-grid ariaLabel="Март" [cells]="item.cells" />
                    </ng-template>
                </app-story-row>
            }

            @case ('length') {
                <app-story-row caption="Длина месяца" slotWidth="16rem" [items]="lengths" [itemLabel]="caseLabel">
                    <ng-template let-item>
                        <rt-night-grid ariaLabel="Месяц" [cells]="item.cells" />
                    </ng-template>
                </app-story-row>
            }

            @case ('states') {
                <app-story-row caption="Взаимодействие" slotWidth="16rem" [items]="states" [itemLabel]="stateLabel">
                    <ng-template let-state>
                        <rt-night-grid ariaLabel="Март" [cells]="mixed" [attr.data-story-state]="state.state" />
                    </ng-template>
                </app-story-row>
            }

            @case ('edges') {
                <app-story-row caption="Края" slotWidth="16rem" [items]="edges" [itemLabel]="caseLabel">
                    <ng-template let-item>
                        <rt-night-grid ariaLabel="Март" [cells]="item.cells" />
                    </ng-template>
                </app-story-row>
            }

            @case ('themes') {
                <app-story-themes caption="Сетка в обеих темах">
                    <ng-template>
                        <div style="width: 16rem">
                            <rt-night-grid ariaLabel="Март" [cells]="mixed" />
                        </div>
                    </ng-template>
                </app-story-themes>
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtNightGridComponent,

        // showcase
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtNightGridMatrixComponent {
    public part: TNightGridMatrixPart = 'state';

    public readonly mixed: readonly IRtNightGrid.Cell[] = month(31, (index: number): IRtNightGrid.State => STATES[index % 3]);

    public readonly states: readonly IStoryState[] = STORY_STATES;
    public readonly stateLabel: (value: IStoryState) => string = storyStateLabel;

    /** Три состояния показаны и порознь, и вперемешку: плотные клетки различаются только рядом. */
    public readonly stateCases: readonly INightGridCase[] = [
        { name: 'всё свободно', cells: month(31, (): IRtNightGrid.State => 'free') },
        { name: 'всё занято', cells: month(31, (): IRtNightGrid.State => 'primary') },
        { name: 'всё под вопросом', cells: month(31, (): IRtNightGrid.State => 'secondary') },
        { name: 'вперемешку', cells: month(31, (index: number): IRtNightGrid.State => STATES[index % 3]) },
    ];

    public readonly lengths: readonly INightGridCase[] = [
        { name: '28 дней', cells: month(28, (index: number): IRtNightGrid.State => STATES[index % 3]) },
        { name: '30 дней', cells: month(30, (index: number): IRtNightGrid.State => STATES[index % 3]) },
        { name: '31 день', cells: month(31, (index: number): IRtNightGrid.State => STATES[index % 3]) },
    ];

    public readonly edges: readonly INightGridCase[] = [
        { name: 'пустой набор', cells: [] },
        { name: 'одна клетка', cells: month(1, (): IRtNightGrid.State => 'primary') },
    ];

    public readonly caseLabel: (value: INightGridCase) => string = (value: INightGridCase): string => value.name;
}
