import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryGridComponent } from '../../../../../showcase/story-grid.component';
import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { IStoryState, STORY_STATES, storyStateLabel } from '../../../../../showcase/story-states';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtButtonDirective } from '../../rt-button.directive';
import { IButton } from '../../rt-button.model';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TButtonMatrixPart =
    'appearance' | 'disabled' | 'pressed' | 'size' | 'icon' | 'rounded' | 'loading' | 'states' | 'presets' | 'themes';

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
                <app-story-presets caption="Палитра × внешний вид в обоих наборах">
                    <ng-template>
                        <app-story-grid [rows]="themes" [columns]="appearances">
                            <ng-template let-theme let-appearance="col">
                                <button
                                    rtButton
                                    [attr.aria-label]="theme"
                                    [label]="theme"
                                    [theme]="theme"
                                    [appearance]="appearance"></button>
                            </ng-template>
                        </app-story-grid>
                    </ng-template>
                </app-story-presets>
            }

            @case ('disabled') {
                <app-story-presets caption="Палитра × отключённость в обоих наборах">
                    <ng-template>
                        <app-story-grid [rows]="themes" [columns]="appearances">
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
                    </ng-template>
                </app-story-presets>
            }

            @case ('pressed') {
                <app-story-presets caption="Оформление × положение в обоих наборах">
                    <ng-template>
                        <app-story-grid [rows]="appearances" [columns]="pressedCases" [columnLabel]="pressedLabel">
                            <ng-template let-appearance let-pressedCase="col">
                                <button
                                    rtButton
                                    [attr.aria-label]="appearance"
                                    [label]="appearance"
                                    [appearance]="appearance"
                                    [pressed]="pressedCase.value"></button>
                            </ng-template>
                        </app-story-grid>
                    </ng-template>
                </app-story-presets>
            }

            @case ('size') {
                <app-story-presets caption="Размер × внешний вид в обоих наборах">
                    <ng-template>
                        <app-story-grid [rows]="sizes" [columns]="appearances">
                            <ng-template let-size let-appearance="col">
                                <button rtButton label="Сохранить" aria-label="Сохранить" [size]="size" [appearance]="appearance"></button>
                            </ng-template>
                        </app-story-grid>
                    </ng-template>
                </app-story-presets>
            }

            @case ('icon') {
                <app-story-presets caption="Иконка в обоих наборах">
                    <ng-template>
                        <app-story-row [items]="iconCases" [itemLabel]="iconCaseLabel">
                            <ng-template let-iconCase>
                                <button
                                    rtButton
                                    [attr.aria-label]="iconCase.name"
                                    [label]="iconCase.label"
                                    [icon]="iconCase.icon"
                                    [iconPos]="iconCase.iconPos"></button>
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('rounded') {
                <app-story-presets caption="Скругление в обоих наборах">
                    <ng-template>
                        <app-story-row [items]="rounded" [itemLabel]="roundedLabel">
                            <ng-template let-value>
                                <button rtButton label="Сохранить" aria-label="Сохранить" [rounded]="value"></button>
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('loading') {
                <app-story-presets caption="Загрузка в обоих наборах">
                    <ng-template>
                        <app-story-row [items]="appearances">
                            <ng-template let-appearance>
                                <button rtButton loading label="Сохранение…" aria-label="Сохранение" [appearance]="appearance"></button>
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('states') {
                <app-story-presets caption="Взаимодействие и отключение в обоих наборах">
                    <ng-template>
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
                    </ng-template>
                </app-story-presets>
            }

            @case ('presets') {
                <app-story-presets caption="Взаимодействие по видам оформления в обоих наборах">
                    <ng-template>
                        @for (appearance of appearances; track appearance) {
                            <app-story-row [caption]="appearance" [items]="states" [itemLabel]="stateLabel">
                                <ng-template let-state>
                                    <button
                                        rtButton
                                        label="Сохранить"
                                        aria-label="Сохранить"
                                        [appearance]="appearance"
                                        [attr.data-story-state]="state.state"></button>
                                </ng-template>
                            </app-story-row>
                        }
                    </ng-template>
                </app-story-presets>
            }

            @case ('themes') {
                <app-story-presets caption="Палитра в обеих темах и обоих наборах">
                    <ng-template>
                        <app-story-themes>
                            <ng-template>
                                @for (theme of themes; track theme) {
                                    <button rtButton [attr.aria-label]="theme" [label]="theme" [theme]="theme"></button>
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
        // directives
        RtButtonDirective,

        // showcase
        StoryGridComponent,
        StoryPresetsComponent,
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtButtonMatrixComponent {
    public part: TButtonMatrixPart = 'appearance';

    /**
     * Три положения кнопки: нажата, отжата и положения нет вовсе. Третье — не то же, что отжатое:
     * обычная кнопка о положении не говорит вспомогательным средствам ничего, а отжатая говорит,
     * что у неё есть второе положение.
     */
    public readonly pressedCases: ReadonlyArray<{ readonly label: string; readonly value: boolean | null }> = [
        { label: 'положения нет', value: null },
        { label: 'отжата', value: false },
        { label: 'нажата', value: true },
    ];

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

    public readonly pressedLabel: (value: { readonly label: string }) => string = (value: { readonly label: string }): string =>
        value.label;
}
