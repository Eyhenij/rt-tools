import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtLogoComponent } from '../../rt-logo.component';
import { IRtLogo } from '../../rt-logo.model';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type LogoMatrixPart = 'variant' | 'height' | 'aspect' | 'themes';

/**
 * Матрицы `rt-logo` для витрины.
 *
 * Начертания здесь — заглушки из `.storybook/storybook.scss`: своего логотипа кит не везёт,
 * и без подставленных свойств каждая ячейка была бы пустым местом нужного размера.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-logo-matrix',
    template: `
        @switch (part) {
            @case ('variant') {
                <app-story-row caption="Вариант" [items]="variants">
                    <ng-template let-variant>
                        <rt-logo ariaLabel="Витрина" [variant]="variant" />
                    </ng-template>
                </app-story-row>
            }

            @case ('height') {
                <app-story-row caption="Высота" [items]="heights" [itemLabel]="heightLabel">
                    <ng-template let-height>
                        <rt-logo ariaLabel="Витрина" variant="lockup" [height]="height" />
                    </ng-template>
                </app-story-row>
            }

            @case ('aspect') {
                <app-story-row caption="Пропорция" [items]="aspects" [itemLabel]="aspectLabel">
                    <ng-template let-aspect>
                        <rt-logo ariaLabel="Витрина" variant="wordmark" [height]="51" [aspect]="aspect" />
                    </ng-template>
                </app-story-row>
            }

            @case ('themes') {
                <app-story-themes caption="Начертания в обеих темах">
                    <ng-template>
                        @for (variant of variants; track variant) {
                            <rt-logo ariaLabel="Витрина" [variant]="variant" />
                        }
                    </ng-template>
                </app-story-themes>
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtLogoComponent,

        // showcase
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtLogoMatrixComponent {
    public part: LogoMatrixPart = 'variant';

    public readonly variants: readonly IRtLogo.Variant[] = ['wordmark', 'lockup'];

    /** `0` — не нулевой размер, а «умолчание варианта»: у него своя ячейка. */
    public readonly heights: readonly number[] = [0, 40, 75, 120];

    /** `0` — то же «не задано». Остальные значения нарочно уводят пропорцию от умолчания. */
    public readonly aspects: readonly number[] = [0, 3, 5.4, 8];

    public readonly heightLabel: (value: number) => string = (value: number): string => (value === 0 ? 'умолчание варианта' : `${value}px`);

    public readonly aspectLabel: (value: number) => string = (value: number): string =>
        value === 0 ? 'умолчание варианта' : String(value);
}
