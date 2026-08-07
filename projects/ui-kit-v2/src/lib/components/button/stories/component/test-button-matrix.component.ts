import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryGridComponent } from '../../../../../showcase/story-grid.component';
import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { IStoryState, STORY_STATES, storyStateLabel } from '../../../../../showcase/story-states';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtButtonDirective } from '../../rt-button.directive';
import { IButton } from '../../rt-button.model';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type ButtonMatrixPart = 'appearance' | 'disabled' | 'size' | 'icon' | 'rounded' | 'loading' | 'states' | 'themes';

/** Случай иконки — не значение оси, а различимая комбинация подписи и стороны. */
interface IButtonIconCase {
    readonly name: string;
    readonly label: string | null;
    readonly icon: string | null;
    readonly iconPos: IButton.IconPos;
}

/**
 * Матрицы состояний `[rtButton]` для витрины.
 *
 * Перемножены только оси, которые влияют друг на друга: палитра с внешним видом (у `text`
 * и `outlined` цвет уходит в подпись и контур, а не в заливку) и палитра с отключённостью.
 * Размер, скругление и позиция иконки от палитры не зависят — они идут рядами.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-button-matrix',
    template: `
        @switch (part) {
            @case ('appearance') {
                <app-story-grid caption="Палитра × внешний вид" [rows]="themes" [columns]="appearances">
                    <ng-template let-theme let-appearance="col">
                        <button rtButton [attr.aria-label]="theme" [label]="theme" [theme]="theme" [appearance]="appearance"></button>
                    </ng-template>
                </app-story-grid>
            }

            @case ('disabled') {
                <app-story-grid caption="Палитра × отключённость" [rows]="themes" [columns]="appearances">
                    <ng-template let-theme let-appearance="col">
                        <button
                            rtButton
                            disabled
                            [attr.aria-label]="theme"
                            [label]="theme"
                            [theme]="theme"
                            [appearance]="appearance"></button>
                    </ng-template>
                </app-story-grid>
            }

            @case ('size') {
                <app-story-grid caption="Размер × внешний вид" [rows]="sizes" [columns]="appearances">
                    <ng-template let-size let-appearance="col">
                        <button rtButton label="Сохранить" aria-label="Сохранить" [size]="size" [appearance]="appearance"></button>
                    </ng-template>
                </app-story-grid>
            }

            @case ('icon') {
                <app-story-row caption="Иконка" [items]="iconCases" [itemLabel]="iconCaseLabel">
                    <ng-template let-iconCase>
                        <button
                            rtButton
                            [attr.aria-label]="iconCase.name"
                            [label]="iconCase.label"
                            [icon]="iconCase.icon"
                            [iconPos]="iconCase.iconPos"></button>
                    </ng-template>
                </app-story-row>
            }

            @case ('rounded') {
                <app-story-row caption="Скругление" [items]="rounded" [itemLabel]="roundedLabel">
                    <ng-template let-value>
                        <button rtButton label="Сохранить" aria-label="Сохранить" [rounded]="value"></button>
                    </ng-template>
                </app-story-row>
            }

            @case ('loading') {
                <app-story-row caption="Загрузка" [items]="appearances">
                    <ng-template let-appearance>
                        <button rtButton loading label="Сохранение…" aria-label="Сохранение" [appearance]="appearance"></button>
                    </ng-template>
                </app-story-row>
            }

            @case ('states') {
                <app-story-row caption="Взаимодействие" [items]="states" [itemLabel]="stateLabel">
                    <ng-template let-state>
                        <button rtButton label="Сохранить" aria-label="Сохранить" [attr.data-story-state]="state.state"></button>
                    </ng-template>
                </app-story-row>

                <app-story-row caption="Отключение" [items]="appearances">
                    <ng-template let-appearance>
                        <button rtButton disabled label="Отключена" aria-label="Отключена" [appearance]="appearance"></button>
                    </ng-template>
                </app-story-row>
            }

            @case ('themes') {
                <app-story-themes caption="Палитра в обеих темах">
                    <ng-template>
                        @for (theme of themes; track theme) {
                            <button rtButton [attr.aria-label]="theme" [label]="theme" [theme]="theme"></button>
                        }
                    </ng-template>
                </app-story-themes>
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // directives
        RtButtonDirective,

        // showcase
        StoryGridComponent,
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtButtonMatrixComponent {
    public part: ButtonMatrixPart = 'appearance';

    public readonly themes: readonly IButton.Theme[] = ['primary', 'secondary', 'success', 'warning', 'danger', 'info'];
    public readonly appearances: readonly IButton.Appearance[] = ['filled', 'outlined', 'text'];
    public readonly sizes: readonly IButton.Size[] = ['sm', 'md', 'lg', 'xl', '2xl'];
    public readonly rounded: readonly boolean[] = [false, true];
    public readonly states: readonly IStoryState[] = STORY_STATES;
    public readonly stateLabel: (value: IStoryState) => string = storyStateLabel;

    /** Иконка — не ось значений, а четыре различимых случая: без неё, слева, справа, без подписи. */
    public readonly iconCases: readonly IButtonIconCase[] = [
        { name: 'без иконки', label: 'Сохранить', icon: null, iconPos: 'left' },
        { name: 'слева', label: 'Скачать', icon: 'ico-download', iconPos: 'left' },
        { name: 'справа', label: 'Далее', icon: 'arrow-right', iconPos: 'right' },
        { name: 'без подписи', label: null, icon: 'pencil', iconPos: 'left' },
    ];

    public readonly roundedLabel: (value: boolean) => string = (value: boolean): string => (value ? 'rounded' : 'по умолчанию');

    public readonly iconCaseLabel: (value: IButtonIconCase) => string = (value: IButtonIconCase): string => value.name;
}
