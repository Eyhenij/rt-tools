import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryGridComponent } from '../../../../../showcase/story-grid.component';
import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { IStoryState, STORY_STATES, storyStateLabel } from '../../../../../showcase/story-states';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { IRtIcon } from '../../../icon/rt-icon.model';
import { RT_RADIUS_STEPS, TRtRadius } from '../../../radius/rt-radius.model';
import { RtIconButtonComponent } from '../../rt-icon-button.component';
import { IRtIconButton } from '../../rt-icon-button.model';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TIconButtonMatrixPart = 'variant' | 'size' | 'iconSize' | 'radius' | 'flags' | 'content' | 'states' | 'presets' | 'themes';

/** Случай признака: какой из булевых входов включён и как он называется словами. */
interface IIconButtonFlagCase {
    readonly name: string;
    readonly loading: boolean;
    readonly disabled: boolean;
    readonly active: boolean;
    readonly indicator: boolean;
}

/**
 * Матрицы `rt-icon-button` для витрины.
 *
 * Перемножены палитра с формой (у круглой кнопки заливка читается иначе) и палитра с
 * отключённостью. Размер иконки перемножен с размером кнопки — ровно та пара, ради которой
 * `iconSize` и существует: крупная кнопка с некрупной иконкой одной строкой не показывается.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-icon-button-matrix',
    template: `
        @switch (part) {
            @case ('variant') {
                <app-story-presets caption="Палитра × скругление в обоих наборах">
                    <ng-template>
                        <app-story-grid [rows]="variants" [columns]="gridRadii" [columnLabel]="radiusLabel">
                            <ng-template let-variant let-radius="col">
                                <rt-icon-button icon="pencil" [ariaLabel]="variant" [variant]="variant" [radius]="radius" />
                            </ng-template>
                        </app-story-grid>
                    </ng-template>
                </app-story-presets>
            }

            @case ('size') {
                <app-story-presets caption="Размер в обоих наборах">
                    <ng-template>
                        <app-story-row [items]="sizes">
                            <ng-template let-size>
                                <rt-icon-button icon="pencil" ariaLabel="Править" variant="secondary" [size]="size" />
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            <!-- Пары наборов здесь нет, и это решение, а не пропуск: матрица занимает всю ширину
                 страницы, а половина пары добавляет к ней свои поля — содержимое уходит за край, и
                 кадр по корню показа режет его молча, одинаково у обеих половин. Набор при этом
                 переписывает цвет, скругление и тень и не трогает размеры — ровно ту ось, ради
                 которой матрица и заведена. Значок в материальном наборе виден на соседней
                 истории «Размер». -->
            @case ('iconSize') {
                <app-story-presets caption="Размер кнопки × размер иконки в обоих наборах">
                    <ng-template>
                        <app-story-grid [rows]="sizes" [columns]="iconSizes" [columnLabel]="iconSizeLabel">
                            <ng-template let-size let-iconSize="col">
                                <rt-icon-button icon="pencil" ariaLabel="Править" variant="secondary" [size]="size" [iconSize]="iconSize" />
                            </ng-template>
                        </app-story-grid>
                    </ng-template>
                </app-story-presets>
            }

            @case ('radius') {
                <app-story-presets caption="Шаги скругления в обоих наборах">
                    <ng-template>
                        <app-story-row [items]="radii" [itemLabel]="radiusLabel">
                            <ng-template let-radius>
                                <rt-icon-button icon="pencil" ariaLabel="Править" variant="primary" [radius]="radius" />
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('flags') {
                <app-story-presets caption="Признак × палитра в обоих наборах">
                    <ng-template>
                        <app-story-grid [rows]="flagCases" [columns]="variants" [rowLabel]="flagCaseLabel">
                            <ng-template let-flagCase let-variant="col">
                                <rt-icon-button
                                    icon="pencil"
                                    [ariaLabel]="flagCase.name"
                                    [variant]="variant"
                                    [loading]="flagCase.loading"
                                    [disabled]="flagCase.disabled"
                                    [active]="flagCase.active"
                                    [indicator]="flagCase.indicator" />
                            </ng-template>
                        </app-story-grid>
                    </ng-template>
                </app-story-presets>
            }

            <!-- Вложенное вместо значка: свой рисунок встаёт в ту же кнопку, с тем же размером и
                 цветом палитры. Рядом — значок кита той же кнопки, чтобы размеры сравнивались в кадре. -->
            @case ('content') {
                <app-story-presets caption="Палитра × значок кита или вложенное в обоих наборах">
                    <ng-template>
                        <app-story-grid [rows]="variants" [columns]="contentCases" [columnLabel]="contentCaseLabel">
                            <ng-template let-variant let-own="col">
                                @if (own) {
                                    <rt-icon-button [icon]="null" [ariaLabel]="variant" [variant]="variant">
                                        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                                            <path
                                                fill="currentColor"
                                                d="M3 3h8v8H3zm2 2v4h4V5zm8-2h8v8h-8zm2 2v4h4V5zM3 13h8v8H3zm2 2v4h4v-4zm8-2h2v2h-2zm4 0h4v2h-4zm-4 4h4v4h-4zm6 2h2v2h-2z" />
                                        </svg>
                                    </rt-icon-button>
                                } @else {
                                    <rt-icon-button icon="pencil" [ariaLabel]="variant" [variant]="variant" />
                                }
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
                                <rt-icon-button
                                    icon="pencil"
                                    ariaLabel="Править"
                                    variant="secondary"
                                    [attr.data-story-state]="state.state" />
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>

                <p class="app-icon-button-matrix__note">
                    Признак ставится на host компонента, а стилизована внутри него настоящая
                    <code>&lt;button&gt;</code>
                    — поэтому у ряда взаимодействия свой селектор, и в параметрах истории он объявлен отдельно от общего.
                </p>
            }

            @case ('presets') {
                <app-story-presets caption="Взаимодействие в обоих наборах">
                    <ng-template>
                        @for (variant of variants; track variant) {
                            <app-story-row [caption]="variant" [items]="states" [itemLabel]="stateLabel">
                                <ng-template let-state>
                                    <rt-icon-button
                                        icon="pencil"
                                        [ariaLabel]="variant"
                                        [variant]="variant"
                                        [attr.data-story-state]="state.state" />
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
                                @for (variant of variants; track variant) {
                                    <rt-icon-button icon="pencil" [ariaLabel]="variant" [variant]="variant" />
                                }
                            </ng-template>
                        </app-story-themes>
                    </ng-template>
                </app-story-presets>
            }
        }
    `,
    styles: `
        .app-icon-button-matrix__note {
            max-width: 46rem;
            color: var(--rt-color-text-muted);
            font-size: 0.8125rem;
            line-height: 1.6;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtIconButtonComponent,

        // showcase
        StoryGridComponent,
        StoryPresetsComponent,
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtIconButtonMatrixComponent {
    public part: TIconButtonMatrixPart = 'variant';

    public readonly variants: readonly IRtIconButton.Variant[] = ['ghost', 'primary', 'secondary', 'danger', 'success', 'warning'];
    public readonly sizes: readonly IRtIconButton.Size[] = ['sm', 'md', 'lg', 'xl', '2xl'];
    public readonly radii: readonly (TRtRadius | null)[] = [null, ...RT_RADIUS_STEPS];
    /** Шаги, которыми раньше были формы: квадрат — умолчание, две скруглённые формы и круг. */
    public readonly gridRadii: readonly (TRtRadius | null)[] = [null, 'lg', 'xl', 'full'];
    public readonly states: readonly IStoryState[] = STORY_STATES;
    public readonly stateLabel: (value: IStoryState) => string = storyStateLabel;

    /** `null` — не отсутствие значения, а «размер иконки от размера кнопки». */
    public readonly iconSizes: readonly (IRtIcon.Size | null)[] = [null, 'xs', 'sm', 'md', 'lg', 'xl', '2xl'];

    public readonly flagCases: readonly IIconButtonFlagCase[] = [
        { name: 'обычная', loading: false, disabled: false, active: false, indicator: false },
        { name: 'нажата (aria-pressed)', loading: false, disabled: false, active: true, indicator: false },
        { name: 'с точкой', loading: false, disabled: false, active: false, indicator: true },
        { name: 'загрузка', loading: true, disabled: false, active: false, indicator: false },
        { name: 'отключена', loading: false, disabled: true, active: false, indicator: false },
    ];

    /** `false` — значок кита, `true` — своё содержимое при `icon = null`. */
    public readonly contentCases: readonly boolean[] = [false, true];

    public readonly contentCaseLabel: (value: boolean) => string = (value: boolean): string => (value ? 'вложенное' : 'значок кита');

    public readonly iconSizeLabel: (value: IRtIcon.Size | null) => string = (value: IRtIcon.Size | null): string =>
        value === null ? 'от кнопки' : value;

    public readonly flagCaseLabel: (value: IIconButtonFlagCase) => string = (value: IIconButtonFlagCase): string => value.name;

    public readonly radiusLabel: (value: TRtRadius | null) => string = (value: TRtRadius | null): string => value ?? 'по умолчанию';
}
