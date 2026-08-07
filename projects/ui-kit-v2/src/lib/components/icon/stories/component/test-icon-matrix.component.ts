import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { CATEGORY_ORDER, categoryOf, IIconCategory } from '../../icon-categories';
import { iconsName } from '../../rt-icon-names';
import { RtIconComponent } from '../../rt-icon.component';
import { IRtIcon } from '../../rt-icon.model';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type IconMatrixPart = 'catalog' | 'size' | 'color' | 'rotate' | 'themes';

/** Категория набора со своими именами — строка каталога. */
interface IIconCategoryGroup {
    readonly category: IIconCategory;
    readonly names: readonly IRtIcon.Name[];
}

/**
 * Матрицы `rt-icon` для витрины.
 *
 * Главная ось здесь — имя: их больше трёхсот, и «показать все значения» значит каталог, а
 * не ряд из выборки. Категории для него уже посчитаны `categoryOf` рядом с компонентом.
 * Размер и цвет друг на друга не влияют — они идут рядами, а не сеткой.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-icon-matrix',
    template: `
        @switch (part) {
            @case ('catalog') {
                @for (group of catalog; track group.category) {
                    <app-story-row [caption]="group.category" [items]="group.names">
                        <ng-template let-name>
                            <rt-icon size="lg" [name]="name" />
                        </ng-template>
                    </app-story-row>
                }
            }

            @case ('size') {
                <app-story-row caption="Размер" [items]="sizes">
                    <ng-template let-size>
                        <rt-icon name="alarm-clock" [size]="size" />
                    </ng-template>
                </app-story-row>
            }

            @case ('color') {
                <app-story-row caption="Цвет" [items]="colors">
                    <ng-template let-color>
                        <rt-icon name="alarm-clock" size="lg" [color]="color" />
                    </ng-template>
                </app-story-row>

                <p class="app-icon-matrix__note">
                    <code>inverse</code>
                    рассчитан на тёмную подложку — на светлой странице он сливается с фоном, и это его штатный вид, а не пропущенная ячейка.
                </p>
            }

            @case ('rotate') {
                <app-story-row caption="Поворот" [items]="rotations" [itemLabel]="rotateLabel">
                    <ng-template let-value>
                        <rt-icon name="arrow-right" size="lg" [rotate]="value" />
                    </ng-template>
                </app-story-row>
            }

            @case ('themes') {
                <app-story-themes caption="Цвет в обеих темах">
                    <ng-template>
                        @for (color of colors; track color) {
                            <rt-icon name="alarm-clock" size="lg" [color]="color" />
                        }
                    </ng-template>
                </app-story-themes>
            }
        }
    `,
    styles: `
        .app-icon-matrix__note {
            max-width: 46rem;
            color: var(--rt-color-text-muted);
            font-size: 0.8125rem;
            line-height: 1.6;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtIconComponent,

        // showcase
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtIconMatrixComponent {
    public part: IconMatrixPart = 'catalog';

    public readonly sizes: readonly IRtIcon.Size[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
    public readonly colors: readonly IRtIcon.Color[] = ['current', 'muted', 'info', 'success', 'warning', 'danger', 'inverse'];
    public readonly rotations: readonly (number | null)[] = [null, 90, 180, 270];

    /** Весь набор, разложенный по категориям в порядке `CATEGORY_ORDER`. */
    public readonly catalog: readonly IIconCategoryGroup[] = CATEGORY_ORDER.map((category: IIconCategory): IIconCategoryGroup => ({
        category,
        names: iconsName.filter((name: IRtIcon.Name): boolean => categoryOf(name) === category),
    })).filter((group: IIconCategoryGroup): boolean => group.names.length > 0);

    public readonly rotateLabel: (value: number | null) => string = (value: number | null): string =>
        value === null ? 'без поворота' : `${value}°`;
}
